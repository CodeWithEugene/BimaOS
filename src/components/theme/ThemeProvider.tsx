'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'system' | 'light' | 'dark';

type ThemeContextValue = {
  theme: Theme;
  resolved: 'light' | 'dark';
  setTheme: (t: Theme) => void;
  cycle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getStored(): Theme {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem('bimaos-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return 'system';
}

function resolve(t: Theme): 'light' | 'dark' {
  if (t !== 'system') return t;
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(resolved: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', resolved === 'dark');
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getStored);
  const [resolved, setResolved] = useState<'light' | 'dark'>(() => resolve(getStored()));

  useEffect(() => {
    applyTheme(resolved);
  }, [resolved]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (theme === 'system') setResolved(getSystemTheme());
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    localStorage.setItem('bimaos-theme', t);
    setThemeState(t);
    setResolved(resolve(t));
  }, []);

  const cycle = useCallback(() => {
    const order: Theme[] = ['system', 'light', 'dark'];
    const idx = order.indexOf(theme);
    setTheme(order[(idx + 1) % order.length]);
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme, cycle }}>
      {children}
    </ThemeContext.Provider>
  );
}

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
