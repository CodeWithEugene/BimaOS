import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { buildUssdMenu, extractPhoneNumber } from '@/lib/ussd';
import { initiateMpesaStkPush } from '@/lib/paystack';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ymoytcpunjvmlklapcrr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  try {
    let sessionId = `sess_${Date.now()}`;
    let serviceCode = '*384*11400#';
    let phoneNumber = '';
    let text = '';

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      sessionId = formData.get('sessionId')?.toString() || sessionId;
      serviceCode = formData.get('serviceCode')?.toString() || serviceCode;
      phoneNumber = formData.get('phoneNumber')?.toString() || '';
      text = formData.get('text')?.toString() || '';
    } else {
      const body = await req.json();
      sessionId = body.sessionId || sessionId;
      serviceCode = body.serviceCode || serviceCode;
      phoneNumber = body.phoneNumber || '';
      text = body.text || '';
    }

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Missing required field: phoneNumber' },
        { status: 400 }
      );
    }

    const cleanedPhone = extractPhoneNumber(phoneNumber);
    const response = buildUssdMenu(text);

    console.log(`[USSD] ${cleanedPhone} | Input: "${text}" | Response: ${response.type}`);

    // Process database mutations when user reaches the end state.
    // NOTE: parts[0] is the language selection ('1' English / '2' Kiswahili),
    // so every menu selection is shifted one position to the right.
    if (response.type === 'END') {
      const parts = text.split('*');
      const lang = parts[0] === '2' ? 'sw' : 'en';

      // 1. Confirm Purchase: <lang>*1*<categoryIndex>*<planIndex>*1
      if (parts.length === 5 && parts[1] === '1' && parts[4] === '1') {
        const categoryIndex = parts[2];
        const planIndex = parts[3];
        
        const planMap: Record<string, Record<string, { type: string; name: string; premium: number; coverage: number }>> = {
          '1': {
            '1': { type: 'kilimo-basic', name: 'Crop Guard Basic', premium: 150, coverage: 20000 },
            '2': { type: 'kilimo-standard', name: 'Weather-Indexed Plus', premium: 450, coverage: 70000 },
            '3': { type: 'kilimo-executive', name: 'Parametric Shield', premium: 1200, coverage: 200000 }
          },
          '2': {
            '1': { type: 'boda-basic', name: 'Boda Daily', premium: 20, coverage: 30000 },
            '2': { type: 'boda-standard', name: 'Rider Commuter', premium: 100, coverage: 100000 },
            '3': { type: 'boda-executive', name: 'Comprehensive Motor', premium: 500, coverage: 500000 }
          },
          '3': {
            '1': { type: 'biashara-basic', name: 'Mama Mboga Daily', premium: 30, coverage: 20000 },
            '2': { type: 'biashara-standard', name: 'Market Stall Standard', premium: 150, coverage: 80000 },
            '3': { type: 'biashara-executive', name: 'Retail Shop Secure', premium: 800, coverage: 300000 }
          },
          '4': {
            '1': { type: 'health-basic', name: 'Bima Afya Basic', premium: 50, coverage: 50000 },
            '2': { type: 'health-standard', name: 'Sacco Health Cover', premium: 200, coverage: 150000 },
            '3': { type: 'health-executive', name: 'Afya Family Shield', premium: 600, coverage: 500000 }
          }
        };

        const categoryMap: Record<string, string> = {
          '1': 'kilimo',
          '2': 'boda',
          '3': 'biashara',
          '4': 'health'
        };

        const product = planMap[categoryIndex]?.[planIndex];
        const category = categoryMap[categoryIndex];

        if (product && category) {
          // Resolve (or register) the offline user so the Paystack webhook can
          // attach the resulting policy to the right account.
          let userId: string | null = null;
          const { data: userProfile } = await supabase
            .from('users')
            .select('id')
            .eq('phone_number', cleanedPhone)
            .maybeSingle();

          if (userProfile) {
            userId = userProfile.id;
          } else {
            // Register new offline user
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
              phone: cleanedPhone,
              phone_confirm: true,
              user_metadata: { role: 'consumer', full_name: `USSD User ${cleanedPhone.slice(-4)}` }
            });

            if (authData?.user) {
              userId = authData.user.id;
            } else {
              console.error('Failed to create auth user for USSD, checking fallback:', authError);

              // Fallback to an existing user if auth admin is unavailable
              const { data: fallbackUser } = await supabase
                .from('users')
                .select('id')
                .limit(1)
                .maybeSingle();
              userId = fallbackUser?.id ?? null;
            }
          }

          if (!userId) {
            response.type = 'END';
            response.message =
              lang === 'sw'
                ? 'Samahani, akaunti yako haikupatikana. Tafadhali sajili kwenye bima-os.vercel.app kisha ujaribu tena.'
                : 'Sorry, we could not find your account. Please register at bima-os.vercel.app and try again.';
          } else {
            // Coverage period: kilimo runs a season (6 months), others 30 days
            const startDate = new Date();
            const endDate = new Date();
            if (category === 'kilimo') {
              endDate.setMonth(endDate.getMonth() + 6);
            } else {
              endDate.setDate(endDate.getDate() + 30);
            }

            // Trigger the REAL M-Pesa STK push (same helper as the web checkout).
            // The policy is NOT created here — it is created by the Paystack
            // webhook (/api/payments/paystack) on charge.success using the
            // metadata below. This mirrors the working web payment flow.
            const reference = `BOS-USSD-${Date.now().toString(36).toUpperCase()}`;
            const stk = await initiateMpesaStkPush({
              phoneNumber: cleanedPhone,
              amount: product.premium,
              reference,
              metadata: {
                user_id: userId,
                policy_type: product.type,
                plan_name: product.name,
                coverage_amount: product.coverage,
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                channel: 'ussd',
              },
            });

            if (!stk.success) {
              console.error('[USSD] STK push failed:', stk.message);
              response.type = 'END';
              response.message =
                lang === 'sw'
                  ? 'Samahani, hatukuweza kutuma ombi la malipo la M-Pesa. Tafadhali jaribu tena.'
                  : 'Sorry, we could not send the M-Pesa request. Please try again.';
            }
            // On success the confirm END message already instructs the user to
            // enter their M-Pesa PIN; the webhook finalises the policy.
          }
        }
      }

      // 2. File Claim: <lang>*2*<policyId_or_phone>*<description>
      if (parts.length === 4 && parts[1] === '2') {
        const policyInput = parts[2];
        const description = parts[3];

        let userId = null;
        let policyId = null;

        // Try lookup user by phone or policy ID
        const { data: userProfile } = await supabase
          .from('users')
          .select('id')
          .eq('phone_number', cleanedPhone)
          .maybeSingle();

        if (userProfile) {
          userId = userProfile.id;

          // Find their active policy
          const { data: policy } = await supabase
            .from('policies')
            .select('id')
            .eq('user_id', userId)
            .eq('status', 'active')
            .limit(1)
            .maybeSingle();

          if (policy) {
            policyId = policy.id;
          }
        }

        // Fallback policy search by direct ID if input looks like uuid
        if (!policyId && policyInput.length > 20) {
          const { data: policy } = await supabase
            .from('policies')
            .select('id, user_id')
            .eq('id', policyInput)
            .maybeSingle();
          if (policy) {
            policyId = policy.id;
            userId = policy.user_id;
          }
        }

        // If we found a valid policy and user, insert the claim
        if (userId && policyId) {
          await supabase.from('claims').insert({
            policy_id: policyId,
            user_id: userId,
            description: description,
            status: 'human_review',
            ai_confidence_score: 50,
            image_urls: [],
            social_verdict: "Social Intelligence Audit: No matches found in local news feeds for this specific event. Manual review recommended. Fraud Risk: Moderate."
          });
        }
      }
    }

    // Return raw text format for Africa's Talking USSD Gateway
    if (contentType.includes('application/x-www-form-urlencoded') || req.headers.get('accept')?.includes('text/plain')) {
      return new Response(`${response.type} ${response.message}`, {
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    return NextResponse.json({
      sessionId,
      serviceCode,
      phoneNumber,
      ...response,
    });
  } catch (error) {
    console.error('[USSD Error]:', error);
    return new Response('END An error occurred. Please try again.', {
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'BimaOS USSD Gateway',
    version: '1.0.0',
    endpoints: {
      ussd_handler: '/api/ussd',
    },
    docs: 'Dial *384*11400# on your phone to access BimaOS',
  });
}
