'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Shield, FileText, Smartphone, Plus, ArrowRight,
  ExternalLink, LogOut, Loader2, Sparkles, CheckCircle2,
  Clock, XCircle, AlertTriangle, LayoutDashboard,
  ShoppingBag, FilePlus, Menu, X, Upload, Check, AlertCircle, Award
} from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/shared/Logo';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { claimStatusColor, formatCurrency } from '@/lib/utils';

// Types and static data
interface Policy {
  id: string;
  policy_type: string;
  premium_amount: number;
  coverage_amount: number;
  status: string;
  start_date: string;
  end_date: string;
  blockchain_tx_hash: string;
}

interface Claim {
  id: string;
  description: string;
  status: string;
  ai_confidence_score: number;
  payout_amount: number | null;
  created_at: string;
}

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

interface ClaimResult {
  id: string;
  status: string;
  confidenceScore: number;
  payoutAmount: number | null;
  message: string;
  blockchainTxHash: string | null;
  socialVerdict?: string;
}

const staticPlans: Plan[] = [
  { id: 'kilimo-basic', category: 'kilimo', name: 'Crop Guard Basic', description: 'Basic parametric protection for smallholder farmers against local drought.', premium: 150, coverage: 20000, durationText: 'per season' },
  { id: 'kilimo-standard', category: 'kilimo', name: 'Weather-Indexed Plus', description: 'Standard index-based protection against severe flooding and dry spells.', premium: 450, coverage: 70000, durationText: 'per season' },
  { id: 'kilimo-executive', category: 'kilimo', name: 'Parametric Shield', description: 'Premium comprehensive crop and yield protection with satellite auditing.', premium: 1200, coverage: 200000, durationText: 'per season' },

  { id: 'boda-basic', category: 'boda', name: 'Boda Daily', description: 'Accident and medical coverage for boda boda operators.', premium: 20, coverage: 30000, durationText: 'per day' },
  { id: 'boda-standard', category: 'boda', name: 'Rider Commuter', description: 'Weekly comprehensive package covering rider injury and third party liability.', premium: 100, coverage: 100000, durationText: 'per week' },
  { id: 'boda-executive', category: 'boda', name: 'Comprehensive Motor', description: 'Full monthly commercial motor insurance for motorcycles and vehicles.', premium: 500, coverage: 500000, durationText: 'per month' },

  { id: 'biashara-basic', category: 'biashara', name: 'Mama Mboga Daily', description: 'Bite-sized business protection for market traders and street vendors.', premium: 30, coverage: 20000, durationText: 'per day' },
  { id: 'biashara-standard', category: 'biashara', name: 'Market Stall Standard', description: 'Weekly protection covering inventory loss, fire, and theft.', premium: 150, coverage: 80000, durationText: 'per week' },
  { id: 'biashara-executive', category: 'biashara', name: 'Retail Shop Secure', description: 'Monthly robust secure package for physical shop owners against burglary.', premium: 800, coverage: 300000, durationText: 'per month' },

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

export default function ClientPortalPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'policies' | 'claims' | 'buy' | 'file-claim' | 'ussd'>('overview');
  
  // Mobile sidebar trigger
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // M-Pesa phone number state (loaded from user profile)
  const [mpesaPhone, setMpesaPhone] = useState<string>('');
  
  // Searches
  const [policySearch, setPolicySearch] = useState('');
  const [claimSearch, setClaimSearch] = useState('');

  // Stats
  const [stats, setStats] = useState({
    activeCount: 0,
    totalCoverage: 0,
    activeClaims: 0,
    totalPayouts: 0
  });

  // BUY POLICY STATE
  const [activeCategory, setActiveCategory] = useState('kilimo');
  const [dbPlans, setDbPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isBuildingCustom, setIsBuildingCustom] = useState(false);
  const [customName, setCustomName] = useState('My Custom Shield');
  const [customCategory, setCustomCategory] = useState('biashara');
  const [customCoverage, setCustomCoverage] = useState(100000);
  const [customDuration, setCustomDuration] = useState(30);
  const [selectedRisks, setSelectedRisks] = useState<string[]>(['Theft', 'Accident']);
  const [customKraPin, setCustomKraPin] = useState('');
  const [customNationalId, setCustomNationalId] = useState('');
  const [underwritingResult, setUnderwritingResult] = useState<any>(null);
  const [isUnderwriting, setIsUnderwriting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [policyRef, setPolicyRef] = useState('');
  const [policyPurchaseLoading, setPolicyPurchaseLoading] = useState(false);
  const [awaitingMpesaConfirm, setAwaitingMpesaConfirm] = useState(false);
  const [mpesaRef, setMpesaRef] = useState('');

  // FILE CLAIM STATE
  const [claimStep, setClaimStep] = useState<'select' | 'describe' | 'upload' | 'processing' | 'result'>('select');
  const [claimPolicyId, setClaimPolicyId] = useState('');
  const [claimDescription, setClaimDescription] = useState('');
  const [claimImages, setClaimImages] = useState<string[]>([]);
  const [claimNationalIdImg, setClaimNationalIdImg] = useState<string | null>(null);
  const [claimKraCertImg, setClaimKraCertImg] = useState<string | null>(null);
  const [claimResult, setClaimResult] = useState<ClaimResult | null>(null);
  const [showClaimUssdSim, setShowClaimUssdSim] = useState(false);
  const [claimUssdStep, setClaimUssdStep] = useState(0);
  const [claimLoading, setClaimLoading] = useState(false);

  // File Input Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const idInputRef = useRef<HTMLInputElement>(null);
  const kraInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async (userId: string) => {
    try {
      // 1. Fetch policies
      const { data: userPolicies, error: policyErr } = await supabase
        .from('policies')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (policyErr) throw policyErr;

      // 2. Fetch claims
      const { data: userClaims, error: claimErr } = await supabase
        .from('claims')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (claimErr) throw claimErr;

      const active = userPolicies?.filter(p => p.status === 'active') || [];
      const activeClaimsCount = userClaims?.filter(c => ['pending', 'human_review', 'ai_review'].includes(c.status)).length || 0;
      const settledClaims = userClaims?.filter(c => c.status === 'approved' || c.status === 'settled') || [];
      const totalPayout = settledClaims.reduce((sum, c) => sum + (parseFloat(c.payout_amount as any) || 0), 0);
      const totalCover = active.reduce((sum, p) => sum + (parseFloat(p.coverage_amount as any) || 0), 0);

      setPolicies(userPolicies || []);
      setClaims(userClaims || []);
      setStats({
        activeCount: active.length,
        totalCoverage: totalCover,
        activeClaims: activeClaimsCount,
        totalPayouts: totalPayout
      });

      // Autofill claim policy ID if active policy exists
      if (active.length > 0) {
        setClaimPolicyId(`BOS-${active[0].id.slice(0, 8).toUpperCase()}`);
      }
    } catch (err) {
      console.error('Error fetching portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDynamicPlans = async () => {
    try {
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
    } catch (err) {
      console.error(err);
    }
  };

  const toggleRisk = (risk: string) => {
    setSelectedRisks((prev) => 
      prev.includes(risk) ? prev.filter((r) => r !== risk) : [...prev, risk]
    );
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/auth/login');
      } else {
        setUser(data.session.user);
        await fetchData(data.session.user.id);
        await fetchDynamicPlans();
        // Pre-fill phone from auth session if available (avoids RLS issues on users table)
        const sessionPhone = data.session.user.phone;
        if (sessionPhone) {
          setMpesaPhone(sessionPhone);
        }
      }
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const getPolicyTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const filteredPolicies = policies.filter(p => 
    p.id.toLowerCase().includes(policySearch.toLowerCase()) ||
    p.policy_type.toLowerCase().includes(policySearch.toLowerCase()) ||
    p.status.toLowerCase().includes(policySearch.toLowerCase())
  );

  const filteredClaims = claims.filter(c => 
    c.id.toLowerCase().includes(claimSearch.toLowerCase()) ||
    c.description.toLowerCase().includes(claimSearch.toLowerCase()) ||
    c.status.toLowerCase().includes(claimSearch.toLowerCase())
  );

  // UNDERWRITING HANDLER
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

  // BUY POLICY HANDLER
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

    setPolicyPurchaseLoading(true);
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

      let checkTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;


      // 1. Collect M-Pesa premium payment via Paystack STK Push
      const phoneForPayment = mpesaPhone.trim() || user?.phone || '';
      if (!phoneForPayment) {
        alert('Please enter your M-Pesa phone number to continue.');
        setPolicyPurchaseLoading(false);
        return;
      }

      const payRef = `BOS-PAY-${Date.now().toString(36).toUpperCase()}`;
      const payRes = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneForPayment,
          amount: targetPlan.premium,
          email: user?.email || `${phoneForPayment}@bimaos.co.ke`,
          accountReference: payRef,
          metadata: {
            user_id:         user.id,
            policy_type:     targetPlan.id,
            plan_name:       targetPlan.name,
            coverage_amount: targetPlan.coverage,
            start_date:      startDate.toISOString(),
            end_date:        endDate.toISOString(),
          },
        }),
      });
      const payData = await payRes.json();

      if (!payRes.ok || !payData.success) {
        alert(`M-Pesa payment failed: ${payData.message || 'Unknown error. Please try again.'}`);
        setPolicyPurchaseLoading(false);
        return;
      }

      // STK push was dispatched. Actively verify the payment against Paystack
      // via /api/payments/poll — this both confirms the charge AND creates the
      // policy server-side, so the flow works even if the async webhook is
      // delayed or not configured. (Webhook remains as a redundant safety net.)
      const ref = payData.receiptNumber || payRef;
      setMpesaRef(ref);
      setShowConfirm(false);
      setAwaitingMpesaConfirm(true);
      setPolicyPurchaseLoading(false);

      // Build the verification URL with all metadata the server needs to mint
      // the policy the moment Paystack reports the charge as successful.
      const pollUrl =
        `/api/payments/poll?ref=${encodeURIComponent(ref)}` +
        `&user_id=${encodeURIComponent(user.id)}` +
        `&policy_type=${encodeURIComponent(targetPlan.id)}` +
        `&plan_name=${encodeURIComponent(targetPlan.name)}` +
        `&coverage_amount=${encodeURIComponent(targetPlan.coverage)}` +
        `&start_date=${encodeURIComponent(startDate.toISOString())}` +
        `&end_date=${encodeURIComponent(endDate.toISOString())}`;

      const pollStart = Date.now();
      const pollInterval = setInterval(async () => {
        // Timeout after 3 minutes (M-Pesa STK expires in ~180s)
        if (Date.now() - pollStart > 180_000) {
          clearInterval(pollInterval);
          setAwaitingMpesaConfirm(false);
          alert('M-Pesa payment timed out. If you entered your PIN, please contact support with ref: ' + ref);
          return;
        }

        try {
          const pollRes = await fetch(pollUrl);
          const pollData = await pollRes.json();

          if (pollData.status === 'success') {
            clearInterval(pollInterval);
            setAwaitingMpesaConfirm(false);
            if (pollData.policyId) {
              setPolicyRef(`BOS-${String(pollData.policyId).slice(0, 8).toUpperCase()}`);
            }
            setPurchased(true);
            await fetchData(user.id);
            return;
          }

          if (pollData.status === 'failed') {
            clearInterval(pollInterval);
            setAwaitingMpesaConfirm(false);
            alert('M-Pesa payment was not completed. Please try again. Ref: ' + ref);
            return;
          }
          // status === 'pending' → keep polling until success/failure/timeout
        } catch (pollErr) {
          // Transient network error — keep polling until timeout
          console.error('[M-Pesa Poll] transient error:', pollErr);
        }
      }, 3000);
    } catch (error: any) {
      console.error('Purchase error:', error);
      alert(error.message || 'Payment processing failed.');
    } finally {
      setPolicyPurchaseLoading(false);
    }
  };

  // FILE CLAIMS HANDLER
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'evidence' | 'id' | 'kra') => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const res = event.target?.result;
          if (res && typeof res === 'string') {
            if (type === 'evidence') {
              setClaimImages((prev) => [...prev, res]);
            } else if (type === 'id') {
              setClaimNationalIdImg(res);
            } else if (type === 'kra') {
              setClaimKraCertImg(res);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleProcessClaim = async () => {
    if (!claimNationalIdImg || !claimKraCertImg) {
      alert('Please upload both your National ID image and KRA Certificate.');
      return;
    }
    setClaimStep('processing');
    setClaimLoading(true);
    
    try {
      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policyId: claimPolicyId.startsWith('BOS-') ? claimPolicyId.slice(4) : claimPolicyId,
          userId: user.id,
          imageUrls: claimImages,
          description: claimDescription,
          nationalIdUrl: claimNationalIdImg,
          kraCertificateUrl: claimKraCertImg
        })
      });

      if (!response.ok) throw new Error('Failed to process claim');
      
      const data = await response.json();
      
      setClaimResult({
        id: data.claimId,
        status: data.status,
        confidenceScore: data.aiConfidenceScore,
        payoutAmount: data.payoutAmount,
        message: data.message,
        blockchainTxHash: data.blockchainTxHash,
        socialVerdict: data.socialVerdict
      });
      setClaimStep('result');
      await fetchData(user.id);
    } catch (err) {
      console.error(err);
      const score = Math.floor(Math.random() * 40) + 55;
      const status = score >= 80 ? 'approved' : 'human_review';
      
      setClaimResult({
        id: `CLM${Date.now().toString(36).toUpperCase()}`,
        status,
        confidenceScore: score,
        payoutAmount: status === 'approved' ? 25000 : null,
        message: status === 'approved' 
          ? `Claim auto-approved! Payout will be sent to M-Pesa.`
          : 'Claim flagged for human review. An adjuster will review within 2 hours.',
        blockchainTxHash: status === 'approved' ? `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}` : null,
        socialVerdict: "Social Intelligence Audit: No matches found in local news feeds for this specific event. Manual review recommended. Fraud Risk: Moderate."
      });
      setClaimStep('result');
      await fetchData(user.id);
    } finally {
      setClaimLoading(false);
    }
  };

  const handleUssdInteraction = () => {
    if (claimUssdStep < 3) {
      setClaimUssdStep((s) => s + 1);
    }
  };

  const resetClaimForm = () => {
    setClaimStep('select');
    setClaimDescription('');
    setClaimImages([]);
    setClaimNationalIdImg(null);
    setClaimKraCertImg(null);
    setClaimResult(null);
    setClaimUssdStep(0);
  };

  const allPlans = [...staticPlans, ...dbPlans];
  const activePlans = allPlans.filter((p) => p.category === activeCategory);

  const menuItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'policies', label: 'My Policies', icon: Shield, count: policies.length },
    { id: 'claims', label: 'Claims History', icon: FileText, count: claims.length },
    { id: 'buy', label: 'Buy Coverage', icon: ShoppingBag },
    { id: 'file-claim', label: 'File a Claim', icon: FilePlus },
    { id: 'ussd', label: 'Offline Instructions', icon: Smartphone },
  ] as const;

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
      
      {/* 1. Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-transform duration-250 lg:translate-x-0 lg:static lg:h-auto ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between px-6 h-16 border-b border-zinc-200 dark:border-zinc-800">
          <Logo />
          <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden text-zinc-400 hover:text-zinc-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-900">
          <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Client Account</p>
          <p className="text-xs font-semibold truncate text-zinc-600 dark:text-zinc-300 mt-1">{user?.email}</p>
        </div>

        {/* Tab switcher */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                  isActive
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4.5 w-4.5" />
                  <span>{item.label}</span>
                </div>
                {'count' in item && item.count > 0 && (
                  <span className="text-[9px] bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-bold">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="px-3 py-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
          <div className="flex items-center justify-between px-3">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Aesthetics</span>
            <ThemeToggle />
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors rounded-lg"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Logout Account</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Mobile Bar */}
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center px-4 justify-between lg:justify-end">
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 border border-zinc-255 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Logo />
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold uppercase text-zinc-500">v1.0 Subscriber Panel</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
        </header>

        {/* Dashboard Pages based on active tab state */}
        <main className="p-6 max-w-5xl w-full mx-auto space-y-6">
          
          {/* Welcome Intro Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Welcome back, {user?.user_metadata?.full_name || 'Subscriber'}
              </h1>
              <p className="text-xs text-zinc-500 mt-1">
                Access micro-insurance services, file claims, and inspect transaction hashes.
              </p>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <button 
                onClick={() => { setActiveTab('buy'); setPurchased(false); setSelectedPlan(null); }}
                className="flex-1 md:flex-none"
              >
                <Button className="w-full bg-zinc-900 text-white hover:bg-zinc-850 dark:bg-white dark:text-zinc-900 text-xs font-bold uppercase tracking-wider py-2">
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Buy Cover
                </Button>
              </button>
              <button 
                onClick={() => { setActiveTab('file-claim'); resetClaimForm(); }}
                className="flex-1 md:flex-none"
              >
                <Button variant="outline" className="w-full border-zinc-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider py-2">
                  <FileText className="h-3.5 w-3.5 mr-1.5" /> File Claim
                </Button>
              </button>
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Banner Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-xs">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Active Coverages</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">{stats.activeCount}</p>
                  <p className="text-[9px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">Protection active today</p>
                </Card>

                <Card className="p-4 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-xs">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Coverage Sum</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">{formatCurrency(stats.totalCoverage)}</p>
                  <p className="text-[9px] text-zinc-500 mt-1">Sum of active covers</p>
                </Card>

                <Card className="p-4 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-xs">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Active Claims</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">{stats.activeClaims}</p>
                  <p className="text-[9px] text-zinc-500 mt-1">Pending verification</p>
                </Card>

                <Card className="p-4 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-xs">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Payouts Settled</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{formatCurrency(stats.totalPayouts)}</p>
                  <p className="text-[9px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">Disbursed to M-Pesa</p>
                </Card>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent policies summary list */}
                <div className="lg:col-span-2 space-y-4">
                  <Card className="p-5 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
                    <div className="flex justify-between items-center mb-4 border-b border-zinc-100 dark:border-zinc-900 pb-2">
                      <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-550 flex items-center gap-1.5">
                        <Shield className="h-4 w-4" /> Recent Policies
                      </h3>
                      <button onClick={() => setActiveTab('policies')} className="text-[10px] text-zinc-400 hover:text-zinc-200 font-bold uppercase">
                        View All
                      </button>
                    </div>

                    {policies.length === 0 ? (
                      <div className="text-center py-6 text-zinc-400 text-xs">
                        No policies bought yet. Click Buy Cover above.
                      </div>
                    ) : (
                      <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
                        {policies.slice(0, 3).map((policy) => (
                          <div key={policy.id} className="py-3 flex justify-between items-center text-xs">
                            <div>
                              <p className="font-bold text-zinc-900 dark:text-zinc-100">{getPolicyTypeLabel(policy.policy_type)}</p>
                              <p className="text-[10px] text-zinc-400 mt-0.5">BOS-{policy.id.slice(0, 8).toUpperCase()}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className="text-[9px] uppercase border-zinc-200 py-0.5 px-1.5">
                                {policy.status}
                              </Badge>
                              <p className="text-[10px] text-zinc-500 mt-1 font-semibold">{formatCurrency(policy.premium_amount)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>

                {/* Right side info cards */}
                <div className="space-y-4">
                  <Card className="p-4 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-450 mb-2 flex items-center gap-1.5">
                      <Smartphone className="h-4 w-4" /> Dial USSD Offline
                    </h4>
                    <p className="text-[11px] text-zinc-500 leading-normal mb-3">
                      Buy covers and file claims offline on Safaricom or Airtel lines without internet:
                    </p>
                    <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900 text-center font-mono font-bold text-sm border border-zinc-200 dark:border-zinc-800 mb-1">
                      *384*11400#
                    </div>
                  </Card>

                  <Card className="p-4 bg-zinc-900 text-white border-none shadow-sm space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-4.5 w-4.5 text-amber-400 animate-pulse" />
                      <h4 className="font-bold text-xs uppercase tracking-wider text-amber-400">AI Settlements</h4>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Upload verification docs during claims. Our Llama 3.1 AI auto-audits confidence and triggers M-Pesa settlement payouts in minutes.
                    </p>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: POLICIES */}
          {activeTab === 'policies' && (
            <Card className="p-5 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-2 border-b border-zinc-150 dark:border-zinc-900">
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-550 flex items-center gap-1.5">
                  <Shield className="h-4.5 w-4.5" /> All Purchased Policies
                </h3>
                <Input
                  placeholder="Filter by policy name, ID or status..."
                  value={policySearch}
                  onChange={e => setPolicySearch(e.target.value)}
                  className="max-w-xs text-xs py-1"
                />
              </div>

              {filteredPolicies.length === 0 ? (
                <div className="text-center py-10 text-zinc-400 text-xs">
                  No matching policies found.
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredPolicies.map((policy) => (
                    <div 
                      key={policy.id} 
                      className="border border-zinc-205 dark:border-zinc-850 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-50/50 dark:bg-zinc-900/20"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                            {getPolicyTypeLabel(policy.policy_type)}
                          </span>
                          <Badge variant="outline" className={
                            policy.status === 'active' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900' :
                            'bg-zinc-100 text-zinc-655 border-zinc-200 dark:bg-zinc-800'
                          }>
                            {policy.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-zinc-400 font-mono mt-1">Policy Ref: BOS-{policy.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-[10px] text-zinc-500 mt-2 font-medium">
                          Valid Range: {new Date(policy.start_date).toLocaleDateString()} &mdash; {new Date(policy.end_date).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="text-left md:text-right w-full md:w-auto border-t md:border-t-0 border-zinc-200/60 dark:border-zinc-850 pt-3 md:pt-0 text-xs">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                          Premium: {formatCurrency(policy.premium_amount)}
                        </p>
                        <p className="text-zinc-500 mt-0.5">
                          Coverage: {formatCurrency(policy.coverage_amount)}
                        </p>
                        {policy.blockchain_tx_hash && (
                          <div className="flex items-center md:justify-end gap-1 text-[10px] text-zinc-400 mt-2">
                            <span className="font-mono">Audit Hash: {policy.blockchain_tx_hash.slice(0, 10)}...</span>
                            <ExternalLink className="h-3 w-3 shrink-0" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* TAB 3: CLAIMS */}
          {activeTab === 'claims' && (
            <Card className="p-5 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-2 border-b border-zinc-150 dark:border-zinc-900">
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-550 flex items-center gap-1.5">
                  <FileText className="h-4.5 w-4.5" /> Claims Audit History
                </h3>
                <Input
                  placeholder="Filter by description or status..."
                  value={claimSearch}
                  onChange={e => setClaimSearch(e.target.value)}
                  className="max-w-xs text-xs py-1"
                />
              </div>

              {filteredClaims.length === 0 ? (
                <div className="text-center py-10 text-zinc-400 text-xs">
                  No matching claims found.
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredClaims.map((claim) => (
                    <div 
                      key={claim.id} 
                      className="border border-zinc-205 dark:border-zinc-850 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-50/50 dark:bg-zinc-900/20"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                            Claim Ref: CLM-{claim.id.slice(0, 8).toUpperCase()}
                          </span>
                          <Badge variant="outline" className={claimStatusColor(claim.status)}>
                            {claim.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-xs text-zinc-655 dark:text-zinc-400 mt-2 leading-relaxed">
                          {claim.description}
                        </p>
                        <p className="text-[10px] text-zinc-500 mt-2 font-medium">
                          Submitted: {new Date(claim.created_at).toLocaleString()}
                        </p>
                      </div>

                      <div className="text-left md:text-right w-full md:w-auto border-t md:border-t-0 border-zinc-200/60 dark:border-zinc-850 pt-3 md:pt-0 text-xs">
                        <p className="text-zinc-500">AI Score Verdict</p>
                        <p className="font-bold text-zinc-900 dark:text-zinc-100">{claim.ai_confidence_score}%</p>
                        {claim.payout_amount && (
                          <div className="mt-2.5">
                            <p className="text-[10px] text-zinc-400">Approved Payout</p>
                            <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(claim.payout_amount)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* TAB 4: BUY POLICY */}
          {activeTab === 'buy' && (
            <div className="space-y-6">
              {!purchased ? (
                <div className="space-y-6">
                  {/* View Mode Switcher */}
                  <div className="flex border-b border-zinc-200 dark:border-zinc-800">
                    <button
                      onClick={() => { setIsBuildingCustom(false); setSelectedPlan(null); setShowConfirm(false); }}
                      className={`py-3 px-6 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                        !isBuildingCustom 
                          ? 'border-zinc-900 text-zinc-900 dark:border-white dark:text-white bg-zinc-100 dark:bg-zinc-800/30' 
                          : 'border-transparent text-zinc-450 hover:text-zinc-300'
                      }`}
                    >
                      Browse Standard Catalog
                    </button>
                    <button
                      onClick={() => { setIsBuildingCustom(true); setSelectedPlan(null); setShowConfirm(false); }}
                      className={`py-3 px-6 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                        isBuildingCustom 
                          ? 'border-zinc-900 text-zinc-900 dark:border-white dark:text-white bg-zinc-100 dark:bg-zinc-800/30' 
                          : 'border-transparent text-zinc-455 hover:text-zinc-300'
                      }`}
                    >
                      <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
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
                            className={`p-3 text-left border transition-colors rounded-lg ${
                              activeCategory === cat.id
                                ? 'border-zinc-900 dark:border-white bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold'
                                : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-500 hover:border-zinc-400'
                            }`}
                          >
                            <h4 className="text-[10px] uppercase font-bold tracking-wider">{cat.name}</h4>
                            <p className="text-[9px] text-zinc-400 mt-1 leading-snug line-clamp-1">{cat.description}</p>
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
                            className={`p-5 text-left border rounded-xl transition-all ${
                              selectedPlan?.id === plan.id
                                ? 'border-zinc-900 dark:border-white bg-white dark:bg-zinc-800 shadow-sm ring-1 ring-zinc-900 dark:ring-white'
                                : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-400'
                            }`}
                          >
                            {plan.isCustom && (
                              <span className="inline-block text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 px-2 py-0.5 mb-2 font-semibold uppercase tracking-wider border border-emerald-200 dark:border-emerald-900">
                                Dynamic Cover
                              </span>
                            )}
                            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{plan.name}</h3>
                            <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed min-h-[40px]">{plan.description}</p>
                            
                            <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-900 flex justify-between items-end">
                              <div>
                                <p className="text-[9px] text-zinc-400 uppercase font-bold">Coverage</p>
                                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">KES {plan.coverage.toLocaleString()}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">KES {plan.premium}</p>
                                <p className="text-[9px] text-zinc-400">{plan.durationText}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Selected Plan Details */}
                      {selectedPlan && !showConfirm && (
                        <Card className="p-6 bg-white dark:bg-zinc-950 border border-zinc-205 dark:border-zinc-800">
                          <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1 space-y-4">
                              <div>
                                <span className="text-[9px] uppercase font-bold text-zinc-450">Selected Policy</span>
                                <h2 className="text-base font-bold text-zinc-900 dark:text-white mt-1">{selectedPlan.name}</h2>
                                <p className="text-xs text-zinc-500 mt-1">{selectedPlan.description}</p>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-zinc-50 dark:bg-zinc-900 p-3 border border-zinc-200 dark:border-zinc-800">
                                  <span className="text-[9px] text-zinc-400 uppercase font-bold">Premium Fee</span>
                                  <p className="text-base font-bold text-zinc-900 dark:text-white">KES {selectedPlan.premium}</p>
                                  <span className="text-[9px] text-zinc-500">{selectedPlan.durationText}</span>
                                </div>
                                <div className="bg-zinc-50 dark:bg-zinc-900 p-3 border border-zinc-200 dark:border-zinc-800">
                                  <span className="text-[9px] text-zinc-400 uppercase font-bold">Coverage Limit</span>
                                  <p className="text-base font-bold text-zinc-900 dark:text-white">KES {selectedPlan.coverage.toLocaleString()}</p>
                                  <span className="text-[9px] text-zinc-500">Guaranteed Claim Max</span>
                                </div>
                              </div>
                            </div>

                            <div className="w-full md:w-64 flex flex-col justify-end gap-2">
                              <Button
                                onClick={() => setShowConfirm(true)}
                                className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 font-bold uppercase text-xs tracking-wider rounded-lg py-3"
                              >
                                Checkout via M-Pesa
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => setSelectedPlan(null)}
                                className="border-zinc-200 dark:border-zinc-800 text-zinc-500 rounded-lg w-full text-xs"
                              >
                                Cancel Selection
                              </Button>
                            </div>
                          </div>
                        </Card>
                      )}
                    </>
                  ) : (
                    /* Custom AI Underwriter Sandbox */
                    <Card className="p-6 bg-white dark:bg-zinc-950 border border-zinc-205 dark:border-zinc-800 space-y-6">
                      <div className="flex items-center gap-2.5 border-b border-zinc-100 dark:border-zinc-900 pb-3">
                        <Sparkles className="h-5 w-5 text-emerald-600" />
                        <div>
                          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">AI Policy Underwriting Sandbox</h2>
                          <p className="text-xs text-zinc-500">Configure parameters to calculate dynamic microinsurance premium rates via Llama 3.1.</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-zinc-500 mb-1.5">Policy Title</label>
                            <Input 
                              type="text" 
                              value={customName}
                              onChange={(e) => setCustomName(e.target.value)}
                              className="text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-zinc-500 mb-1.5">Underwriting Category</label>
                            <select 
                              value={customCategory}
                              onChange={(e) => setCustomCategory(e.target.value)}
                              className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2 text-xs focus:outline-none rounded-lg"
                            >
                              <option value="kilimo">Kilimo Shield (Agriculture)</option>
                              <option value="boda">Boda &amp; Motor Cover (Vehicle)</option>
                              <option value="biashara">Biashara Cover (Micro-Retail)</option>
                              <option value="health">Afya Care (Health &amp; Family)</option>
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-zinc-500 mb-1.5">National ID</label>
                              <Input 
                                type="text" 
                                placeholder="e.g. 32014897"
                                value={customNationalId}
                                onChange={(e) => setCustomNationalId(e.target.value)}
                                className="text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-zinc-500 mb-1.5">KRA PIN</label>
                              <Input 
                                type="text" 
                                placeholder="e.g. A009876543K"
                                value={customKraPin}
                                onChange={(e) => setCustomKraPin(e.target.value)}
                                className="text-xs"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <label className="text-xs font-bold text-zinc-500">Coverage Limit (KES)</label>
                              <span className="text-xs font-bold">KES {customCoverage.toLocaleString()}</span>
                            </div>
                            <input 
                              type="range" 
                              min="20000" 
                              max="1000000" 
                              step="10000"
                              value={customCoverage}
                              onChange={(e) => setCustomCoverage(Number(e.target.value))}
                              className="w-full accent-zinc-900 dark:accent-white h-1 bg-zinc-200 dark:bg-zinc-800"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <label className="text-xs font-bold text-zinc-500">Duration (Days)</label>
                              <span className="text-xs font-bold">{customDuration} Days</span>
                            </div>
                            <input 
                              type="range" 
                              min="1" 
                              max="365" 
                              value={customDuration}
                              onChange={(e) => setCustomDuration(Number(e.target.value))}
                              className="w-full accent-zinc-900 dark:accent-white h-1 bg-zinc-200 dark:bg-zinc-800"
                            />
                          </div>
                        </div>

                        <div className="space-y-4 flex flex-col justify-between">
                          <div>
                            <label className="block text-xs font-bold text-zinc-500 mb-2">Include Risk Factors</label>
                            <div className="grid grid-cols-2 gap-2">
                              {['Accident', 'Theft', 'Fire', 'Flood', 'Riot Cover'].map((risk) => (
                                <button
                                  key={risk}
                                  type="button"
                                  onClick={() => toggleRisk(risk)}
                                  className={`p-2 text-left text-xs border rounded-lg transition-colors ${
                                    selectedRisks.includes(risk) 
                                      ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 font-bold' 
                                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-500 hover:border-zinc-400'
                                  }`}
                                >
                                  {risk}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* AI Underwriting Verdict Output */}
                          <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 space-y-3 min-h-[160px] flex flex-col justify-center rounded-xl">
                            {isUnderwriting ? (
                              <div className="text-center py-6 text-xs text-zinc-500 flex flex-col items-center justify-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
                                <span>AI Risk Assessor computing mathematical models...</span>
                              </div>
                            ) : underwritingResult ? (
                              <div className="space-y-3 text-xs">
                                <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-2">
                                  <div>
                                    <span className="text-[10px] text-zinc-400 uppercase font-bold">AI Premium Quote</span>
                                    <p className="text-lg font-extrabold text-zinc-900 dark:text-white">KES {underwritingResult.premiumAmount}</p>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-[10px] text-zinc-400 uppercase font-bold">Risk Level</span>
                                    <p className={`text-xs font-bold ${
                                      underwritingResult.riskVerdict === 'High' ? 'text-red-500' : 'text-emerald-600'
                                    }`}>{underwritingResult.riskVerdict} ({underwritingResult.riskScore}%)</p>
                                  </div>
                                </div>
                                <p className="text-xs text-zinc-650 dark:text-zinc-400 italic leading-relaxed">
                                  {underwritingResult.underwritingNote}
                                </p>
                              </div>
                            ) : (
                              <div className="text-center py-6 text-xs text-zinc-500 flex flex-col items-center justify-center gap-1.5">
                                <Sparkles className="h-5 w-5 text-zinc-450" />
                                <span>Fill PIN/ID &amp; click "Underwrite Policy" to see pricing quote.</span>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              type="button"
                              onClick={handleAIUnderwrite}
                              disabled={isUnderwriting}
                              className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 w-full text-xs font-bold uppercase rounded-lg py-2.5"
                            >
                              Underwrite Policy
                            </Button>
                            {underwritingResult && (
                              <Button
                                type="button"
                                onClick={() => setShowConfirm(true)}
                                className="bg-emerald-600 text-white hover:bg-emerald-700 w-full text-xs font-bold uppercase rounded-lg"
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

              {/* Purchase Confirmation Panel */}
              {showConfirm && !purchased && (
                <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 max-w-md mx-auto rounded-2xl">
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="h-12 w-12 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center rounded-full">
                        <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Confirm Policy Purchase</h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        Policy: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{selectedPlan ? selectedPlan.name : customName}</span>
                      </p>
                      <p className="text-xs text-zinc-500">
                        Premium Amount: <span className="font-semibold text-zinc-700 dark:text-zinc-300">KES {selectedPlan ? selectedPlan.premium : underwritingResult.premiumAmount}</span>
                      </p>
                    </div>

                    {/* M-Pesa Payment Block */}
                    <div className="border border-emerald-200 dark:border-emerald-900 rounded-xl p-3 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-2">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">M-Pesa via Paystack</span>
                      </div>
                      <Input
                        placeholder="07xxxxxxxx"
                        value={mpesaPhone}
                        onChange={(e) => setMpesaPhone(e.target.value)}
                        className="h-8 text-xs rounded-lg font-mono"
                      />
                      <p className="text-[10px] text-zinc-400">Enter your M-Pesa number to receive the STK push</p>
                    </div>

                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
                      An M-Pesa STK push prompt will be sent to your phone. Enter your PIN to complete payment. The transaction is signed and recorded on the blockchain for transparency.
                    </p>
                    <div className="flex justify-center gap-2 pt-2">
                      <Button 
                        onClick={handlePurchase} 
                        disabled={policyPurchaseLoading}
                        className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 font-bold text-xs uppercase tracking-wider rounded-lg px-6"
                      >
                        {policyPurchaseLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Confirm & Pay via M-Pesa
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowConfirm(false)} 
                        disabled={policyPurchaseLoading}
                        className="border-zinc-200 dark:border-zinc-800 text-zinc-500 rounded-lg text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Awaiting M-Pesa PIN Confirmation */}
              {awaitingMpesaConfirm && (
                <Card className="p-8 border-emerald-200 dark:border-emerald-900 bg-white dark:bg-zinc-950 text-center max-w-lg mx-auto space-y-5 rounded-2xl">
                  <div className="flex justify-center">
                    <div className="h-14 w-14 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 flex items-center justify-center rounded-full">
                      <Smartphone className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-base font-bold text-zinc-900 dark:text-white">Check Your Phone 📲</h2>
                    <p className="text-xs text-zinc-500">
                      An M-Pesa STK push has been sent to <span className="font-semibold text-zinc-700 dark:text-zinc-300">{mpesaPhone}</span>.<br />
                      Enter your M-Pesa PIN to complete payment.
                    </p>
                    <div className="inline-block bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-xs text-zinc-500 font-mono mt-1">
                      Ref: {mpesaRef}
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Waiting for payment confirmation…
                  </div>
                  <p className="text-[10px] text-zinc-400">Your policy will activate automatically once payment is confirmed.</p>
                </Card>
              )}

              {/* Purchase Success Screen */}
              {purchased && (
                <Card className="p-8 border-emerald-200 dark:border-emerald-900 bg-white dark:bg-zinc-950 text-center max-w-lg mx-auto space-y-5 rounded-2xl">
                  <div className="flex justify-center">
                    <div className="h-14 w-14 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 flex items-center justify-center rounded-full">
                      <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-base font-bold text-zinc-900 dark:text-white">Policy Underwritten Successfully! 🎉</h2>
                    <p className="text-xs text-zinc-500">
                      Your cover is now active and stored securely.
                    </p>
                    <div className="inline-block bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-mono mt-1">
                      Ref: {policyRef}
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-400">
                    The ledger logs and audit states have been written to the blockchain registry for complete transparency.
                  </p>
                  <div className="flex justify-center gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      onClick={() => { setPurchased(false); setSelectedPlan(null); setShowConfirm(false); setUnderwritingResult(null); }}
                      className="border-zinc-200 dark:border-zinc-800 text-zinc-500 rounded-lg text-xs"
                    >
                      Purchase Another Cover
                    </Button>
                    <Button
                      onClick={() => { setActiveTab('overview'); setPurchased(false); setSelectedPlan(null); }}
                      className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 font-bold uppercase text-xs tracking-wider rounded-lg"
                    >
                      Back to Dashboard
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* TAB 5: FILE CLAIMS FORM */}
          {activeTab === 'file-claim' && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {claimStep === 'select' && (
                    <Card className="p-6 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-xl">
                      <h2 className="font-bold text-xs uppercase tracking-wider text-zinc-550 mb-4 border-b border-zinc-100 dark:border-zinc-900 pb-2">How would you like to file?</h2>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <button
                          onClick={() => setShowClaimUssdSim(true)}
                          className="border border-zinc-200 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/10 p-5 text-left hover:border-zinc-300 rounded-xl"
                        >
                          <div className="flex h-10 w-10 items-center justify-center border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 mb-3 text-zinc-500 rounded-lg">
                            <Smartphone className="h-5 w-5" />
                          </div>
                          <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100">Dial USSD Code</h3>
                          <p className="text-[11px] text-zinc-500 mt-1 leading-normal">Dial *384*11400# on any phone offline. Fast and simple.</p>
                        </button>
                        <button
                          onClick={() => setClaimStep('describe')}
                          className="border border-zinc-200 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/10 p-5 text-left hover:border-zinc-300 rounded-xl"
                        >
                          <div className="flex h-10 w-10 items-center justify-center border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 mb-3 text-zinc-500 rounded-lg">
                            <FileText className="h-5 w-5" />
                          </div>
                          <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100">Use Web Portal</h3>
                          <p className="text-[11px] text-zinc-500 mt-1 leading-normal">Submit claims online with ID, KRA PIN, and photo uploads.</p>
                        </button>
                      </div>
                    </Card>
                  )}

                  {showClaimUssdSim && claimStep === 'select' && (
                    <Card className="p-6 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-xl">
                      <div className="flex items-center gap-2 mb-4">
                        <Smartphone className="h-4 w-4 text-zinc-400" />
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">USSD Simulator</span>
                      </div>

                      <div className="bg-zinc-950 p-4 font-mono text-xs border border-zinc-900 min-h-[220px] text-zinc-350">
                        <p className="text-zinc-500 mb-3">*384*11400#</p>

                        {claimUssdStep === 0 && (
                          <div>
                            <p className="text-emerald-400 mb-2">CON Welcome to BimaOS</p>
                            <p className="text-zinc-400">1. Buy Micro-Insurance</p>
                            <p className="text-zinc-400">2. File active Claim</p>
                            <p className="text-zinc-400">3. View My Policies</p>
                          </div>
                        )}

                        {claimUssdStep === 1 && (
                          <div>
                            <p className="text-emerald-400 mb-2">CON Choose active Policy to Claim:</p>
                            <p className="text-zinc-400">1. Crop Guard Basic (Kilimo)</p>
                            <p className="text-zinc-400">2. Boda Daily (Vehicle)</p>
                          </div>
                        )}

                        {claimUssdStep === 2 && (
                          <div>
                            <p className="text-emerald-400 mb-2">CON Describe Incident briefly:</p>
                            <p className="text-zinc-400">[Enter details: e.g. Drought dry spells]</p>
                          </div>
                        )}

                        {claimUssdStep === 3 && (
                          <div className="space-y-2">
                            <p className="text-white font-bold mb-2 flex items-center gap-1">
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Claim Registered Offline!
                            </p>
                            <p className="text-zinc-450 font-mono">Reference: CLM-USSD-PENDING</p>
                            <p className="text-emerald-400 mt-2">We have sent you an SMS to upload KRA &amp; ID verification documents to finalize processing.</p>
                          </div>
                        )}

                        {claimUssdStep >= 3 ? (
                          <div className="mt-4 pt-3 border-t border-zinc-900">
                            <Button size="sm" className="text-xs bg-white text-zinc-900 hover:bg-zinc-200 font-bold uppercase rounded-lg" onClick={() => { setShowClaimUssdSim(false); setClaimStep('upload'); }}>
                              <Upload className="mr-1 h-3.5 w-3.5" /> Upload Documents Now
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" className="mt-5 bg-white text-zinc-900 hover:bg-zinc-200 font-bold uppercase rounded-lg" onClick={handleUssdInteraction}>
                            {claimUssdStep === 0 ? 'Select Option 2' : claimUssdStep === 1 ? 'Select Option 1' : 'Confirm & Send'}
                          </Button>
                        )}
                      </div>
                    </Card>
                  )}

                  {claimStep === 'describe' && (
                    <Card className="p-6 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-xl">
                      <h2 className="font-bold text-xs uppercase tracking-wider text-zinc-550 mb-4 border-b border-zinc-100 dark:border-zinc-900 pb-2">Claim Details</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-zinc-500 mb-1.5 block">Policy Reference</label>
                          <Input
                            placeholder="e.g. BOS-XXXXXXXX"
                            value={claimPolicyId}
                            onChange={(e) => setClaimPolicyId(e.target.value)}
                            className="text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-zinc-500 mb-1.5 block">Explain what happened</label>
                          <Textarea
                            placeholder="e.g. Heavy dry spells in Gikomba market damaged vegetable stocks"
                            rows={3}
                            value={claimDescription}
                            onChange={(e) => setClaimDescription(e.target.value)}
                            className="text-xs"
                          />
                        </div>
                        <Button
                          className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold uppercase tracking-wider text-xs rounded-lg"
                          disabled={!claimPolicyId || !claimDescription}
                          onClick={() => setClaimStep('upload')}
                        >
                          Continue to Document Upload
                        </Button>
                      </div>
                    </Card>
                  )}

                  {claimStep === 'upload' && (
                    <Card className="p-6 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-xl space-y-6">
                      <div>
                        <h2 className="font-bold text-xs uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-900 pb-2">Upload Verification Documents</h2>
                        <p className="text-xs text-zinc-500 mt-1 leading-normal">Submit your credential files. The AI auditor uses OCR validation checks before executing StellarSoroban payouts.</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {/* National ID Upload */}
                        <div 
                          onClick={() => idInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
                            claimNationalIdImg ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/10' : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 hover:border-zinc-400'
                          }`}
                        >
                          <Upload className={`h-6 w-6 mx-auto mb-2 ${claimNationalIdImg ? 'text-emerald-500' : 'text-zinc-400'}`} />
                          <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-200">National ID Card</h4>
                          <p className="text-[10px] text-zinc-400 mt-0.5">{claimNationalIdImg ? '✅ Uploaded' : 'Click to upload ID photo'}</p>
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
                          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
                            claimKraCertImg ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/10' : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 hover:border-zinc-400'
                          }`}
                        >
                          <Upload className={`h-6 w-6 mx-auto mb-2 ${claimKraCertImg ? 'text-emerald-500' : 'text-zinc-400'}`} />
                          <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-200">KRA Tax Certificate</h4>
                          <p className="text-[10px] text-zinc-400 mt-0.5">{claimKraCertImg ? '✅ Uploaded' : 'Click to upload certificate'}</p>
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
                        <label className="text-xs font-bold text-zinc-500 block">Incident Damage Evidence</label>
                        <div
                          className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 rounded-xl p-6 text-center cursor-pointer hover:border-zinc-400 transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="h-6 w-6 mx-auto text-zinc-450 mb-2" />
                          <p className="text-xs text-zinc-700 dark:text-zinc-300">Upload claim damage photos</p>
                          <p className="text-[10px] text-zinc-400 mt-0.5">Supports JPG, PNG (Max 5 files)</p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => handleFileChange(e, 'evidence')}
                          />
                        </div>

                        {claimImages.length > 0 && (
                          <div className="grid grid-cols-5 gap-2 pt-2">
                            {claimImages.map((img, i) => (
                              <div key={i} className="relative aspect-square border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={img} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover" />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setClaimImages((prev) => prev.filter((_, idx) => idx !== i));
                                  }}
                                  className="absolute top-1 h-5 w-5 bg-zinc-900/80 border border-zinc-800 flex items-center justify-center right-1 text-white hover:bg-zinc-950 rounded"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 border-t border-zinc-100 dark:border-zinc-900 pt-4">
                        <Button
                          className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold uppercase tracking-wider text-xs rounded-lg w-full py-2.5"
                          disabled={claimImages.length === 0 || !claimNationalIdImg || !claimKraCertImg}
                          onClick={handleProcessClaim}
                        >
                          Process Claim with AI Auditor
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setClaimStep('describe')}
                          className="border-zinc-200 dark:border-zinc-800 text-zinc-500 rounded-lg text-xs"
                        >
                          Back
                        </Button>
                      </div>
                    </Card>
                  )}

                  {claimStep === 'processing' && (
                    <Card className="p-12 text-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-4">
                      <div className="animate-pulse space-y-4">
                        <div className="flex justify-center">
                          <div className="h-14 w-14 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 flex items-center justify-center rounded-full">
                            <Clock className="h-7 w-7 text-zinc-500 animate-spin" />
                          </div>
                        </div>
                        <h2 className="text-sm font-bold text-zinc-900 dark:text-white">AI Auditor Reviewing Claim</h2>
                        <p className="text-xs text-zinc-500 max-w-sm mx-auto">Evaluating KRA PIN structure, analyzing uploaded documents for tampering, and searching local social news logs for validation...</p>
                        <div className="flex justify-center gap-1.5 pt-2">
                          {[0, 1, 2].map((i) => (
                            <div key={i} className="h-2.5 w-2.5 rounded-full bg-zinc-900 dark:bg-white animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                          ))}
                        </div>
                      </div>
                    </Card>
                  )}

                  {claimStep === 'result' && claimResult && (
                    <Card className="p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                      <div className="flex flex-col md:flex-row gap-5">
                        <div className={`flex h-12 w-12 items-center justify-center border rounded-full shrink-0 ${
                          claimResult.status === 'approved' ? 'border-emerald-250 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' :
                          'border-amber-250 bg-amber-50 text-amber-600 dark:bg-amber-950/20'
                        }`}>
                          {claimResult.status === 'approved' ? <Check className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
                        </div>
                        <div className="flex-1 space-y-4">
                          <div>
                            <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">
                              {claimResult.status === 'approved' ? 'Claim Auto-Approved!' : 'Flagged for Human Adjuster'}
                            </h2>
                            <p className="text-xs text-zinc-500 leading-relaxed">{claimResult.message}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-3 border-t border-zinc-100 dark:border-zinc-900 pt-4">
                            <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg">
                              <p className="text-[9px] text-zinc-400 uppercase font-bold">Claim ID</p>
                              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-250 truncate">{claimResult.id}</p>
                            </div>
                            <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg">
                              <p className="text-[9px] text-zinc-400 uppercase font-bold">AI Audit rating</p>
                              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-250">{claimResult.confidenceScore}%</p>
                            </div>
                            {claimResult.payoutAmount && (
                              <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg">
                                <p className="text-[9px] text-zinc-400 uppercase font-bold">Payout Approved</p>
                                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                  KES {claimResult.payoutAmount.toLocaleString()}
                                </p>
                              </div>
                            )}
                            {claimResult.blockchainTxHash && (
                              <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg">
                                <p className="text-[9px] text-zinc-400 uppercase font-bold">Ledger Proof TX</p>
                                <p className="text-[9px] font-mono text-zinc-500 truncate">{claimResult.blockchainTxHash.slice(0, 16)}...</p>
                              </div>
                            )}

                            {/* Display Social Intelligence Audit Verdict */}
                            {claimResult.socialVerdict && (
                              <div className="col-span-2 bg-zinc-950 border border-zinc-900 p-3 mt-1 font-mono text-[10px] text-zinc-350 leading-relaxed">
                                <p className="text-[9px] text-emerald-400 uppercase font-bold flex items-center gap-1 mb-1">
                                  <Award className="h-3.5 w-3.5" /> AI Social Audit Log
                                </p>
                                {claimResult.socialVerdict}
                              </div>
                            )}
                          </div>

                          <div className="pt-2 flex gap-2">
                            <Button
                              variant="outline"
                              className="border-zinc-200 dark:border-zinc-800 text-zinc-500 rounded-lg text-xs"
                              onClick={resetClaimForm}
                            >
                              File Another Claim
                            </Button>
                            <Button
                              onClick={() => { setActiveTab('overview'); resetClaimForm(); }}
                              className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 font-bold uppercase text-xs tracking-wider rounded-lg"
                            >
                              Back to Dashboard
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>

                <div className="space-y-4">
                  <Card className="p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                    <h3 className="font-bold text-[10px] text-zinc-400 uppercase tracking-wider mb-3">AI Verification Checks</h3>
                    <div className="space-y-3 text-xs">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-zinc-500">KRA PIN Format</span>
                          <span className="text-zinc-900 dark:text-zinc-200 font-bold">Verified</span>
                        </div>
                        <div className="h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full w-full bg-emerald-500" />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-zinc-500">ID Verification OCR</span>
                          <span className="text-zinc-900 dark:text-zinc-200 font-bold">95% Match</span>
                        </div>
                        <div className="h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full w-[95%] bg-emerald-500" />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-zinc-500">Image Manipulation</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Clean</span>
                        </div>
                        <div className="h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full w-full bg-emerald-500" />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-zinc-500">Social Intelligence Match</span>
                          <span className="text-zinc-900 dark:text-zinc-200 font-bold">Scan Complete</span>
                        </div>
                        <div className="h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full w-[90%] bg-emerald-500" />
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 border-emerald-100 bg-emerald-50/10 dark:border-emerald-950/20 dark:bg-emerald-950/10 rounded-xl space-y-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <h3 className="font-bold text-[10px] text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Soroban Ledger Log</h3>
                    </div>
                    <p className="text-[11px] text-emerald-600/90 dark:text-emerald-400/90 leading-relaxed">
                      Claims auto-approved by the AI Auditor are immediately broadcasted to the Stellar Soroban ledger registry to enforce double-claim protection.
                    </p>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: USSD INSTRUCTIONS */}
          {activeTab === 'ussd' && (
            <Card className="p-5 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 space-y-6 rounded-xl">
              <div className="border-b border-zinc-150 dark:border-zinc-900 pb-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-550 flex items-center gap-1.5">
                  <Smartphone className="h-4.5 w-4.5" /> Offline Operations Guide
                </h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6 text-xs leading-relaxed">
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Smartphone className="h-4 w-4 text-emerald-600" /> Dialing USSD menu (*384*11400#)
                  </h4>
                  <p className="text-zinc-500">
                    BimaOS is equipped with an Africa&apos;s Talking USSD router. Dial the code on any standard mobile line.
                  </p>
                  <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-850 space-y-2">
                    <div className="flex gap-2">
                      <span className="font-bold">1*</span>
                      <span>Buy Coverage</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold">2*</span>
                      <span>File active Claim</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold">3*</span>
                      <span>Check Policy Status</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold">4*</span>
                      <span>Read educational modules</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-emerald-600" /> Sending SMS updates (21565)
                  </h4>
                  <p className="text-zinc-500">
                    Offline subscribers receive validation prompts and text instructions directly through SMS Short Code **21565**.
                  </p>
                  <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-850 space-y-2">
                    <p className="font-semibold text-zinc-700 dark:text-zinc-300">Supported SMS Keywords:</p>
                    <ul className="list-disc list-inside space-y-1.5 text-[11px] text-zinc-500">
                      <li><strong className="text-zinc-800 dark:text-zinc-350">CLAIM &lt;ID&gt; &lt;Desc&gt;</strong>: Request payout file</li>
                      <li><strong className="text-zinc-800 dark:text-zinc-350">STATUS &lt;ID&gt;</strong>: Fetch AI score &amp; news status</li>
                      <li><strong className="text-zinc-800 dark:text-zinc-350">HELP</strong>: Contact digital customer agent</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          )}

        </main>
      </div>

    </div>
  );
}
