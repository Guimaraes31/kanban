'use client';

import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import type {
  DashboardStats,
  Lead,
  LeadActivity,
  LeadSource,
  LeadStatus,
  MessageTemplate,
  Pipeline,
  PipelineStage,
  ScheduledMessage,
} from '@/types';

type NewLead = Omit<Lead, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'last_interaction_at'>;
type NewTemplate = Omit<MessageTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

interface StoreContextValue {
  loading: boolean;
  leads: Lead[];
  templates: MessageTemplate[];
  pipeline: Pipeline;
  activities: LeadActivity[];
  scheduledMessages: ScheduledMessage[];
  tags: string[];
  stats: DashboardStats;
  refresh: () => Promise<void>;
  createLead: (data: NewLead) => Promise<Lead>;
  updateLead: (id: string, data: Partial<Lead>) => Promise<Lead>;
  deleteLead: (id: string) => Promise<void>;
  moveLeadStatus: (id: string, status: LeadStatus) => Promise<Lead>;
  getLeadById: (id: string) => Lead | undefined;
  getActivities: (leadId?: string) => LeadActivity[];
  addActivity: (leadId: string, type: LeadActivity['type'], title: string, description?: string, metadata?: Record<string, unknown>) => Promise<void>;
  updateTemplate: (id: string, data: Partial<MessageTemplate>) => Promise<MessageTemplate>;
  createTemplate: (data: NewTemplate) => Promise<MessageTemplate>;
  updatePipelineStages: (stages: PipelineStage[]) => Promise<void>;
  scheduleFollowUp: (leadId: string, templateId: string, content: string, delay: ScheduledMessage['delay']) => Promise<ScheduledMessage>;
  markMessageSent: (id: string) => Promise<void>;
  getLeads: (filters?: { source?: LeadSource; status?: LeadStatus; tag?: string; search?: string }) => Lead[];
}

const EMPTY_PIPELINE: Pipeline = {
  id: '', user_id: '', name: 'Funil Principal', is_default: true, stages: [], created_at: '', updated_at: '',
};

const StoreContext = createContext<StoreContextValue | null>(null);

