'use client';

import { Phone, Camera, CheckCircle, Wallet } from 'lucide-react';

const steps = [
  {
    icon: Phone,
    title: 'Dial *384*11400#',
    description: 'Open the USSD menu on any phone. No app, no internet, no smartphone needed.',
    detail: 'Select "Buy Insurance" and choose your cover type.',
  },
  {
    icon: Wallet,
    title: 'Pay via M-Pesa',
    description: 'Confirm with a single tap. Premiums deducted directly from your mobile money.',
    detail: 'Daily premiums from KES 20. Pay only when you need cover.',
  },
  {
    icon: Camera,
    title: 'File a Claim via SMS (21565)',
    description: 'Send a photo of the damage via the secure link we SMS you, or trigger a claim text to Short Code 21565.',
    detail: 'Get a confidence score and update in under 60 seconds.',
  },
  {
    icon: CheckCircle,
    title: 'Get Paid in Minutes',
    description: 'Approved claims paid directly to M-Pesa. High-confidence claims skip the queue.',
    detail: 'Blockchain-verified. Auditable. Transparent.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 border-t border-zinc-100 dark:border-zinc-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            How BimaOS works
          </h2>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            From USSD to payout in four simple steps — no paperwork, no branches, no delays.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.title} className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 mb-4">
                  <step.icon className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    {index + 1}
                  </span>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{step.title}</h3>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-2">{step.description}</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">{step.detail}</p>
              </div>

              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-7 -right-4 w-8 h-px bg-zinc-200 dark:bg-zinc-800" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
