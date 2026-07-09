'use client';

import { Badge } from '@/components/ui/badge';
import { formatDateRelative, claimStatusColor } from '@/lib/utils';

const claims = [
  { id: 'CLM-2025-001', policy: 'Boda Boda Daily', customer: '+254 712 345 678', amount: 'KES 25,000', status: 'settled', date: '2025-07-08T10:30:00Z' },
  { id: 'CLM-2025-002', policy: 'Seasonal Crop', customer: '+254 723 456 789', amount: 'KES 45,000', status: 'approved', date: '2025-07-08T14:20:00Z' },
  { id: 'CLM-2025-003', policy: 'Market Stock', customer: '+254 734 567 890', amount: 'KES 12,000', status: 'human_review', date: '2025-07-09T08:15:00Z' },
  { id: 'CLM-2025-004', policy: 'Health Cover', customer: '+254 745 678 901', amount: 'KES 8,500', status: 'ai_review', date: '2025-07-09T09:45:00Z' },
  { id: 'CLM-2025-005', policy: 'Life Cover', customer: '+254 756 789 012', amount: 'KES 100,000', status: 'human_review', date: '2025-07-09T11:00:00Z' },
];

export function RecentClaims() {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Recent Claims</h3>
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
                <td className="px-5 py-3 font-medium text-zinc-900 dark:text-zinc-100">{claim.id}</td>
                <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">{claim.policy}</td>
                <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">{claim.customer}</td>
                <td className="px-5 py-3 text-zinc-900 dark:text-zinc-100">{claim.amount}</td>
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
