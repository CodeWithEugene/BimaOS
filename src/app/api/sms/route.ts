import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phoneNumber, message } = body;

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: phoneNumber, message' },
        { status: 400 }
      );
    }

    console.log(`[SMS] To: ${phoneNumber} | Message: "${message.slice(0, 100)}..."`);

    const lower = message.toLowerCase();

    if (lower.includes('claim') && lower.includes('status')) {
      return NextResponse.json({
        success: true,
        response: `Your claim CLM${phoneNumber.slice(-4).toUpperCase()} is being processed. Check status: bimaos.app/claims`,
      });
    }

    if (lower.includes('balance') || lower.includes('policy')) {
      return NextResponse.json({
        success: true,
        response: 'You have 2 active policies. Reply with POLICY <number> for details or dial *384*XXX#.',
      });
    }

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('help')) {
      return NextResponse.json({
        success: true,
        response: 'Welcome to BimaOS! Dial *384*XXX# to buy insurance, file a claim, or check your policies.',
      });
    }

    return NextResponse.json({
      success: true,
      response: 'Thank you for contacting BimaOS. Dial *384*XXX# or visit bimaos.app for assistance.',
    });
  } catch (error) {
    console.error('[SMS Error]:', error);
    return NextResponse.json(
      { error: 'Failed to process SMS' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'BimaOS SMS Gateway',
    version: '1.0.0',
    description: 'Handles inbound and outbound SMS communications via Africa\'s Talking API',
  });
}
