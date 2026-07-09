'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, TrendingDown, Calendar, Percent, 
  Smartphone, Users, ShieldAlert, CheckCircle, FileText
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AnalyticsDashboardPage() {
  const stats = [
    { label: 'Loss Ratio', value: '28.4%', change: '-2.1%', trend: 'up', desc: 'Claims payout vs premium collected' },
    { label: 'Underwritten Premium', value: 'KES 245,800', change: '+14.5%', trend: 'up', desc: 'Total premium generated this month' },
    { label: 'Claim Resolution Rate', value: '96.2%', change: '+0.8%', trend: 'up', desc: 'Resolved within 24h service SLA' },
    { label: 'Avg Payout Time', value: '8.4 mins', change: '-4.2 mins', trend: 'down', desc: 'From filing to M-Pesa remittance' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Performance Analytics</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Detailed metrics of the underwriting pool, loss ratios, and user growth across offline channels.
        </p>
      </div>

      {/* Grid of Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="p-4 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
            <div className="flex justify-between items-start text-zinc-500">
              <span className="text-xs font-medium uppercase tracking-wider">{stat.label}</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 font-bold">
                {stat.change}
              </Badge>
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-2">{stat.value}</p>
            <p className="text-[10px] text-zinc-400 mt-1">{stat.desc}</p>
          </Card>
        ))}
      </div>

      {/* Charts section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* SVG Premium Growth Chart */}
        <Card className="p-5 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            Underwritten Premium Growth (Last 6 Months)
          </h3>
          
          <div className="h-[220px] w-full pt-4 flex flex-col justify-between">
            <div className="flex-1 w-full relative">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                <div className="w-full border-t border-zinc-100 dark:border-zinc-900" />
                <div className="w-full border-t border-zinc-100 dark:border-zinc-900" />
                <div className="w-full border-t border-zinc-100 dark:border-zinc-900" />
                <div className="w-full border-t border-zinc-100 dark:border-zinc-900" />
              </div>

              {/* Chart Line using native SVG */}
              <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                {/* Under Area (No Gradients) */}
                <polygon
                  points="0,200 0,160 120,130 240,110 360,70 480,45 600,10 600,200"
                  fill="currentColor"
                  className="text-zinc-100 dark:text-zinc-900/40"
                />
                {/* Stroke line */}
                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-zinc-900 dark:text-zinc-100"
                  points="0,160 120,130 240,110 360,70 480,45 600,10"
                />
                {/* Points */}
                <circle cx="0" cy="160" r="4" fill="currentColor" className="text-zinc-900 dark:text-zinc-100" />
                <circle cx="120" cy="130" r="4" fill="currentColor" className="text-zinc-900 dark:text-zinc-100" />
                <circle cx="240" cy="110" r="4" fill="currentColor" className="text-zinc-900 dark:text-zinc-100" />
                <circle cx="360" cy="70" r="4" fill="currentColor" className="text-zinc-900 dark:text-zinc-100" />
                <circle cx="480" cy="45" r="4" fill="currentColor" className="text-zinc-900 dark:text-zinc-100" />
                <circle cx="600" cy="10" r="4" fill="currentColor" className="text-zinc-900 dark:text-zinc-100" />
              </svg>
            </div>

            {/* X-Axis labels */}
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-3">
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
            </div>
          </div>
        </Card>

        {/* SVG Distribution Channels Performance */}
        <Card className="p-5 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-1.5">
            <Smartphone className="h-4 w-4 text-zinc-500" />
            Active Channel Shares (Policy Volume)
          </h3>

          <div className="h-[220px] w-full pt-4 flex flex-col justify-between">
            <div className="flex-1 flex items-end justify-around gap-4 px-2">
              {/* Bar 1: USSD */}
              <div className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold font-mono">62%</span>
                <div className="w-full bg-zinc-900 dark:bg-zinc-100 rounded-md h-[120px]" />
                <span className="text-[10px] text-zinc-500 font-semibold uppercase">USSD Menu</span>
              </div>

              {/* Bar 2: Agents */}
              <div className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold font-mono">26%</span>
                <div className="w-full bg-zinc-400 dark:bg-zinc-700 rounded-md h-[52px]" />
                <span className="text-[10px] text-zinc-500 font-semibold uppercase">Agents API</span>
              </div>

              {/* Bar 3: Web Portal */}
              <div className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold font-mono">12%</span>
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-md h-[24px]" />
                <span className="text-[10px] text-zinc-500 font-semibold uppercase">PWA Web</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Underwriting breakdown */}
      <Card className="p-5 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-4">
          Underwritten Pools Breakdown
        </h3>
        <div className="grid md:grid-cols-3 gap-6 text-xs divide-y md:divide-y-0 md:divide-x divide-zinc-200 dark:divide-zinc-800">
          <div className="space-y-3">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100">Boda Boda Microinsurance</h4>
            <div className="flex justify-between">
              <span className="text-zinc-500">Active Policies</span>
              <span className="font-medium text-zinc-950 dark:text-zinc-50">1,249</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Loss Ratio</span>
              <span className="font-medium text-zinc-950 dark:text-zinc-50">34.2%</span>
            </div>
          </div>

          <div className="space-y-3 md:pl-6">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100">Agricultural Parametric</h4>
            <div className="flex justify-between">
              <span className="text-zinc-500">Farmers Covered</span>
              <span className="font-medium text-zinc-950 dark:text-zinc-50">3,492</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Loss Ratio</span>
              <span className="font-medium text-zinc-950 dark:text-zinc-50">18.1%</span>
            </div>
          </div>

          <div className="space-y-3 md:pl-6">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100">SME Fire &amp; Inventory</h4>
            <div className="flex justify-between">
              <span className="text-zinc-500">Active Businesses</span>
              <span className="font-medium text-zinc-950 dark:text-zinc-50">540</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Loss Ratio</span>
              <span className="font-medium text-zinc-950 dark:text-zinc-50">21.8%</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
