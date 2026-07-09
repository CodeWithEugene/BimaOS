'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { 
  FileText, Search, ShieldCheck, AlertTriangle, 
  CheckCircle2, XCircle, Calendar, Clock, Loader2, RefreshCcw,
  Eye, FileCheck, Award
} from 'lucide-react';
import { claimStatusColor, formatCurrency, formatDateRelative } from '@/lib/utils';

interface ClaimItem {
  id: string;
  policyId: string;
  policyType: string;
  customer: string;
  amount: number;
  status: 'pending' | 'approved' | 'settled' | 'rejected' | 'human_review';
  date: string;
  aiScore: number;
  description: string;
  flags: string[];
  nationalIdUrl?: string;
  kraCertificateUrl?: string;
  socialVerdict?: string;
  nationalIdNumber?: string;
  kraPin?: string;
}

const mockClaimsFallback: ClaimItem[] = [
  { 
    id: 'CLM-MOCK-001', 
    policyId: 'POL-3492',
    policyType: 'Daily Market Cover', 
    customer: '+254 734 567 890', 
    amount: 15000, 
    status: 'human_review', 
    date: '2025-07-09T08:15:00Z',
    aiScore: 62,
    description: 'Stock damaged by fire at Gikomba Market around 3pm. Goods worth approximately KES 15,000 destroyed.',
    flags: ['Low confidence score', 'Image resolution low', 'Timestamp inconsistency'],
    nationalIdNumber: '32014589',
    kraPin: 'A009876543K',
    socialVerdict: 'Social Intelligence Audit: Found 3 matching reports of Gikomba Market fire incident on local news feeds. Incident confirmed. Fraud Risk: Low.'
  },
  { 
    id: 'CLM-MOCK-002', 
    policyId: 'POL-0182',
    policyType: 'Life Cover', 
    customer: '+254 756 789 012', 
    amount: 100000, 
    status: 'human_review', 
    date: '2025-07-09T11:00:00Z',
    aiScore: 45,
    description: 'Policy holder passed away on July 5th after brief illness. Beneficiary filing for KES 100,000 payout.',
    flags: ['Medical certificate requires manual lookup', 'Unclear document upload'],
    nationalIdNumber: '29875412',
    kraPin: 'A005432167L',
    socialVerdict: 'Social Intelligence Audit: No matches found in local news feeds for this specific event. Manual review recommended. Fraud Risk: Moderate.'
  }
];

