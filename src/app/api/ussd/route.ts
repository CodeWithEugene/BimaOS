import { NextRequest, NextResponse } from 'next/server';
import { buildUssdMenu } from '@/lib/ussd';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, serviceCode, phoneNumber, text } = body;

    if (!text === undefined || !phoneNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: text, phoneNumber' },
        { status: 400 }
      );
    }

    const response = buildUssdMenu(text || '');

    console.log(`[USSD] ${phoneNumber} | Service: ${serviceCode} | Input: "${text}" | Response: ${response.type}`);

    return NextResponse.json({
      sessionId,
      serviceCode,
      phoneNumber,
      ...response,
    });
  } catch (error) {
    console.error('[USSD Error]:', error);
    return NextResponse.json(
      { message: 'END An error occurred. Please try again.', type: 'END' },
      { status: 200 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'BimaOS USSD Gateway',
    version: '1.0.0',
    endpoints: {
      ussd_handler: '/api/ussd',
    },
    docs: 'Dial *384*XXX# on your phone to access BimaOS',
  });
}
