'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './kanban-card';
import type { Lead, PipelineStage } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface KanbanColumnProps {
  stage: PipelineStage;
  leads: Lead[];
  onCardClick: (lead: Lead) => void;
}

export function KanbanColumn({ stage, leads, onCardClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.slug });
  const totalValue = leads.reduce((sum, l) => sum + l.estimated_value, 0);

  return (
    <div
      ref={setNodeRef}
      className={`flex w-72 shrink-0 flex-col rounded-xl border bg-zinc-900/30 transition-colors ${
        isOver ? 'border-violet-500/50 bg-violet-600/5' : 'border-zinc-800'
      }`}
    >
      <div className="flex items-center justify-between p-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
          <span className="text-sm font-medium text-zinc-200">{stage.name}</span>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-800 px-1.5 text-xs text-zinc-400">
            {leads.length}
          </span>
        </div>
      </div>

      {totalValue > 0 && (
        <p className="px-3 py-1.5 text-xs text-zinc-500">{formatCurrency(totalValue)}</p>
      )}

      <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-2 p-2 overflow-y-auto max-h-[calc(100vh-16rem)]">
          {leads.length === 0 ? (
            <div className="flex items-center justify-center h-24 rounded-lg border border-dashed border-zinc-800">
              <p className="text-xs text-zinc-600">Arraste leads aqui</p>
            </div>
          ) : (
            leads.map((lead) => (
              <KanbanCard key={lead.id} lead={lead} onClick={() => onCardClick(lead)} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}