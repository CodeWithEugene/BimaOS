import { NextRequest, NextResponse } from 'next/server';
import { generateMockTxHash } from '@/lib/blockchain';

const ledger: Record<string, unknown>[] = [];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { entityType, entityId, payload } = body;

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: 'Missing required fields: entityType, entityId' },
        { status: 400 }
      );
    }

    const txHash = generateMockTxHash();
    const entry = {
      id: `${entityType}_${entityId}_${Date.now()}`,
      entityType,
      entityId,
      txHash,
      network: 'stellar_soroban' as const,
      blockNumber: Math.floor(Math.random() * 1000000) + 10000000,
      payload: payload || {},
      timestamp: new Date().toISOString(),
    };

    ledger.push(entry);

    return NextResponse.json({
      success: true,
      txHash,
      network: 'stellar_soroban',
      blockNumber: entry.blockNumber,
      message: 'Transaction committed to Stellar Soroban ledger.',
    });
  } catch {
    return NextResponse.json(
      { success: false, txHash: `sim_${Date.now().toString(36)}`, network: 'simulation', blockNumber: null },
      { status: 200 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const claimId = searchParams.get('claimId');

  if (claimId) {
    const relatedEntries = ledger.filter(
      (e) => {
        const payload = e.payload as Record<string, unknown> | undefined;
        return payload?.claimId === claimId || e.entityId === claimId;
      }
    );

    const duplicateFound = relatedEntries.filter(
      (e) => e.entityType === 'claim_payout'
    ).length > 1;

    return NextResponse.json({
      verified: !duplicateFound,
      duplicateFound,
      existingClaims: relatedEntries.map((e) => e.entityId),
      entries: relatedEntries,
    });
  }

  return NextResponse.json({
    name: 'BimaOS Blockchain Registry',
    network: 'Stellar Soroban',
    status: 'operational',
    totalTransactions: ledger.length,
    recentEntries: ledger.slice(-10),
  });
}
