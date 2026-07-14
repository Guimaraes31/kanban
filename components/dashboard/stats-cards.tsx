'use client';

import { TrendingUp, Users, UserPlus, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface StatsCardsProps {
  totalLeads: number;
  newToday: number;
  conversionRate: number;
  pipelineValue: number;
}

const cards = [
  { key: 'total', label: 'Total de Leads', icon: Users, color: 'text-white', bg: 'bg-white/10' },
  { key: 'new', label: 'Novos Hoje', icon: UserPlus, color: 'text-zinc-200', bg: 'bg-white/10' },
  { key: 'conversion', label: 'Taxa de Conversão', icon: TrendingUp, color: 'text-zinc-300', bg: 'bg-white/10' },
  { key: 'value', label: 'Valor no Funil', icon: DollarSign, color: 'text-zinc-400', bg: 'bg-white/10' },
] as const;

export function StatsCards({ totalLeads, newToday, conversionRate, pipelineValue }: StatsCardsProps) {
  const values: Record<string, string | number> = {
    total: totalLeads,
    new: newToday,
    conversion: `${conversionRate}%`,
    value: formatCurrency(pipelineValue),
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map(({ key, label, icon: Icon, color, bg }) => (
        <Card key={key} className="border-zinc-800 bg-zinc-900/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">{label}</p>
                <p className="text-2xl font-bold text-zinc-100 mt-1">{values[key]}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
