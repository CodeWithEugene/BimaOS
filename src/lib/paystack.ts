/**
 * Shared Paystack M-Pesa (mobile money) helper.
 *
 * Used by both the web checkout (/api/payments) and the USSD purchase flow
 * (/api/ussd) so the STK-push logic lives in exactly one place. On a
 * successful charge, Paystack fires `charge.success` to the webhook
 * (/api/payments/paystack) which creates the policy from the metadata passed
 * here. The web flow additionally polls /api/payments/poll as a fallback.
 */

const PAYSTACK_CHARGE_URL = 'https://api.paystack.co/charge';

export interface NormalisedPhone {
  normalised: string; // +254XXXXXXXXX
  digits: string; // 254XXXXXXXXX
}

/**
 * Normalise any Kenyan phone input to Paystack's required +254XXXXXXXXX format.
 * Returns null when the result is not a valid 12-digit MSISDN.
 */
export function normaliseKenyanPhone(phoneNumber: string): NormalisedPhone | null {
  let digits = (phoneNumber || '').trim().replace(/\D/g, ''); // strip non-digits
  if (digits.startsWith('254')) {
    // already 254XXXXXXXXX
  } else if (digits.startsWith('0')) {
    digits = '254' + digits.slice(1); // 07XXXXXXXX -> 254XXXXXXXXX
  } else if (digits.length > 0) {
    digits = '254' + digits; // bare number -> 254XXXXXXXXX
  }

  if (digits.length !== 12) return null;
  return { normalised: '+' + digits, digits };
}

export interface StkPushParams {
  phoneNumber: string;
  amount: number; // KES (whole units)
  email?: string;
  reference: string;
  metadata?: Record<string, unknown>;
}

export interface StkPushResult {
  success: boolean;
  reference: string | null;
  status?: string; // Paystack transaction status (e.g. "pay_offline", "send_otp", "success")
  normalisedPhone?: string;
  message: string;
  raw?: unknown;
  error?: unknown;
}

/**
 * Dispatch a Paystack M-Pesa STK push (mobile money charge).
 * Does not create any policy — that happens on `charge.success` via the webhook
 * (and, for the web flow, the poll endpoint).
 */
export async function initiateMpesaStkPush(params: StkPushParams): Promise<StkPushResult> {
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';

  const norm = normaliseKenyanPhone(params.phoneNumber);
  if (!norm) {
    return {
      success: false,
      reference: null,
      message: `Invalid phone number. Expected a Kenyan number, got: ${params.phoneNumber}`,
    };
  }

  const amountInCents = Math.round(Number(params.amount) * 100); // Paystack KES is in cents
  const customerEmail = params.email || `${norm.digits}@bimaos.co.ke`;

  console.log(
    `[Paystack M-Pesa] STK push -> ${norm.normalised} | KES ${params.amount} | Ref: ${params.reference}`
  );

  try {
    const res = await fetch(PAYSTACK_CHARGE_URL, {
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
          phone: norm.normalised,
          provider: 'mpesa',
        },
        reference: params.reference,
        metadata: params.metadata || {},
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.status) {
      console.error('[Paystack M-Pesa Error]:', data);
      return {
        success: false,
        reference: null,
        normalisedPhone: norm.normalised,
        message: data.message || 'M-Pesa charge initiation failed.',
        error: data,
      };
    }

    const reference = data.data?.reference || params.reference;
    const status = data.data?.status;

    console.log(`[Paystack M-Pesa] STK status: ${status} | Ref: ${reference}`);

    return {
      success: true,
      reference,
      status,
      normalisedPhone: norm.normalised,
      message:
        status === 'success'
          ? `Payment of KES ${params.amount} completed. Reference: ${reference}`
          : `M-Pesa STK push sent to ${norm.normalised}. Enter your M-Pesa PIN to complete. Reference: ${reference}`,
      raw: data,
    };
  } catch (error) {
    console.error('[Paystack M-Pesa] Request error:', error);
    return {
      success: false,
      reference: null,
      normalisedPhone: norm.normalised,
      message: 'Payment processing error. Please try again.',
      error,
    };
  }
}