export default function ClaimsDashboardPage() {
  const supabase = createClient();
  const [claims, setClaims] = useState<ClaimItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedClaim, setSelectedClaim] = useState<ClaimItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('claims')
        .select('*, policies(policy_type, id), users(phone_number, national_id_number, kra_pin)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      if (data && data.length > 0) {
        const mapped: ClaimItem[] = data.map((c: any) => ({
          id: c.id,
          policyId: c.policies?.id || c.policy_id,
          policyType: c.policies?.policy_type?.replace(/_/g, ' ') || 'Daily Boda Cover',
          customer: c.users?.phone_number || 'USSD Subscriber',
          amount: c.payout_amount || 15000,
          status: c.status,
          date: c.created_at,
          aiScore: c.ai_confidence_score || 70,
          description: c.description || 'No description provided.',
          flags: c.status === 'human_review' ? ['Requires manual checks', 'Verification required'] : [],
          nationalIdUrl: c.national_id_url,
          kraCertificateUrl: c.kra_certificate_url,
          socialVerdict: c.social_verdict,
          nationalIdNumber: c.users?.national_id_number,
          kraPin: c.users?.kra_pin
        }));
        setClaims(mapped);
      } else {
        setClaims(mockClaimsFallback);
      }
    } catch (err) {
      console.error('Error getting claims:', err);
      setClaims(mockClaimsFallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const filteredClaims = claims.filter(c => {
    const matchesSearch = c.id.toLowerCase().includes(search.toLowerCase()) || 
                          c.customer.includes(search) || 
                          c.policyType.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleResolve = async (claimId: string, action: 'approve' | 'reject') => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId, action, reviewerId: 'insurer_adjuster' })
      });

      if (!response.ok) throw new Error('API verification call failed');

      const resultData = await response.json();
      
      setClaims(prev => prev.map(c => {
        if (c.id === claimId) {
          const nextStatus = action === 'approve' ? 'approved' : 'rejected';
          const updated = { 
            ...c, 
            status: nextStatus as any, 
            flags: [],
            amount: resultData.payoutAmount || c.amount 
          };
          if (selectedClaim && selectedClaim.id === claimId) {
            setSelectedClaim(updated);
          }
          return updated;
        }
        return c;
      }));
      alert(`Claim is now resolved as ${action === 'approve' ? 'approved' : 'rejected'}.`);
    } catch (err) {
      console.error(err);
      alert('Failed to execute resolution.');
    } finally {
      setActionLoading(false);
    }
  };

  // Helper to open base64 or URL file preview
  const openFilePreview = (fileData: string | undefined, title: string) => {
    if (!fileData) return;
    const w = window.open();
    if (w) {
      w.document.title = title;
      if (fileData.startsWith('data:')) {
        w.document.write(`<iframe src="${fileData}" width="100%" height="100%" style="border:none;"></iframe>`);
      } else {
        w.location.href = fileData;
      }
    }
  };

  return (
    <div className="space-y-6 text-zinc-900 dark:text-zinc-100">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Claims Resolution pipeline</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Review claimant National IDs, KRA certificates, AI audit ratings, and Social Intelligence feeds.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchClaims} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCcw className="h-4 w-4 mr-1" />}
          Refresh
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left/Middle: Claims List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap gap-3 bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search Claim ID, customer, or policy..."
                className="pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg px-3 py-1.5 text-sm text-zinc-700 dark:text-zinc-300"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="human_review">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="settled">Settled</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Claim</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Customer</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Amount</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">AI Confidence</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-zinc-500" />
                      </td>
                    </tr>
                  ) : filteredClaims.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-zinc-400">
                        No claims match your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredClaims.map((c) => (
                      <tr 
                        key={c.id} 
                        onClick={() => setSelectedClaim(c)}
                        className={`hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors ${
                          selectedClaim?.id === c.id ? 'bg-zinc-50 dark:bg-zinc-900' : ''
                        }`}
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[120px]">{c.id}</p>
                          <p className="text-xs text-zinc-500 capitalize">{c.policyType}</p>
                        </td>
                        <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400">{c.customer}</td>
                        <td className="px-5 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                          {formatCurrency(c.amount)}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <div className="w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5">
                              <div 
                                className={`h-1.5 rounded-full ${
                                  c.aiScore >= 80 ? 'bg-emerald-500' :
                                  c.aiScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                }`} 
                                style={{ width: `${c.aiScore}%` }}
                              />
                            </div>
                            <span className="font-mono text-xs font-medium">{c.aiScore}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <Badge variant="outline" className={claimStatusColor(c.status)}>
                            {c.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 text-right" onClick={e => e.stopPropagation()}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50"
                            onClick={() => setSelectedClaim(c)}
                          >
                            Inspect
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Inspection Sidebar */}
        <div>
          {selectedClaim ? (
            <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-6">
              <div className="flex justify-between items-start border-b border-zinc-100 dark:border-zinc-900 pb-4">
                <div>
                  <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100 truncate max-w-[150px]">{selectedClaim.id}</h3>
                  <p className="text-xs text-zinc-500 mt-0.5 truncate max-w-[180px]">Policy Ref: {selectedClaim.policyId}</p>
                </div>
                <Badge variant="outline" className={claimStatusColor(selectedClaim.status)}>
                  {selectedClaim.status.replace('_', ' ')}
                </Badge>
              </div>

              {/* Claim Metadata */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Claim Metadata</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-zinc-50 dark:bg-zinc-900 p-2.5 rounded-lg">
                    <p className="text-zinc-500">Customer</p>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100 mt-0.5 truncate">{selectedClaim.customer}</p>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-900 p-2.5 rounded-lg">
                    <p className="text-zinc-500">Amount Requested</p>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100 mt-0.5">{formatCurrency(selectedClaim.amount)}</p>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-900 p-2.5 rounded-lg flex items-center gap-1.5 col-span-2">
                    <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                    <span>{formatDateRelative(selectedClaim.date)}</span>
                  </div>
                </div>
              </div>

              {/* Identity Verification Documents */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Claimant Identity Proofs</h4>
                <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg space-y-2.5 text-xs">
                  <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
                    <span className="text-zinc-500">KRA PIN Number</span>
                    <span className="font-mono font-semibold">{selectedClaim.kraPin || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
                    <span className="text-zinc-500">National ID</span>
                    <span className="font-mono font-semibold">{selectedClaim.nationalIdNumber || 'N/A'}</span>
                  </div>
                  
                  {/* File Links */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => openFilePreview(selectedClaim.nationalIdUrl, 'National ID')}
                      disabled={!selectedClaim.nationalIdUrl}
                      className="py-1.5 px-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold uppercase tracking-wider text-center flex items-center justify-center gap-1 hover:border-zinc-400 disabled:opacity-40"
                    >
                      <Eye className="h-3.5 w-3.5" /> ID Doc
                    </button>
                    <button
                      onClick={() => openFilePreview(selectedClaim.kraCertificateUrl, 'KRA Certificate')}
                      disabled={!selectedClaim.kraCertificateUrl}
                      className="py-1.5 px-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold uppercase tracking-wider text-center flex items-center justify-center gap-1 hover:border-zinc-400 disabled:opacity-40"
                    >
                      <FileCheck className="h-3.5 w-3.5" /> KRA Cert
                    </button>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Incident Statement</h4>
                <p className="text-xs text-zinc-650 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg leading-relaxed">
                  {selectedClaim.description}
                </p>
              </div>

              {/* AI & Social Intelligence Audit */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">AI &amp; Social Audit logs</h4>
                <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500">Heuristic Score</span>
                    <span className={`font-bold ${
                      selectedClaim.aiScore >= 80 ? 'text-emerald-600' :
                      selectedClaim.aiScore >= 60 ? 'text-amber-600' : 'text-red-600'
                    }`}>{selectedClaim.aiScore}%</span>
                  </div>

                  {selectedClaim.socialVerdict && (
                    <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-350 leading-relaxed bg-zinc-950 p-2.5 border border-zinc-900 font-mono">
                      <p className="text-[9px] font-bold text-emerald-400 flex items-center gap-1 mb-1">
                        <Award className="h-3.5 w-3.5" /> Social Validation Feed
                      </p>
                      {selectedClaim.socialVerdict}
                    </div>
                  )}

                  {selectedClaim.flags.length > 0 && (
                    <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
                      <p className="text-[9px] font-bold text-amber-500 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Flag Checks ({selectedClaim.flags.length})
                      </p>
                      {selectedClaim.flags.map((flag, idx) => (
                        <div key={idx} className="text-[10px] text-zinc-500">
                          • {flag}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Decision Actions */}
              {selectedClaim.status === 'human_review' && (
                <div className="flex gap-2 pt-2">
                  <Button 
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg"
                    disabled={actionLoading}
                    onClick={() => handleResolve(selectedClaim.id, 'approve')}
                  >
                    {actionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <CheckCircle2 className="mr-1 h-3.5 w-3.5" />}
                    Approve Payout
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 border-red-200 text-red-650 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/20 font-semibold text-xs rounded-lg"
                    disabled={actionLoading}
                    onClick={() => handleResolve(selectedClaim.id, 'reject')}
                  >
                    <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
                  </Button>
                </div>
              )}

              {selectedClaim.status === 'approved' && (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 p-3 rounded-lg text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-semibold">Payout Approved</p>
                    <p className="text-[10px] opacity-90 mt-0.5">Stellar blockchain ledger settled.</p>
                  </div>
                </div>
              )}

              {selectedClaim.status === 'rejected' && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 p-3 rounded-lg text-xs flex items-center gap-2">
                  <XCircle className="h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-semibold">Claim Rejected</p>
                    <p className="text-[10px] opacity-90 mt-0.5">Retracted and marked in database logs.</p>
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <div className="h-full border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-center p-8 text-center text-zinc-400">
              <div>
                <FileText className="h-10 w-10 mx-auto text-zinc-300 dark:text-zinc-700 mb-2" />
                <p className="text-sm">Select a claim to inspect claimant documents, verify news check logs, and process payouts.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
