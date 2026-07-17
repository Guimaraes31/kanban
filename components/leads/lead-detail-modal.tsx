'use client';

import { useState } from 'react';
import { MessageCircle, ExternalLink, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LeadForm } from './lead-form';
import { useStore } from '@/hooks/use-store';
import { formatCurrency, formatRelative, formatWhatsAppLink, normalizeLeadLink } from '@/lib/utils';
import { applyTemplate } from '@/lib/seed';
import { getSourceColorClasses, getStatusColorClasses, getTagColorClasses, VALUE_COLOR_CLASS } from '@/lib/lead-colors';
import { SOURCE_LABELS, STATUS_LABELS, type Lead } from '@/types';

interface LeadDetailModalProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
}

export function LeadDetailModal({ lead: leadProp, open, onClose }: LeadDetailModalProps) {
  const { getLeadById, getActivities, updateLead, addActivity, templates } = useStore();
  const [editing, setEditing] = useState(false);
  const [openedWhatsAppLeadId, setOpenedWhatsAppLeadId] = useState<string | null>(null);
  const [confirmingWhatsApp, setConfirmingWhatsApp] = useState(false);

  if (!leadProp) return null;

  const lead = getLeadById(leadProp.id) ?? leadProp;

  const activities = getActivities(lead.id);
  const welcomeTemplate = templates.find((t) => t.category === 'welcome');
  const leadLink = normalizeLeadLink(lead.link);

  const handleWhatsApp = () => {
    const message = welcomeTemplate
      ? applyTemplate(welcomeTemplate.content, lead.name)
      : `Olá ${lead.name.split(' ')[0]}! Como posso ajudar?`;
    window.open(formatWhatsAppLink(lead.whatsapp, message), '_blank', 'noopener,noreferrer');
    void navigator.clipboard?.writeText(message).catch(() => undefined);
    setOpenedWhatsAppLeadId(lead.id);
    toast.success('WhatsApp aberto. Confirme o envio ao voltar.');
  };

  const handleConfirmWhatsApp = async () => {
    const message = welcomeTemplate
      ? applyTemplate(welcomeTemplate.content, lead.name)
      : `Olá ${lead.name.split(' ')[0]}! Como posso ajudar?`;
    setConfirmingWhatsApp(true);
    try {
      await addActivity(lead.id, 'whatsapp_sent', 'Mensagem enviada', message);
      setOpenedWhatsAppLeadId(null);
      toast.success('Envio registrado no histórico!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível registrar o envio');
    } finally {
      setConfirmingWhatsApp(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl" onClose={onClose}>
        {editing ? (
          <>
            <DialogHeader>
              <DialogTitle>Editar Lead</DialogTitle>
            </DialogHeader>
            <LeadForm
              initial={lead}
              onSubmit={async (data) => {
                await updateLead(lead.id, data);
                toast.success('Lead atualizado!');
                setEditing(false);
              }}
              onCancel={() => setEditing(false)}
            />
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between pr-8">
                <div>
                  <DialogTitle className="text-xl">{lead.name}</DialogTitle>
                  <p className="text-sm text-zinc-400 mt-1">{lead.whatsapp}</p>
                </div>
                <Badge variant="outline" className={getStatusColorClasses(lead.status)}>{STATUS_LABELS[lead.status]}</Badge>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="rounded-lg bg-zinc-800/50 p-3">
                <p className="text-xs text-zinc-500">Origem</p>
                <Badge variant="outline" className={getSourceColorClasses(lead.source)}>{SOURCE_LABELS[lead.source]}</Badge>
              </div>
              <div className="rounded-lg bg-zinc-800/50 p-3">
                <p className="text-xs text-zinc-500">Valor</p>
                <p className={`text-sm ${VALUE_COLOR_CLASS}`}>{formatCurrency(lead.estimated_value)}</p>
              </div>
              <div className="rounded-lg bg-zinc-800/50 p-3">
                <p className="text-xs text-zinc-500">Última interação</p>
                <p className="text-sm font-medium text-zinc-200">{formatRelative(lead.last_interaction_at)}</p>
              </div>
              <div className="rounded-lg bg-zinc-800/50 p-3">
                <p className="text-xs text-zinc-500">Link</p>
                {leadLink ? (
                  <a
                    href={leadLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex max-w-full items-center gap-1.5 text-sm font-medium text-cyan-300 hover:text-cyan-200"
                  >
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Abrir link</span>
                  </a>
                ) : (
                  <p className="mt-1 text-sm font-medium text-zinc-500">Sem link</p>
                )}
              </div>
            </div>

            {leadLink && (
              <div className="rounded-lg bg-zinc-800/30 p-3 mb-4">
                <p className="text-xs text-zinc-500 mb-1">URL</p>
                <a
                  href={leadLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-sm text-cyan-300 hover:text-cyan-200"
                >
                  {leadLink}
                </a>
              </div>
            )}

            {lead.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {lead.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className={getTagColorClasses(tag)}>{tag}</Badge>
                ))}
              </div>
            )}

            {lead.notes && (
              <div className="rounded-lg bg-zinc-800/30 p-3 mb-4">
                <p className="text-xs text-zinc-500 mb-1">Observações</p>
                <p className="text-sm text-zinc-300">{lead.notes}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-5">
              <Button size="sm" onClick={handleWhatsApp}>
                <MessageCircle className="h-4 w-4" />
                {openedWhatsAppLeadId === lead.id ? 'Reabrir WhatsApp' : 'Enviar WhatsApp'}
              </Button>
              {openedWhatsAppLeadId === lead.id && (
                <Button size="sm" variant="secondary" disabled={confirmingWhatsApp} onClick={handleConfirmWhatsApp}>
                  <CheckCircle className="h-4 w-4" />
                  {confirmingWhatsApp ? 'Registrando...' : 'Confirmar envio'}
                </Button>
              )}
              <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>Editar</Button>
            </div>

            <div>
              <h4 className="text-sm font-medium text-zinc-300 mb-3">Histórico de Interações</h4>
              {activities.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-4">Sem interações registradas</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {activities.map((act) => (
                    <div key={act.id} className="flex items-start gap-2 text-sm border-l-2 border-zinc-700 pl-3 py-1">
                      <div className="flex-1">
                        <p className="text-zinc-200">{act.title}</p>
                        {act.description && <p className="text-xs text-zinc-500">{act.description}</p>}
                      </div>
                      <span className="text-xs text-zinc-600 shrink-0">{formatRelative(act.created_at)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
