'use client';

import { Smartphone, ShieldCheck, FileText, Bot, Globe, Lock } from 'lucide-react';

const features = [
  {
    icon: Smartphone,
    title: 'USSD & SMS First',
    description: 'Works on any phone — no smartphone or internet required. Dial *384*XXX# to buy, claim, and manage policies.',
  },
  {
    icon: Bot,
    title: 'AI Claims Processing',
    description: 'Computer vision analyzes damage photos in seconds. Fraud detection flags manipulated images automatically.',
  },
  {
    icon: ShieldCheck,
    title: 'Blockchain Trust',
    description: 'Every policy and claim is recorded on an immutable ledger. Real-time auditing for regulators and insurers.',
  },
  {
    icon: FileText,
    title: 'Instant Payouts',
    description: 'Approved claims paid directly to M-Pesa within minutes. No paperwork, no waiting for weeks.',
  },
  {
    icon: Globe,
    title: 'Parametric Insurance',
    description: 'Weather-indexed crop insurance that pays out automatically when rainfall thresholds are breached.',
  },
  {
    icon: Lock,
    title: 'RegTech Compliance',
    description: 'Automated IRA compliance, KYC/AML checks, and audit-ready reporting for insurance partners.',
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-28 border-t border-zinc-100 dark:border-zinc-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Everything you need for inclusive insurance
          </h2>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            BimaOS bridges the gap between informal communities and formal insurance providers.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 mb-4">
                <feature.icon className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
              </div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{feature.title}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
