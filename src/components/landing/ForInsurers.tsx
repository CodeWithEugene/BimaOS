'use client';

import { BarChart3, Users, Shield, Wallet, ArrowRight, GitBranch, ScrollText } from 'lucide-react';
import Link from 'next/link';

const benefits = [
  {
    icon: Users,
    title: 'Access 80%+ Unserved Market',
    description: 'Reach informal workers, smallholder farmers, and MSMEs who have never had insurance.',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Dashboard',
    description: 'Monitor policies, claims, payouts, and fraud alerts in real time via our web portal.',
  },
  {
    icon: Shield,
    title: 'AI Fraud Detection',
    description: 'Reduce false claims by up to 40% with computer vision and pattern detection.',
  },
  {
    icon: GitBranch,
    title: 'API-First Architecture',
    description: 'Integrate BimaOS into your existing systems via REST APIs. Works with any core system.',
  },
  {
    icon: ScrollText,
    title: 'Regulatory Compliance',
    description: 'Automated IRA reporting, KYC/AML checks, and audit-ready blockchain records.',
  },
  {
    icon: Wallet,
    title: 'Lower Operations Cost',
    description: 'Process micro-premiums profitably. Our cost per policy is 80% lower than traditional models.',
  },
];

export function ForInsurers() {
  return (
    <section id="for-insurers" className="py-20 sm:py-28 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 mb-4">
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">For Insurance Partners</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              The infrastructure layer for African insurance
            </h2>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
              BimaOS is not an insurance company. We&apos;re the technology layer that helps you
              reach, serve, and retain millions of new policyholders profitably.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href="/dashboard"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 px-6 text-sm font-medium transition-colors"
              >
                View Dashboard Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-3 w-3 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">API Status — All Systems Operational</span>
            </div>
            <div className="space-y-3">
              {[
                { name: 'USSD Gateway', status: '99.9% uptime', ok: true },
                { name: 'Claims API', status: '99.7% uptime', ok: true },
                { name: 'M-Pesa Integration', status: '99.5% uptime', ok: true },
                { name: 'Blockchain Ledger', status: '100% uptime', ok: true },
              ].map((api) => (
                <div key={api.name} className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-900 last:border-0">
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">{api.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">{api.status}</span>
                    <div className={`h-2 w-2 rounded-full ${api.ok ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 mb-3">
                <benefit.icon className="h-4.5 w-4.5 text-zinc-700 dark:text-zinc-300" />
              </div>
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-1">{benefit.title}</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
