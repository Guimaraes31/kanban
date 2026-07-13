'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { LEAD_SOURCES, type Lead, type LeadSource, type LeadStatus } from '@/types';

interface LeadFormProps {
  initial?: Partial<Lead>;
  onSubmit: (data: {
    name: string;
    whatsapp: string;
    email?: string;
    source: LeadSource;
    status: LeadStatus;
    estimated_value: number;
    notes?: string;
    tags: string[];
  }) => void;
  onCancel: () => void;
}

export function LeadForm({ initial, onSubmit, onCancel }: LeadFormProps) {
  const [name, setName] = useState(initial?.name || '');
  const [whatsapp, setWhatsapp] = useState(initial?.whatsapp || '');
  const [email, setEmail] = useState(initial?.email || '');
  const [source, setSource] = useState<LeadSource>(initial?.source || 'instagram');
  const [status, setStatus] = useState<LeadStatus>(initial?.status || 'novo');
  const [value, setValue] = useState(String(initial?.estimated_value || 899));
  const [notes, setNotes] = useState(initial?.notes || '');
  const [tags, setTags] = useState(initial?.tags?.join(', ') || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !whatsapp.trim()) return;
    onSubmit({
      name: name.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim() || undefined,
      source,
      status,
      estimated_value: parseFloat(value) || 0,
      notes: notes.trim() || undefined,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nome *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" required />
        </div>
        <div className="space-y-2">
          <Label>WhatsApp *</Label>
          <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="11999999999" required />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" />
        </div>
        <div className="space-y-2">
          <Label>Origem</Label>
          <Select value={source} onChange={(e) => setSource(e.target.value as LeadSource)}>
            {LEAD_SOURCES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onChange={(e) => setStatus(e.target.value as LeadStatus)}>
            <option value="novo">Novo</option>
            <option value="em_contato">Em Contato</option>
            <option value="interessado">Interessado</option>
            <option value="proposta">Proposta</option>
            <option value="fechado">Fechado</option>
            <option value="perdido">Perdido</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Valor Estimado (R$)</Label>
          <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} min="0" step="0.01" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Tags (separadas por vírgula)</Label>
        <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="promo-verao, vip" />
      </div>
      <div className="space-y-2">
        <Label>Observações</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas sobre o lead..." rows={3} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">{initial?.id ? 'Salvar' : 'Criar Lead'}</Button>
      </div>
    </form>
  );
}