import { Sidebar } from '@/components/dashboard/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-zinc-50 dark:bg-zinc-900">
        <div className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center px-6">
          <div className="flex items-center gap-3">
            <div className="flex lg:hidden h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 dark:bg-white">
              <svg className="h-4 w-4 text-white dark:text-zinc-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 hidden lg:block" />
            <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">BimaOS Insurer Portal</h1>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">v1.0.0</span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              All Systems Operational
            </div>
          </div>
        </div>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
