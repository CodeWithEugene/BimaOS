'use client';

export function Stats() {
  return (
    <section className="py-20 border-t border-zinc-100 dark:border-zinc-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">3 min</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Average time to get covered</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">KES 20</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Minimum daily premium</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">99.9%</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">USSD gateway uptime</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">24/7</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Claims processing</p>
          </div>
        </div>
      </div>
    </section>
  );
}
