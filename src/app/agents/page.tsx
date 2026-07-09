'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Users,
  TrendingUp,
  DollarSign,
  Smartphone,
  CheckCircle,
  ArrowRight,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function AgentsPage() {
  const [showSimulator, setShowSimulator] = useState(false);
  const [policiesSold, setPoliciesSold] = useState(0);
  const [commission, setCommission] = useState(0);

  const sellPolicy = () => {
    setPoliciesSold((p) => p + 1);
    setCommission((c) => c + Math.floor(Math.random() * 150) + 50);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
            <ArrowRight className="h-4 w-4 rotate-180" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Agent Portal</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Sell insurance, track commissions, grow your network.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4">
                <Users className="h-5 w-5 text-zinc-700 dark:text-zinc-300 mb-2" />
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{policiesSold}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Policies Sold</p>
              </Card>
              <Card className="p-4">
                <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mb-2" />
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">KES {commission}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Commission Earned</p>
              </Card>
              <Card className="p-4">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 mb-2" />
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{policiesSold > 0 ? 'A+' : 'N/A'}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Agent Rating</p>
              </Card>
            </div>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Smartphone className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">USSD Sales Simulator</h2>
              </div>

              {!showSimulator ? (
                <div className="text-center py-8">
                  <Smartphone className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Demonstrate how agents sell via USSD</p>
                  <Button onClick={() => setShowSimulator(true)} className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900">
                    Start Simulator
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg bg-zinc-900 dark:bg-zinc-950 p-4 font-mono text-sm min-h-[120px]">
                    <p className="text-zinc-500 text-xs mb-2">*384*XXX# Agent Mode</p>
                    <p className="text-emerald-400">
                      {policiesSold === 0
                        ? 'CON Agent Menu\n1. Sell Policy\n2. Check Commission\n3. Customer Lookup'
                        : 'CON Policy Sold!\nCustomer: Daily Boda Cover\nPremium: KES 20\nCommission: KES 10'}
                    </p>
                  </div>

                  <Button onClick={sellPolicy} className="w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Sell Policy (KES 20)
                  </Button>

                  {policiesSold > 0 && (
                    <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 p-3">
                      <p className="text-sm text-emerald-800 dark:text-emerald-200 font-medium">
                        KES {commission} commission earned!
                      </p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">
                        {policiesSold} policies sold today
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Agent Onboarding</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400">1</div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Register via USSD</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Dial *384*XXX# and select Agent Registration</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400">2</div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Get Digital ID</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Upload ID via SMS link. Verified in 24 hours.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400">3</div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Start Selling</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Earn up to 20% commission on every policy sold.</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-3">Commission Structure</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Daily Cover</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">15%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Seasonal Crop</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">20%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Health Cover</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">18%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Life Cover</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">22%</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-2">Why Become an Agent?</h3>
              <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                <li className="flex gap-2"><CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" /> No license fees</li>
                <li className="flex gap-2"><CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" /> Instant commission</li>
                <li className="flex gap-2"><CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" /> Work from any phone</li>
                <li className="flex gap-2"><CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" /> Daily payouts to M-Pesa</li>
              </ul>
            </Card>

            <Card className="p-4 border-zinc-300 dark:border-zinc-700">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Distribution Network</h3>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                BimaOS aggregates thousands of micro-agents across Kenya. Insurers reach customers
                they could never access through traditional channels.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
