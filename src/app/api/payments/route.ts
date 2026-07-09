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

    // Normalise to Paystack Kenya required format: +254XXXXXXXXX
    // Strip everything except digits first, then prepend +254
    let digits = phoneNumber.trim().replace(/\D/g, '');   // remove all non-digit chars
    if (digits.startsWith('254')) {
      digits = digits;                                     // 254XXXXXXXXX → keep
    } else if (digits.startsWith('0')) {
      digits = '254' + digits.slice(1);                   // 07XXXXXXXX → 254XXXXXXXXX
    } else {
      digits = '254' + digits;                            // bare number → 254XXXXXXXXX
    }
    const normalised = '+' + digits;                      // always prefix with +

    if (digits.length !== 12) {
      return NextResponse.json(
        { success: false, message: `Phone number must be 12 digits after country code. Got: ${normalised}` },
        { status: 400 }
      );
    }

    // Paystack KES amounts are in cents (×100)
    const amountInCents = Math.round(Number(amount) * 100);

    const customerEmail = email || `${digits}@bimaos.co.ke`;

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
          phone: normalised,   // +254XXXXXXXXX
          provider: 'mpesa',
        },
        reference: accountReference || `BOS-${Date.now()}`,
        metadata: metadata || {},
      }),
    });

    const paystackData = await paystackRes.json();

    // Log full response for debugging
    console.log('[Paystack M-Pesa] Full response:', JSON.stringify(paystackData, null, 2));

    if (!paystackRes.ok || !paystackData.status) {
      console.error('[Paystack M-Pesa Error]:', paystackData);
      return NextResponse.json(
        {
          success: false,
          receiptNumber: null,
          transactionId: null,
          message: paystackData.message || 'M-Pesa charge initiation failed.',
          paystackError: paystackData,
        },
        { status: 400 }
      );
    }

    // Paystack M-Pesa returns status: "pay_offline" when STK push is dispatched
    const reference = paystackData.data?.reference || accountReference;
    const status = paystackData.data?.status;

    console.log(`[Paystack M-Pesa] STK status: ${status} | Phone: ${normalised} | Reference: ${reference}`);

    return NextResponse.json({
      success: true,
      receiptNumber: reference,
      transactionId: reference,
      paystackStatus: status,
      message:
        status === 'success'
          ? `Payment of KES ${amount} completed. Reference: ${reference}`
          : `M-Pesa STK push sent to ${normalised}. Enter your M-Pesa PIN to complete. Reference: ${reference}`,
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
