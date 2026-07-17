'use client';

import { useEffect, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatRelative } from '@/lib/utils';
import { getSourceColorClasses, VALUE_COLOR_CLASS } from '@/lib/lead-colors';
import { SOURCE_LABELS, type Lead } from '@/types';

interface KanbanCardProps {
  lead: Lead;
  onClick: () => void;
  isDragging?: boolean;
}

function CardBody({ lead }: { lead: Lead }) {
  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-100 truncate">{lead.name}</p>
          <div className="flex items-center gap-1 mt-1 text-xs text-zinc-500">
            <Phone className="h-3 w-3" />
            <span>{lead.whatsapp}</span>
          </div>
        </div>
        <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors" aria-hidden>
          <GripVertical className="h-4 w-4" />
        </span>
      </div>

      <div className="flex items-center justify-between mt-2.5">
        <Badge variant="outline" className={`text-[10px] ${getSourceColorClasses(lead.source)}`}>{SOURCE_LABELS[lead.source]}</Badge>
        <span className={`text-xs ${VALUE_COLOR_CLASS}`}>{formatCurrency(lead.estimated_value)}</span>
      </div>

      <p className="text-[10px] text-zinc-600 mt-2">{formatRelative(lead.last_interaction_at)}</p>
    </>
  );
}

/** Versão visual do card (overlay de drag — sem sortable). */
export function KanbanCardPreview({ lead }: { lead: Lead }) {
  return (
    <div
      data-kanban-card
      className="group rounded-lg border border-white/50 bg-zinc-900 p-3 shadow-xl ring-1 ring-white/20 cursor-grabbing"
    >
      <CardBody lead={lead} />
    </div>
  );
}

export function KanbanCard({ lead, onClick, isDragging }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortDragging } = useSortable({
    id: lead.id,
    disabled: Boolean(isDragging),
  });
  const suppressClickRef = useRef(false);

  useEffect(() => {
    if (isSortDragging) {
      suppressClickRef.current = true;
    }
  }, [isSortDragging]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortDragging ? 0.35 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-kanban-card
      className={`group touch-none rounded-lg border border-zinc-800 bg-zinc-900 p-3 cursor-grab active:cursor-grabbing hover:border-zinc-700 hover:bg-zinc-800/80 transition-colors ${
        isDragging || isSortDragging ? 'shadow-xl border-white/50 ring-1 ring-white/20' : ''
      }`}
      onClick={() => {
        if (suppressClickRef.current) {
          suppressClickRef.current = false;
          return;
        }
        onClick();
      }}
      {...attributes}
      {...listeners}
    >
      <CardBody lead={lead} />
    </div>
  );
}
