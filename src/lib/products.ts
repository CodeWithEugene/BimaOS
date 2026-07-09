import type { ProductDefinition, PolicyType } from '@/types';

export const products: ProductDefinition[] = [
  {
    type: 'daily_boda',
    name: 'Daily Boda Cover',
    description: 'Accident and theft protection for boda boda riders. Pay as you ride - only KES 20 per day.',
    dailyPremium: 20,
    coverageAmount: 50000,
    icon: 'Bike',
    color: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  },
  {
    type: 'daily_market',
    name: 'Daily Market Cover',
    description: 'Protect your market stock and goods against fire, theft, and damage. From KES 30/day.',
    dailyPremium: 30,
    coverageAmount: 30000,
    icon: 'Store',
    color: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
  {
    type: 'seasonal_crop',
    name: 'Seasonal Crop Cover',
    description: 'Weather-indexed protection for smallholder farmers. Automatic payouts when rainfall fails.',
    dailyPremium: 150,
    coverageAmount: 150000,
    icon: 'Sprout',
    color: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
  {
    type: 'health_cover',
    name: 'Health Cover',
    description: 'Affordable daily health insurance. Covers outpatient visits, basic procedures, and emergency care.',
    dailyPremium: 50,
    coverageAmount: 200000,
    icon: 'HeartPulse',
    color: 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  },
  {
    type: 'sme_fire',
    name: 'SME Fire & Stock Cover',
    description: 'Comprehensive cover for small businesses. Fire, theft, stock damage, and business interruption.',
    dailyPremium: 100,
    coverageAmount: 500000,
    icon: 'Building2',
    color: 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  },
  {
    type: 'life_cover',
    name: 'Life Cover',
    description: 'Simple life insurance that pays out to your family. From KES 40/day.',
    dailyPremium: 40,
    coverageAmount: 1000000,
    icon: 'Shield',
    color: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  },
  {
    type: 'funeral',
    name: 'Funeral Insurance',
    description: 'Dignified funeral cover for you and your family. Quick payouts when you need them most.',
    dailyPremium: 30,
    coverageAmount: 100000,
    icon: 'Heart',
    color: 'bg-slate-50 dark:bg-slate-950/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800',
  },
  {
    type: 'education_savings',
    name: 'Education Savings Plan',
    description: 'Save and insure your child\'s education. Combines savings with life cover.',
    dailyPremium: 80,
    coverageAmount: 500000,
    icon: 'GraduationCap',
    color: 'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
  },
];

export function getProductByType(type: PolicyType): ProductDefinition | undefined {
  return products.find((p) => p.type === type);
}

export function calculateCoverageDuration(
  premiumAmount: number,
  policyType: PolicyType
): { start: Date; end: Date } {
  const start = new Date();
  const end = new Date(start);

  if (policyType === 'seasonal_crop') {
    end.setMonth(end.getMonth() + 6);
  } else if (policyType === 'education_savings') {
    end.setFullYear(end.getFullYear() + 10);
  } else {
    end.setDate(end.getDate() + 30);
  }

  return { start, end };
}
