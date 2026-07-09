import { NextRequest, NextResponse } from 'next/server';
import { initiateMpesaStkPush } from '@/lib/paystack';

/**
 * Trigger a Paystack M-Pesa (mobile money) STK push charge.
 * Paystack Charge API docs: https://paystack.com/docs/payments/mobile-money/
 *
 * Body:
 *   phoneNumber  – Kenyan phone in format 07xxxxxxxx or 254xxxxxxxx
 *   amount       – KES amount (integer)
 *   email        – customer email (required by Paystack)
 *   accountReference – policy / order reference
 *   metadata     – { user_id, policy_type } passed through to webhook
 *
 * The actual STK-push logic is shared with the USSD flow via
 * `initiateMpesaStkPush` in src/lib/paystack.ts.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phoneNumber, amount, email, accountReference, metadata } = body;

    if (!phoneNumber || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: phoneNumber, amount' },
        { status: 400 }
      );
    }

    const result = await initiateMpesaStkPush({
      phoneNumber,
      amount,
      email,
      reference: accountReference || `BOS-${Date.now()}`,
      metadata: metadata || {},
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          receiptNumber: null,
          transactionId: null,
          message: result.message,
          paystackError: result.error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      receiptNumber: result.reference,
      transactionId: result.reference,
      paystackStatus: result.status,
      message: result.message,
    });
  } catch (error) {
    console.error('[Payment Error]:', error);
    return NextResponse.json(
      {
        success: false,
        receiptNumber: null,
        transactionId: null,
        message: 'Payment processing error. Please try again.',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'BimaOS Payment Gateway',
    version: '2.0.0',
    provider: 'Paystack M-Pesa (Kenya)',
    supported: ['M-Pesa STK Push', 'Mobile Money Charge', 'Paystack Webhook'],
  });
}
