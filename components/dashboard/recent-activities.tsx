'use client';

import Link from 'next/link';
import { ArrowRight, ArrowRightLeft, Clock, Edit, MessageCircle, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRelative } from '@/lib/utils';
import type { LeadActivity } from '@/types';

const iconMap = {
  created: Plus,
  updated: Edit,
  status_change: ArrowRightLeft,
  whatsapp_sent: MessageCircle,
  whatsapp_scheduled: Clock,
  note: Edit,
};

const colorMap = {
  created: 'border-blue-400/20 bg-blue-400/10 text-blue-300',
  updated: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-300',
  status_change: 'border-violet-400/20 bg-violet-400/10 text-violet-300',
  whatsapp_sent: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  whatsapp_scheduled: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
  note: 'border-zinc-700 bg-zinc-800 text-zinc-300',
};

export function RecentActivities({ activities }: { activities: LeadActivity[] }) {
  const columnSize = Math.ceil(activities.length / 2);
  const columns = [activities.slice(0, columnSize), activities.slice(columnSize)].filter((column) => column.length > 0);

  return (
    <Card className="overflow-hidden border-zinc-800/90 bg-zinc-900/70 shadow-lg shadow-black/10">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 border-b border-zinc-800/70 pb-4">
        <div>
          <CardTitle className="text-zinc-100">Atividades recentes</CardTitle>
          <CardDescription className="mt-1">Últimas movimentações da sua operação</CardDescription>
        </div>
        <Link
          href="/leads"
          className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          Abrir leads
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="pt-5">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-500">
              <Clock className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-zinc-300">Nenhuma atividade ainda</p>
            <p className="mt-1 text-xs text-zinc-500">As movimentações dos leads aparecerão aqui.</p>
          </div>
        ) : (
          <div className="grid gap-x-8 gap-y-6 md:grid-cols-2 md:gap-y-0">
            {columns.map((column, columnIndex) => (
              <div key={columnIndex}>
                {column.map((activity, index) => {
                  const Icon = iconMap[activity.type] || Edit;
                  const colors = colorMap[activity.type] || colorMap.note;
                  return (
                    <div key={activity.id} className="relative flex gap-3 pb-5 last:pb-0">
                      {index < column.length - 1 && (
                        <span className="absolute bottom-0 left-[15px] top-8 w-px bg-zinc-800" aria-hidden="true" />
                      )}
                      <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${colors}`}>
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                          <p className="text-sm font-medium text-zinc-200">{activity.title}</p>
                          <time className="shrink-0 text-[11px] text-zinc-600" dateTime={activity.created_at}>
                            {formatRelative(activity.created_at)}
                          </time>
                        </div>
                        {activity.description && (
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500">{activity.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
