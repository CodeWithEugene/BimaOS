'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const icons = { dark: Moon, light: Sun, system: Monitor } as const;

export function ThemeToggle() {
  const { theme, cycle } = useTheme();
  const Icon = icons[theme];

  const label = theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'System';

  return (
    <button
      onClick={cycle}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
      title={`Theme: ${label}`}
      aria-label={`Switch theme (currently ${label})`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
