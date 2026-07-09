'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Logo } from '@/components/shared/Logo';
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Settings,
  ScrollText,
  Smartphone,
  LogOut,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/claims', label: 'Claims', icon: FileText },
  { href: '/dashboard/policies', label: 'Policies', icon: ScrollText },
  { href: '/dashboard/agents', label: 'Agents', icon: Users },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/ussd', label: 'USSD Simulator', icon: Smartphone },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="flex items-center justify-between px-6 h-16 border-b border-zinc-200 dark:border-zinc-800">
        <Logo />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Insurer Portal</p>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
        <div className="flex items-center justify-between px-3">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Theme</span>
          <ThemeToggle />
        </div>
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 text-xs font-medium">
            JW
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">Insurer Admin</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">admin@bimaos.app</p>
          </div>
          <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
