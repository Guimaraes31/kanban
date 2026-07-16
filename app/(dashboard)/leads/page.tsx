'use client';

import { useState } from 'react';
import { AlertTriangle, Plus, RefreshCw, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LeadForm } from '@/components/leads/lead-form';
import { LeadDetailModal } from '@/components/leads/lead-detail-modal';
import { useStore } from '@/hooks/use-store';
import { formatCurrency, formatRelative } from '@/lib/utils';
import { DELETE_BUTTON_CLASS, getSourceColorClasses, getStatusColorClasses, getTagColorClasses, VALUE_COLOR_CLASS } from '@/lib/lead-colors';
import {
  LEAD_CATEGORIES,
  LEAD_SOURCES,
  SOURCE_LABELS,
  STATUS_LABELS,
  type Lead,
  type LeadCategory,
  type LeadSource,
  type LeadStatus,
} from '@/types';

const NO_CATEGORY_FILTER = '__no_category__' as const;

function getCategoryLabel(category: LeadCategory) {
  return LEAD_CATEGORIES.find((item) => item.value === category)?.label ?? category;
}

export default function LeadsPage() {
  const { createLead, deleteLead, tags, leads: allLeads, loading, error, refresh, getLeads } = useStore();
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<LeadSource | ''>('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<LeadCategory | typeof NO_CATEGORY_FILTER | ''>('');
  const [tagFilter, setTagFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const leads = getLeads({
    search: search || undefined,
    source: sourceFilter || undefined,
    status: statusFilter || undefined,
    tag: tagFilter || undefined,
  }).filter((lead) => {
    if (!categoryFilter) return true;
    if (categoryFilter === NO_CATEGORY_FILTER) return !lead.category;
    return lead.category === categoryFilter;
  });
  const hasActiveFilters = Boolean(search || sourceFilter || statusFilter || categoryFilter || tagFilter);

  const clearFilters = () => {
    setSearch('');
    setSourceFilter('');
    setStatusFilter('');
    setCategoryFilter('');
    setTagFilter('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Gestão de Leads</h1>
          <p className="text-sm text-zinc-500 mt-1">{loading ? 'Carregando leads...' : `${leads.length} leads encontrados`}</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          Novo Lead
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(16rem,1fr)_repeat(4,minmax(0,10rem))]">
        <div className="relative sm:col-span-2 xl:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            aria-label="Buscar leads"
            className="pl-9"
            placeholder="Buscar por nome, WhatsApp ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select aria-label="Filtrar por origem" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value as LeadSource | '')} className="w-full">
          <option value="">Todas origens</option>
          {LEAD_SOURCES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </Select>
        <Select aria-label="Filtrar por status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as LeadStatus | '')} className="w-full">
          <option value="">Todos status</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
        <Select
          aria-label="Filtrar por categoria"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as LeadCategory | typeof NO_CATEGORY_FILTER | '')}
          className="w-full"
        >
          <option value="">Todas categorias</option>
          <option value={NO_CATEGORY_FILTER}>Sem categoria</option>
          {LEAD_CATEGORIES.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </Select>
        <Select aria-label="Filtrar por tag" value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} className="w-full">
          <option value="">Todas tags</option>
          {tags.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </Select>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 py-14 text-center">
          <AlertTriangle className="mb-3 h-8 w-8 text-red-300" />
          <p className="text-sm font-medium text-zinc-200">Não foi possível carregar os leads</p>
          <p className="mt-1 max-w-md text-xs text-zinc-500">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              void refresh().catch(() => undefined);
            }}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Tentar novamente
          </Button>
        </div>
      ) : loading ? (
        <div className="space-y-2 rounded-xl border border-zinc-800 p-3" aria-busy="true" aria-label="Carregando leads">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="h-14 animate-pulse rounded-lg bg-zinc-900/70" />
          ))}
        </div>
      ) : leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-zinc-800">
          <Filter className="h-8 w-8 text-zinc-600 mb-3" />
          <p className="text-sm text-zinc-400">
            {allLeads.length === 0 ? 'Nenhum lead cadastrado' : 'Nenhum lead corresponde aos filtros'}
          </p>
          <p className="mt-1 text-xs text-zinc-600">
            {allLeads.length === 0 ? 'Cadastre seu primeiro contato para começar.' : 'Ajuste ou limpe os filtros para ver outros resultados.'}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={allLeads.length === 0 ? () => setShowCreate(true) : clearFilters}
          >
            {allLeads.length === 0 ? 'Criar primeiro lead' : hasActiveFilters ? 'Limpar filtros' : 'Atualizar busca'}
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  <th className="text-left p-3 text-zinc-400 font-medium">Nome</th>
                  <th className="text-left p-3 text-zinc-400 font-medium hidden sm:table-cell">WhatsApp</th>
                  <th className="text-left p-3 text-zinc-400 font-medium hidden md:table-cell">Origem</th>
                  <th className="text-left p-3 text-zinc-400 font-medium">Status</th>
                  <th className="text-left p-3 text-zinc-400 font-medium hidden lg:table-cell">Valor</th>
                  <th className="text-left p-3 text-zinc-400 font-medium hidden lg:table-cell">Última interação</th>
                  <th className="text-right p-3 text-zinc-400 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-zinc-800/50 hover:bg-zinc-900/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <td className="p-3">
                      <p className="font-medium text-zinc-200">{lead.name}</p>
                      {(lead.category || lead.tags.length > 0) && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {lead.category && (
                            <Badge
                              variant="outline"
                              className="border-cyan-500/30 bg-cyan-500/10 text-[10px] text-cyan-300"
                            >
                              {getCategoryLabel(lead.category)}
                            </Badge>
                          )}
                          {lead.tags.slice(0, 2).map((t) => (
                            <Badge key={t} variant="outline" className={`text-[10px] ${getTagColorClasses(t)}`}>{t}</Badge>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-zinc-400 hidden sm:table-cell">{lead.whatsapp}</td>
                    <td className="p-3 hidden md:table-cell">
                      <Badge variant="outline" className={getSourceColorClasses(lead.source)}>{SOURCE_LABELS[lead.source]}</Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className={getStatusColorClasses(lead.status)}>{STATUS_LABELS[lead.status]}</Badge>
                    </td>
                    <td className={`p-3 hidden lg:table-cell ${VALUE_COLOR_CLASS}`}>{formatCurrency(lead.estimated_value)}</td>
                    <td className="p-3 text-zinc-500 text-xs hidden lg:table-cell">{formatRelative(lead.last_interaction_at)}</td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedLead(lead);
                          }}
                        >
                          Abrir
                        </Button>
                        <Button
                        variant="ghost"
                        size="sm"
                        className={DELETE_BUTTON_CLASS}
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await deleteLead(lead.id);
                            toast.success('Lead removido');
                          } catch (error) {
                            toast.error(error instanceof Error ? error.message : 'Erro ao remover lead');
                          }
                        }}
                      >
                        Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent onClose={() => setShowCreate(false)}>
          <DialogHeader>
            <DialogTitle>Novo Lead</DialogTitle>
          </DialogHeader>
          <LeadForm
            onSubmit={async (data) => {
              try {
                await createLead(data);
                toast.success('Lead criado com sucesso!');
                setShowCreate(false);
              } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Erro ao criar lead');
              }
            }}
            onCancel={() => setShowCreate(false)}
          />
        </DialogContent>
      </Dialog>

      <LeadDetailModal
        lead={selectedLead}
        open={!!selectedLead}
        onClose={() => setSelectedLead(null)}
      />
    </div>
  );
}
