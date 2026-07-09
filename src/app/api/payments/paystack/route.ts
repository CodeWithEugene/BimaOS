import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ymoytcpunjvmlklapcrr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();
    const signature = req.headers.get('x-paystack-signature');
    const secret = process.env.PAYSTACK_SECRET_KEY || '';

    // Verify HMAC signature
    const hash = crypto.createHmac('sha512', secret).update(bodyText).digest('hex');
    if (signature && hash !== signature) {
      console.warn('[Paystack Webhook] Invalid signature — rejecting');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(bodyText);
    const event = payload.event;
    const data = payload.data;

    console.log(`[Paystack Webhook] Event: ${event} | Reference: ${data?.reference}`);

    if (event === 'charge.success') {
      const amount     = data.amount / 100; // Paystack sends in cents
      const reference  = data.reference;
      const metadata   = data.metadata || {};

      // All plan details are passed from the client via metadata
      const userId       = metadata.user_id;
      const policyType   = metadata.policy_type   || 'daily_boda';
      const planName     = metadata.plan_name      || policyType;
      const coverage     = Number(metadata.coverage_amount) || 50000;
      const startDate    = metadata.start_date ? new Date(metadata.start_date) : new Date();
      const endDate      = metadata.end_date   ? new Date(metadata.end_date)   : (() => {
        const d = new Date(); d.setDate(d.getDate() + 30); return d;
      })();

      if (!userId) {
        console.warn('[Paystack Webhook] No user_id in metadata for reference:', reference);
        return NextResponse.json({ status: 'ok — no user_id' });
      }

      // Prevent duplicate policy creation for same reference
      const { data: existing } = await supabase
        .from('policies')
        .select('id')
        .eq('blockchain_tx_hash', `paystack:${reference}`)
        .maybeSingle();

      if (existing) {
        console.log('[Paystack Webhook] Policy already created for reference:', reference);
        return NextResponse.json({ status: 'already processed' });
      }

      const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

      const { data: policyData, error: policyError } = await supabase
        .from('policies')
        .insert({
          user_id:          userId,
          policy_type:      policyType,
          premium_amount:   amount,
          coverage_amount:  coverage,
          status:           'active',
          start_date:       startDate.toISOString(),
          end_date:         endDate.toISOString(),
          blockchain_tx_hash: `paystack:${reference}`,  // temporary until blockchain signs
        })
        .select()
        .single();

      if (policyError) {
        console.error('[Paystack Webhook] Policy insertion error:', policyError);
        return NextResponse.json({ status: 'policy error' }, { status: 500 });
      }

      // Sign on blockchain (async, fire-and-forget)
      try {
        const chainRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/blockchain`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entityType: 'policy_issuance',
            entityId: policyData.id,
            payload: { plan: planName, premium: amount, coverage, paystack_reference: reference },
          }),
        });
        const chainData = await chainRes.json();
        if (chainData.success) {
          // Update policy with real tx hash
          await supabase
            .from('policies')
            .update({ blockchain_tx_hash: chainData.txHash })
            .eq('id', policyData.id);

          // Write ledger log
          await supabase.from('ledger_logs').insert({
            entity_type: 'policy_issuance',
            entity_id:   policyData.id,
            tx_hash:     chainData.txHash,
            network:     chainData.network || 'ethereum_sepolia',
            payload:     { paystack_reference: reference, amount, plan: planName },
          });
        }
      } catch (chainErr) {
        console.error('[Paystack Webhook] Blockchain signing error (non-fatal):', chainErr);
      }

      console.log('[Paystack Webhook] Policy created:', policyData.id, 'for user:', userId);
    }

    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    console.error('[Paystack Webhook Error]:', error);
    return NextResponse.json({ error: error.message || 'Webhook error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'BimaOS Paystack Webhook Handler',
    version: '2.0.0',
    description: 'Listens to charge.success and creates policy + blockchain audit on confirmed M-Pesa payment.',
  });
}
