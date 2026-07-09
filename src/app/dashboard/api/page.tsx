'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Code2, Terminal, Copy, Check, ExternalLink,
  BookOpen, Laptop, Smartphone
} from 'lucide-react';

export default function ApiIntegrationsPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'curl' | 'nodejs'>('curl');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const curlSnippets = {
    payment: `curl -X POST https://bima-os.vercel.app/api/payments \\
  -H "Content-Type: application/json" \\
  -d '{
    "phoneNumber": "+254712345678",
    "amount": 20,
    "policyType": "daily_boda"
  }'`,
    claim: `curl -X POST https://bima-os.vercel.app/api/claims \\
  -H "Content-Type: application/json" \\
  -d '{
    "policyId": "policy_uuid_here",
    "userId": "user_uuid_here",
    "description": "Accident occurred on Haile Selassie Ave",
    "imageUrls": ["https://supabase.co/storage/claim_photo.png"],
    "nationalIdUrl": "https://supabase.co/storage/national_id.png",
    "kraCertificateUrl": "https://supabase.co/storage/kra_cert.png"
  }'`,
    ussd: `curl -X POST https://bima-os.vercel.app/api/ussd \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "sessionId=AT_1234&serviceCode=*384*11400#&phoneNumber=+254712345678&text=1*1"`
  };

  const nodeSnippets = {
    payment: `const response = await fetch('https://bima-os.vercel.app/api/payments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phoneNumber: '+254712345678',
    amount: 20,
    policyType: 'daily_boda'
  })
});
const data = await response.json();
console.log('M-Pesa STK Push Initialized:', data);`,
    claim: `const response = await fetch('https://bima-os.vercel.app/api/claims', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    policyId: 'policy-uuid-here',
    userId: 'user-uuid-here',
    description: 'Accident occurred on Haile Selassie Ave',
    imageUrls: ['https://supabase.co/storage/claim_photo.png'],
    nationalIdUrl: 'https://supabase.co/storage/national_id.png',
    kraCertificateUrl: 'https://supabase.co/storage/kra_cert.png'
  })
});
const result = await response.json();
console.log('AI Claims Auditor Verdict:', result.status);`
  };

  const embedCode = `<iframe 
  src="https://bima-os.vercel.app/products?embed=true" 
  width="100%" 
  height="600" 
  frameborder="0"
  style="border: 2px solid #222;"
></iframe>`;

  return (
    <div className="space-y-6 text-zinc-900 dark:text-zinc-100">
      <div>
        <h2 className="text-xl font-semibold">Developer API &amp; Widget Integrations</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Integrate BimaOS open insurtech tools into e-commerce checkout flows, Sacco networks, and third-party dashboards.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Columns: API Documentation & Code Snippets */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-900 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4.5 w-4.5 text-zinc-500" />
                <h3 className="font-semibold text-sm">REST API Endpoints</h3>
              </div>
              
              {/* Language Switcher */}
              <div className="flex border border-zinc-250 dark:border-zinc-850 p-0.5 bg-zinc-50 dark:bg-zinc-900">
                <button
                  onClick={() => setActiveTab('curl')}
                  className={`px-3 py-1 text-[10px] font-bold uppercase transition-colors ${
                    activeTab === 'curl' ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'text-zinc-500'
                  }`}
                >
                  cURL
                </button>
                <button
                  onClick={() => setActiveTab('nodejs')}
                  className={`px-3 py-1 text-[10px] font-bold uppercase transition-colors ${
                    activeTab === 'nodejs' ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'text-zinc-500'
                  }`}
                >
                  Node.js
                </button>
              </div>
            </div>

            {/* API Endpoint list */}
            <div className="space-y-5">
              {/* 1. Payments Endpoint */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5">POST</span>
                    <span className="font-mono text-xs font-semibold">/api/payments</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(activeTab === 'curl' ? curlSnippets.payment : nodeSnippets.payment, 'pay')}
                    className="text-[10px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5"
                  >
                    {copied === 'pay' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied === 'pay' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Triggers an M-Pesa STK push to collect daily/weekly micro-insurance premiums.</p>
                <pre className="p-3 bg-zinc-950 text-zinc-350 font-mono text-[10px] overflow-x-auto border border-zinc-900">
                  <code>{activeTab === 'curl' ? curlSnippets.payment : nodeSnippets.payment}</code>
                </pre>
              </div>

              {/* 2. Claims Auditing Endpoint */}
              <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-900 pt-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5">POST</span>
                    <span className="font-mono text-xs font-semibold">/api/claims</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(activeTab === 'curl' ? curlSnippets.claim : nodeSnippets.claim, 'clm')}
                    className="text-[10px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5"
                  >
                    {copied === 'clm' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied === 'clm' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Processes active claims, checks document authenticity (OCR), runs news checks (Social Intel), and auto-settles approved payouts.</p>
                <pre className="p-3 bg-zinc-950 text-zinc-350 font-mono text-[10px] overflow-x-auto border border-zinc-900">
                  <code>{activeTab === 'curl' ? curlSnippets.claim : nodeSnippets.claim}</code>
                </pre>
              </div>

              {/* 3. Africa's Talking USSD Webhook */}
              {activeTab === 'curl' && (
                <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-900 pt-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5">POST</span>
                      <span className="font-mono text-xs font-semibold">/api/ussd</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(curlSnippets.ussd, 'ussd')}
                      className="text-[10px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5"
                    >
                      {copied === 'ussd' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied === 'ussd' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">The webhook entry point configured on Africa's Talking USSD settings to route dialing logic.</p>
                  <pre className="p-3 bg-zinc-950 text-zinc-350 font-mono text-[10px] overflow-x-auto border border-zinc-900">
                    <code>{curlSnippets.ussd}</code>
                  </pre>
                </div>
              )}
            </div>
          </Card>

          {/* Smart Contract Card */}
          <Card className="p-5 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-3 mb-4">
              <Code2 className="h-4.5 w-4.5 text-zinc-500" />
              <h3 className="font-semibold text-sm">Ethereum Registry Integration</h3>
            </div>
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-900/40 p-3 border border-zinc-150 dark:border-zinc-850 rounded-lg">
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block">Network</span>
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">Sepolia Testnet</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block">Registry Address</span>
                  <span className="font-mono text-[10px] text-zinc-800 dark:text-zinc-200 block break-all">
                    0xA9023faaefcA4e7a4B013604EAA65e4ab59B0d7C
                  </span>
                </div>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Policy issuances and claim settlements are committed directly to our deployed smart contract on Ethereum Sepolia. Third-party developers can query policy validity or claim settlement states directly from the blockchain:
              </p>
              <pre className="p-3 bg-zinc-950 text-zinc-350 font-mono text-[10px] overflow-x-auto border border-zinc-900 leading-normal">
{`const { ethers } = require("ethers");
const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
const registry = new ethers.Contract(
  "0xA9023faaefcA4e7a4B013604EAA65e4ab59B0d7C",
  ["function verifyClaim(bytes32 _claimId) view returns (bool, string, uint256)"],
  provider
);

// Verify a claim payout using claim ID bytes32 hash
const claimIdHash = ethers.keccak256(ethers.toUtf8Bytes("CLAIM-12345"));
const [exists, status, payout] = await registry.verifyClaim(claimIdHash);
console.log("Claim Exists:", exists, "Status:", status);`}
              </pre>
            </div>
          </Card>
        </div>

        {/* Right Column: Dynamic Embeddable Widget */}
        <div className="space-y-6">
          <Card className="p-5 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-2">
              <Laptop className="h-4.5 w-4.5 text-zinc-500" />
              <h3 className="font-semibold text-sm">Embeddable PWA Widget</h3>
            </div>
            
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Embed the BimaOS policy checkout widget directly inside your ecommerce checkout or Sacco member screen by pasting this simple iframe snippet:
            </p>

            <div className="relative">
              <pre className="p-3 bg-zinc-950 text-zinc-350 font-mono text-[10px] overflow-x-auto border border-zinc-900">
                <code>{embedCode}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(embedCode, 'embed')}
                className="absolute top-2 right-2 text-[10px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
              >
                {copied === 'embed' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied === 'embed' ? 'Copy Code' : 'Copy'}
              </button>
            </div>

            {/* Simulated Live Widget Preview Box */}
            <div className="border border-zinc-200 dark:border-zinc-850 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/30 text-center space-y-4">
              <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold">Interactive Checkout Preview</span>
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-5 shadow-sm text-left space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold">Agribusiness Cargo</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">KES 14,500</span>
                </div>
                <div className="h-px bg-zinc-100 dark:bg-zinc-900" />
                
                {/* Embed Button */}
                <button
                  type="button"
                  onClick={() => alert('BimaOS Widget Iframe Mock: Redirects to secure microinsurance checkout.')}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 rounded-none"
                >
                  <Code2 className="h-4 w-4" /> Add BimaOS Crop Shield (+ KES 150)
                </button>
              </div>
              <p className="text-[10px] text-zinc-500 leading-normal">
                Clicking the button lets clients add bite-sized Crop Cover (+ KES 150) to their cart during checkout.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
