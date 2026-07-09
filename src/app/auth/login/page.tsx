'use client';

import { useState } from 'react';
import { Shield, Mail, Lock, ArrowRight, Smartphone, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

type Tab = 'signin' | 'signup';

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>('signin');
  const [success, setSuccess] = useState(false);

  // Sign In
  const [signinEmail, setSigninEmail] = useState('');
  const [signinPassword, setSigninPassword] = useState('');

  // Sign Up
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleSignin = () => {
    setSuccess(true);
  };

  const handleSignup = () => {
    setSuccess(true);
  };

  const reset = () => {
    setSuccess(false);
    setSigninEmail('');
    setSigninPassword('');
    setSignupName('');
    setSignupEmail('');
    setSignupPassword('');
    setAgreed(false);
  };

  const perks = [
    { icon: Smartphone, text: 'Get covered via USSD in under 3 minutes' },
    { icon: Shield, text: 'AI-powered claims with instant payouts' },
    { icon: TrendingUp, text: 'Flexible microinsurance for daily life' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Brand half */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-zinc-900 dark:bg-black p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <div>
          <Image src="/BimaOS_logo_horizontal.png" alt="BimaOS" width={112} height={28} className="h-7 w-auto brightness-0 invert" priority />
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Insurance for<br />Every African
          </h1>
          <p className="text-zinc-400 text-lg max-w-md mb-10">
            Open insurance infrastructure that makes coverage accessible, affordable, and instant — starting from KES 10/day.
          </p>
          <div className="space-y-5">
            {perks.map((perk) => (
              <div key={perk.text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                  <perk.icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-zinc-300 text-sm">{perk.text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-xs text-zinc-600">
          Africa&apos;s Talking Insurtech Hackathon 2025
        </p>
      </div>

      {/* Form half */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-zinc-50 dark:bg-zinc-950">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Image src="/BimaOS_logo_horizontal.png" alt="BimaOS" width={112} height={28} className="h-7 w-auto dark:brightness-0 dark:invert" priority />
          </div>

          {/* Tabs */}
          <div className="flex mb-8 bg-zinc-200 dark:bg-zinc-800 rounded-lg p-1">
            <button
              onClick={() => { setTab('signin'); reset(); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                tab === 'signin'
                  ? 'bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab('signup'); reset(); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                tab === 'signup'
                  ? 'bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Success */}
          {success && (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                  <Shield className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                {tab === 'signup' ? 'Account Created!' : 'Signed In!'}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                Welcome to BimaOS. You&apos;re now authenticated.
              </p>
              <a
                href="/dashboard"
                className="w-full inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 px-4 text-sm font-medium transition-colors"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
          )}

          {/* Sign In */}
          {!success && tab === 'signin' && (
            <div>
              <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Welcome back</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Sign in to your account.</p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      className="pl-9"
                      value={signinEmail}
                      onChange={(e) => setSigninEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                      type="password"
                      placeholder="********"
                      className="pl-9"
                      value={signinPassword}
                      onChange={(e) => setSigninPassword(e.target.value)}
                    />
                  </div>
                </div>
                <button
                  onClick={handleSignin}
                  disabled={!signinEmail || !signinPassword}
                  className="w-full inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 px-4 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Sign Up */}
          {!success && tab === 'signup' && (
            <div>
              <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Create your account</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Get insured in under 3 minutes.</p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">Full Name</label>
                  <Input
                    placeholder="Jane Muthoni"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      className="pl-9"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                      type="password"
                      placeholder="At least 8 characters"
                      className="pl-9"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                    />
                  </div>
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
                  />
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    I agree to the{' '}
                    <span className="text-zinc-900 dark:text-zinc-100 underline">Terms</span>
                    {' '}and{' '}
                    <span className="text-zinc-900 dark:text-zinc-100 underline">Privacy Policy</span>
                  </span>
                </label>
                <button
                  onClick={handleSignup}
                  disabled={!signupName || !signupEmail || !signupPassword || signupPassword.length < 8 || !agreed}
                  className="w-full inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 px-4 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <p className="mt-8 text-xs text-center text-zinc-400 dark:text-zinc-600">
            For insurers and agents.{' '}
            <a href="/dashboard" className="text-zinc-900 dark:text-zinc-100 font-medium hover:underline">
              Skip to demo dashboard
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
