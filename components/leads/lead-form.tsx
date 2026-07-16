'use client';

import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  LEAD_CATEGORIES,
  LEAD_SOURCES,
  STATUS_LABELS,
  type Lead,
  type LeadCategory,
  type LeadSource,
  type LeadStatus,
} from '@/types';

interface LeadFormProps {
  initial?: Partial<Lead>;
  onSubmit: (data: {
    name: string;
    whatsapp: string;
    email?: string;
    source: LeadSource;
    category: LeadCategory | null;
    status: LeadStatus;
    estimated_value: number;
    notes?: string;
    tags: string[];
  }) => void;
  onCancel: () => void;
}

export function LeadForm({ initial, onSubmit, onCancel }: LeadFormProps) {
  const formId = useId();
  const [name, setName] = useState(initial?.name || '');
  const [whatsapp, setWhatsapp] = useState(initial?.whatsapp || '');
  const [email, setEmail] = useState(initial?.email || '');
  const [source, setSource] = useState<LeadSource>(initial?.source || 'instagram');
  const [category, setCategory] = useState<LeadCategory | ''>(initial?.category || '');
  const [status, setStatus] = useState<LeadStatus>(initial?.status || 'novo');
  const [value, setValue] = useState(String(initial?.estimated_value ?? 899));
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
      category: category || null,
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
          <Label htmlFor={`${formId}-name`}>Nome *</Label>
          <Input id={`${formId}-name`} value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${formId}-whatsapp`}>WhatsApp *</Label>
          <Input id={`${formId}-whatsapp`} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="11999999999" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${formId}-email`}>Email</Label>
          <Input id={`${formId}-email`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${formId}-source`}>Origem</Label>
          <Select id={`${formId}-source`} value={source} onChange={(e) => setSource(e.target.value as LeadSource)}>
            {LEAD_SOURCES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${formId}-category`}>Categoria</Label>
          <Select id={`${formId}-category`} value={category} onChange={(e) => setCategory(e.target.value as LeadCategory | '')}>
            <option value="">Sem categoria</option>
            {LEAD_CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${formId}-status`}>Status</Label>
          <Select id={`${formId}-status`} value={status} onChange={(e) => setStatus(e.target.value as LeadStatus)}>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${formId}-value`}>Valor Estimado (R$)</Label>
          <Input id={`${formId}-value`} type="number" value={value} onChange={(e) => setValue(e.target.value)} min="0" step="0.01" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${formId}-tags`}>Tags (separadas por vírgula)</Label>
        <Input id={`${formId}-tags`} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="promo-verao, vip" />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${formId}-notes`}>Observações</Label>
        <Textarea id={`${formId}-notes`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas sobre o lead..." rows={3} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">{initial?.id ? 'Salvar' : 'Criar Lead'}</Button>
      </div>
    </form>
  );
}
