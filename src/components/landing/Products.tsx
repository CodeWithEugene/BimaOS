'use client';

import { products } from '@/lib/products';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const iconMap: Record<string, React.ReactNode> = {
  Bike: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>
  ),
  Store: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>
  ),
  Sprout: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.5c-1.3 2.2-1.8 4-3 5.5"/><path d="M12 4c-2.5 4-5 5.5-7 7"/><path d="M14 6c1.5 2 3 4 4.5 6 .5 1 1.5 2 2.5 3"/></svg>
  ),
  HeartPulse: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
  ),
  Building2: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
  ),
  Shield: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
  ),
  Heart: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
  ),
  GraduationCap: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
  ),
};

export function Products() {
  return (
    <section id="products" className="py-20 sm:py-28 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Insurance products for every African
          </h2>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            From boda boda riders to smallholder farmers — coverage that fits your life and budget.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <div
              key={product.type}
              className="group relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 transition-all duration-300 hover:bg-zinc-900 dark:hover:bg-zinc-100 hover:border-zinc-900 dark:hover:border-zinc-100"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg border mb-3 transition-colors duration-300 ${product.color} group-hover:bg-white/20 dark:group-hover:bg-zinc-900/20 group-hover:border-transparent`}>
                <span className="transition-colors duration-300 group-hover:text-white dark:group-hover:text-zinc-900">
                  {iconMap[product.icon] || iconMap.Shield}
                </span>
              </div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm transition-colors duration-300 group-hover:text-white dark:group-hover:text-zinc-900">{product.name}</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed transition-colors duration-300 group-hover:text-zinc-300 dark:group-hover:text-zinc-600">{product.description}</p>
              <div className="mt-3 flex items-end justify-between">
                <div>
                  <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50 transition-colors duration-300 group-hover:text-white dark:group-hover:text-zinc-900">
                    KES {product.dailyPremium}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 transition-colors duration-300 group-hover:text-zinc-300 dark:group-hover:text-zinc-600">
                    {product.type === 'seasonal_crop' ? 'per season' : 'per day'} · up to KES {(product.coverageAmount / 1000).toFixed(0)}k
                  </p>
                </div>
              </div>
              <Link
                href={`/products?type=${product.type}`}
                className="mt-3 inline-flex items-center text-xs font-medium text-zinc-900 dark:text-zinc-100 transition-colors duration-300 group-hover:text-white dark:group-hover:text-zinc-900"
              >
                Learn more <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
