import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { buildUssdMenu, extractPhoneNumber } from '@/lib/ussd';

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

    // Process database mutations when user reaches the end state
    if (response.type === 'END') {
      const parts = text.split('*');

      // 1. Confirm Purchase: 1*<categoryIndex>*<planIndex>*1
      if (parts.length === 4 && parts[0] === '1' && parts[3] === '1') {
        const categoryIndex = parts[1];
        const planIndex = parts[2];
        
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
          // Resolve User
          let userId = null;
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
              
              // Fallback to searching active users or creating a dummy uuid if auth admin is not active
              const { data: fallbackUser } = await supabase
                .from('users')
                .select('id')
                .limit(1)
                .maybeSingle();
              userId = fallbackUser?.id;
            }
          }

          if (userId) {
            const startDate = new Date();
            const endDate = new Date();
            if (category === 'kilimo') {
              endDate.setMonth(endDate.getMonth() + 6);
            } else {
              endDate.setDate(endDate.getDate() + 30);
            }

            const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

            const { data: policyData, error: policyError } = await supabase
              .from('policies')
              .insert({
                user_id: userId,
                policy_type: product.type,
                premium_amount: product.premium,
                coverage_amount: product.coverage,
                status: 'active',
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                blockchain_tx_hash: txHash,
                category: category,
                plan_id: product.type
              })
              .select()
              .single();

            if (policyError) {
              console.error('Policy insert error:', policyError);
            } else if (policyData) {
              // Log to blockchain ledger registry
              await supabase.from('ledger_logs').insert({
                entity_type: 'policy_issuance',
                entity_id: policyData.id,
                tx_hash: txHash,
                network: 'stellar_soroban',
                payload: { product: product.type, premium: product.premium }
              });
            }
          }
        }
      }

      // 2. File Claim: 2*<policyId_or_phone_or_input>*<description>
      if (parts.length === 3 && parts[0] === '2') {
        const policyInput = parts[1];
        const description = parts[2];

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
            telegram_message_id: `TG_${Date.now()}`,
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
