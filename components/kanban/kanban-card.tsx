'use client';

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

export function KanbanCard({ lead, onClick, isDragging }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortDragging } = useSortable({
    id: lead.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group rounded-lg border border-zinc-800 bg-zinc-900 p-3 cursor-pointer hover:border-zinc-700 hover:bg-zinc-800/80 transition-all ${
        isDragging ? 'shadow-xl border-white/50' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-100 truncate">{lead.name}</p>
          <div className="flex items-center gap-1 mt-1 text-xs text-zinc-500">
            <Phone className="h-3 w-3" />
            <span>{lead.whatsapp}</span>
          </div>
        </div>
        <button
          className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-zinc-400 transition-opacity cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center justify-between mt-2.5">
        <Badge variant="outline" className={`text-[10px] ${getSourceColorClasses(lead.source)}`}>{SOURCE_LABELS[lead.source]}</Badge>
        <span className={`text-xs ${VALUE_COLOR_CLASS}`}>{formatCurrency(lead.estimated_value)}</span>
      </div>

      <p className="text-[10px] text-zinc-600 mt-2">{formatRelative(lead.last_interaction_at)}</p>
    </div>
  );
}
