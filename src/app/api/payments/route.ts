import { NextRequest, NextResponse } from 'next/server';
import { generateMockTxHash } from '@/lib/blockchain';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phoneNumber, amount, accountReference } = body;

    if (!phoneNumber || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: phoneNumber, amount' },
        { status: 400 }
      );
    }

    const receiptNumber = `MPE${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    const transactionId = `TXN${Date.now().toString(36).toUpperCase()}`;

    console.log(`[M-PESA] STK Push to ${phoneNumber} for KES ${amount} | Ref: ${accountReference || receiptNumber}`);

    const simulatedDelay = Math.random() * 1000 + 500;
    await new Promise((resolve) => setTimeout(resolve, simulatedDelay));

    const success = true;

    return NextResponse.json({
      success,
      receiptNumber: success ? receiptNumber : null,
      transactionId: success ? transactionId : null,
      message: success
        ? `Payment of KES ${amount} successful. Receipt: ${receiptNumber}`
        : 'Payment failed. Please try again.',
      blockchainTxHash: success ? generateMockTxHash() : null,
    });
  } catch (error) {
    console.error('[Payment Error]:', error);
    return NextResponse.json(
      { success: false, receiptNumber: null, transactionId: null, message: 'Payment processing error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'BimaOS Payment Gateway',
    version: '1.0.0',
    provider: 'M-Pesa (Daraja API)',
    supported: ['STK Push', 'Payment Validation', 'Confirmation'],
  });
}
