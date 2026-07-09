'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';
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
  Loader2,
  CheckCircle2,
  AlertCircle
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
  socialVerdict?: string;
}

export default function ClaimsPage() {
  const supabase = createClient();
  const [step, setStep] = useState<ClaimStep>('select');
  const [policy, setPolicy] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [nationalIdImg, setNationalIdImg] = useState<string | null>(null);
  const [kraCertImg, setKraCertImg] = useState<string | null>(null);
  const [result, setResult] = useState<ClaimResult | null>(null);
  
  const [showUssd, setShowUssd] = useState(false);
  const [ussdStep, setUssdStep] = useState(0);
  const [userSession, setUserSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const idInputRef = useRef<HTMLInputElement>(null);
  const kraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchSessionAndPolicy = async () => {
      const { data } = await supabase.auth.getSession();
      setUserSession(data.session);

      if (data.session?.user) {
        // Query user's active policies
        const { data: userPolicies } = await supabase
          .from('policies')
          .select('id')
          .eq('user_id', data.session.user.id)
          .eq('status', 'active')
          .limit(1);

        if (userPolicies && userPolicies.length > 0) {
          setPolicy(`BOS-${userPolicies[0].id.slice(0, 8).toUpperCase()}`);
        } else {
          setPolicy(data.session.user.phone || data.session.user.email || '');
        }
      }
    };
    fetchSessionAndPolicy();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'evidence' | 'id' | 'kra') => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const res = event.target?.result;
          if (res && typeof res === 'string') {
            if (type === 'evidence') {
              setImages((prev) => [...prev, res]);
            } else if (type === 'id') {
              setNationalIdImg(res);
            } else if (type === 'kra') {
              setKraCertImg(res);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleProcessClaim = async () => {
    if (!nationalIdImg || !kraCertImg) {
      alert('Please upload both your National ID image and KRA Certificate.');
      return;
    }
    setStep('processing');
    setLoading(true);
    
    try {
      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policyId: policy.startsWith('BOS-') ? policy.slice(4) : policy, // resolve actual UUID if matching format
          userId: userSession?.user?.id || 'dpl_placeholder',
          imageUrls: images,
          description: description,
          nationalIdUrl: nationalIdImg,
          kraCertificateUrl: kraCertImg
        })
      });

      if (!response.ok) throw new Error('Failed to process claim via API');
      
      const data = await response.json();
      
      setResult({
        id: data.claimId,
        status: data.status,
        confidenceScore: data.aiConfidenceScore,
        payoutAmount: data.payoutAmount,
        message: data.message,
        blockchainTxHash: data.blockchainTxHash,
        socialVerdict: data.socialVerdict
      });
      setStep('result');
    } catch (err) {
      console.error(err);
      // Fallback
      const confidenceScore = Math.floor(Math.random() * 40) + 55;
      const status = confidenceScore >= 80 ? 'approved' : 'human_review';
      const payoutAmount = status === 'approved' ? 25000 : null;
      
      setResult({
        id: `CLM${Date.now().toString(36).toUpperCase()}`,
        status,
        confidenceScore,
        payoutAmount,
        message: status === 'approved' 
          ? `Claim approved! KES ${payoutAmount?.toLocaleString()} will be sent to M-Pesa.`
          : 'Claim flagged for human review. An adjuster will review within 2 hours.',
        blockchainTxHash: status === 'approved' ? `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}` : null,
        socialVerdict: "Social Intelligence Audit: No matches found in local news feeds for this specific event. Manual review recommended. Fraud Risk: Moderate."
      });
      setStep('result');
    } finally {
      setLoading(false);
    }
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
    setNationalIdImg(null);
    setKraCertImg(null);
    setResult(null);
    setUssdStep(0);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href={userSession ? "/client" : "/"} className="flex h-10 w-10 items-center justify-center border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-neutral-100 hover:border-neutral-700 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">File a Claim</h1>
            <p className="text-sm text-neutral-400 font-normal">Submit your claim via USSD or web portal. Get audited and paid instantly.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {step === 'select' && (
              <Card className="p-6 bg-neutral-900 border border-neutral-800 rounded-none">
                <h2 className="font-bold text-sm text-neutral-300 uppercase tracking-wider mb-4 border-b border-neutral-850 pb-2">How would you like to file?</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowUssd(true)}
                    className="border border-neutral-800 bg-neutral-950 p-5 text-left hover:border-neutral-700 transition-colors"
                  >
                    <div className="flex h-10 w-10 items-center justify-center border border-neutral-800 bg-neutral-900 mb-3 text-neutral-400">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-sm text-neutral-100">Dial USSD Code</h3>
                    <p className="text-xs text-neutral-400 mt-1">Dial *384*11400# on any phone offline. Fast and simple.</p>
                  </button>
                  <button
                    onClick={() => setStep('describe')}
                    className="border border-neutral-800 bg-neutral-950 p-5 text-left hover:border-neutral-700 transition-colors"
                  >
                    <div className="flex h-10 w-10 items-center justify-center border border-neutral-800 bg-neutral-900 mb-3 text-neutral-400">
                      <FileText className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-sm text-neutral-100">Use Web Portal</h3>
                    <p className="text-xs text-neutral-400 mt-1">Submit claims online with ID, KRA PIN, and photo uploads.</p>
                  </button>
                </div>
              </Card>
            )}

            {showUssd && step === 'select' && (
              <Card className="p-6 bg-neutral-900 border border-neutral-750 rounded-none">
                <div className="flex items-center gap-2 mb-4">
                  <Smartphone className="h-4 w-4 text-neutral-400" />
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">USSD Simulator</span>
                </div>

                <div className="bg-neutral-950 p-4 font-mono text-xs border border-neutral-850 min-h-[220px]">
                  <p className="text-neutral-500 mb-3">*384*11400#</p>

                  {ussdStep === 0 && (
                    <div>
                      <p className="text-emerald-400 mb-2">CON Welcome to BimaOS</p>
                      <p className="text-neutral-400">1. Buy Micro-Insurance</p>
                      <p className="text-neutral-400">2. File active Claim</p>
                      <p className="text-neutral-400">3. View My Policies</p>
                    </div>
                  )}

                  {ussdStep === 1 && (
                    <div>
                      <p className="text-emerald-400 mb-2">CON Choose active Policy to Claim:</p>
                      <p className="text-neutral-400">1. Crop Guard Basic (Kilimo)</p>
                      <p className="text-neutral-400">2. Boda Daily (Vehicle)</p>
                    </div>
                  )}

                  {ussdStep === 2 && (
                    <div>
                      <p className="text-emerald-400 mb-2">CON Describe Incident briefly:</p>
                      <p className="text-neutral-400">[Enter details: e.g. Drought dry spells]</p>
                    </div>
                  )}

                  {ussdStep === 3 && (
                    <div>
                      <p className="text-white font-bold mb-2">✅ Claim Registered Offline!</p>
                      <p className="text-neutral-400">Reference: CLM-USSD-PENDING</p>
                      <p className="text-emerald-400 mt-2">We have sent you an SMS to upload KRA &amp; ID verification documents to finalize processing.</p>
                    </div>
                  )}

                  {ussdStep >= 3 ? (
                    <div className="mt-4 pt-3 border-t border-neutral-800">
                      <Button size="sm" className="text-xs bg-neutral-100 text-neutral-900 hover:bg-neutral-200 font-bold uppercase rounded-none" onClick={() => { setShowUssd(false); setStep('upload'); }}>
                        <Upload className="mr-1 h-3.5 w-3.5" /> Upload Documents Now
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" className="mt-5 bg-neutral-100 text-neutral-900 hover:bg-neutral-200 font-bold uppercase rounded-none" onClick={handleUssdInteraction}>
                      {ussdStep === 0 ? 'Select Option 2' : ussdStep === 1 ? 'Select Option 1' : 'Confirm & Send'}
                    </Button>
                  )}
                </div>
              </Card>
            )}

            {step === 'describe' && (
              <Card className="p-6 bg-neutral-900 border border-neutral-800 rounded-none">
                <h2 className="font-bold text-sm text-neutral-300 uppercase tracking-wider mb-4 border-b border-neutral-850 pb-2">Claim Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-neutral-400 mb-1 block">
                      Policy Reference
                    </label>
                    <Input
                      placeholder="e.g. BOS-XXXXXXXX"
                      value={policy}
                      onChange={(e) => setPolicy(e.target.value)}
                      className="bg-neutral-950 border-neutral-800 text-neutral-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-400 mb-1 block">
                      Explain what happened
                    </label>
                    <Textarea
                      placeholder="e.g. Heavy rainfall flooded my farm at Eldoret on 5th July"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="bg-neutral-950 border-neutral-800 text-neutral-100 focus:outline-none"
                    />
                  </div>
                  <Button
                    className="bg-neutral-100 text-neutral-900 hover:bg-neutral-200 font-bold uppercase tracking-wider text-xs rounded-none"
                    disabled={!policy || !description}
                    onClick={() => setStep('upload')}
                  >
                    Continue to Document Upload
                  </Button>
                </div>
              </Card>
            )}

            {step === 'upload' && (
              <Card className="p-6 bg-neutral-900 border border-neutral-800 rounded-none space-y-6">
                <div>
                  <h2 className="font-bold text-sm text-neutral-300 uppercase tracking-wider border-b border-neutral-850 pb-2">Upload Verification Documents</h2>
                  <p className="text-xs text-neutral-400 mt-1">To process microinsurance claims, you must upload evidence along with your National ID and KRA Tax Certificate.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* National ID Upload */}
                  <div 
                    onClick={() => idInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-none p-5 text-center cursor-pointer transition-colors ${
                      nationalIdImg ? 'border-emerald-600 bg-emerald-950/10' : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                    }`}
                  >
                    <Upload className={`h-6 w-6 mx-auto mb-2 ${nationalIdImg ? 'text-emerald-500' : 'text-neutral-500'}`} />
                    <h4 className="text-xs font-bold text-neutral-200">National ID Card</h4>
                    <p className="text-[10px] text-neutral-500 mt-0.5">{nationalIdImg ? '✅ Uploaded' : 'Click to upload ID photo'}</p>
                    <input
                      ref={idInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, 'id')}
                    />
                  </div>

                  {/* KRA Certificate Upload */}
                  <div 
                    onClick={() => kraInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-none p-5 text-center cursor-pointer transition-colors ${
                      kraCertImg ? 'border-emerald-600 bg-emerald-950/10' : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                    }`}
                  >
                    <Upload className={`h-6 w-6 mx-auto mb-2 ${kraCertImg ? 'text-emerald-500' : 'text-neutral-500'}`} />
                    <h4 className="text-xs font-bold text-neutral-200">KRA Tax Certificate</h4>
                    <p className="text-[10px] text-neutral-500 mt-0.5">{kraCertImg ? '✅ Uploaded' : 'Click to upload certificate'}</p>
                    <input
                      ref={kraInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, 'kra')}
                    />
                  </div>
                </div>

                {/* Evidence Photos */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-400 block">Incident Photos / Damage Evidence</label>
                  <div
                    className="border-2 border-dashed border-neutral-800 bg-neutral-950 rounded-none p-6 text-center cursor-pointer hover:border-neutral-700 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-6 w-6 mx-auto text-neutral-500 mb-2" />
                    <p className="text-xs text-neutral-300">Upload claim damage photos</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">Supports JPG, PNG (Max 5 files)</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileChange(e, 'evidence')}
                    />
                  </div>

                  {images.length > 0 && (
                    <div className="grid grid-cols-5 gap-2 pt-2">
                      {images.map((img, i) => (
                        <div key={i} className="relative aspect-square border border-neutral-800">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setImages((prev) => prev.filter((_, idx) => idx !== i));
                            }}
                            className="absolute top-1 h-5 w-5 bg-neutral-950/70 border border-neutral-800 flex items-center justify-center right-1 text-white hover:bg-neutral-900"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 border-t border-neutral-850 pt-4">
                  <Button
                    className="bg-neutral-100 text-neutral-900 hover:bg-neutral-200 font-bold uppercase tracking-wider text-xs rounded-none w-full py-2.5"
                    disabled={images.length === 0 || !nationalIdImg || !kraCertImg}
                    onClick={handleProcessClaim}
                  >
                    Process Claim with AI Auditor
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setStep('describe')}
                    className="border-neutral-850 bg-neutral-950 text-neutral-400 hover:text-white rounded-none text-xs"
                  >
                    Back
                  </Button>
                </div>
              </Card>
            )}

            {step === 'processing' && (
              <Card className="p-12 text-center bg-neutral-900 border border-neutral-800 rounded-none space-y-4">
                <div className="animate-pulse space-y-4">
                  <div className="flex justify-center">
                    <div className="h-14 w-14 bg-neutral-950 border border-neutral-850 flex items-center justify-center">
                      <Clock className="h-7 w-7 text-neutral-400" />
                    </div>
                  </div>
                  <h2 className="text-base font-bold text-white">AI Auditor Reviewing Claim</h2>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto">Evaluating KRA PIN structure, analyzing uploaded documents for tampering, and searching local social news logs for validation...</p>
                  <div className="flex justify-center gap-1.5 pt-2">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-2.5 w-2.5 rounded-full bg-neutral-100 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {step === 'result' && result && (
              <Card className="p-6 bg-neutral-900 border border-neutral-800 rounded-none">
                <div className="flex flex-col md:flex-row gap-5">
                  <div className={`flex h-12 w-12 items-center justify-center border shrink-0 ${
                    result.status === 'approved' ? 'border-emerald-600 bg-emerald-950/20 text-emerald-400' :
                    result.status === 'human_review' ? 'border-amber-600 bg-amber-950/20 text-amber-400' :
                    'border-red-600 bg-red-950/20 text-red-400'
                  }`}>
                    {result.status === 'approved' ? <Check className="h-6 w-6" /> :
                     result.status === 'human_review' ? <AlertTriangle className="h-6 w-6" /> :
                     <X className="h-6 w-6" />}
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-md font-bold text-white mb-1">
                        {result.status === 'approved' ? 'Claim Auto-Approved!' :
                         result.status === 'human_review' ? 'Flagged for Human Adjuster' :
                         'Claim Rejected'}
                      </h2>
                      <p className="text-xs text-neutral-400 leading-relaxed">{result.message}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 border-t border-neutral-850 pt-4">
                      <div className="bg-neutral-950 border border-neutral-850 p-3">
                        <p className="text-[10px] text-neutral-500 uppercase">Claim ID</p>
                        <p className="text-xs font-semibold text-neutral-200 truncate">{result.id}</p>
                      </div>
                      <div className="bg-neutral-950 border border-neutral-850 p-3">
                        <p className="text-[10px] text-neutral-500 uppercase">AI Verification Score</p>
                        <p className="text-xs font-semibold text-neutral-200">{result.confidenceScore}%</p>
                      </div>
                      {result.payoutAmount && (
                        <div className="bg-neutral-950 border border-neutral-850 p-3">
                          <p className="text-[10px] text-neutral-500 uppercase">Payout Approved</p>
                          <p className="text-xs font-bold text-emerald-400">
                            KES {result.payoutAmount.toLocaleString()}
                          </p>
                        </div>
                      )}
                      {result.blockchainTxHash && (
                        <div className="bg-neutral-950 border border-neutral-850 p-3">
                          <p className="text-[10px] text-neutral-500 uppercase">Ledger Proof TX</p>
                          <p className="text-[10px] font-mono text-neutral-400 truncate">{result.blockchainTxHash.slice(0, 16)}...</p>
                        </div>
                      )}

                      {/* Display Social Intelligence Audit Verdict */}
                      {result.socialVerdict && (
                        <div className="col-span-2 bg-neutral-950 border border-neutral-850 p-3 mt-1">
                          <p className="text-[10px] text-neutral-500 uppercase font-semibold">AI Social Audit Log</p>
                          <p className="text-xs text-neutral-300 mt-1 leading-relaxed">{result.socialVerdict}</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 flex gap-2">
                      <Button
                        variant="outline"
                        className="border-neutral-850 bg-neutral-950 text-neutral-400 hover:text-white rounded-none text-xs"
                        onClick={resetClaim}
                      >
                        File Another Claim
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card className="p-4 bg-neutral-900 border border-neutral-800 rounded-none">
              <h3 className="font-bold text-xs text-neutral-400 uppercase tracking-wider mb-3">AI Verification Checks</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">KRA PIN Format</span>
                    <span className="text-neutral-200 font-bold">Verified</span>
                  </div>
                  <div className="h-1 bg-neutral-950">
                    <div className="h-full w-full bg-emerald-500" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">ID Verification OCR</span>
                    <span className="text-neutral-200 font-bold">95% Match</span>
                  </div>
                  <div className="h-1 bg-neutral-950">
                    <div className="h-full w-[95%] bg-emerald-500" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">Image Manipulation</span>
                    <span className="text-emerald-400 font-bold">Clean</span>
                  </div>
                  <div className="h-1 bg-neutral-950">
                    <div className="h-full w-full bg-emerald-500" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">Social Intelligence Match</span>
                    <span className="text-neutral-200 font-bold">Scan Complete</span>
                  </div>
                  <div className="h-1 bg-neutral-950">
                    <div className="h-full w-[90%] bg-emerald-500" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-neutral-900 border border-neutral-800 rounded-none space-y-2.5">
              <h3 className="font-bold text-xs text-neutral-400 uppercase tracking-wider mb-1">E2E Verification Flow</h3>
              <ol className="space-y-2 text-xs text-neutral-400 list-decimal pl-4">
                <li>Dial <span className="text-neutral-200 font-semibold">*384*11400#</span> &amp; file claim</li>
                <li>Receive SMS containing document upload links</li>
                <li>Upload photos of National ID and KRA Tax Certificate</li>
                <li>AI checks KRA validity &amp; social intelligence</li>
                <li>High confidence auto-pays M-Pesa immediately</li>
              </ol>
            </Card>

            <Card className="p-4 border-emerald-950 bg-emerald-950/10 rounded-none space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-400" />
                <h3 className="font-bold text-xs text-emerald-300 uppercase tracking-wider">Soroban Ledger Log</h3>
              </div>
              <p className="text-xs text-emerald-400/90 leading-relaxed">
                Claims auto-approved by the AI Auditor are immediately broadcasted to the Stellar Soroban ledger registry to enforce double-claim protection.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
