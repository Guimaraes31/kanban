'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowRight, Clock3, Kanban, RefreshCw, UsersRound } from 'lucide-react';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { LeadsChart } from '@/components/dashboard/leads-chart';
import { RecentActivities } from '@/components/dashboard/recent-activities';
import { PipelineOverview } from '@/components/dashboard/pipeline-overview';
import { SourceOverview } from '@/components/dashboard/source-overview';
import { UpcomingFollowUps } from '@/components/dashboard/upcoming-followups';
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton';
import { Button } from '@/components/ui/button';
import { useStore } from '@/hooks/use-store';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardPage() {
  const { stats, leads, pipeline, scheduledMessages, loading, error, refresh } = useStore();
  const { businessName } = useAuth();
  const pendingFollowUps = scheduledMessages.filter((message) => message.status === 'pending').length;

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center justify-center">
        <div className="w-full rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-300">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-xl font-semibold text-zinc-100">Não foi possível carregar o dashboard</h1>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-zinc-400">{error}</p>
          <Button
            className="mt-5"
            onClick={() => {
              void refresh().catch(() => undefined);
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5 sm:space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-violet-950/40 p-5 shadow-2xl shadow-black/20 sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-300">
                Visão geral
              </span>
              {pendingFollowUps > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-xs text-amber-300">
                  <Clock3 className="h-3.5 w-3.5" />
                  {pendingFollowUps} {pendingFollowUps === 1 ? 'follow-up pendente' : 'follow-ups pendentes'}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {businessName || 'Seu negócio'} em movimento.
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400 sm:text-base">
              Acompanhe as oportunidades, entenda o ritmo do funil e priorize os próximos contatos.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Link
              href="/leads"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
            >
              <UsersRound className="h-4 w-4" />
              Gerenciar leads
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/kanban"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/70 px-4 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Kanban className="h-4 w-4" />
              Abrir funil
            </Link>
          </div>
        </div>
      </section>

      <StatsCards
        totalLeads={stats.totalLeads}
        newToday={stats.newToday}
        conversionRate={stats.conversionRate}
        pipelineValue={stats.pipelineValue}
      />

      <div className="grid items-stretch gap-5 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-8">
          <LeadsChart data={stats.leadsByDay} />
        </div>
        <div className="min-w-0 xl:col-span-4">
          <UpcomingFollowUps messages={scheduledMessages} leads={leads} />
        </div>
      </div>

      <div className="grid items-stretch gap-5 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-7">
          <PipelineOverview
            stages={pipeline.stages}
            leads={leads}
            conversionRate={stats.conversionRate}
          />
        </div>
        <div className="min-w-0 xl:col-span-5">
          <SourceOverview leads={leads} />
        </div>
      </div>

      <RecentActivities activities={stats.recentActivities} />
    </div>
  );
}
