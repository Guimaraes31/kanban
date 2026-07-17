'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { toast } from 'sonner';
import { KanbanColumn } from './kanban-column';
import { KanbanCardPreview } from './kanban-card';
import { LeadDetailModal } from '@/components/leads/lead-detail-modal';
import { useStore } from '@/hooks/use-store';
import type { Lead, LeadStatus } from '@/types';

/** Prefere o ponteiro; se não achar, usa cantos/retângulos — ajuda a soltar em colunas vizinhas. */
const kanbanCollisionDetection: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args);
  if (pointerHits.length > 0) {
    return pointerHits;
  }

  const rectHits = rectIntersection(args);
  if (rectHits.length > 0) {
    return rectHits;
  }

  return closestCorners(args);
};

export function KanbanBoard() {
  const { leads, pipeline, moveLeadStatus } = useStore();
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const panRef = useRef<{
    active: boolean;
    startX: number;
    scrollLeft: number;
    pointerId: number | null;
  }>({ active: false, startX: 0, scrollLeft: 0, pointerId: null });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Distância baixa: arrastar o card fica fácil, sem abrir o modal sem querer
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const stages = [...pipeline.stages].sort((a, b) => a.position - b.position);
  const isDraggingCard = Boolean(activeLead);

  const handleDragStart = (event: DragStartEvent) => {
    // Cancela pan se o usuário começou a arrastar um card
    panRef.current.active = false;
    const lead = leads.find((l) => l.id === event.active.id);
    if (lead) setActiveLead(lead);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveLead(null);
    const { active, over } = event;
    if (!over) return;

    const leadId = active.id as string;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    let newStatus: LeadStatus | null = null;

    if (stages.some((s) => s.slug === over.id)) {
      newStatus = over.id as LeadStatus;
    } else {
      const overLead = leads.find((l) => l.id === over.id);
      if (overLead) newStatus = overLead.status;
    }

    if (newStatus && newStatus !== lead.status) {
      try {
        await moveLeadStatus(leadId, newStatus);
        toast.success(`Lead movido para ${stages.find((s) => s.slug === newStatus)?.name}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Erro ao mover lead');
      }
    }
  };

  const handleDragCancel = () => {
    setActiveLead(null);
  };

  // Arrastar o fundo do funil para rolar horizontalmente (como um trackpad de pan)
  const onScrollerPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || isDraggingCard) return;

    const target = event.target as HTMLElement;
    if (target.closest('[data-kanban-card], button, a, input, textarea, select')) {
      return;
    }

    const el = scrollerRef.current;
    if (!el) return;

    panRef.current = {
      active: true,
      startX: event.clientX,
      scrollLeft: el.scrollLeft,
      pointerId: event.pointerId,
    };
    el.setPointerCapture(event.pointerId);
    el.classList.add('cursor-grabbing');
    el.classList.remove('cursor-grab');
  }, [isDraggingCard]);

  const onScrollerPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const pan = panRef.current;
    if (!pan.active) return;

    const el = scrollerRef.current;
    if (!el) return;

    const deltaX = event.clientX - pan.startX;
    el.scrollLeft = pan.scrollLeft - deltaX;
  }, []);

  const endPan = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const pan = panRef.current;
    if (!pan.active) return;

    pan.active = false;
    const el = scrollerRef.current;
    if (el) {
      if (pan.pointerId != null) {
        try {
          el.releasePointerCapture(pan.pointerId);
        } catch {
          // ignore if already released
        }
      }
      el.classList.remove('cursor-grabbing');
      el.classList.add('cursor-grab');
    }
    pan.pointerId = null;
  }, []);

  // Roda do mouse no funil rola na horizontal; se a coluna ainda puder rolar vertical, deixa a coluna
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;

      const target = event.target as HTMLElement | null;
      const columnScroll = target?.closest('[data-kanban-column-scroll]') as HTMLElement | null;
      if (columnScroll && Math.abs(event.deltaY) > 0) {
        const canScrollUp = columnScroll.scrollTop > 0;
        const canScrollDown =
          columnScroll.scrollTop + columnScroll.clientHeight < columnScroll.scrollHeight - 1;
        if ((event.deltaY < 0 && canScrollUp) || (event.deltaY > 0 && canScrollDown)) {
          return;
        }
      }

      const mostlyVertical = Math.abs(event.deltaY) >= Math.abs(event.deltaX);
      if (mostlyVertical && event.deltaY !== 0) {
        el.scrollLeft += event.deltaY;
        event.preventDefault();
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={kanbanCollisionDetection}
        autoScroll={{
          threshold: { x: 0.12, y: 0.18 },
          acceleration: 18,
          interval: 5,
        }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div
          ref={scrollerRef}
          onPointerDown={onScrollerPointerDown}
          onPointerMove={onScrollerPointerMove}
          onPointerUp={endPan}
          onPointerCancel={endPan}
          className={`flex gap-4 overflow-x-auto overflow-y-hidden pb-4 min-h-[calc(100vh-12rem)] select-none scroll-smooth-none ${
            isDraggingCard ? 'cursor-default' : 'cursor-grab'
          }`}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {stages.map((stage) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              leads={leads.filter((l) => l.status === stage.slug)}
              onCardClick={setSelectedLead}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
          {activeLead && (
            <div className="rotate-1 scale-105 opacity-95 shadow-2xl">
              <KanbanCardPreview lead={activeLead} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <LeadDetailModal
        lead={selectedLead}
        open={!!selectedLead}
        onClose={() => setSelectedLead(null)}
      />
    </>
  );
}
