'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Smartphone, Send, RotateCcw, HelpCircle, Code } from 'lucide-react';

interface UssdResponse {
  message: string;
  type: 'CON' | 'END';
  sessionId: string;
  serviceCode: string;
  phoneNumber: string;
}

export default function UssdSimulatorPage() {
  const [phoneNumber, setPhoneNumber] = useState('+254712345678');
  const [rawInputText, setRawInputText] = useState('');
  const [replyInput, setReplyInput] = useState('');
  const [screenText, setScreenText] = useState('Dial *384*11400# to start BimaOS');
  const [sessionActive, setSessionActive] = useState(false);
  const [responseType, setResponseType] = useState<'CON' | 'END' | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [apiLogs, setApiLogs] = useState<any[]>([]);

  const handleDial = async () => {
    if (!phoneNumber) return;
    
    const sessionId = `sess_${Date.now()}`;
    const payload = {
      sessionId,
      serviceCode: '*384*11400#',
      phoneNumber,
      text: '',
    };

    try {
      const res = await fetch('/api/ussd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json() as UssdResponse;
      setScreenText(data.message);
      setResponseType(data.type);
      setSessionActive(data.type === 'CON');
      setRawInputText('');
      setReplyInput('');
      setHistory([]);

      setApiLogs((prev) => [
        {
          timestamp: new Date().toLocaleTimeString(),
          request: payload,
          response: data,
        },
        ...prev,
      ]);
    } catch (error) {
      console.error('USSD dial error:', error);
      setScreenText('END Connection error. Please try again.');
      setSessionActive(false);
    }
  };

  const handleSendReply = async () => {
    if (!phoneNumber || !replyInput.trim()) return;

    // Build the concatenated USSD text (e.g. "1*2*1")
    const nextRawText = rawInputText ? `${rawInputText}*${replyInput.trim()}` : replyInput.trim();
    
    const payload = {
      sessionId: apiLogs[0]?.request.sessionId || `sess_${Date.now()}`,
      serviceCode: '*384*11400#',
      phoneNumber,
      text: nextRawText,
    };

    try {
      const res = await fetch('/api/ussd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json() as UssdResponse;
      setScreenText(data.message);
      setResponseType(data.type);
      setSessionActive(data.type === 'CON');
      setRawInputText(nextRawText);
      setHistory((prev) => [...prev, replyInput.trim()]);
      setReplyInput('');

      setApiLogs((prev) => [
        {
          timestamp: new Date().toLocaleTimeString(),
          request: payload,
          response: data,
        },
        ...prev,
      ]);
    } catch (error) {
      console.error('USSD reply error:', error);
      setScreenText('END Connection error. Please try again.');
      setSessionActive(false);
    }
  };

  const resetSimulator = () => {
    setPhoneNumber('+254712345678');
    setRawInputText('');
    setReplyInput('');
    setScreenText('Dial *384*11400# to start BimaOS');
    setSessionActive(false);
    setResponseType(null);
    setHistory([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">USSD Simulator</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Simulate offline subscriber USSD interactions and trace the Africa&apos;s Talking API request/response cycle.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Phone Emulator */}
        <div className="flex justify-center">
          <div className="w-[320px] h-[640px] bg-zinc-900 dark:bg-black rounded-[40px] p-4 border-[6px] border-zinc-700 dark:border-zinc-800 shadow-2xl flex flex-col justify-between relative overflow-hidden">
            {/* Speaker & Camera notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-2">
              <div className="w-12 h-1 bg-zinc-800 rounded-full" />
              <div className="w-2 h-2 bg-zinc-800 rounded-full" />
            </div>

            {/* Simulated Phone UI Header */}
            <div className="flex justify-between items-center text-xs text-zinc-500 font-medium px-2 pt-2">
              <span>BimaOS Mobile</span>
              <div className="flex items-center gap-1">
                <span>📶 4G</span>
                <span>🔋 85%</span>
              </div>
            </div>

            {/* Screen */}
            <div className="flex-1 bg-zinc-950 rounded-2xl border border-zinc-800 my-4 p-4 flex flex-col justify-between font-mono">
              {/* Screen Top Status */}
              <div className="text-[10px] text-zinc-600 border-b border-zinc-900 pb-1.5 flex justify-between">
                <span>Service: *384*11400#</span>
                <span>{sessionActive ? 'Active Session' : 'Idle'}</span>
              </div>

              {/* Message Display Area */}
              <div className="flex-grow py-4 overflow-y-auto flex flex-col justify-center">
                {screenText.split('\n').map((line, idx) => (
                  <p
                    key={idx}
                    className={`text-sm ${
                      line.startsWith('CON') || line.startsWith('END') || line.startsWith('📋') || line.startsWith('✅')
                        ? 'text-emerald-400 font-bold'
                        : 'text-zinc-300'
                    }`}
                  >
                    {line.replace(/^(CON|END)\s+/, '')}
                  </p>
                ))}
              </div>

              {/* Phone Input Box */}
              <div className="border-t border-zinc-900 pt-3">
                {sessionActive ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-md px-2 py-1 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700"
                      placeholder="Enter choice..."
                      value={replyInput}
                      onChange={(e) => setReplyInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendReply();
                      }}
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={handleSendReply}
                      className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold"
                    >
                      <Send className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleDial}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    Dial USSD Code
                  </Button>
                )}
              </div>
            </div>

            {/* Bottom Bar / Home Indicator */}
            <div className="flex flex-col items-center gap-1.5 pb-1">
              <div className="flex justify-around w-full px-4 mb-2">
                <button
                  onClick={resetSimulator}
                  className="flex flex-col items-center gap-0.5 text-[9px] text-zinc-500 hover:text-zinc-300"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              </div>
              <div className="w-24 h-1 bg-zinc-800 rounded-full" />
            </div>
          </div>
        </div>

        {/* Right Columns: Configuration and API trace logs */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-zinc-500" />
              Simulator Configuration
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
                  Subscriber Phone Number
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="+254712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={sessionActive}
                  />
                  {sessionActive && (
                    <Button variant="outline" size="sm" onClick={resetSimulator}>
                      Disconnect
                    </Button>
                  )}
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">
                  Simulates the customer&apos;s phone dialing the system. Used to query policies.
                </p>
              </div>

              <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900 p-3.5 border border-zinc-100 dark:border-zinc-800">
                <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                  <HelpCircle className="h-3.5 w-3.5 text-zinc-400" />
                  Navigation Guide
                </h4>
                <ul className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
                  <li>• First choose language: <span className="font-bold text-zinc-700 dark:text-zinc-300">1</span> English or <span className="font-bold text-zinc-700 dark:text-zinc-300">2</span> Kiswahili.</li>
                  <li>• Then <span className="font-bold text-zinc-700 dark:text-zinc-300">1</span> to buy cover, <span className="font-bold text-zinc-700 dark:text-zinc-300">2</span> to file a claim.</li>
                  <li>• <span className="font-bold text-zinc-700 dark:text-zinc-300">3</span> to view policies, <span className="font-bold text-zinc-700 dark:text-zinc-300">4</span> for the education module.</li>
                  <li>• e.g. buy: <span className="font-bold text-zinc-700 dark:text-zinc-300">1*1*2*1*1</span> (Eng → Buy → Boda → Rider → Confirm).</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* API logs */}
          <Card className="p-5 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex-1 flex flex-col">
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <Code className="h-4 w-4 text-zinc-500" />
              API Session Trace Logs (Africa&apos;s Talking API Webhook Payload)
            </h3>

            {apiLogs.length === 0 ? (
              <div className="flex-1 border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-lg flex items-center justify-center p-8 text-center">
                <div>
                  <p className="text-sm text-zinc-400 dark:text-zinc-600">No session activity recorded yet.</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Dial the USSD menu above to capture the API payloads.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                {apiLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden text-xs font-mono"
                  >
                    <div className="bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between text-[10px] text-zinc-500">
                      <span>POST /api/ussd</span>
                      <span>{log.timestamp}</span>
                    </div>
                    <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-200 dark:divide-zinc-800">
                      <div className="p-3 bg-zinc-950 text-zinc-400">
                        <p className="text-[10px] text-zinc-500 mb-1 uppercase font-semibold">Request Body</p>
                        <pre className="whitespace-pre-wrap">{JSON.stringify(log.request, null, 2)}</pre>
                      </div>
                      <div className="p-3 bg-zinc-950 text-zinc-400">
                        <p className="text-[10px] text-zinc-500 mb-1 uppercase font-semibold">Response Payload</p>
                        <pre className="whitespace-pre-wrap">{JSON.stringify(log.response, null, 2)}</pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
