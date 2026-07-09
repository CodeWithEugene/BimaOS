'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Shield, Mail, Lock, ArrowRight, Smartphone, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

type Tab = 'signin' | 'signup';
type UserRole = 'consumer' | 'insurer';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [tab, setTab] = useState<Tab>('signin');
  const [roleSelection, setRoleSelection] = useState<UserRole>('consumer');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Sign In
  const [signinEmail, setSigninEmail] = useState('');
  const [signinPassword, setSigninPassword] = useState('');

  // Sign Up
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupNationalId, setSignupNationalId] = useState('');
  const [signupKraPin, setSignupKraPin] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleSignin = async () => {
    setError(null);
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: signinEmail,
        password: signinPassword,
      });

      if (authError) throw authError;

      if (data.session) {
        const user = data.user;
        // Role is sourced from the stored profile; fall back to the auth
        // metadata that was set at sign-up so routing is never ambiguous.
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        const actualRole: string =
          (user.user_metadata?.role as string | undefined) ||
          profile?.role ||
          'consumer';

        // Guarantee the profile row exists with the correct role so the
        // backend stays consistent regardless of trigger state.
        if (!profile || profile.role !== actualRole) {
          await supabase.from('users').upsert({
            id: user.id,
            phone_number: (user.email || user.phone || '') as string,
            full_name: (user.user_metadata?.full_name as string) || '',
            role: actualRole,
          });
        }

        const isStaff = actualRole === 'insurer' || actualRole === 'adjuster' || actualRole === 'admin';

        setSuccess(true);
        setTimeout(() => {
          router.push(isStaff ? '/dashboard' : '/client');
        }, 1500);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setError(null);
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: {
            full_name: signupName,
            role: roleSelection,
            national_id_number: roleSelection === 'consumer' ? signupNationalId : undefined,
            kra_pin: roleSelection === 'consumer' ? signupKraPin : undefined,
          },
        },
      });

      if (authError) throw authError;

      // Best-effort: ensure the profile row exists with the chosen role even
      // if the database trigger has not run yet (e.g. email confirmation pending).
      if (data.user) {
        try {
          await supabase.from('users').upsert({
            id: data.user.id,
            phone_number: (signupEmail || '') as string,
            full_name: signupName,
            role: roleSelection,
            national_id_number: roleSelection === 'consumer' ? signupNationalId : null,
            kra_pin: roleSelection === 'consumer' ? signupKraPin : null,
          });
        } catch {
          // Profile creation is best-effort; the DB trigger is the primary path.
        }
      }

      setSuccess(true);
      setTimeout(() => {
        if (roleSelection === 'insurer') {
          router.push('/dashboard');
        } else {
          router.push('/client');
        }
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSuccess(false);
    setError(null);
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
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden bg-zinc-950">
        <div className="absolute inset-0">
          <Image src="/mama_mboga.png" alt="" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-black/30" />
        </div>
        <div className="relative z-10">
          <Image src="/BimaOS_logo_horizontal.png" alt="BimaOS" width={112} height={28} className="brightness-0 invert" style={{ height: '1.75rem', width: 'auto' }} priority />
        </div>
        <div className="relative z-10 text-left">
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Insurance for<br />Every African
          </h1>
          <p className="text-zinc-300 text-lg max-w-md mb-10">
            Open insurance infrastructure that makes coverage accessible, affordable, and instant — starting from KES 20/day.
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
        <p className="relative z-10 text-xs text-zinc-500">
          Africa&apos;s Talking Insurtech Hackathon 2025
        </p>
      </div>

      {/* Form half */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-zinc-50 dark:bg-zinc-950">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Image src="/BimaOS_logo_horizontal.png" alt="BimaOS" width={112} height={28} className="dark:brightness-0 dark:invert" style={{ height: '1.75rem', width: 'auto' }} priority />
          </div>

          {/* Tab Switcher: Sign In vs Sign Up */}
          <div className="flex mb-6 bg-zinc-200 dark:bg-zinc-800 rounded-lg p-1">
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

          {/* Success Screen */}
          {success && (
            <div className="text-center py-6">
              <div className="flex justify-center mb-4">
                <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Shield className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                {tab === 'signup' ? 'Account Created!' : 'Welcome Back!'}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                {tab === 'signup' ? 'Setting up your profile...' : 'Redirecting to your portal...'}
              </p>
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-900 dark:text-white" />
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="text-xs text-red-700 dark:text-red-400 font-medium">
                {error}
              </div>
            </div>
          )}

          {/* Role Picker (Subscriber vs Insurance Provider) */}
          {!success && (
            <div className="mb-6">
              <label className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-2">Portal Access Mode</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => setRoleSelection('consumer')}
                  className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    roleSelection === 'consumer'
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700'
                  }`}
                >
                  Subscriber / Client
                </button>
                <button
                  type="button"
                  onClick={() => setRoleSelection('insurer')}
                  className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    roleSelection === 'insurer'
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700'
                  }`}
                >
                  Insurance Provider
                </button>
              </div>
            </div>
          )}

          {/* Sign In View */}
          {!success && tab === 'signin' && (
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">Welcome back</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                Sign in to your {roleSelection === 'consumer' ? 'Client' : 'Underwriter'} portal.
              </p>
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
                  disabled={!signinEmail || !signinPassword || loading}
                  className="w-full inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 px-4 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Sign Up View */}
          {!success && tab === 'signup' && (
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">Create your account</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                Register as a {roleSelection === 'consumer' ? 'Subscriber' : 'Insurance Provider'}.
              </p>
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

                {roleSelection === 'consumer' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">National ID</label>
                      <Input
                        placeholder="30123456"
                        value={signupNationalId}
                        onChange={(e) => setSignupNationalId(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">KRA PIN</label>
                      <Input
                        placeholder="A012345678B"
                        value={signupKraPin}
                        onChange={(e) => setSignupKraPin(e.target.value)}
                      />
                    </div>
                  </div>
                )}

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
                  disabled={!signupName || !signupEmail || !signupPassword || signupPassword.length < 8 || !agreed || loading}
                  className="w-full inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 px-4 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <p className="mt-8 text-xs text-center text-zinc-400 dark:text-zinc-600">
            For testing underwriters.{' '}
            <a href="/dashboard" className="text-zinc-900 dark:text-zinc-100 font-semibold hover:underline">
              Skip to insurer demo dashboard
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
