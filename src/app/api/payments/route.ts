import { NextRequest, NextResponse } from 'next/server';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';

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

    // Normalise phone: Paystack M-Pesa expects 07xxxxxxxx or 254xxxxxxxx
    const normalised = phoneNumber.startsWith('0')
      ? phoneNumber
      : phoneNumber.startsWith('+254')
      ? '0' + phoneNumber.slice(4)
      : phoneNumber;

    // Paystack amounts are in the smallest currency unit (kobo/cents).
    // For KES, Paystack uses integer KES (not sub-units), so multiply × 100.
    const amountInCents = Math.round(Number(amount) * 100);

    const customerEmail = email || `${normalised}@bimaos.co.ke`;

    console.log(`[Paystack M-Pesa] Initiating STK push → ${normalised} | KES ${amount} | Ref: ${accountReference}`);

    const paystackRes = await fetch('https://api.paystack.co/charge', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: customerEmail,
        amount: amountInCents,
        currency: 'KES',
        mobile_money: {
          phone: normalised,
          provider: 'mpesa',
        },
        reference: accountReference || `BOS-${Date.now()}`,
        metadata: metadata || {},
      }),
    });

    const paystackData = await paystackRes.json();

    if (!paystackRes.ok || !paystackData.status) {
      console.error('[Paystack M-Pesa Error]:', paystackData);
      return NextResponse.json(
        {
          success: false,
          receiptNumber: null,
          transactionId: null,
          message: paystackData.message || 'M-Pesa charge initiation failed.',
        },
        { status: 400 }
      );
    }

    // Paystack returns status: "send_otp" | "pay_offline" | "success"
    // For M-Pesa, "pay_offline" means the STK push was dispatched to the phone.
    const reference = paystackData.data?.reference || accountReference;
    const status = paystackData.data?.status;

    console.log(`[Paystack M-Pesa] Response status: ${status} | Reference: ${reference}`);

    return NextResponse.json({
      success: true,
      receiptNumber: reference,
      transactionId: reference,
      paystackStatus: status,
      message:
        status === 'success'
          ? `Payment of KES ${amount} completed. Reference: ${reference}`
          : `M-Pesa STK push sent to ${normalised}. Enter your M-Pesa PIN to complete payment. Reference: ${reference}`,
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
