export type LeadSource = 'instagram' | 'site' | 'indicacao' | 'whatsapp' | 'google_maps' | 'outro';

export type LeadCategory = 'links';

export type LeadStatus =
  | 'novo'
  | 'em_contato'
  | 'recap'
  | 'interessado'
  | 'proposta'
  | 'fechado'
  | 'perdido';

export type ActivityType =
  | 'status_change'
  | 'note'
  | 'whatsapp_sent'
  | 'whatsapp_scheduled'
  | 'created'
  | 'updated';

export type FollowUpDelay = '1h' | '1d' | '3d';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  business_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PipelineStage {
  id: string;
  pipeline_id: string;
  name: string;
  slug: LeadStatus;
  color: string;
  position: number;
  created_at: string;
}

export interface Pipeline {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  stages: PipelineStage[];
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  user_id: string;
  name: string;
  whatsapp: string;
  email?: string;
  source: LeadSource;
  category?: LeadCategory | null;
  status: LeadStatus;
  estimated_value: number;
  notes?: string;
  tags: string[];
  last_interaction_at: string;
  created_at: string;
  updated_at: string;
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  user_id: string;
  type: ActivityType;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface MessageTemplate {
  id: string;
  user_id: string;
  name: string;
  content: string;
  category: 'welcome' | 'followup' | 'proposal' | 'closing' | 'custom';
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduledMessage {
  id: string;
  lead_id: string;
  user_id: string;
  template_id: string | null;
  content: string;
  scheduled_for: string;
  delay: FollowUpDelay;
  status: 'pending' | 'sent' | 'cancelled';
  sent_at?: string;
  created_at: string;
}

export interface DashboardStats {
  totalLeads: number;
  newToday: number;
  conversionRate: number;
  pipelineValue: number;
  leadsByDay: { date: string; count: number }[];
  recentActivities: LeadActivity[];
}

export const LEAD_SOURCES: { value: LeadSource; label: string }[] = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'site', label: 'Site' },
  { value: 'indicacao', label: 'Indicação' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'google_maps', label: 'Google Maps' },
  { value: 'outro', label: 'Outro' },
];

export const LEAD_CATEGORIES: { value: LeadCategory; label: string }[] = [
  { value: 'links', label: 'Links' },
];

export const DEFAULT_STAGES: Omit<PipelineStage, 'id' | 'pipeline_id' | 'created_at'>[] = [
  { name: 'Novo', slug: 'novo', color: '#3b82f6', position: 0 },
  { name: 'Em Contato', slug: 'em_contato', color: '#f59e0b', position: 1 },
  { name: 'Recap', slug: 'recap', color: '#06b6d4', position: 2 },
  { name: 'Interessado', slug: 'interessado', color: '#a855f7', position: 3 },
  { name: 'Proposta', slug: 'proposta', color: '#f97316', position: 4 },
  { name: 'Fechado', slug: 'fechado', color: '#22c55e', position: 5 },
  { name: 'Perdido', slug: 'perdido', color: '#ef4444', position: 6 },
];

export const STATUS_LABELS: Record<LeadStatus, string> = {
  novo: 'Novo',
  em_contato: 'Em Contato',
  recap: 'Recap',
  interessado: 'Interessado',
  proposta: 'Proposta',
  fechado: 'Fechado',
  perdido: 'Perdido',
};

export const SOURCE_LABELS: Record<LeadSource, string> = {
  instagram: 'Instagram',
  site: 'Site',
  indicacao: 'Indicação',
  whatsapp: 'WhatsApp',
  google_maps: 'Google Maps',
  outro: 'Outro',
};

export const CATEGORY_LABELS: Record<LeadCategory, string> = {
  links: 'Links',
};
