'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  User,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

interface ClaimForReview {
  id: string;
  policyType: string;
  customer: string;
  description: string;
  confidenceScore: number;
  imageUrl: string;
  submittedAt: string;
  aiFlags: string[];
}

export default function VerifyPage() {
  const [resolved, setResolved] = useState<Record<string, 'approved' | 'rejected'>>({});

  const claims: ClaimForReview[] = [
    {
      id: 'CLM2025-003',
      policyType: 'Daily Market Cover',
      customer: '+254 734 567 890',
      description: 'Stock damaged by fire at Gikomba Market around 3pm. Goods worth approximately KES 15,000 destroyed.',
      confidenceScore: 62,
      imageUrl: '',
      submittedAt: '2025-07-09T08:15:00Z',
      aiFlags: ['Low confidence score', 'Image quality below threshold', 'Timestamp unclear'],
    },
    {
      id: 'CLM2025-005',
      policyType: 'Life Cover',
      customer: '+254 756 789 012',
      description: 'Policy holder passed away on July 5th after brief illness. Beneficiary filing for KES 100,000 payout.',
      confidenceScore: 45,
      imageUrl: '',
      submittedAt: '2025-07-09T11:00:00Z',
      aiFlags: ['Document not clear', 'Requires manual verification of medical certificate'],
    },
  ];

  const claim = claims[0];

  const handleApprove = () => {
    setResolved((prev) => ({ ...prev, [claim.id]: 'approved' }));
  };

  const handleReject = () => {
    setResolved((prev) => ({ ...prev, [claim.id]: 'rejected' }));
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
            <AlertTriangle className="h-4 w-4 rotate-180" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Claims Review</h1>
              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                Human-in-the-Loop
              </Badge>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Telegram Adjuster Interface — Review AI-flagged claims and make decisions.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {claims.map((c) => {
              const resolvedStatus = resolved[c.id];
              return (
                <Card key={c.id} className={`p-6 ${
                  resolvedStatus === 'approved' ? 'border-emerald-200 dark:border-emerald-900' :
                  resolvedStatus === 'rejected' ? 'border-red-200 dark:border-red-900' : ''
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">{c.id}</h2>
                        {resolvedStatus && (
                          <Badge className={resolvedStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}>
                            {resolvedStatus === 'approved' ? 'Approved' : 'Rejected'}
                          </Badge>
                        )}
                        {!resolvedStatus && (
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                            Pending Review
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {c.policyType} · {c.customer}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{c.confidenceScore}%</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">AI Score</p>
                    </div>
                  </div>

                  <div className="mb-4 rounded-lg bg-zinc-50 dark:bg-zinc-900 p-3">
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">{c.description}</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider">AI Flags</p>
                    <div className="space-y-1.5">
                      {c.aiFlags.map((flag, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          {flag}
                        </div>
                      ))}
                    </div>
                  </div>

                  {!resolvedStatus && (
                    <div className="flex gap-3">
                      <Button
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => handleApprove()}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve & Payout
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-red-300 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                        onClick={() => handleReject()}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  )}

                  {resolvedStatus && (
                    <div className={`rounded-lg p-3 ${
                      resolvedStatus === 'approved' ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900' :
                      'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900'
                    }`}>
                      <div className="flex items-center gap-2">
                        {resolvedStatus === 'approved' ? (
                          <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {resolvedStatus === 'approved'
                            ? 'KES 25,000 payout approved. Blockchain TX submitted.'
                            : 'Claim rejected. Reason logged to audit trail.'}
                        </p>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Telegram Bot</h3>
              </div>

              <div className="rounded-lg bg-zinc-100 dark:bg-zinc-900 p-3 space-y-3 text-xs">
                <div className="flex items-start gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 shrink-0">
                    <Shield className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">BimaOS Bot</p>
                    <p className="text-zinc-600 dark:text-zinc-400">New claim flagged for review: CLM2025-003 (62% confidence)</p>
                    <p className="text-zinc-400 mt-1">/approve or /reject to respond</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0">
                    <User className="h-3 w-3 text-zinc-600 dark:text-zinc-400" />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">Adjuster (You)</p>
                    <p className="text-zinc-600 dark:text-zinc-400">/review CLM2025-003</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 shrink-0">
                    <Shield className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">BimaOS Bot</p>
                    <p className="text-zinc-600 dark:text-zinc-400">Showing CLM2025-003. Customer: +254 734 *** **0. Policy: Daily Market Cover. AI Score: 62%. Flags: Low confidence, image quality, timestamp.</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-zinc-300 dark:border-zinc-700">
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-2">Review Stats</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Pending</span>
                  <span className="font-medium text-amber-600 dark:text-amber-400">{claims.length - Object.keys(resolved).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Approved Today</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">{Object.values(resolved).filter(v => v === 'approved').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Rejected Today</span>
                  <span className="font-medium text-red-600 dark:text-red-400">{Object.values(resolved).filter(v => v === 'rejected').length}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-600 dark:text-zinc-400">Avg Review Time</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">2.4 min</span>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-semibold text-sm text-emerald-800 dark:text-emerald-300">Blockchain Audit</h3>
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                Every approval/rejection is recorded on-chain. Immutable audit trail for IRA compliance.
              </p>
              <div className="mt-2 font-mono text-xs text-emerald-600 dark:text-emerald-500 truncate">
                TX: 0x7a3b...f9e2 · Stellar Soroban
              </div>
            </Card>

            <div className="flex items-center gap-2 text-xs text-zinc-400 justify-center">
              <Clock className="h-3 w-3" />
              <span>Connected via Telegram @BimaOSAdjusterBot</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
