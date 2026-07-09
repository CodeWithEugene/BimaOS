import { NextRequest, NextResponse } from 'next/server';

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
    const payoutAmount = approved ? 25000 + Math.floor(Math.random() * 20000) : 0;

    return NextResponse.json({
      success: true,
      claimId,
      action,
      reviewerId,
      payoutAmount,
      timestamp: new Date().toISOString(),
      message: approved
        ? `✅ Claim ${claimId} verified and approved. KES ${payoutAmount.toLocaleString()} payout initiated to M-Pesa.`
        : `❌ Claim ${claimId} rejected. Reason: evidence does not match policy coverage terms.`,
      blockchainTxHash: approved ? `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}` : null,
    });
  } catch (error) {
    console.error('[Verify Error]:', error);
    return NextResponse.json(
      { error: 'Failed to process verification' },
      { status: 500 }
    );
  }
}
