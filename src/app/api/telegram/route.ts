import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { claimId, adjusterResponse, message } = body;

    if (message) {
      console.log(`[Telegram Bot] Incoming: "${message}"`);

      if (message === '/start') {
        return NextResponse.json({
          success: true,
          response: 'BimaOS Adjuster Bot active. You\'ll receive claim alerts here.',
        });
      }

      return NextResponse.json({
        success: true,
        response: 'Command received. Use /status to see pending claims.',
      });
    }

    if (claimId && adjusterResponse) {
      const approved = adjusterResponse === 'approve';

      return NextResponse.json({
        success: true,
        claimId,
        action: approved ? 'approved' : 'rejected',
        payoutAmount: approved ? 25000 : null,
        message: approved
          ? `Claim ${claimId} approved by adjuster. Payout initiated.`
          : `Claim ${claimId} rejected by adjuster.`,
      });
    }

    return NextResponse.json(
      { error: 'Missing claimId or adjusterResponse' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Telegram Error]:', error);
    return NextResponse.json(
      { error: 'Failed to process Telegram webhook' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'BimaOS Telegram Bot',
    version: '1.0.0',
    bot: '@BimaOSAdjusterBot',
    description: 'Human-in-the-loop claims adjustment via Telegram',
  });
}
