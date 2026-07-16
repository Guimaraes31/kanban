import Link from 'next/link';
import { ArrowRight, Share2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SOURCE_LABELS, type Lead } from '@/types';

const sourceStyles: Record<string, { dot: string; bar: string }> = {
  instagram: { dot: 'bg-pink-400', bar: 'bg-pink-400' },
  google_maps: { dot: 'bg-red-400', bar: 'bg-red-400' },
  site: { dot: 'bg-sky-400', bar: 'bg-sky-400' },
  indicacao: { dot: 'bg-teal-400', bar: 'bg-teal-400' },
  whatsapp: { dot: 'bg-emerald-400', bar: 'bg-emerald-400' },
  outro: { dot: 'bg-zinc-400', bar: 'bg-zinc-400' },
};

export function SourceOverview({ leads }: { leads: Lead[] }) {
  const counts = leads.reduce<Map<Lead['source'], number>>((result, lead) => {
    result.set(lead.source, (result.get(lead.source) ?? 0) + 1);
    return result;
  }, new Map());
  const rows = Array.from(counts, ([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count);
  const total = leads.length;

  return (
    <Card className="h-full overflow-hidden border-zinc-800/90 bg-zinc-900/70 shadow-lg shadow-black/10">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 border-b border-zinc-800/70 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-zinc-100">
            <Share2 className="h-4 w-4 text-cyan-300" aria-hidden="true" />
            Origem dos leads
          </CardTitle>
          <CardDescription className="mt-1">Canais que mais geram oportunidades</CardDescription>
        </div>
        <div className="rounded-lg bg-zinc-800/80 px-2.5 py-1.5 text-center">
          <p className="text-base font-bold leading-none text-zinc-100 tabular-nums">{total}</p>
          <p className="mt-1 text-[9px] uppercase tracking-wider text-zinc-500">leads</p>
        </div>
      </CardHeader>

      <CardContent className="pt-5">
        {rows.length === 0 ? (
          <div className="flex min-h-60 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 text-center">
            <Share2 className="mb-3 h-6 w-6 text-zinc-600" aria-hidden="true" />
            <p className="text-sm font-medium text-zinc-300">Sem dados de origem</p>
            <p className="mt-1 text-xs text-zinc-500">Cadastre leads para comparar seus canais.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rows.map(({ source, count }) => {
              const percentage = total ? Math.round((count / total) * 100) : 0;
              const style = sourceStyles[source] ?? sourceStyles.outro;
              const fallbackLabel = source.replaceAll('_', ' ');
              return (
                <div key={source}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${style.dot}`} aria-hidden="true" />
                      <span className="truncate text-sm font-medium capitalize text-zinc-300">
                        {SOURCE_LABELS[source] ?? fallbackLabel}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 text-xs tabular-nums">
                      <span className="text-zinc-500">{count}</span>
                      <span className="w-9 text-right font-semibold text-zinc-200">{percentage}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800/80">
                    <div
                      className={`h-full rounded-full transition-[width] duration-500 ${style.bar}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-5 flex justify-end border-t border-zinc-800/70 pt-4">
          <Link
            href="/leads"
            className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Ver leads
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
