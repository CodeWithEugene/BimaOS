import { StatsCards } from '@/components/dashboard/StatsCards';
import { RecentClaims } from '@/components/dashboard/RecentClaims';
import { ClaimsChart } from '@/components/dashboard/ClaimsChart';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Dashboard Overview</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Real-time view of your insurance portfolio and claims pipeline.
        </p>
      </div>

      <StatsCards />

      <div className="grid lg:grid-cols-2 gap-6">
        <RecentClaims />
        <ClaimsChart />
      </div>
    </div>
  );
}
