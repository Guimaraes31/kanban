'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './kanban-card';
import type { Lead, PipelineStage } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { getStatusDotColor, VALUE_COLOR_CLASS } from '@/lib/lead-colors';

interface KanbanColumnProps {
  stage: PipelineStage;
  leads: Lead[];
  onCardClick: (lead: Lead) => void;
}

export function KanbanColumn({ stage, leads, onCardClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.slug,
    data: { type: 'column', stage },
  });
  const totalValue = leads.reduce((sum, l) => sum + l.estimated_value, 0);
  const dotColor = getStatusDotColor(stage.slug, stage.color);

  return (
    <div
      ref={setNodeRef}
      data-kanban-column
      className={`flex w-72 shrink-0 flex-col rounded-xl border transition-colors ${
        isOver
          ? 'border-white/60 bg-white/[0.07] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]'
          : 'border-zinc-800 bg-zinc-900/30'
      }`}
    >
      <div className="flex items-center justify-between p-3 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full shrink-0"
            style={{ backgroundColor: dotColor, boxShadow: `0 0 8px ${dotColor}66` }}
          />
          <span className="text-sm font-medium text-zinc-200">{stage.name}</span>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-800 px-1.5 text-xs text-zinc-400">
            {leads.length}
          </span>
        </div>
      </div>

      {totalValue > 0 && (
        <p className={`px-3 py-1.5 text-xs shrink-0 ${VALUE_COLOR_CLASS}`}>{formatCurrency(totalValue)}</p>
      )}

      <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
        <div data-kanban-column-scroll className="flex max-h-[calc(100vh-16rem)] min-h-[22rem] flex-1 flex-col gap-2 overflow-y-auto p-2">
          {leads.length === 0 ? (
            <div
              className={`flex flex-1 min-h-[12rem] items-center justify-center rounded-lg border border-dashed transition-colors ${
                isOver ? 'border-white/40 bg-white/5' : 'border-zinc-800'
              }`}
            >
              <p className={`text-xs ${isOver ? 'text-zinc-300' : 'text-zinc-600'}`}>
                {isOver ? 'Solte aqui' : 'Arraste leads aqui'}
              </p>
            </div>
          ) : (
            <>
              {leads.map((lead) => (
                <KanbanCard key={lead.id} lead={lead} onClick={() => onCardClick(lead)} />
              ))}
              {/* Área extra para facilitar o drop no fim da coluna */}
              <div
                className={`min-h-16 flex-1 rounded-lg border border-dashed transition-colors ${
                  isOver ? 'border-white/30 bg-white/[0.03]' : 'border-transparent'
                }`}
                aria-hidden
              />
            </>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
