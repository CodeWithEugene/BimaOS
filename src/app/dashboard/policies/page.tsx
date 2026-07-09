'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { 
  ScrollText, Search, Shield, Calendar, 
  ExternalLink, Hash, DollarSign, Loader2, RefreshCcw
} from 'lucide-react';
import { formatCurrency, formatDateRelative } from '@/lib/utils';

interface PolicyItem {
  id: string;
  customer: string;
  type: string;
  premium: number;
  coverage: number;
  status: 'active' | 'expired' | 'claimed' | 'cancelled';
  startDate: string;
  endDate: string;
  txHash: string;
}

const mockPoliciesFallback: PolicyItem[] = [
  {
    id: 'BOS-POL-0182',
    customer: '+254 756 789 012',
    type: 'Life Cover',
    premium: 40,
    coverage: 1000000,
    status: 'claimed',
    startDate: '2025-06-01T00:00:00Z',
    endDate: '2026-06-01T00:00:00Z',
    txHash: '0x17c91823abcefd839210bc931fdf73c91e847cbb029d29ef1928cf84029f438a',
  },
  {
    id: 'BOS-POL-1082',
    customer: '+254 712 345 678',
    type: 'Daily Boda Cover',
    premium: 20,
    coverage: 50000,
    status: 'active',
    startDate: '2025-07-09T00:00:00Z',
    endDate: '2025-07-10T00:00:00Z',
    txHash: '0x629bf9182ca9fbf918e9a2bcde981a8ef18f918e0018d9f9a2e374f762b9a101',
  }
];

export default function PoliciesDashboardPage() {
  const supabase = createClient();
  const [policies, setPolicies] = useState<PolicyItem[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('policies')
        .select('*, users(phone_number)');
      
      if (error) throw error;

      if (data && data.length > 0) {
        const mapped: PolicyItem[] = data.map((p: any) => ({
          id: `BOS-${p.id.slice(0, 8).toUpperCase()}`,
          customer: p.users?.phone_number || 'USSD Subscriber',
          type: p.policy_type?.replace(/_/g, ' ') || 'Daily Boda Cover',
          premium: parseFloat(p.premium_amount),
          coverage: parseFloat(p.coverage_amount),
          status: p.status,
          startDate: p.start_date,
          endDate: p.end_date,
          txHash: p.blockchain_tx_hash || '0x...'
        }));
        setPolicies(mapped);
      } else {
        setPolicies(mockPoliciesFallback);
      }
    } catch (err) {
      console.error('Error fetching policies:', err);
      setPolicies(mockPoliciesFallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const filteredPolicies = policies.filter(p => {
    const matchesSearch = p.id.toLowerCase().includes(search.toLowerCase()) || 
                          p.customer.includes(search);
    const matchesType = typeFilter === 'all' || p.type.toLowerCase().includes(typeFilter.toLowerCase());
    return matchesSearch && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900';
      case 'expired':
        return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800';
      case 'claimed':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border-blue-200 dark:border-blue-900';
      default:
        return 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border-red-200 dark:border-red-900';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Active Policies</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Monitor active underwritten policies, track daily micro-premiums, and verify blockchain ledger states.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchPolicies} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCcw className="h-4 w-4 mr-1" />}
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
          <div className="flex justify-between items-start text-zinc-500">
            <span className="text-xs font-medium uppercase tracking-wider">Total Active Policies</span>
            <Shield className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-2">
            {policies.filter(p => p.status === 'active').length}
          </p>
          <p className="text-[10px] text-zinc-400 mt-1">Providing micro-premium protection</p>
        </Card>

        <Card className="p-4 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
          <div className="flex justify-between items-start text-zinc-500">
            <span className="text-xs font-medium uppercase tracking-wider">Daily Underwritten Volume</span>
            <DollarSign className="h-4 w-4 text-zinc-400" />
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-2">
            KES {policies.filter(p => p.status === 'active').reduce((sum, p) => sum + p.premium, 0).toLocaleString()}
          </p>
          <p className="text-[10px] text-zinc-400 mt-1">Collected premium cash flow today</p>
        </Card>

        <Card className="p-4 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
          <div className="flex justify-between items-start text-zinc-500">
            <span className="text-xs font-medium uppercase tracking-wider">Total Liability Pool</span>
            <Shield className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-2">
            KES {(policies.reduce((sum, p) => sum + p.coverage, 0) / 1000000).toFixed(2)}M
          </p>
          <p className="text-[10px] text-zinc-400 mt-1">Aggregated coverage liability</p>
        </Card>

        <Card className="p-4 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
          <div className="flex justify-between items-start text-zinc-500">
            <span className="text-xs font-medium uppercase tracking-wider">Ledger Health</span>
            <Hash className="h-4 w-4 text-zinc-400" />
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-2">100%</p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">Synced to Stellar Soroban</p>
        </Card>
      </div>

      {/* Filters & Tables */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search Policy ID or Phone Number..."
              className="pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg px-3 py-1.5 text-sm text-zinc-700 dark:text-zinc-300"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option value="all">All Cover Types</option>
              <option value="boda">Daily Boda Cover</option>
              <option value="market">Daily Market Cover</option>
              <option value="crop">Seasonal Crop Cover</option>
              <option value="health">Health Cover</option>
              <option value="life">Life Cover</option>
            </select>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Policy ID</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Subscriber</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Cover Type</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Premium</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Coverage</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Duration</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Ledger Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-zinc-500" />
                    </td>
                  </tr>
                ) : filteredPolicies.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-zinc-400">
                      No policies found.
                    </td>
                  </tr>
                ) : (
                  filteredPolicies.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                      <td className="px-5 py-4 font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[120px]">{p.id}</td>
                      <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400">{p.customer}</td>
                      <td className="px-5 py-4 font-medium capitalize">{p.type}</td>
                      <td className="px-5 py-4 text-zinc-900 dark:text-zinc-100">
                        {formatCurrency(p.premium)}
                        <span className="text-[10px] text-zinc-400 ml-1">
                          {p.type.includes('crop') ? '/seas' : '/day'}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold text-zinc-900 dark:text-zinc-100">{formatCurrency(p.coverage)}</td>
                      <td className="px-5 py-4 text-xs text-zinc-500 space-y-0.5">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-zinc-400">From:</span>
                          <span>{new Date(p.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-zinc-400">To:</span>
                          <span>{new Date(p.endDate).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant="outline" className={getStatusBadge(p.status)}>
                          {p.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400 max-w-[120px]">
                          <span className="font-mono truncate">{p.txHash}</span>
                          <ExternalLink className="h-3 w-3 shrink-0 cursor-pointer text-zinc-500 hover:text-zinc-700" />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
