'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  FileText,
  Upload,
  Shield,
  ArrowLeft,
  Check,
  X,
  AlertTriangle,
  Clock,
  Smartphone,
  Send,
} from 'lucide-react';
import Link from 'next/link';
import { claimStatusColor, formatCurrency } from '@/lib/utils';

type ClaimStep = 'select' | 'describe' | 'upload' | 'processing' | 'result';

interface ClaimResult {
  id: string;
  status: string;
  confidenceScore: number;
  payoutAmount: number | null;
  message: string;
  blockchainTxHash: string | null;
}

export default function ClaimsPage() {
  const [step, setStep] = useState<ClaimStep>('select');
  const [policy, setPolicy] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [result, setResult] = useState<ClaimResult | null>(null);
  const [showUssd, setShowUssd] = useState(false);
  const [ussdStep, setUssdStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result;
          if (result && typeof result === 'string') {
            setImages((prev) => [...prev, result]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleProcessClaim = async () => {
    setStep('processing');
    await new Promise((r) => setTimeout(r, 2500));

    const confidenceScore = Math.floor(Math.random() * 40) + 55;
    let status: string;
    let payoutAmount: number | null = null;

    if (confidenceScore >= 85) {
      status = 'approved';
      payoutAmount = Math.floor(Math.random() * 40000) + 10000;
    } else if (confidenceScore >= 60) {
      status = 'human_review';
    } else {
      status = 'rejected';
    }

    setResult({
      id: `CLM${Date.now().toString(36).toUpperCase()}`,
      status,
      confidenceScore,
      payoutAmount,
      message:
        status === 'approved'
          ? `Claim approved! KES ${payoutAmount?.toLocaleString()} will be sent to M-Pesa.`
          : status === 'human_review'
            ? 'Claim flagged for human review. An adjuster will review within 2 hours.'
            : 'Claim could not be verified. Please contact support.',
      blockchainTxHash: status === 'approved' ? `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}` : null,
    });

    setStep('result');
  };

  const handleUssdInteraction = () => {
    if (ussdStep < 3) {
      setUssdStep((s) => s + 1);
    }
  };

  const resetClaim = () => {
    setStep('select');
    setPolicy('');
    setDescription('');
    setImages([]);
    setResult(null);
    setUssdStep(0);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">File a Claim</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Submit your claim via USSD or web. Get paid in minutes.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {step === 'select' && (
              <Card className="p-6">
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">How would you like to file?</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowUssd(true)}
                    className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 text-left hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 mb-3">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-sm">Via USSD</h3>
                    <p className="text-xs text-zinc-500 mt-1">Dial *384*XXX# on any phone. No internet needed.</p>
                  </button>
                  <button
                    onClick={() => setStep('describe')}
                    className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 text-left hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 mb-3">
                      <FileText className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-sm">Via Web</h3>
                    <p className="text-xs text-zinc-500 mt-1">Submit online with photo uploads.</p>
                  </button>
                </div>
              </Card>
            )}

            {showUssd && step === 'select' && (
              <Card className="p-6 border-zinc-300 dark:border-zinc-700">
                <div className="flex items-center gap-2 mb-4">
                  <Smartphone className="h-4 w-4 text-zinc-500" />
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">USSD Simulator</span>
                </div>

                <div className="rounded-lg bg-zinc-900 dark:bg-zinc-950 p-4 font-mono text-sm min-h-[200px]">
                  <p className="text-zinc-500 text-xs mb-3">*384*XXX#</p>

                  {ussdStep === 0 && (
                    <div>
                      <p className="text-emerald-400 mb-1">CON Welcome to BimaOS</p>
                      <p className="text-zinc-400 text-xs">1. Buy Insurance</p>
                      <p className="text-zinc-400 text-xs">2. File a Claim</p>
                      <p className="text-zinc-400 text-xs">3. My Policies</p>
                    </div>
                  )}

                  {ussdStep === 1 && (
                    <div>
                      <p className="text-emerald-400 mb-1">CON Select Cover Type:</p>
                      <p className="text-zinc-400 text-xs">1. Daily Boda Cover</p>
                      <p className="text-zinc-400 text-xs">2. Market Cover</p>
                      <p className="text-zinc-400 text-xs">3. Crop Cover</p>
                    </div>
                  )}

                  {ussdStep === 2 && (
                    <div>
                      <p className="text-emerald-400 mb-1">CON Confirm Purchase?</p>
                      <p className="text-zinc-400 text-xs">1. Yes (M-Pesa)</p>
                      <p className="text-zinc-400 text-xs">2. No</p>
                    </div>
                  )}

                  {ussdStep === 3 && (
                    <div>
                      <p className="text-white font-medium mb-2">✅ Purchase Successful!</p>
                      <p className="text-zinc-400 text-xs">Policy BOS-ACTIVE</p>
                      <p className="text-zinc-400 text-xs">KES 20 · Daily Boda Cover</p>
                      <p className="text-emerald-400 text-xs mt-2">M-Pesa receipt: MPE7K2X9</p>
                    </div>
                  )}

                  {ussdStep >= 3 ? (
                    <div className="mt-4 pt-3 border-t border-zinc-800">
                      <p className="text-xs text-zinc-500 mb-2">
                        An SMS has been sent with a link to upload claim photos
                      </p>
                      <Button size="sm" variant="outline" className="text-xs" onClick={() => { setShowUssd(false); setStep('upload'); }}>
                        <Upload className="mr-1 h-3 w-3" /> Upload Photos Now
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" className="mt-4 bg-white text-zinc-900 hover:bg-zinc-200" onClick={handleUssdInteraction}>
                      {ussdStep === 0 ? 'Select Option 2' : ussdStep === 1 ? 'Select Option 1' : 'Confirm'}
                    </Button>
                  )}
                </div>

                {ussdStep === 0 && (
                  <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => { setShowUssd(false); setStep('describe'); }}>
                    Skip to Web Upload Instead
                  </Button>
                )}
              </Card>
            )}

            {step === 'describe' && (
              <Card className="p-6">
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Claim Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">
                      Policy Number
                    </label>
                    <Input
                      placeholder="e.g., BOS-A1B2C3 or your phone number"
                      value={policy}
                      onChange={(e) => setPolicy(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">
                      What happened?
                    </label>
                    <Textarea
                      placeholder="Describe the incident (e.g., 'Hit by another boda on Kenyatta Ave at 2pm')"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <Button
                    className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
                    disabled={!policy || !description}
                    onClick={() => setStep('upload')}
                  >
                    <Send className="mr-2 h-4 w-4" /> Continue to Photo Upload
                  </Button>
                </div>
              </Card>
            )}

            {step === 'upload' && (
              <Card className="p-6">
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Upload Evidence</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                  Take photos of the damage with your phone. Our AI will analyze them instantly.
                </p>

                <div
                  className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-8 text-center cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto text-zinc-400 mb-3" />
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Tap to upload photos</p>
                  <p className="text-xs text-zinc-400 mt-1">Supports JPG, PNG · Max 5 photos</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-5 gap-2">
                    {images.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/50 flex items-center justify-center"
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  className="mt-4 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
                  disabled={images.length === 0}
                  onClick={handleProcessClaim}
                >
                  <Shield className="mr-2 h-4 w-4" /> Process Claim with AI
                </Button>
              </Card>
            )}

            {step === 'processing' && (
              <Card className="p-12 text-center">
                <div className="animate-pulse">
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                      <Clock className="h-8 w-8 text-zinc-500" />
                    </div>
                  </div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">AI is Analyzing Your Claim</h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Checking images for authenticity and damage assessment...</p>
                  <div className="mt-6 flex justify-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-2 w-2 rounded-full bg-zinc-900 dark:bg-zinc-100 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {step === 'result' && result && (
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    result.status === 'approved' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                    result.status === 'human_review' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                    'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  }`}>
                    {result.status === 'approved' ? <Check className="h-6 w-6" /> :
                     result.status === 'human_review' ? <AlertTriangle className="h-6 w-6" /> :
                     <X className="h-6 w-6" />}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                      {result.status === 'approved' ? 'Claim Approved!' :
                       result.status === 'human_review' ? 'Under Human Review' :
                       'Claim Rejected'}
                    </h2>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{result.message}</p>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900 p-3">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Claim ID</p>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{result.id}</p>
                      </div>
                      <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900 p-3">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">AI Confidence</p>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{result.confidenceScore}%</p>
                      </div>
                      {result.payoutAmount && (
                        <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900 p-3">
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">Payout Amount</p>
                          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(result.payoutAmount)}
                          </p>
                        </div>
                      )}
                      {result.blockchainTxHash && (
                        <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900 p-3">
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">Blockchain TX</p>
                          <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400 truncate">{result.blockchainTxHash.slice(0, 16)}...</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <Badge variant="outline" className={claimStatusColor(result.status)}>
                        {result.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={resetClaim}
                    >
                      File Another Claim
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-3">AI Assessment Criteria</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-600 dark:text-zinc-400">Image Quality</span>
                    <span className="text-zinc-900 dark:text-zinc-100 font-medium">92%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div className="h-full w-[92%] rounded-full bg-zinc-900 dark:bg-zinc-100" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-600 dark:text-zinc-400">Damage Severity</span>
                    <span className="text-zinc-900 dark:text-zinc-100 font-medium">65%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div className="h-full w-[65%] rounded-full bg-amber-500" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-600 dark:text-zinc-400">Manipulation Check</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">Clean</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div className="h-full w-[98%] rounded-full bg-green-500" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-600 dark:text-zinc-400">Geo-Location Match</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">Verified</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div className="h-full w-[95%] rounded-full bg-green-500" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-600 dark:text-zinc-400">Timestamp Consistency</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">Match</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div className="h-full w-full rounded-full bg-green-500" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-2">How It Works</h3>
              <ol className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                <li className="flex gap-2"><span className="font-medium text-zinc-900 dark:text-zinc-100">1.</span> Dial *384*XXX# and select File Claim</li>
                <li className="flex gap-2"><span className="font-medium text-zinc-900 dark:text-zinc-100">2.</span> Receive SMS with secure upload link</li>
                <li className="flex gap-2"><span className="font-medium text-zinc-900 dark:text-zinc-100">3.</span> Take photo of the damage</li>
                <li className="flex gap-2"><span className="font-medium text-zinc-900 dark:text-zinc-100">4.</span> AI analyzes and scores the claim</li>
                <li className="flex gap-2"><span className="font-medium text-zinc-900 dark:text-zinc-100">5.</span> High confidence → Auto-approved + payout</li>
                <li className="flex gap-2"><span className="font-medium text-zinc-900 dark:text-zinc-100">6.</span> Low confidence → Human adjuster reviews</li>
              </ol>
            </Card>

            <Card className="p-4 border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-semibold text-sm text-emerald-800 dark:text-emerald-300">Blockchain-Protected</h3>
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                Every transaction is recorded on the Stellar Soroban ledger — immutable,
                auditable, and transparent. No double-claiming. No tampering.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
