'use client';

import { Users, FileText, ShieldCheck, TrendingUp } from 'lucide-react';

const stats = [
  {
    label: 'Active Policies',
    value: '12,847',
    change: '+12.5%',
    icon: ShieldCheck,
    trend: 'up',
  },
  {
    label: 'Pending Claims',
    value: '143',
    change: '-8.2%',
    icon: FileText,
    trend: 'down',
  },
  {
    label: 'Total Customers',
    value: '9,421',
    change: '+18.3%',
    icon: Users,
    trend: 'up',
  },
  {
    label: 'Payouts (30d)',
    value: 'KES 2.4M',
    change: '+5.1%',
    icon: TrendingUp,
    trend: 'up',
  },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <stat.icon className="h-4.5 w-4.5 text-zinc-700 dark:text-zinc-300" />
            </div>
            <span className={`text-xs font-medium ${
              stat.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {stat.change}
            </span>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stat.value}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
