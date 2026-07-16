'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartNoAxesColumnIncreasing } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LeadsChartProps {
  data: { date: string; count: number }[];
}

export function LeadsChart({ data }: LeadsChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    label: format(parseISO(d.date), 'EEE', { locale: ptBR }).replace('.', ''),
  }));
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="h-full overflow-hidden border-zinc-800/90 bg-zinc-900/70 shadow-lg shadow-black/10">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 border-b border-zinc-800/70 pb-4">
        <div>
          <CardTitle className="text-zinc-100">Entrada de leads</CardTitle>
          <CardDescription className="mt-1">Novas oportunidades nos últimos 7 dias</CardDescription>
        </div>
        <div className="rounded-xl border border-violet-400/20 bg-violet-400/10 px-3 py-2 text-right">
          <p className="text-lg font-bold leading-none text-violet-200 tabular-nums">{total}</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-violet-300/70">no período</p>
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        {total === 0 ? (
          <div className="flex h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/30 text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-800/70 text-zinc-500">
              <ChartNoAxesColumnIncreasing className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-zinc-300">Nenhuma entrada nesta semana</p>
            <p className="mt-1 max-w-xs text-xs leading-5 text-zinc-500">
              Os novos leads aparecerão aqui assim que forem cadastrados.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} barSize={36} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="leadBars" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#6d28d9" stopOpacity={0.72} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#27272a" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: '#a1a1aa', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                dy={8}
              />
              <YAxis
                tick={{ fill: '#71717a', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(161, 161, 170, 0.06)', radius: 8 }}
                contentStyle={{
                  background: '#18181b',
                  border: '1px solid #3f3f46',
                  borderRadius: '12px',
                  color: '#fafafa',
                  boxShadow: '0 16px 40px rgba(0,0,0,.35)',
                }}
                labelStyle={{ color: '#a1a1aa', marginBottom: 4 }}
                labelFormatter={(_, payload) => {
                  const item = payload?.[0]?.payload;
                  return item ? format(parseISO(item.date), "dd 'de' MMMM", { locale: ptBR }) : '';
                }}
                formatter={(value) => {
                  const count = Number(value);
                  return [`${count} ${count === 1 ? 'lead' : 'leads'}`, 'Novos'];
                }}
              />
              <Bar dataKey="count" fill="url(#leadBars)" radius={[8, 8, 3, 3]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
