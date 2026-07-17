'use client';

import { KanbanBoard } from '@/components/kanban/kanban-board';
import { useStore } from '@/hooks/use-store';

export default function KanbanPage() {
  const { leads } = useStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Funil de Leads</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Arraste o card para mudar a etapa · arraste o fundo ou use a roda do mouse para rolar · {leads.length} leads no funil
        </p>
      </div>
      <KanbanBoard />
    </div>
  );
}