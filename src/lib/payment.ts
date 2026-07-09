export interface MpesaPaymentResponse {
  success: boolean;
  receiptNumber: string | null;
  transactionId: string | null;
  message: string;
}

export async function initiateMpesaPayment(
  phoneNumber: string,
  amount: number,
  accountReference: string
): Promise<MpesaPaymentResponse> {
  const response = await fetch('/api/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber, amount, accountReference }),
  });
  return response.json();
}

export function generatePaymentReference(policyId: string): string {
  return `BOS-PAY-${policyId.slice(0, 8).toUpperCase()}`;
}
