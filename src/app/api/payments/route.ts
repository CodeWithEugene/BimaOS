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

    // Normalise to Paystack Kenya format: 254XXXXXXXXX (no leading + or 0)
    let normalised = phoneNumber.trim().replace(/\s+/g, '');
    if (normalised.startsWith('+254')) {
      normalised = normalised.slice(1);           // +254... → 254...
    } else if (normalised.startsWith('0')) {
      normalised = '254' + normalised.slice(1);   // 07... → 2547...
    } else if (!normalised.startsWith('254')) {
      normalised = '254' + normalised;            // bare number → 254...
    }

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

    // Paystack returns status: "send_otp" | "pay_offline" | "success"
    // For M-Pesa, "pay_offline" means the STK push was dispatched to the phone.
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
