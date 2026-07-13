'use client';

import { StatsCards } from '@/components/dashboard/stats-cards';
import { LeadsChart } from '@/components/dashboard/leads-chart';
import { RecentActivities } from '@/components/dashboard/recent-activities';
import { useStore } from '@/hooks/use-store';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardPage() {
  const { stats } = useStore();
  const { businessName } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">{businessName} — Visão geral dos seus leads</p>
      </div>

      <StatsCards
        totalLeads={stats.totalLeads}
        newToday={stats.newToday}
        conversionRate={stats.conversionRate}
        pipelineValue={stats.pipelineValue}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LeadsChart data={stats.leadsByDay} />
        </div>
        <RecentActivities activities={stats.recentActivities} />
      </div>
    </div>
  );
}