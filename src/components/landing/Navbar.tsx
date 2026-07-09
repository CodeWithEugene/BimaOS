'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Logo } from '@/components/shared/Logo';

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Logo />

          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">
              Features
            </Link>
            <Link href="#products" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">
              Products
            </Link>
            <Link href="#how-it-works" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">
              How It Works
            </Link>
            <Link href="#for-insurers" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">
              For Insurers
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <Link href="/auth/login" className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
              Sign In
            </Link>
            <Link href="/auth/login" className="inline-flex h-8 items-center justify-center rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 px-3 text-sm font-medium transition-colors">
              Get Started
            </Link>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-zinc-600 dark:text-zinc-400"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-4 space-y-3">
          <Link href="#features" className="block text-sm text-zinc-600 dark:text-zinc-400">Features</Link>
          <Link href="#products" className="block text-sm text-zinc-600 dark:text-zinc-400">Products</Link>
          <Link href="#how-it-works" className="block text-sm text-zinc-600 dark:text-zinc-400">How It Works</Link>
          <Link href="#for-insurers" className="block text-sm text-zinc-600 dark:text-zinc-400">For Insurers</Link>
          <div className="flex gap-2 pt-2">
            <ThemeToggle />
            <Link href="/auth/login" className="flex-1 inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
              Sign In
            </Link>
            <Link href="/auth/login" className="flex-1 inline-flex h-8 items-center justify-center rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 text-sm font-medium transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