function fail(message: string, error?: { message?: string } | null): never {
  throw new Error(error?.message || message);
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { userId, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [pipeline, setPipeline] = useState<Pipeline>(EMPTY_PIPELINE);
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([]);

  const refresh = useCallback(async () => {
    const supabase = createClient();
    if (!supabase || !userId) {
      setLeads([]); setActivities([]); setTemplates([]); setPipeline(EMPTY_PIPELINE); setScheduledMessages([]); setLoading(false);
      return;
    }
    setLoading(true);
    const [leadResult, activityResult, templateResult, pipelineResult, messageResult] = await Promise.all([
      supabase.from('leads').select('*').order('updated_at', { ascending: false }),
      supabase.from('lead_activities').select('*').order('created_at', { ascending: false }),
      supabase.from('message_templates').select('*').order('created_at'),
      supabase.from('pipelines').select('*, pipeline_stages(*)').eq('is_default', true).maybeSingle(),
      supabase.from('scheduled_messages').select('*').order('created_at', { ascending: false }),
    ]);
    const error = leadResult.error || activityResult.error || templateResult.error || pipelineResult.error || messageResult.error;
    if (error) fail('Não foi possível carregar seus dados.', error);
    setLeads((leadResult.data ?? []) as Lead[]);
    setActivities((activityResult.data ?? []) as LeadActivity[]);
    setTemplates((templateResult.data ?? []) as MessageTemplate[]);
    const rawPipeline = pipelineResult.data as (Omit<Pipeline, 'stages'> & { pipeline_stages: PipelineStage[] }) | null;
    setPipeline(rawPipeline ? { ...rawPipeline, stages: [...rawPipeline.pipeline_stages].sort((a, b) => a.position - b.position) } : EMPTY_PIPELINE);
    setScheduledMessages((messageResult.data ?? []) as ScheduledMessage[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (!isAuthenticated) {
      queueMicrotask(() => void refresh());
      return;
    }
    queueMicrotask(() => void refresh());
  }, [isAuthenticated, refresh]);

  const addActivity = useCallback(async (leadId: string, type: LeadActivity['type'], title: string, description?: string, metadata?: Record<string, unknown>) => {
    const supabase = createClient();
    if (!supabase || !userId) fail('Sessão inválida.');
    const { error } = await supabase.from('lead_activities').insert({ lead_id: leadId, user_id: userId, type, title, description, metadata: metadata ?? {} });
    if (error) fail('Não foi possível registrar a atividade.', error);
    await refresh();
  }, [refresh, userId]);

  const createLead = useCallback(async (data: NewLead) => {
    const supabase = createClient();
    if (!supabase || !userId) fail('Sessão inválida.');
    const { data: created, error } = await supabase.from('leads').insert({ ...data, user_id: userId }).select().single();
    if (error || !created) fail('Não foi possível criar o lead.', error);
    await supabase.from('lead_activities').insert({ lead_id: created.id, user_id: userId, type: 'created', title: 'Lead criado', description: `Lead ${created.name} cadastrado manualmente` });
    await refresh();
    return created as Lead;
  }, [refresh, userId]);

  const updateLead = useCallback(async (id: string, data: Partial<Lead>) => {
    const supabase = createClient();
    if (!supabase) fail('Supabase não está configurado.');
    const { data: updated, error } = await supabase.from('leads').update(data).eq('id', id).select().single();
    if (error || !updated) fail('Não foi possível atualizar o lead.', error);
    await refresh();
    return updated as Lead;
  }, [refresh]);

  const deleteLead = useCallback(async (id: string) => {
    const supabase = createClient();
    if (!supabase) fail('Supabase não está configurado.');
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) fail('Não foi possível excluir o lead.', error);
    await refresh();
  }, [refresh]);

  const updateTemplate = useCallback(async (id: string, data: Partial<MessageTemplate>) => {
    const supabase = createClient();
    if (!supabase) fail('Supabase não está configurado.');
    const { data: updated, error } = await supabase.from('message_templates').update(data).eq('id', id).select().single();
    if (error || !updated) fail('Não foi possível salvar o template.', error);
    await refresh();
    return updated as MessageTemplate;
  }, [refresh]);

  const createTemplate = useCallback(async (data: NewTemplate) => {
    const supabase = createClient();
    if (!supabase || !userId) fail('Sessão inválida.');
    const { data: created, error } = await supabase.from('message_templates').insert({ ...data, user_id: userId }).select().single();
    if (error || !created) fail('Não foi possível criar o template.', error);
    await refresh();
    return created as MessageTemplate;
  }, [refresh, userId]);

  const updatePipelineStages = useCallback(async (stages: PipelineStage[]) => {
    const supabase = createClient();
    if (!supabase || !pipeline.id) fail('Pipeline não encontrado.');
    const { error: deleteError } = await supabase.from('pipeline_stages').delete().eq('pipeline_id', pipeline.id);
    if (deleteError) fail('Não foi possível atualizar o pipeline.', deleteError);
    const rows = stages.map(({ name, slug, color, position }) => ({ pipeline_id: pipeline.id, name, slug, color, position }));
    const { error } = await supabase.from('pipeline_stages').insert(rows);
    if (error) fail('Não foi possível atualizar o pipeline.', error);
    await refresh();
  }, [pipeline.id, refresh]);

  const scheduleFollowUp = useCallback(async (leadId: string, templateId: string, content: string, delay: ScheduledMessage['delay']) => {
    const supabase = createClient();
    if (!supabase || !userId) fail('Sessão inválida.');
    const delays = { '1h': 3600000, '1d': 86400000, '3d': 259200000 };
    const { data: created, error } = await supabase.from('scheduled_messages').insert({ lead_id: leadId, user_id: userId, template_id: templateId, content, delay, scheduled_for: new Date(Date.now() + delays[delay]).toISOString() }).select().single();
    if (error || !created) fail('Não foi possível agendar o follow-up.', error);
    await refresh();
    return created as ScheduledMessage;
  }, [refresh, userId]);

  const markMessageSent = useCallback(async (id: string) => {
    const supabase = createClient();
    if (!supabase) fail('Supabase não está configurado.');
    const { error } = await supabase.from('scheduled_messages').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', id);
    if (error) fail('Não foi possível atualizar a mensagem.', error);
    await refresh();
  }, [refresh]);

  const getLeads = useCallback((filters?: { source?: LeadSource; status?: LeadStatus; tag?: string; search?: string }) => {
    let result = [...leads];
    if (filters?.source) result = result.filter((lead) => lead.source === filters.source);
    if (filters?.status) result = result.filter((lead) => lead.status === filters.status);
    if (filters?.tag) result = result.filter((lead) => lead.tags.includes(filters.tag!));
    if (filters?.search) {
      const query = filters.search.toLowerCase();
      result = result.filter((lead) => lead.name.toLowerCase().includes(query) || lead.whatsapp.includes(query) || lead.email?.toLowerCase().includes(query));
    }
    return result;
  }, [leads]);

  const tags = useMemo(() => Array.from(new Set(leads.flatMap((lead) => lead.tags))).sort(), [leads]);
  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const closed = leads.filter((lead) => lead.status === 'fechado').length;
    const last7 = Array.from({ length: 7 }, (_, index) => { const date = new Date(); date.setDate(date.getDate() - (6 - index)); return date.toISOString().slice(0, 10); });
    return {
      totalLeads: leads.length,
      newToday: leads.filter((lead) => lead.created_at.startsWith(today)).length,
      conversionRate: leads.length ? Math.round((closed / leads.length) * 100) : 0,
      pipelineValue: leads.filter((lead) => !['fechado', 'perdido'].includes(lead.status)).reduce((sum, lead) => sum + Number(lead.estimated_value), 0),
      leadsByDay: last7.map((date) => ({ date, count: leads.filter((lead) => lead.created_at.startsWith(date)).length })),
      recentActivities: activities.slice(0, 8),
    };
  }, [activities, leads]);

  const value = useMemo<StoreContextValue>(() => ({ loading: loading || (isAuthenticated && !pipeline.id), leads, templates, pipeline, activities, scheduledMessages, tags, stats, refresh, createLead, updateLead, deleteLead, moveLeadStatus: (id, status) => updateLead(id, { status }), getLeadById: (id) => leads.find((lead) => lead.id === id), getActivities: (leadId) => leadId ? activities.filter((activity) => activity.lead_id === leadId) : activities, addActivity, updateTemplate, createTemplate, updatePipelineStages, scheduleFollowUp, markMessageSent, getLeads }), [loading, isAuthenticated, leads, templates, pipeline, activities, scheduledMessages, tags, stats, refresh, createLead, updateLead, deleteLead, addActivity, updateTemplate, createTemplate, updatePipelineStages, scheduleFollowUp, markMessageSent, getLeads]);

  return createElement(StoreContext.Provider, { value }, children);
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore deve ser usado dentro de StoreProvider.');
  return context;
}
