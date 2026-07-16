import Link from 'next/link';
import { ArrowRight, Kanban } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { Lead, PipelineStage } from '@/types';

interface PipelineOverviewProps {
  stages: PipelineStage[];
  leads: Lead[];
  conversionRate: number;
}

export function PipelineOverview({ stages, leads, conversionRate }: PipelineOverviewProps) {
  const rows = [...stages]
    .sort((a, b) => a.position - b.position)
    .map((stage) => {
      const stageLeads = leads.filter((lead) => lead.status === stage.slug);
      return {
        ...stage,
        count: stageLeads.length,
        value: stageLeads.reduce((sum, lead) => sum + Number(lead.estimated_value), 0),
      };
    });
  const maxCount = Math.max(...rows.map((row) => row.count), 1);

  return (
    <Card className="h-full overflow-hidden border-zinc-800/90 bg-zinc-900/70 shadow-lg shadow-black/10">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 border-b border-zinc-800/70 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-zinc-100">
            <Kanban className="h-4 w-4 text-violet-300" aria-hidden="true" />
            Visão do funil
          </CardTitle>
          <CardDescription className="mt-1">Distribuição e valor por etapa</CardDescription>
        </div>
        <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1.5 text-right">
          <p className="text-sm font-bold leading-none text-emerald-300 tabular-nums">{conversionRate}%</p>
          <p className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-emerald-300/60">conversão</p>
        </div>
      </CardHeader>

      <CardContent className="pt-5">
        {rows.length === 0 ? (
          <div className="flex min-h-60 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 text-center">
            <Kanban className="mb-3 h-6 w-6 text-zinc-600" aria-hidden="true" />
            <p className="text-sm font-medium text-zinc-300">Funil ainda não configurado</p>
            <p className="mt-1 text-xs text-zinc-500">As etapas aparecerão aqui após a configuração.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rows.map((row) => {
              const width = row.count === 0 ? 0 : Math.max((row.count / maxCount) * 100, 8);
              return (
                <div key={row.id}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: row.color, boxShadow: `0 0 10px ${row.color}55` }}
                        aria-hidden="true"
                      />
                      <span className="truncate text-sm font-medium text-zinc-300">{row.name}</span>
                    </div>
                    <div className="flex shrink-0 items-baseline gap-3">
                      <span className="hidden text-xs text-zinc-500 sm:inline">{formatCurrency(row.value)}</span>
                      <span className="min-w-6 text-right text-sm font-semibold text-zinc-100 tabular-nums">{row.count}</span>
                    </div>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800/80">
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{ width: `${width}%`, backgroundColor: row.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-zinc-800/70 pt-4">
          <p className="text-xs text-zinc-500">
            <span className="font-semibold text-zinc-300 tabular-nums">{leads.length}</span> leads no total
          </p>
          <Link
            href="/kanban"
            className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Ver funil
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
