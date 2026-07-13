'use client';

import { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
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
import { LEAD_SOURCES, SOURCE_LABELS, STATUS_LABELS, type Lead, type LeadSource, type LeadStatus } from '@/types';

export default function LeadsPage() {
  const { createLead, deleteLead, tags } = useStore();
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<LeadSource | ''>('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('');
  const [tagFilter, setTagFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const { getLeads } = useStore();
  const leads = getLeads({
    search: search || undefined,
    source: sourceFilter || undefined,
    status: statusFilter || undefined,
    tag: tagFilter || undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Gestão de Leads</h1>
          <p className="text-sm text-zinc-500 mt-1">{leads.length} leads encontrados</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          Novo Lead
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            className="pl-9"
            placeholder="Buscar por nome, WhatsApp ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value as LeadSource | '')} className="w-full sm:w-40">
          <option value="">Todas origens</option>
          {LEAD_SOURCES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </Select>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as LeadStatus | '')} className="w-full sm:w-40">
          <option value="">Todos status</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
        <Select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} className="w-full sm:w-40">
          <option value="">Todas tags</option>
          {tags.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </Select>
      </div>

      {leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-zinc-800">
          <Filter className="h-8 w-8 text-zinc-600 mb-3" />
          <p className="text-sm text-zinc-500">Nenhum lead encontrado</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowCreate(true)}>
            Criar primeiro lead
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
                      {lead.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {lead.tags.slice(0, 2).map((t) => (
                            <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-zinc-400 hidden sm:table-cell">{lead.whatsapp}</td>
                    <td className="p-3 hidden md:table-cell">
                      <Badge variant="outline">{SOURCE_LABELS[lead.source]}</Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant="default">{STATUS_LABELS[lead.status]}</Badge>
                    </td>
                    <td className="p-3 text-emerald-400 hidden lg:table-cell">{formatCurrency(lead.estimated_value)}</td>
                    <td className="p-3 text-zinc-500 text-xs hidden lg:table-cell">{formatRelative(lead.last_interaction_at)}</td>
                    <td className="p-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteLead(lead.id);
                          toast.success('Lead removido');
                        }}
                      >
                        Excluir
                      </Button>
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
            onSubmit={(data) => {
              createLead(data);
              toast.success('Lead criado com sucesso!');
              setShowCreate(false);
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