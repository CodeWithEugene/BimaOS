'use client';

import { useState } from 'react';
import { Shield, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { products } from '@/lib/products';
import Link from 'next/link';

export default function ProductsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [policyRef, setPolicyRef] = useState('');

  const handlePurchase = () => {
    setPolicyRef(`BOS-${Date.now().toString(36).toUpperCase()}`);
    setPurchased(true);
    setTimeout(() => {
      setPurchased(false);
      setShowConfirm(false);
      setSelected(null);
    }, 4000);
  };

  const product = products.find((p) => p.type === selected);



  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Insurance Products</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Choose coverage that fits your life. Pay daily, weekly, or per season.</p>
          </div>
        </div>

        {!purchased ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {products.map((p) => (
              <button
                key={p.type}
                onClick={() => {
                  setSelected(p.type);
                  setShowConfirm(false);
                }}
                className={`rounded-xl border p-5 text-left transition-all ${
                  selected === p.type
                    ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-900 ring-1 ring-zinc-900 dark:ring-zinc-100'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg border mb-3 ${p.color}`}>
                  <Shield className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{p.name}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">{p.description}</p>
                <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                    KES {p.dailyPremium}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {p.type === 'seasonal_crop' ? 'per season' : 'per day'} · up to KES {(p.coverageAmount / 1000).toFixed(0)}k
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : null}

        {selected && !showConfirm && !purchased && product && (
          <Card className="p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${product.color}`}>
                <Shield className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{product.name}</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{product.description}</p>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900 p-3">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Premium</p>
                    <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">KES {product.dailyPremium}</p>
                    <p className="text-xs text-zinc-400">{product.type === 'seasonal_crop' ? 'per season' : 'per day'}</p>
                  </div>
                  <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900 p-3">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Coverage Amount</p>
                    <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">KES {product.coverageAmount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <Check className="h-4 w-4 text-emerald-500" />
                    No paperwork required
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <Check className="h-4 w-4 text-emerald-500" />
                    Pay via M-Pesa
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <Check className="h-4 w-4 text-emerald-500" />
                    AI-powered claims in under 60 seconds
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <Check className="h-4 w-4 text-emerald-500" />
                    Blockchain-verified policy record
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button
                    className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
                    onClick={() => setShowConfirm(true)}
                  >
                    Buy Now via M-Pesa
                  </Button>
                  <Button variant="outline" onClick={() => setSelected(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {showConfirm && product && !purchased && (
          <Card className="p-6 border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Confirm Purchase</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                {product.name} · KES {product.dailyPremium}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-500 mb-6">
                An M-Pesa STK push will be sent to your phone. Enter your PIN to confirm.
              </p>
              <div className="flex justify-center gap-3">
                <Button onClick={handlePurchase} className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900">
                  Confirm & Pay via M-Pesa
                </Button>
                <Button variant="outline" onClick={() => setShowConfirm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {purchased && (
          <Card className="p-12 border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20">
            <div className="text-center max-w-md mx-auto">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                  <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Purchase Successful! 🎉
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                Your {product?.name} policy is now active.
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-500 mb-6">
                Policy #{policyRef} · Recorded on Stellar blockchain
              </p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={() => { setPurchased(false); setSelected(null); setShowConfirm(false); }}>
                  Buy Another Policy
                </Button>
                <Link
                  href="/"
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 px-4 text-sm font-medium transition-colors"
                >
                  Return Home
                </Link>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
