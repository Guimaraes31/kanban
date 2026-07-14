'use client';

import { MessageCircle, ArrowRightLeft, Plus, Edit, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  created: 'text-white bg-white/10',
  updated: 'text-zinc-200 bg-white/10',
  status_change: 'text-zinc-300 bg-white/10',
  whatsapp_sent: 'text-zinc-100 bg-white/10',
  whatsapp_scheduled: 'text-zinc-400 bg-white/10',
  note: 'text-zinc-400 bg-zinc-800',
};

export function RecentActivities({ activities }: { activities: LeadActivity[] }) {
  if (activities.length === 0) {
    return (
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader><CardTitle className="text-zinc-100">Atividades Recentes</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500 text-center py-8">Nenhuma atividade ainda</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader>
        <CardTitle className="text-zinc-100">Atividades Recentes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.map((activity) => {
          const Icon = iconMap[activity.type] || Edit;
          const colors = colorMap[activity.type] || colorMap.note;
          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colors}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-200">{activity.title}</p>
                {activity.description && (
                  <p className="text-xs text-zinc-500 truncate">{activity.description}</p>
                )}
                <p className="text-xs text-zinc-600 mt-0.5">{formatRelative(activity.created_at)}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
