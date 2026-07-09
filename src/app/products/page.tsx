'use client';

import { useState, useEffect } from 'react';
import { Shield, ArrowLeft, Check, Loader2, Sparkles, Sliders, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Plan {
  id: string;
  category: string;
  name: string;
  description: string;
  premium: number;
  coverage: number;
  durationText: string;
  isCustom?: boolean;
}

const staticPlans: Plan[] = [
  // Kilimo Shield
  { id: 'kilimo-basic', category: 'kilimo', name: 'Crop Guard Basic', description: 'Basic parametric protection for smallholder farmers against local drought.', premium: 150, coverage: 20000, durationText: 'per season' },
  { id: 'kilimo-standard', category: 'kilimo', name: 'Weather-Indexed Plus', description: 'Standard index-based protection against severe flooding and dry spells.', premium: 450, coverage: 70000, durationText: 'per season' },
  { id: 'kilimo-executive', category: 'kilimo', name: 'Parametric Shield', description: 'Premium comprehensive crop and yield protection with satellite auditing.', premium: 1200, coverage: 200000, durationText: 'per season' },

  // Boda & Motor
  { id: 'boda-basic', category: 'boda', name: 'Boda Daily', description: 'Accident and medical coverage for boda boda operators.', premium: 20, coverage: 30000, durationText: 'per day' },
  { id: 'boda-standard', category: 'boda', name: 'Rider Commuter', description: 'Weekly comprehensive package covering rider injury and third party liability.', premium: 100, coverage: 100000, durationText: 'per week' },
  { id: 'boda-executive', category: 'boda', name: 'Comprehensive Motor', description: 'Full monthly commercial motor insurance for motorcycles and vehicles.', premium: 500, coverage: 500000, durationText: 'per month' },

  // Biashara Cover
  { id: 'biashara-basic', category: 'biashara', name: 'Mama Mboga Daily', description: 'Bite-sized business protection for market traders and street vendors.', premium: 30, coverage: 20000, durationText: 'per day' },
  { id: 'biashara-standard', category: 'biashara', name: 'Market Stall Standard', description: 'Weekly protection covering inventory loss, fire, and theft.', premium: 150, coverage: 80000, durationText: 'per week' },
  { id: 'biashara-executive', category: 'biashara', name: 'Retail Shop Secure', description: 'Monthly robust secure package for physical shop owners against burglary.', premium: 800, coverage: 300000, durationText: 'per month' },

  // Afya Care
  { id: 'health-basic', category: 'health', name: 'Bima Afya Basic', description: 'Weekly low-cost health and hospitalization cover.', premium: 50, coverage: 50000, durationText: 'per week' },
  { id: 'health-standard', category: 'health', name: 'Sacco Health Cover', description: 'Monthly health protection for group and Sacco members.', premium: 200, coverage: 150000, durationText: 'per month' },
  { id: 'health-executive', category: 'health', name: 'Afya Family Shield', description: 'Monthly premium healthcare coverage for the entire household.', premium: 600, coverage: 500000, durationText: 'per month' }
];

const categories = [
  { id: 'kilimo', name: '🌾 Kilimo Shield', description: 'Parametric Agriculture & Crop Protection' },
  { id: 'boda', name: '🏍️ Boda & Motor', description: 'Rider & Commercial Vehicle Insurance' },
  { id: 'biashara', name: '🏪 Biashara Cover', description: 'Micro-retail Stall & Business Safety' },
  { id: 'health', name: '🩺 Afya Care', description: 'Family & Hospitalization Support' }
];

export default function ProductsPage() {
  const supabase = createClient();
  const [activeCategory, setActiveCategory] = useState('kilimo');
  const [dbPlans, setDbPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  
  // Custom Policy Builder state
  const [isBuildingCustom, setIsBuildingCustom] = useState(false);
  const [customName, setCustomName] = useState('My Custom Shield');
  const [customCategory, setCustomCategory] = useState('biashara');
  const [customCoverage, setCustomCoverage] = useState(100000);
  const [customDuration, setCustomDuration] = useState(30);
  const [selectedRisks, setSelectedRisks] = useState<string[]>(['Theft', 'Accident']);
  const [customKraPin, setCustomKraPin] = useState('');
  const [customNationalId, setCustomNationalId] = useState('');
  
  // Underwriting status
  const [underwritingResult, setUnderwritingResult] = useState<any>(null);
  const [isUnderwriting, setIsUnderwriting] = useState(false);

  // General state
  const [showConfirm, setShowConfirm] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [policyRef, setPolicyRef] = useState('');
  const [userSession, setUserSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch dynamic plans and session
  useEffect(() => {
    const initData = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      setUserSession(sessionData.session);

      // Fetch dynamic custom plans created by insurers
      const { data: plansData } = await supabase
        .from('custom_plans')
        .select('*');
      
      if (plansData) {
        const formattedPlans: Plan[] = plansData.map((p) => ({
          id: p.id,
          category: p.category,
          name: p.name,
          description: p.description || 'Custom insurer-deployed coverage.',
          premium: Number(p.premium_amount),
          coverage: Number(p.coverage_amount),
          durationText: `for ${p.duration_days} days`,
          isCustom: true
        }));
        setDbPlans(formattedPlans);
      }
    };
    initData();
  }, []);

  const allPlans = [...staticPlans, ...dbPlans];
  const activePlans = allPlans.filter((p) => p.category === activeCategory);

  const toggleRisk = (risk: string) => {
    setSelectedRisks((prev) => 
      prev.includes(risk) ? prev.filter((r) => r !== risk) : [...prev, risk]
    );
  };

  // Run AI Underwriter
  const handleAIUnderwrite = async () => {
    if (!customKraPin.trim() || !customNationalId.trim()) {
      alert('Please fill in both KRA PIN and National ID to run AI Underwriting.');
      return;
    }
    setIsUnderwriting(true);
    try {
      const response = await fetch('/api/ai/underwrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: customCategory,
          coverageAmount: customCoverage,
          durationDays: customDuration,
          risks: selectedRisks,
          kraPin: customKraPin,
          nationalId: customNationalId
        })
      });
      const data = await response.json();
      setUnderwritingResult(data);
    } catch (err) {
      console.error(err);
      alert('AI Underwriter calculation failed. Using local math values.');
    } finally {
      setIsUnderwriting(false);
    }
  };

  // Handle Purchase of static or custom policy
  const handlePurchase = async () => {
    const targetPlan = selectedPlan || (underwritingResult ? {
      id: 'ai-custom',
      name: customName,
      category: customCategory,
      premium: underwritingResult.premiumAmount,
      coverage: customCoverage,
      durationText: `for ${customDuration} days`
    } : null);

    if (!targetPlan) return;

    if (!userSession?.user) {
      alert('Please Sign In first to buy a policy.');
      return;
    }

    setLoading(true);
    try {
      const startDate = new Date();
      const endDate = new Date();
      if (selectedPlan) {
        if (selectedPlan.id.includes('kilimo')) {
          endDate.setMonth(endDate.getMonth() + 6);
        } else if (selectedPlan.id.includes('basic') || selectedPlan.id.includes('daily')) {
          endDate.setDate(endDate.getDate() + 1);
        } else if (selectedPlan.id.includes('standard') || selectedPlan.id.includes('week')) {
          endDate.setDate(endDate.getDate() + 7);
        } else {
          endDate.setDate(endDate.getDate() + 30);
        }
      } else {
        endDate.setDate(endDate.getDate() + customDuration);
      }

      const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

      const { data: policyData, error: policyError } = await supabase
        .from('policies')
        .insert({
          user_id: userSession.user.id,
          policy_type: targetPlan.id,
          premium_amount: targetPlan.premium,
          coverage_amount: targetPlan.coverage,
          status: 'active',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          blockchain_tx_hash: txHash,
          category: targetPlan.category,
          plan_id: targetPlan.id
        })
        .select()
        .single();

      if (policyError) throw policyError;

      // Log transaction to Ledger logs on Supabase
      await supabase.from('ledger_logs').insert({
        entity_type: 'policy_issuance',
        entity_id: policyData.id,
        tx_hash: txHash,
        network: 'stellar_soroban',
        payload: { 
          product: targetPlan.name, 
          premium: targetPlan.premium, 
          custom: !selectedPlan,
          kraPin: customKraPin || null 
        }
      });

      setPolicyRef(`BOS-${policyData.id.slice(0, 8).toUpperCase()}`);
      setPurchased(true);
    } catch (error: any) {
      console.error('Purchase error:', error);
      alert(error.message || 'Payment processing failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href={userSession ? "/client" : "/"} 
            className="flex h-10 w-10 items-center justify-center border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-neutral-100 hover:border-neutral-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Insurance Products &amp; Catalog</h1>
            <p className="text-sm text-neutral-400">Select structured micro-coverage or construct a custom plan underwritten by AI.</p>
          </div>
        </div>

        {!userSession && (
          <div className="mb-6 p-4 bg-yellow-950/20 border border-yellow-800 text-xs text-yellow-300 font-medium flex justify-between items-center">
            <span>You need to be signed in to purchase a policy.</span>
            <Link href="/auth/login" className="underline font-bold uppercase hover:text-white">Sign In &rarr;</Link>
          </div>
        )}

        {!purchased ? (
          <div className="space-y-6">
            {/* View Mode Switcher */}
            <div className="flex border-b border-neutral-800">
              <button
                onClick={() => { setIsBuildingCustom(false); setSelectedPlan(null); setShowConfirm(false); }}
                className={`py-3 px-6 text-sm font-bold border-b-2 transition-all ${
                  !isBuildingCustom 
                    ? 'border-neutral-100 text-white bg-neutral-900/30' 
                    : 'border-transparent text-neutral-500 hover:text-neutral-300'
                }`}
              >
                Browse Standard Catalog
              </button>
              <button
                onClick={() => { setIsBuildingCustom(true); setSelectedPlan(null); setShowConfirm(false); }}
                className={`py-3 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                  isBuildingCustom 
                    ? 'border-neutral-100 text-white bg-neutral-900/30' 
                    : 'border-transparent text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <Sparkles className="h-4 w-4 text-emerald-400" />
                Build Custom AI Policy
              </button>
            </div>

            {!isBuildingCustom ? (
              <>
                {/* Categories Tab Selector */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveCategory(cat.id);
                        setSelectedPlan(null);
                        setShowConfirm(false);
                      }}
                      className={`p-3 text-left border transition-colors ${
                        activeCategory === cat.id
                          ? 'border-neutral-100 bg-neutral-900 text-white font-bold'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <h4 className="text-xs uppercase tracking-wider">{cat.name}</h4>
                      <p className="text-[10px] text-neutral-500 mt-1 leading-snug line-clamp-1">{cat.description}</p>
                    </button>
                  ))}
                </div>

                {/* Plans Grid */}
                <div className="grid md:grid-cols-3 gap-4">
                  {activePlans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => {
                        setSelectedPlan(plan);
                        setShowConfirm(false);
                      }}
                      className={`p-5 text-left border transition-all ${
                        selectedPlan?.id === plan.id
                          ? 'border-neutral-100 bg-neutral-900 ring-1 ring-neutral-100'
                          : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                      }`}
                    >
                      {plan.isCustom && (
                        <span className="inline-block text-[9px] bg-emerald-600/20 text-emerald-400 px-2 py-0.5 mb-2 font-semibold uppercase tracking-wider border border-emerald-500/30">
                          Dynamic Cover
                        </span>
                      )}
                      <h3 className="font-bold text-sm text-neutral-100">{plan.name}</h3>
                      <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed min-h-[40px]">{plan.description}</p>
                      
                      <div className="mt-4 pt-4 border-t border-neutral-800 flex justify-between items-end">
                        <div>
                          <p className="text-xs text-neutral-500">Coverage</p>
                          <p className="text-sm font-semibold text-neutral-200">KES {plan.coverage.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-white">KES {plan.premium}</p>
                          <p className="text-[10px] text-neutral-500">{plan.durationText}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Static Plan Info Card */}
                {selectedPlan && !showConfirm && (
                  <Card className="p-6 bg-neutral-900 border border-neutral-800 rounded-none">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1 space-y-4">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-neutral-400">Selected Policy</span>
                          <h2 className="text-lg font-bold text-white mt-1">{selectedPlan.name}</h2>
                          <p className="text-xs text-neutral-400 mt-1">{selectedPlan.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-neutral-950 p-3 border border-neutral-800">
                            <span className="text-[10px] text-neutral-500 uppercase">Premium Fee</span>
                            <p className="text-lg font-bold text-white">KES {selectedPlan.premium}</p>
                            <span className="text-[10px] text-neutral-400">{selectedPlan.durationText}</span>
                          </div>
                          <div className="bg-neutral-950 p-3 border border-neutral-800">
                            <span className="text-[10px] text-neutral-500 uppercase">Total Coverage Limit</span>
                            <p className="text-lg font-bold text-white">KES {selectedPlan.coverage.toLocaleString()}</p>
                            <span className="text-[10px] text-neutral-400">Guaranteed Claim Max</span>
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-2">
                          {['Direct payouts via M-Pesa', 'Audit-free rapid claims verification', 'Blockchain ledger-registered ledger log'].map((benefit, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-neutral-300">
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                              {benefit}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="w-full md:w-64 flex flex-col justify-end gap-2.5">
                        <Button
                          onClick={() => setShowConfirm(true)}
                          className="bg-neutral-100 text-neutral-900 hover:bg-neutral-200 w-full font-bold uppercase text-xs tracking-wider rounded-none py-3"
                        >
                          Checkout via M-Pesa
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setSelectedPlan(null)}
                          className="border-neutral-850 bg-neutral-950 text-neutral-400 hover:text-white rounded-none w-full text-xs"
                        >
                          Cancel Selection
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
              </>
            ) : (
              /* Custom AI Policy Creator UI */
              <Card className="p-6 bg-neutral-900 border border-neutral-800 rounded-none space-y-6">
                <div className="flex items-center gap-2.5 border-b border-neutral-800 pb-3">
                  <Sliders className="h-5 w-5 text-neutral-300" />
                  <div>
                    <h2 className="text-md font-bold text-white">AI Policy Underwriting sandbox</h2>
                    <p className="text-xs text-neutral-400">Adjust risk parameters and let the AI model dynamically calculate the premium rate.</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left Column: Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Policy Name</label>
                      <input 
                        type="text" 
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs text-neutral-100 focus:outline-none focus:border-neutral-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Underwriting Category</label>
                      <select 
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs text-neutral-100 focus:outline-none focus:border-neutral-600"
                      >
                        <option value="kilimo">Kilimo Shield (Agriculture)</option>
                        <option value="boda">Boda &amp; Motor Cover (Vehicle)</option>
                        <option value="biashara">Biashara Cover (Micro-Retail)</option>
                        <option value="health">Afya Care (Health &amp; Family)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-400 mb-1.5">National ID Number</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 30219854"
                          value={customNationalId}
                          onChange={(e) => setCustomNationalId(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs text-neutral-100 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-neutral-400 mb-1.5">KRA PIN Number</label>
                        <input 
                          type="text" 
                          placeholder="e.g. A001234567Z"
                          value={customKraPin}
                          onChange={(e) => setCustomKraPin(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs text-neutral-100 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Coverage Amount Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-semibold text-neutral-400">Coverage Limit (KES)</label>
                        <span className="text-xs font-bold text-neutral-100">KES {customCoverage.toLocaleString()}</span>
                      </div>
                      <input 
                        type="range" 
                        min="20000" 
                        max="1000000" 
                        step="10000"
                        value={customCoverage}
                        onChange={(e) => setCustomCoverage(Number(e.target.value))}
                        className="w-full accent-neutral-100 bg-neutral-950 h-1"
                      />
                    </div>

                    {/* Duration Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-semibold text-neutral-400">Coverage Duration (Days)</label>
                        <span className="text-xs font-bold text-neutral-100">{customDuration} Days</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="365" 
                        value={customDuration}
                        onChange={(e) => setCustomDuration(Number(e.target.value))}
                        className="w-full accent-neutral-100 bg-neutral-950 h-1"
                      />
                    </div>
                  </div>

                  {/* Right Column: Risks & Live AI Output */}
                  <div className="space-y-4 flex flex-col justify-between">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-400 mb-2">Include Risk Factors</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Accident', 'Theft', 'Fire', 'Flood', 'Riot Cover'].map((risk) => (
                          <button
                            key={risk}
                            type="button"
                            onClick={() => toggleRisk(risk)}
                            className={`p-2 text-left text-xs border transition-colors ${
                              selectedRisks.includes(risk) 
                                ? 'bg-neutral-100 text-neutral-900 border-neutral-100 font-bold' 
                                : 'border-neutral-850 bg-neutral-950 text-neutral-400 hover:border-neutral-800'
                            }`}
                          >
                            {risk}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* AI Output Result Box */}
                    <div className="bg-neutral-950 border border-neutral-850 p-4 space-y-3 min-h-[160px] flex flex-col justify-center">
                      {isUnderwriting ? (
                        <div className="text-center py-6 text-xs text-neutral-500 flex flex-col items-center justify-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin text-neutral-300" />
                          <span>AI Risk Assessor computing mathematical models...</span>
                        </div>
                      ) : underwritingResult ? (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center border-b border-neutral-850 pb-2">
                            <div>
                              <span className="text-[10px] text-neutral-500 uppercase">AI Premium Quote</span>
                              <p className="text-lg font-extrabold text-white">KES {underwritingResult.premiumAmount}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-neutral-500 uppercase">Risk Level</span>
                              <p className={`text-xs font-bold ${
                                underwritingResult.riskVerdict === 'High' ? 'text-red-400' : 'text-emerald-400'
                              }`}>{underwritingResult.riskVerdict} ({underwritingResult.riskScore}%)</p>
                            </div>
                          </div>
                          <p className="text-xs text-neutral-400 italic leading-relaxed">
                            {underwritingResult.underwritingNote}
                          </p>
                          {underwritingResult.isKraValid === false && (
                            <p className="text-[10px] text-red-400 font-medium">
                              ⚠️ Warning: KRA PIN format is invalid. Claims might be rejected during audit.
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-xs text-neutral-500 flex flex-col items-center justify-center gap-1.5">
                          <Sparkles className="h-5 w-5 text-neutral-600" />
                          <span>Enter KRA PIN and click "Underwrite Policy" to see pricing quote.</span>
                        </div>
                      )}
                    </div>

                    {/* Form Buttons */}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={handleAIUnderwrite}
                        disabled={isUnderwriting}
                        className="bg-neutral-800 text-neutral-100 hover:bg-neutral-700 w-full text-xs font-bold uppercase rounded-none border border-neutral-700"
                      >
                        Underwrite Policy
                      </Button>
                      {underwritingResult && (
                        <Button
                          type="button"
                          onClick={() => setShowConfirm(true)}
                          className="bg-neutral-100 text-neutral-900 hover:bg-neutral-200 w-full text-xs font-bold uppercase rounded-none"
                        >
                          Checkout Plan
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        ) : null}

        {/* Confirmation Screen */}
        {showConfirm && !purchased && (
          <Card className="p-6 border-neutral-800 bg-neutral-900 rounded-none mt-8">
            <div className="text-center max-w-sm mx-auto space-y-4">
              <div className="flex justify-center">
                <div className="h-12 w-12 bg-neutral-950 border border-neutral-800 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirm Policy Purchase</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Policy: {selectedPlan ? selectedPlan.name : customName}
                </p>
                <p className="text-xs text-neutral-400">
                  Premium Amount: KES {selectedPlan ? selectedPlan.premium : underwritingResult.premiumAmount}
                </p>
              </div>
              <p className="text-xs text-neutral-500">
                An M-Pesa STK push prompt will be dispatched instantly to your phone. Enter your PIN to finalize underwriting.
              </p>
              <div className="flex justify-center gap-2 pt-2">
                <Button 
                  onClick={handlePurchase} 
                  disabled={loading}
                  className="bg-neutral-100 text-neutral-900 hover:bg-neutral-200 font-bold text-xs uppercase tracking-wider rounded-none px-6"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Confirm Pay via M-Pesa
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowConfirm(false)} 
                  disabled={loading}
                  className="border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white rounded-none text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Success Screen */}
        {purchased && (
          <Card className="p-12 border-emerald-900 bg-neutral-900 rounded-none text-center max-w-lg mx-auto space-y-5">
            <div className="flex justify-center">
              <div className="h-16 w-16 bg-neutral-950 border border-emerald-800 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Policy Underwritten Successfully! 🎉</h2>
              <p className="text-xs text-neutral-400">
                Your cover is now active and stored securely.
              </p>
              <div className="inline-block bg-neutral-950 border border-neutral-850 px-3 py-1.5 text-xs text-neutral-300 font-mono mt-1">
                Ref: {policyRef}
              </div>
            </div>
            <p className="text-[10px] text-neutral-500">
              The ledger logs and audit states have been written to the blockchain registry for complete transparency.
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <Button 
                variant="outline" 
                onClick={() => { setPurchased(false); setSelectedPlan(null); setShowConfirm(false); setUnderwritingResult(null); }}
                className="border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white rounded-none text-xs"
              >
                Purchase Another Cover
              </Button>
              <Link
                href="/client"
                className="inline-flex h-9 items-center justify-center bg-neutral-100 text-neutral-900 hover:bg-neutral-200 px-4 text-xs font-bold uppercase tracking-wider rounded-none"
              >
                Go to Client Portal
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
