import type { LeadSource, LeadStatus } from '@/types';

export const VALUE_COLOR_CLASS = 'text-emerald-400 font-medium';
export const DELETE_BUTTON_CLASS = 'text-red-500 hover:text-red-400 hover:bg-red-500/10';

export const STATUS_COLORS: Record<LeadStatus, string> = {
  novo: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  em_contato: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  interessado: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  proposta: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  fechado: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  perdido: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export const SOURCE_COLORS: Record<LeadSource, string> = {
  instagram: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  site: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  indicacao: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  whatsapp: 'bg-green-500/20 text-green-400 border-green-500/30',
  outro: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
};

const TAG_COLORS = [
  'bg-violet-500/20 text-violet-400 border-violet-500/30',
  'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  'bg-rose-500/20 text-rose-400 border-rose-500/30',
  'bg-lime-500/20 text-lime-400 border-lime-500/30',
  'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30',
];

export function getStatusColorClasses(status: LeadStatus): string {
  return STATUS_COLORS[status];
}

export function getSourceColorClasses(source: LeadSource): string {
  return SOURCE_COLORS[source];
}

export function getTagColorClasses(tag: string): string {
  const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return TAG_COLORS[hash % TAG_COLORS.length];
}