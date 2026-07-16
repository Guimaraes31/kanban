import Link from 'next/link';
import { ArrowRight, CalendarClock, Clock3 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Lead, ScheduledMessage } from '@/types';

interface UpcomingFollowUpsProps {
  messages: ScheduledMessage[];
  leads: Lead[];
}

export function UpcomingFollowUps({ messages, leads }: UpcomingFollowUpsProps) {
  const pending = messages
    .filter((message) => message.status === 'pending')
    .sort((a, b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime());
  const upcoming = pending.slice(0, 3);
  const leadNames = new Map(leads.map((lead) => [lead.id, lead.name]));

  return (
    <Card className="h-full overflow-hidden border-zinc-800/90 bg-zinc-900/70 shadow-lg shadow-black/10">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 border-b border-zinc-800/70 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-zinc-100">
            <CalendarClock className="h-4 w-4 text-amber-300" aria-hidden="true" />
            Próximos follow-ups
          </CardTitle>
          <CardDescription className="mt-1">Contatos pendentes na agenda</CardDescription>
        </div>
        <span className="flex h-7 min-w-7 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/10 px-2 text-xs font-semibold text-amber-300 tabular-nums">
          {pending.length}
        </span>
      </CardHeader>

      <CardContent className="flex min-h-[300px] flex-col pt-5">
        {upcoming.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-800/70 text-zinc-500">
              <Clock3 className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-zinc-300">Agenda em dia</p>
            <p className="mt-1 max-w-xs text-xs leading-5 text-zinc-500">Nenhum follow-up está pendente no momento.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((message) => {
              const scheduledDate = new Date(message.scheduled_for);
              return (
                <div
                  key={message.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/35 p-3 transition-colors hover:border-zinc-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-200">
                        {leadNames.get(message.lead_id) || 'Lead não encontrado'}
                      </p>
                      <time className="mt-1 block text-xs text-zinc-500" dateTime={message.scheduled_for}>
                        {format(scheduledDate, "dd MMM 'às' HH:mm", { locale: ptBR })}
                      </time>
                    </div>
                    <span
                      className="inline-flex shrink-0 items-center gap-1 rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400"
                    >
                      {message.delay}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-auto border-t border-zinc-800/70 pt-4">
          <Link
            href="/whatsapp"
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/40 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Ver agenda de mensagens
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
