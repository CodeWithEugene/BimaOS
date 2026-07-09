'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function FloatingWidgets() {
  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Habari! I am BimaOS AI. I can assist you with Kilimo, Boda, Biashara, and Health covers. Ask me anything about our policies or claim processing!'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Accessibility State
  const [isAccessOpen, setIsAccessOpen] = useState(false);
  const [textSize, setTextSize] = useState<'base' | 'lg' | 'xl'>('base');
  const [contrastMode, setContrastMode] = useState<'normal' | 'hc-dark' | 'hc-light'>('normal');
  const [dyslexiaMode, setDyslexiaMode] = useState(false);
  const [narratorEnabled, setNarratorEnabled] = useState(false);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatOpen]);

  // Apply Text Size
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (textSize === 'xl') {
      root.style.fontSize = '20px';
    } else if (textSize === 'lg') {
      root.style.fontSize = '18px';
    } else {
      root.style.fontSize = '16px';
    }
  }, [textSize]);

  // Apply Contrast Mode
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const body = document.body;
    body.classList.remove('hc-dark', 'hc-light');
    if (contrastMode === 'hc-dark') {
      body.classList.add('hc-dark');
    } else if (contrastMode === 'hc-light') {
      body.classList.add('hc-light');
    }
  }, [contrastMode]);

  // Apply Dyslexia Font
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const body = document.body;
    if (dyslexiaMode) {
      body.classList.add('font-dyslexia');
    } else {
      body.classList.remove('font-dyslexia');
    }
  }, [dyslexiaMode]);

  // Screen Narrator (Hover-to-Speak)
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (!narratorEnabled) {
      window.speechSynthesis.cancel();
      return;
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const tag = target.tagName;
      
      // Select readable text elements
      if (['BUTTON', 'A', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'LABEL', 'SPAN', 'TD', 'TH'].includes(tag) || target.getAttribute('role') === 'button') {
        const text = target.innerText || target.getAttribute('aria-label') || target.getAttribute('placeholder') || '';
        if (text.trim()) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text.trim());
          utterance.rate = 1.0;
          window.speechSynthesis.speak(utterance);
        }
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      window.speechSynthesis.cancel();
    };
  }, [narratorEnabled]);

  // Handle Chat Submit
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSending) return;

    const userText = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setIsSending(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages, { role: 'user', content: userText }]
        })
      });

      const data = await response.json();
      if (data.message) {
        setChatMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
      } else {
        setChatMessages((prev) => [...prev, { role: 'assistant', content: 'Pole. I ran into an error processing your query. Please try again.' }]);
      }
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [...prev, { role: 'assistant', content: 'Connection issue. Please verify your internet and try again.' }]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {/* Accessibility Control Panel Overlay */}
      {isAccessOpen && (
        <div className="absolute bottom-16 right-16 w-80 bg-neutral-900 border border-neutral-800 rounded-none shadow-2xl p-5 text-neutral-100 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
            <h3 className="font-bold text-sm uppercase tracking-wider text-neutral-400">Accessibility Tools</h3>
            <button 
              onClick={() => setIsAccessOpen(false)}
              className="text-neutral-500 hover:text-neutral-200 text-xs px-2 py-1 bg-neutral-800 rounded-none"
            >
              Close
            </button>
          </div>

          {/* Text Size */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-neutral-400">Text Resizing</span>
            <div className="grid grid-cols-3 gap-1">
              {(['base', 'lg', 'xl'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setTextSize(size)}
                  className={`py-1 text-xs border rounded-none uppercase transition-colors ${
                    textSize === size 
                      ? 'bg-neutral-100 text-neutral-900 border-neutral-100 font-bold' 
                      : 'border-neutral-800 hover:border-neutral-700 text-neutral-300 bg-neutral-900'
                  }`}
                >
                  {size === 'base' ? 'Normal' : size === 'lg' ? 'Large' : 'X-Large'}
                </button>
              ))}
            </div>
          </div>

          {/* Contrast Mode */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-neutral-400">High Contrast Modes</span>
            <div className="grid grid-cols-3 gap-1">
              {(['normal', 'hc-dark', 'hc-light'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setContrastMode(mode)}
                  className={`py-1 text-xs border rounded-none transition-colors ${
                    contrastMode === mode 
                      ? 'bg-neutral-100 text-neutral-900 border-neutral-100 font-bold' 
                      : 'border-neutral-800 hover:border-neutral-700 text-neutral-300 bg-neutral-900'
                  }`}
                >
                  {mode === 'normal' ? 'Default' : mode === 'hc-dark' ? 'Dark HC' : 'Light HC'}
                </button>
              ))}
            </div>
          </div>

          {/* Dyslexia Toggle */}
          <div className="flex justify-between items-center py-1">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-neutral-300">Dyslexia-Friendly Text</span>
              <span className="text-[10px] text-neutral-500">Optimizes spacing & readability</span>
            </div>
            <button
              onClick={() => setDyslexiaMode(!dyslexiaMode)}
              className={`px-3 py-1 text-xs border rounded-none font-semibold ${
                dyslexiaMode 
                  ? 'bg-emerald-600 text-white border-emerald-600' 
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:border-neutral-600'
              }`}
            >
              {dyslexiaMode ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Hover Narrator Toggle */}
          <div className="flex justify-between items-center py-1 border-t border-neutral-800 pt-3">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-neutral-300">Voice Narrator (Screen Reader)</span>
              <span className="text-[10px] text-neutral-500">Hover over elements to read aloud</span>
            </div>
            <button
              onClick={() => setNarratorEnabled(!narratorEnabled)}
              className={`px-3 py-1 text-xs border rounded-none font-semibold ${
                narratorEnabled 
                  ? 'bg-emerald-600 text-white border-emerald-600' 
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:border-neutral-600'
              }`}
            >
              {narratorEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      )}

      {/* AI Chatbot Dialog Overlay */}
      {isChatOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 h-[480px] bg-neutral-900 border border-neutral-800 rounded-none shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-neutral-950 p-4 border-b border-neutral-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <div>
                <h3 className="font-bold text-sm text-neutral-100">BimaOS AI Assistant</h3>
                <span className="text-[10px] text-neutral-500 font-medium">Insurtech Advisor</span>
              </div>
            </div>
            <button 
              onClick={() => setIsChatOpen(false)}
              className="text-neutral-500 hover:text-neutral-200 text-xs px-2 py-1 bg-neutral-800 rounded-none"
            >
              Close
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-950/30">
            {chatMessages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'ml-auto items-end' : 'items-start'}`}
              >
                <div 
                  className={`p-3 text-xs leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-neutral-100 text-neutral-900 font-medium' 
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-200'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex items-center gap-1.5 text-xs text-neutral-500 bg-neutral-900 border border-neutral-800 p-3 max-w-[60%]">
                <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce delay-200"></span>
                <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce delay-300"></span>
                <span>Typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendChat} className="border-t border-neutral-800 bg-neutral-950 p-3 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about covers, pricing, or claims..."
              disabled={isSending}
              className="flex-1 bg-neutral-900 border border-neutral-850 px-3 py-2 text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
            />
            <button
              type="submit"
              disabled={isSending || !chatInput.trim()}
              className="bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs px-3.5 py-2 font-bold transition-colors disabled:opacity-40"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Floating Buttons Bar */}
      <div className="flex items-center gap-2">
        {/* Toggle Accessibility Panel Button */}
        <button
          onClick={() => {
            setIsAccessOpen(!isAccessOpen);
            setIsChatOpen(false);
          }}
          aria-label="Accessibility settings"
          className={`w-12 h-12 flex items-center justify-center border shadow-lg transition-all ${
            isAccessOpen 
              ? 'bg-neutral-100 text-neutral-900 border-neutral-100' 
              : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800'
          }`}
        >
          {/* Accessibility Icon (Universal human with arms open) */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="2 2 20 20" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.5 1.5 0 1 1 3.9 0 1.5 1.5 0 0 1-3.9 0ZM12 8.25v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25" />
          </svg>
        </button>

        {/* Toggle Chatbot Button */}
        <button
          onClick={() => {
            setIsChatOpen(!isChatOpen);
            setIsAccessOpen(false);
          }}
          aria-label="AI Chat Assistant"
          className={`w-12 h-12 flex items-center justify-center border shadow-lg transition-all ${
            isChatOpen 
              ? 'bg-neutral-100 text-neutral-900 border-neutral-100' 
              : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800'
          }`}
        >
          {/* Chat Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.12 2.83 2.64 2.95a21.5 21.5 0 0 0 10.22 0c1.52-.12 2.64-1.35 2.64-2.95V7.5c0-1.6-1.12-2.83-2.64-2.95a21.93 21.93 0 0 0-10.22 0c-1.52.12-2.64 1.35-2.64 2.95v5.22Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 15.75-3.75 3.75V15.75" />
          </svg>
        </button>
      </div>
    </div>
  );
}
