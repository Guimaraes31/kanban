'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Lead, LeadSource, LeadStatus } from '@/types';
import * as store from '@/lib/store';

export function useStore() {
  const [, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener('leadflow-update', handler);
    return () => window.removeEventListener('leadflow-update', handler);
  }, [refresh]);

  return {
    leads: store.getLeads(),
    templates: store.getTemplates(),
    pipeline: store.getPipeline(),
    activities: store.getActivities(),
    tags: store.getAllTags(),
    stats: store.getDashboardStats(),
    scheduledMessages: store.getScheduledMessages(),
    refresh,
    createLead: store.createLead,
    updateLead: store.updateLead,
    deleteLead: store.deleteLead,
    moveLeadStatus: store.moveLeadStatus,
    getLeadById: store.getLeadById,
    getActivities: store.getActivities,
    addActivity: store.addActivity,
    updateTemplate: store.updateTemplate,
    createTemplate: store.createTemplate,
    updatePipelineStages: store.updatePipelineStages,
    scheduleFollowUp: store.scheduleFollowUp,
    markMessageSent: store.markMessageSent,
    getLeads: (filters?: {
      source?: LeadSource;
      status?: LeadStatus;
      tag?: string;
      search?: string;
    }) => store.getLeads(filters),
  };
}