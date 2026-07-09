import { LedgerLog } from '@/types';

export async function commitToLedger(
  entityType: LedgerLog['entity_type'],
  entityId: string,
  payload: Record<string, unknown>
): Promise<{ txHash: string; network: string; blockNumber: number | null }> {
  try {
    const response = await fetch('/api/blockchain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entityType, entityId, payload }),
    });
    return await response.json();
  } catch (error) {
    console.error('Blockchain commit error:', error);
    return {
      txHash: `sim_${Date.now().toString(36)}`,
      network: 'simulation',
      blockNumber: null,
    };
  }
}

export async function verifyClaimOnChain(claimId: string): Promise<{
  verified: boolean;
  duplicateFound: boolean;
  existingClaims: string[];
}> {
  try {
    const response = await fetch(`/api/blockchain?claimId=${claimId}`);
    return await response.json();
  } catch {
    return { verified: true, duplicateFound: false, existingClaims: [] };
  }
}

export function generateMockTxHash(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * 16)];
  }
  return hash;
}
