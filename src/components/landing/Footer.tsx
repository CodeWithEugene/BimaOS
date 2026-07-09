import Link from 'next/link';
import { Logo } from '@/components/shared/Logo';

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Logo className="mb-4" />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs">
              Open insurance infrastructure for Africa. Making coverage accessible to everyone through USSD, AI, and blockchain.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-4">Products</h4>
            <ul className="space-y-2">
              {['Daily Boda Cover', 'Crop Insurance', 'Health Cover', 'SME Insurance', 'Life Cover'].map((item) => (
                <li key={item}>
                  <Link href="#products" className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2">
              {['About', 'For Insurers', 'Blog', 'Contact'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2">
              {['Privacy Policy', 'Terms of Service', 'Regulatory Compliance'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            &copy; {new Date().getFullYear()} BimaOS. Built for the Africa&apos;s Talking Insurtech Hackathon.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-400 dark:text-zinc-500">Powered by</span>
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Africa&apos;s Talking</span>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Supabase</span>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Stellar</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
