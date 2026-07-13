'use client';

import type {
  Lead,
  LeadActivity,
  LeadSource,
  LeadStatus,
  MessageTemplate,
  Pipeline,
  PipelineStage,
  ScheduledMessage,
} from '@/types';
import {
  DEMO_ACTIVITIES,
  DEMO_LEADS,
  DEMO_PIPELINE,
  DEMO_PROFILE,
  DEMO_TEMPLATES,
} from '@/lib/seed';
import { generateId } from '@/lib/utils';

const STORAGE_KEY = 'leadflow_data';
const AUTH_KEY = 'leadflow_auth';

interface StoreData {
  leads: Lead[];
  activities: LeadActivity[];
  templates: MessageTemplate[];
  pipeline: Pipeline;
  scheduledMessages: ScheduledMessage[];
  initialized: boolean;
}

interface AuthSession {
  userId: string;
  email: string;
  fullName: string;
  businessName: string;
}

function getDefaultData(): StoreData {
  return {
    leads: [...DEMO_LEADS],
    activities: [...DEMO_ACTIVITIES],
    templates: [...DEMO_TEMPLATES],
    pipeline: { ...DEMO_PIPELINE, stages: [...DEMO_PIPELINE.stages] },
    scheduledMessages: [],
    initialized: true,
  };
}

function loadStore(): StoreData {
  if (typeof window === 'undefined') return getDefaultData();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const data = getDefaultData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
  }
  return JSON.parse(raw) as StoreData;
}

function saveStore(data: StoreData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent('leadflow-update'));
}

export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as AuthSession;
}

export function login(email: string, password: string): AuthSession {
  const session: AuthSession = {
    userId: DEMO_PROFILE.id,
    email,
    fullName: DEMO_PROFILE.full_name,
    businessName: DEMO_PROFILE.business_name,
  };
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  return session;
}

export function register(
  email: string,
  _password: string,
  fullName: string,
  businessName: string
): AuthSession {
  const session: AuthSession = {
    userId: generateId(),
    email,
    fullName,
    businessName,
  };
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  loadStore();
  return session;
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function getLeads(filters?: {
  source?: LeadSource;
  status?: LeadStatus;
  tag?: string;
  search?: string;
}): Lead[] {
  const store = loadStore();
  let leads = [...store.leads];

  if (filters?.source) leads = leads.filter((l) => l.source === filters.source);
  if (filters?.status) leads = leads.filter((l) => l.status === filters.status);
  if (filters?.tag) leads = leads.filter((l) => l.tags.includes(filters.tag!));
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    leads = leads.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.whatsapp.includes(q) ||
        l.email?.toLowerCase().includes(q)
    );
  }

  return leads.sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}

export function getLeadById(id: string): Lead | undefined {
  return loadStore().leads.find((l) => l.id === id);
}

export function createLead(
  data: Omit<Lead, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'last_interaction_at'>
): Lead {
  const store = loadStore();
  const now = new Date().toISOString();
  const lead: Lead = {
    ...data,
    id: generateId(),
    user_id: DEMO_PROFILE.id,
    last_interaction_at: now,
    created_at: now,
    updated_at: now,
  };
  store.leads.push(lead);
  store.activities.push({
    id: generateId(),
    lead_id: lead.id,
    user_id: DEMO_PROFILE.id,
    type: 'created',
    title: 'Lead criado',
    description: `Lead ${lead.name} cadastrado manualmente`,
    created_at: now,
  });
  saveStore(store);
  return lead;
}

export function updateLead(id: string, data: Partial<Lead>): Lead | null {
  const store = loadStore();
  const idx = store.leads.findIndex((l) => l.id === id);
  if (idx === -1) return null;

  const now = new Date().toISOString();
  const oldStatus = store.leads[idx].status;
  store.leads[idx] = { ...store.leads[idx], ...data, updated_at: now, last_interaction_at: now };

  if (data.status && data.status !== oldStatus) {
    store.activities.push({
      id: generateId(),
      lead_id: id,
      user_id: DEMO_PROFILE.id,
      type: 'status_change',
      title: 'Status alterado',
      description: `Movido de ${oldStatus} para ${data.status}`,
      metadata: { from: oldStatus, to: data.status },
      created_at: now,
    });
  } else {
    store.activities.push({
      id: generateId(),
      lead_id: id,
      user_id: DEMO_PROFILE.id,
      type: 'updated',
      title: 'Lead atualizado',
      created_at: now,
    });
  }

  saveStore(store);
  return store.leads[idx];
}

export function deleteLead(id: string): void {
  const store = loadStore();
  store.leads = store.leads.filter((l) => l.id !== id);
  store.activities = store.activities.filter((a) => a.lead_id !== id);
  saveStore(store);
}

