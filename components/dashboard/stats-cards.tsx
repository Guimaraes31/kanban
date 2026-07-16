'use client';

import { CircleDollarSign, Sparkles, Target, UsersRound } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface StatsCardsProps {
  totalLeads: number;
  newToday: number;
  conversionRate: number;
  pipelineValue: number;
}

export function StatsCards({ totalLeads, newToday, conversionRate, pipelineValue }: StatsCardsProps) {
  const cards = [
    {
      key: 'total',
      label: 'Leads totais',
      value: totalLeads,
      hint: 'contatos na sua base',
      icon: UsersRound,
      iconClass: 'bg-blue-500/15 text-blue-300 ring-blue-400/20',
      glowClass: 'bg-blue-500/10',
      lineClass: 'bg-blue-400',
    },
    {
      key: 'new',
      label: 'Novos hoje',
      value: newToday,
      hint: newToday === 1 ? 'nova oportunidade' : 'novas oportunidades',
      icon: Sparkles,
      iconClass: 'bg-violet-500/15 text-violet-300 ring-violet-400/20',
      glowClass: 'bg-violet-500/10',
      lineClass: 'bg-violet-400',
    },
    {
      key: 'conversion',
      label: 'Conversão',
      value: `${conversionRate}%`,
      hint: 'da base já foi fechada',
      icon: Target,
      iconClass: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/20',
      glowClass: 'bg-emerald-500/10',
      lineClass: 'bg-emerald-400',
    },
    {
      key: 'value',
      label: 'Valor no funil',
      value: formatCurrency(pipelineValue),
      hint: 'em oportunidades abertas',
      icon: CircleDollarSign,
      iconClass: 'bg-amber-500/15 text-amber-300 ring-amber-400/20',
      glowClass: 'bg-amber-500/10',
      lineClass: 'bg-amber-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-4">
      {cards.map(({ key, label, value, hint, icon: Icon, iconClass, glowClass, lineClass }) => (
        <Card
          key={key}
          className="group relative overflow-hidden border-zinc-800/90 bg-zinc-900/70 shadow-lg shadow-black/10 transition duration-200 hover:-translate-y-0.5 hover:border-zinc-700"
        >
          <div className={`absolute inset-x-0 top-0 h-px ${lineClass}`} />
          <div className={`pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full blur-2xl ${glowClass}`} />
          <CardContent className="relative p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">{label}</p>
                <p
                  className="mt-2 truncate text-2xl font-bold tracking-tight text-zinc-50 tabular-nums"
                  title={String(value)}
                >
                  {value}
                </p>
                <p className="mt-1 text-xs text-zinc-500">{hint}</p>
              </div>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${iconClass}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
