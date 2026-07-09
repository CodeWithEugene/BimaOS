import { NextRequest, NextResponse } from 'next/server';
import { analyzeClaimEvidence } from '@/lib/ai';
import { generateMockTxHash } from '@/lib/blockchain';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { policyId, userId, imageUrls } = body;

    if (!policyId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: policyId, userId' },
        { status: 400 }
      );
    }

    const analysis = await analyzeClaimEvidence(imageUrls || []);

    const claimId = `CLM${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    let status: string;
    let telegramMessageId: string | null = null;

    if (analysis.confidenceScore >= 90) {
      status = 'approved';
    } else if (analysis.confidenceScore >= 60) {
      status = 'human_review';
      telegramMessageId = `TG_${Date.now()}`;
    } else {
      status = 'human_review';
      telegramMessageId = `TG_${Date.now()}`;
    }

    const payoutAmount = analysis.analysis.damageSeverity > 0.7 ? 45000 :
      analysis.analysis.damageSeverity > 0.4 ? 25000 : 10000;

    return NextResponse.json({
      claimId,
      status,
      aiConfidenceScore: analysis.confidenceScore,
      aiAnalysis: analysis,
      payoutAmount: status === 'approved' ? payoutAmount : null,
      telegramMessageId,
      blockchainTxHash: status === 'approved' ? generateMockTxHash() : null,
      message: status === 'approved'
        ? `✅ Claim ${claimId} approved! KES ${payoutAmount.toLocaleString()} will be sent to M-Pesa within minutes.`
        : status === 'human_review'
          ? `⏳ Claim ${claimId} flagged for human review. An adjuster will review within 2 hours.`
          : `⏳ Claim ${claimId} is being processed.`,
    });
  } catch (error) {
    console.error('[Claims Error]:', error);
    return NextResponse.json(
      { error: 'Failed to process claim' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const claimId = searchParams.get('claimId');

  const mockClaims = [
    {
      id: 'CLM001',
      policyId: 'POL001',
      status: 'settled',
      amount: 25000,
      date: '2025-07-08T10:30:00Z',
    },
    {
      id: 'CLM002',
      policyId: 'POL003',
      status: 'ai_review',
      amount: null,
      date: '2025-07-09T08:15:00Z',
    },
  ];

  if (claimId) {
    const claim = mockClaims.find((c) => c.id === claimId);
    return NextResponse.json(claim || mockClaims[0]);
  }

  return NextResponse.json(mockClaims);
}
