import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';

/**
 * GET /api/payments/poll?ref=BOS-PAY-XXX
 *
 * Polls the Paystack transaction verify endpoint.
 * If the transaction is successful, creates the policy + blockchain log
 * and returns { status: 'success', policyId }.
 * If still pending, returns { status: 'pending' }.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ref       = searchParams.get('ref');
  const userId    = searchParams.get('user_id');
  const policyType     = searchParams.get('policy_type')     || 'daily_boda';
  const planName       = searchParams.get('plan_name')       || policyType;
  const coverageAmount = Number(searchParams.get('coverage_amount') || 50000);
  const startDate      = searchParams.get('start_date')      ? new Date(searchParams.get('start_date')!) : new Date();
  const endDate        = searchParams.get('end_date')        ? new Date(searchParams.get('end_date')!)   : (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d; })();

  if (!ref) {
    return NextResponse.json({ status: 'error', message: 'Missing ref' }, { status: 400 });
  }

  try {
    // Ask Paystack if this transaction completed
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(ref)}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
    });
    const verifyData = await verifyRes.json();

    const txStatus = verifyData?.data?.status; // 'success' | 'failed' | 'pending' | 'abandoned'

    console.log(`[Paystack Poll] ref=${ref} status=${txStatus}`);

    if (txStatus === 'failed' || txStatus === 'abandoned') {
      return NextResponse.json({ status: 'failed', message: 'Payment was not completed.' });
    }

    if (txStatus !== 'success') {
      // Still waiting (pending / open)
      return NextResponse.json({ status: 'pending' });
    }

    // ── Payment confirmed ──────────────────────────────────────────────────
    if (!userId) {
      return NextResponse.json({ status: 'success', policyId: null, message: 'Paid but no user_id supplied.' });
    }

    // Prevent duplicate policy creation for the same Paystack reference
    const { data: existing } = await supabase
      .from('policies')
      .select('id')
      .eq('blockchain_tx_hash', `paystack:${ref}`)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ status: 'success', policyId: existing.id });
    }

    const amount = verifyData.data.amount / 100; // Paystack returns in cents

    const txHash = `0x${Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)).join('')}`;

    const { data: policyData, error: policyError } = await supabase
      .from('policies')
      .insert({
        user_id:            userId,
        policy_type:        policyType,
        premium_amount:     amount,
        coverage_amount:    coverageAmount,
        status:             'active',
        start_date:         startDate.toISOString(),
        end_date:           endDate.toISOString(),
        blockchain_tx_hash: `paystack:${ref}`,  // placeholder until chain signs
      })
      .select()
      .single();

    if (policyError) {
      console.error('[Poll] Policy insertion error:', policyError);
      return NextResponse.json({ status: 'error', message: policyError.message }, { status: 500 });
    }

    // Fire-and-forget: blockchain signing + ledger log
    (async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const chainRes = await fetch(`${baseUrl}/api/blockchain`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entityType: 'policy_issuance',
            entityId: policyData.id,
            payload: { plan: planName, premium: amount, coverage: coverageAmount, paystack_ref: ref },
          }),
        });
        const chainData = await chainRes.json();
        if (chainData.success) {
          await supabase
            .from('policies')
            .update({ blockchain_tx_hash: chainData.txHash })
            .eq('id', policyData.id);

          await supabase.from('ledger_logs').insert({
            entity_type: 'policy_issuance',
            entity_id:   policyData.id,
            tx_hash:     chainData.txHash,
            network:     chainData.network || 'ethereum_sepolia',
            payload:     { paystack_ref: ref, amount, plan: planName },
          });
        }
      } catch (e) {
        console.error('[Poll] Blockchain sign error (non-fatal):', e);
      }
    })();

    console.log('[Poll] Policy created:', policyData.id, 'for user:', userId);
    return NextResponse.json({ status: 'success', policyId: policyData.id });

  } catch (err: any) {
    console.error('[Poll Error]:', err);
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}
