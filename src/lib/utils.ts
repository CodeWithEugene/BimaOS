import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateRelative(date: string): string {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return formatDate(date);
}

export function policyTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    daily_boda: 'Daily Boda Cover',
    daily_market: 'Daily Market Cover',
    seasonal_crop: 'Seasonal Crop Cover',
    health_cover: 'Health Cover',
    sme_fire: 'SME Fire Cover',
    funeral: 'Funeral Insurance',
    education_savings: 'Education Savings',
    life_cover: 'Life Cover',
  };
  return labels[type] || type;
}

export function claimStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    ai_review: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    human_review: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    settled: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function generatePolicyNumber(): string {
  const prefix = 'BOS';
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${ts}-${rand}`;
}
