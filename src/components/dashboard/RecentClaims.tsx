'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { formatDateRelative, claimStatusColor, formatCurrency } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

interface ClaimRow {
  id: string;
  policy: string;
  customer: string;
  amount: string;
  status: string;
  date: string;
}

const mockClaimsFallback: ClaimRow[] = [
  { id: 'CLM-MOCK-001', policy: 'Daily Market Cover', customer: '+254 734 567 890', amount: 'KES 15,000', status: 'human_review', date: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 'CLM-MOCK-002', policy: 'Life Cover', customer: '+254 756 789 012', amount: 'KES 100,000', status: 'human_review', date: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: 'CLM-MOCK-003', policy: 'Daily Boda Cover', customer: '+254 712 345 678', amount: 'KES 25,000', status: 'settled', date: new Date(Date.now() - 3600000 * 24).toISOString() },
  { id: 'CLM-MOCK-004', policy: 'Seasonal Crop', customer: '+254 723 456 789', amount: 'KES 45,000', status: 'approved', date: new Date(Date.now() - 3600000 * 28).toISOString() }
];

export function RecentClaims() {
  const supabase = createClient();
  const [claims, setClaims] = useState<ClaimRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRecentClaims = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('claims')
          .select('*, policies(policy_type), users(phone_number)')
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;

        if (data && data.length > 0) {
          const mapped: ClaimRow[] = data.map((c: any) => ({
            id: `CLM-${c.id.slice(0, 8).toUpperCase()}`,
            policy: c.policies?.policy_type?.replace(/_/g, ' ') || 'Daily Boda Cover',
            customer: c.users?.phone_number || 'USSD Subscriber',
            amount: formatCurrency(c.payout_amount || 15000),
            status: c.status,
            date: c.created_at
          }));
          setClaims(mapped);
        } else {
          setClaims(mockClaimsFallback);
        }
      } catch (err) {
        console.error('Error fetching recent claims:', err);
        setClaims(mockClaimsFallback);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentClaims();
  }, []);

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
        <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Recent Claims</h3>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-900">
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Claim ID</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Policy</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Customer</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Amount</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((claim) => (
              <tr key={claim.id} className="border-b border-zinc-100 dark:border-zinc-900 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                <td className="px-5 py-3 font-semibold text-zinc-900 dark:text-zinc-100">{claim.id}</td>
                <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400 capitalize">{claim.policy}</td>
                <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">{claim.customer}</td>
                <td className="px-5 py-3 font-medium text-zinc-900 dark:text-zinc-100">{claim.amount}</td>
                <td className="px-5 py-3">
                  <Badge variant="outline" className={claimStatusColor(claim.status)}>
                    {claim.status.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400 text-xs">
                  {formatDateRelative(claim.date)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