export function moveLeadStatus(leadId: string, newStatus: LeadStatus): Lead | null {
  return updateLead(leadId, { status: newStatus });
}

export function getActivities(leadId?: string): LeadActivity[] {
  const store = loadStore();
  let activities = [...store.activities];
  if (leadId) activities = activities.filter((a) => a.lead_id === leadId);
  return activities.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function addActivity(
  leadId: string,
  type: LeadActivity['type'],
  title: string,
  description?: string,
  metadata?: Record<string, unknown>
): void {
  const store = loadStore();
  store.activities.push({
    id: generateId(),
    lead_id: leadId,
    user_id: DEMO_PROFILE.id,
    type,
    title,
    description,
    metadata,
    created_at: new Date().toISOString(),
  });
  const leadIdx = store.leads.findIndex((l) => l.id === leadId);
  if (leadIdx !== -1) {
    store.leads[leadIdx].last_interaction_at = new Date().toISOString();
    store.leads[leadIdx].updated_at = new Date().toISOString();
  }
  saveStore(store);
}

export function getTemplates(): MessageTemplate[] {
  return loadStore().templates;
}

export function updateTemplate(id: string, data: Partial<MessageTemplate>): MessageTemplate | null {
  const store = loadStore();
  const idx = store.templates.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  store.templates[idx] = {
    ...store.templates[idx],
    ...data,
    updated_at: new Date().toISOString(),
  };
  saveStore(store);
  return store.templates[idx];
}

export function createTemplate(
  data: Omit<MessageTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): MessageTemplate {
  const store = loadStore();
  const now = new Date().toISOString();
  const template: MessageTemplate = {
    ...data,
    id: generateId(),
    user_id: DEMO_PROFILE.id,
    created_at: now,
    updated_at: now,
  };
  store.templates.push(template);
  saveStore(store);
  return template;
}

export function getPipeline(): Pipeline {
  return loadStore().pipeline;
}

export function updatePipelineStages(stages: PipelineStage[]): Pipeline {
  const store = loadStore();
  store.pipeline.stages = stages;
  store.pipeline.updated_at = new Date().toISOString();
  saveStore(store);
  return store.pipeline;
}

export function scheduleFollowUp(
  leadId: string,
  templateId: string,
  content: string,
  delay: ScheduledMessage['delay']
): ScheduledMessage {
  const store = loadStore();
  const delays: Record<ScheduledMessage['delay'], number> = {
    '1h': 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000,
    '3d': 3 * 24 * 60 * 60 * 1000,
  };
  const scheduled: ScheduledMessage = {
    id: generateId(),
    lead_id: leadId,
    user_id: DEMO_PROFILE.id,
    template_id: templateId,
    content,
    scheduled_for: new Date(Date.now() + delays[delay]).toISOString(),
    delay,
    status: 'pending',
    created_at: new Date().toISOString(),
  };
  store.scheduledMessages.push(scheduled);
  addActivity(leadId, 'whatsapp_scheduled', 'Follow-up agendado', `Agendado para ${delay} depois`, {
    delay,
    scheduled_for: scheduled.scheduled_for,
  });
  return scheduled;
}

export function getScheduledMessages(leadId?: string): ScheduledMessage[] {
  const store = loadStore();
  let msgs = [...store.scheduledMessages];
  if (leadId) msgs = msgs.filter((m) => m.lead_id === leadId);
  return msgs.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function markMessageSent(id: string): void {
  const store = loadStore();
  const idx = store.scheduledMessages.findIndex((m) => m.id === id);
  if (idx !== -1) {
    store.scheduledMessages[idx].status = 'sent';
    store.scheduledMessages[idx].sent_at = new Date().toISOString();
    saveStore(store);
  }
}

export function getAllTags(): string[] {
  const store = loadStore();
  const tags = new Set<string>();
  store.leads.forEach((l) => l.tags.forEach((t) => tags.add(t)));
  return Array.from(tags).sort();
}

export function getDashboardStats() {
  const store = loadStore();
  const today = new Date().toISOString().split('T')[0];
  const totalLeads = store.leads.length;
  const newToday = store.leads.filter((l) => l.created_at.startsWith(today)).length;
  const closed = store.leads.filter((l) => l.status === 'fechado').length;
  const conversionRate = totalLeads > 0 ? Math.round((closed / totalLeads) * 100) : 0;
  const pipelineValue = store.leads
    .filter((l) => !['fechado', 'perdido'].includes(l.status))
    .reduce((sum, l) => sum + l.estimated_value, 0);

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const leadsByDay = last7.map((date) => ({
    date,
    count: store.leads.filter((l) => l.created_at.startsWith(date)).length,
  }));

  const recentActivities = store.activities
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  return { totalLeads, newToday, conversionRate, pipelineValue, leadsByDay, recentActivities };
}