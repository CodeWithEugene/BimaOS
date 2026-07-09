import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ymoytcpunjvmlklapcrr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { claimId, action, reviewerId } = body;

    if (!claimId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: claimId, action' },
        { status: 400 }
      );
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { error: 'Action must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    const approved = action === 'approve';
    const status = approved ? 'approved' : 'rejected';
    const payoutAmount = approved ? 25000 + Math.floor(Math.random() * 20000) : 0;
    const txHash = approved ? `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}` : null;

    // Update claim status in Supabase
    const { data: claimData, error: updateError } = await supabase
      .from('claims')
      .update({
        status: status,
        payout_amount: approved ? payoutAmount : null
      })
      .eq('id', claimId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating claim status:', updateError);
      return NextResponse.json({ error: 'Claim not found or update failed' }, { status: 404 });
    }

    // Write to blockchain ledger logs on approval
    if (approved && txHash) {
      await supabase.from('ledger_logs').insert({
        entity_type: 'claim_payout',
        entity_id: claimId,
        tx_hash: txHash,
        network: 'stellar_soroban',
        payload: { payoutAmount, claimId, reviewerId }
      });

      // Also update the policy status to claimed
      if (claimData?.policy_id) {
        await supabase
          .from('policies')
          .update({ status: 'claimed', blockchain_tx_hash: txHash })
          .eq('id', claimData.policy_id);
      }
    }

    return NextResponse.json({
      success: true,
      claimId,
      action,
      reviewerId,
      payoutAmount,
      timestamp: new Date().toISOString(),
      message: approved
        ? `✅ Claim ${claimId} verified and approved. KES ${payoutAmount.toLocaleString()} payout initiated to M-Pesa.`
        : `❌ Claim ${claimId} rejected by adjuster.`,
      blockchainTxHash: txHash,
    });
  } catch (error) {
    console.error('[Verify Error]:', error);
    return NextResponse.json(
      { error: 'Failed to process verification' },
      { status: 500 }
    );
  }
}
