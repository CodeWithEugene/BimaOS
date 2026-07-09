'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, Key, Smartphone, MessageSquare, Shield,
  CheckCircle, RefreshCw, Eye, EyeOff
} from 'lucide-react';

export default function SettingsDashboardPage() {
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  // Form States
  const [atUsername, setAtUsername] = useState('bimaos_sandbox');
  const [atApiKey, setAtApiKey] = useState('');
  
  const [mpesaConsumerKey, setMpesaConsumerKey] = useState('');
  const [mpesaSecret, setMpesaSecret] = useState('');
  
  const [telegramToken, setTelegramToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');

  const [stellarContract, setStellarContract] = useState('CDLZXYZ... Soroban Registry Address');
  const [stellarNetwork, setStellarNetwork] = useState('Testnet');

  const toggleSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Gateway Settings</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Configure third-party API credentials, sandbox configurations, and blockchain nodes.
          </p>
        </div>
        {saveSuccess && (
          <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 font-bold px-3 py-1 animate-pulse">
            <CheckCircle className="h-3.5 w-3.5 mr-1 shrink-0" /> Settings Saved
          </Badge>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Africa's Talking Credentials */}
        <Card className="p-5 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-4">
          <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-zinc-500" />
            Africa&apos;s Talking USSD &amp; SMS Gateway
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-500 block mb-1">Username</label>
              <Input 
                value={atUsername}
                onChange={e => setAtUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500 block mb-1">API Key</label>
              <div className="relative">
                <Input 
                  type={showSecrets['at'] ? 'text' : 'password'}
                  value={atApiKey}
                  onChange={e => setAtApiKey(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('at')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showSecrets['at'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Safaricom M-Pesa credentials */}
        <Card className="p-5 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-4">
          <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Key className="h-4 w-4 text-zinc-500" />
            Safaricom M-Pesa Daraja API
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-500 block mb-1">Consumer Key</label>
              <Input 
                value={mpesaConsumerKey}
                onChange={e => setMpesaConsumerKey(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500 block mb-1">Consumer Secret</label>
              <div className="relative">
                <Input 
                  type={showSecrets['mpesa'] ? 'text' : 'password'}
                  value={mpesaSecret}
                  onChange={e => setMpesaSecret(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('mpesa')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showSecrets['mpesa'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Telegram adjusters bot */}
        <Card className="p-5 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-4">
          <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-zinc-500" />
            Telegram Adjuster Dispatch Notification Bot
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-500 block mb-1">Bot Token</label>
              <div className="relative">
                <Input 
                  type={showSecrets['tg'] ? 'text' : 'password'}
                  value={telegramToken}
                  onChange={e => setTelegramToken(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('tg')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showSecrets['tg'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500 block mb-1">Adjuster Chat Group ID</label>
              <Input 
                value={telegramChatId}
                onChange={e => setTelegramChatId(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Stellar Blockchain */}
        <Card className="p-5 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-4">
          <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Shield className="h-4 w-4 text-zinc-500" />
            Stellar Soroban Auditing Registry
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-500 block mb-1">Soroban Smart Contract Address</label>
              <Input 
                value={stellarContract}
                onChange={e => setStellarContract(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500 block mb-1">Target Network</label>
              <select
                className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none"
                value={stellarNetwork}
                onChange={e => setStellarNetwork(e.target.value)}
              >
                <option value="Futurenet">Stellar Futurenet (Developer Sandbox)</option>
                <option value="Testnet">Stellar Testnet (Recommended)</option>
                <option value="Mainnet">Stellar Pubnet (Production)</option>
              </select>
            </div>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button 
            type="submit" 
            className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 font-semibold"
          >
            Save Gateway Settings
          </Button>
          <Button type="button" variant="outline">
            Reset to Default Sandbox Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
