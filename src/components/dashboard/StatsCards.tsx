'use client';

import { useState, useEffect } from 'react';
import { Users, FileText, ShieldCheck, TrendingUp, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function StatsCards() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [activePolicies, setActivePolicies] = useState('12,847');
  const [pendingClaims, setPendingClaims] = useState('143');
  const [totalCustomers, setTotalCustomers] = useState('9,421');
  const [payoutsSum, setPayoutsSum] = useState('KES 2.4M');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // 1. Active policies count
        const { count: policiesCount } = await supabase
          .from('policies')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');
        
        if (policiesCount !== null && policiesCount > 0) {
          setActivePolicies(policiesCount.toLocaleString());
        }

        // 2. Pending claims count
        const { count: claimsCount } = await supabase
          .from('claims')
          .select('*', { count: 'exact', head: true })
          .in('status', ['pending', 'human_review', 'ai_review']);
        
        if (claimsCount !== null && claimsCount > 0) {
          setPendingClaims(claimsCount.toLocaleString());
        }

        // 3. Customers count
        const { count: usersCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'consumer');
        
        if (usersCount !== null && usersCount > 0) {
          setTotalCustomers(usersCount.toLocaleString());
        }

        // 4. Payouts sum
        const { data: claimsPayouts } = await supabase
          .from('claims')
          .select('payout_amount')
          .in('status', ['approved', 'settled']);

        if (claimsPayouts && claimsPayouts.length > 0) {
          const total = claimsPayouts.reduce((sum, item) => sum + (parseFloat(item.payout_amount as any) || 0), 0);
          if (total > 0) {
            if (total >= 1000000) {
              setPayoutsSum(`KES ${(total / 1000000).toFixed(1)}M`);
            } else {
              setPayoutsSum(`KES ${(total / 1000).toFixed(0)}K`);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const stats = [
    {
      label: 'Active Policies',
      value: activePolicies,
      change: '+12.5%',
      icon: ShieldCheck,
      trend: 'up',
    },
    {
      label: 'Pending Claims',
      value: pendingClaims,
      change: '-8.2%',
      icon: FileText,
      trend: 'down',
    },
    {
      label: 'Total Customers',
      value: totalCustomers,
      change: '+18.3%',
      icon: Users,
      trend: 'up',
    },
    {
      label: 'Payouts (Total)',
      value: payoutsSum,
      change: '+5.1%',
      icon: TrendingUp,
      trend: 'up',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 relative"
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
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
            {stat.value}
            {loading && <Loader2 className="h-3 w-3 animate-spin text-zinc-400" />}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
