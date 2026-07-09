'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Smartphone, ShieldCheck, Users } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/mama_mboga.png"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-medium text-zinc-200">
              Africa&apos;s Talking Insurtech Hackathon 2025
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
            Insurance for{' '}
            <span className="text-zinc-300">Every</span>{' '}
            African.
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-zinc-300 max-w-lg mx-auto">
            BimaOS is an open insurance infrastructure platform that makes coverage
            accessible via USSD, AI-powered claims, and blockchain-verified payouts.
            Built for the informal economy.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link
              href="#products"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-white text-zinc-900 hover:bg-zinc-100 px-6 text-sm font-medium transition-colors"
            >
              Get Covered Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/claims"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm px-6 text-sm font-medium text-white hover:bg-white/20 transition-colors"
            >
              <Smartphone className="mr-2 h-4 w-4" />
              File a Claim
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-6 justify-center">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                <Smartphone className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm text-zinc-300">USSD &amp; SMS</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                <ShieldCheck className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm text-zinc-300">AI-Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                <Users className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm text-zinc-300">For Everyone</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
