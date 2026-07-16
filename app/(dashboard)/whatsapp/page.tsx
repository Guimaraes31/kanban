'use client';

import { useEffect, useMemo, useState } from 'react';
import { Copy, ExternalLink, Clock, CheckCircle, MessageCircle, Send, CalendarClock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { useStore } from '@/hooks/use-store';
import { applyTemplate } from '@/lib/seed';
import { formatDate, formatRelative, formatWhatsAppLink } from '@/lib/utils';

export default function WhatsAppPage() {
  const { templates, leads, scheduledMessages, addActivity, markMessageSent } = useStore();
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [openedMessageId, setOpenedMessageId] = useState<string | null>(null);
  const [openedPreviewKey, setOpenedPreviewKey] = useState<string | null>(null);
  const [confirmingDirect, setConfirmingDirect] = useState(false);
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const selectedLead = leads.find((l) => l.id === selectedLeadId);
  const activeTemplateId = selectedTemplateId || templates[0]?.id || '';
  const selectedTemplate = templates.find((template) => template.id === activeTemplateId);
  const previewMessage = useMemo(
    () => selectedLead && selectedTemplate ? applyTemplate(selectedTemplate.content, selectedLead.name) : '',
    [selectedLead, selectedTemplate]
  );
  const previewKey = selectedLead && selectedTemplate ? `${selectedLead.id}:${selectedTemplate.id}` : null;

  const handleSend = () => {
    if (!selectedLead || !previewMessage) {
      toast.error('Selecione um lead e um template');
      return;
    }
    window.open(formatWhatsAppLink(selectedLead.whatsapp, previewMessage), '_blank', 'noopener,noreferrer');
    void navigator.clipboard?.writeText(previewMessage).catch(() => undefined);
    setOpenedPreviewKey(previewKey);
    toast.success('WhatsApp aberto. Confirme o envio ao voltar.');
  };

  const handleConfirmDirectSend = async () => {
    if (!selectedLead || !previewMessage || openedPreviewKey !== previewKey) return;
    setConfirmingDirect(true);
    try {
      await addActivity(selectedLead.id, 'whatsapp_sent', 'Mensagem enviada', previewMessage);
      setOpenedPreviewKey(null);
      toast.success('Envio registrado no histórico!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível registrar o envio');
    } finally {
      setConfirmingDirect(false);
    }
  };

  const handleCopy = () => {
    if (!previewMessage) return;
    void navigator.clipboard?.writeText(previewMessage)
      .then(() => toast.success('Mensagem copiada para a área de transferência!'))
      .catch(() => toast.error('Não foi possível copiar a mensagem'));
  };

  const handleScheduledOpen = (messageId: string) => {
    const message = scheduledMessages.find((item) => item.id === messageId);
    const lead = message ? leads.find((item) => item.id === message.lead_id) : undefined;
    if (!message || !lead) {
      toast.error('Lead ou follow-up não encontrado');
      return;
    }

    window.open(formatWhatsAppLink(lead.whatsapp, message.content), '_blank', 'noopener,noreferrer');
    void navigator.clipboard?.writeText(message.content).catch(() => undefined);
    setOpenedMessageId(message.id);
    toast.success('WhatsApp aberto. Confirme o envio ao voltar.');
  };

  const handleScheduledConfirm = async (messageId: string) => {
    setSendingId(messageId);
    try {
      await markMessageSent(messageId);
      setOpenedMessageId(null);
      toast.success('Follow-up confirmado e registrado como enviado!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível concluir o follow-up');
    } finally {
      setSendingId(null);
    }
  };

  const sentMessages = scheduledMessages
    .filter((message) => message.status === 'sent')
    .sort((a, b) => new Date(b.sent_at || b.created_at).getTime() - new Date(a.sent_at || a.created_at).getTime());
  const pendingMessages = scheduledMessages
    .filter((message) => message.status === 'pending')
    .sort((a, b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Central de WhatsApp</h1>
        <p className="text-sm text-zinc-500 mt-1">Mensagens prontas e follow-ups organizados em um só lugar</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-white" />
              Enviar Mensagem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Selecionar Lead</label>
              <Select value={selectedLeadId} onChange={(e) => setSelectedLeadId(e.target.value)}>
                <option value="">Escolha um lead...</option>
                {leads.filter((l) => !['fechado', 'perdido'].includes(l.status)).map((l) => (
                  <option key={l.id} value={l.id}>{l.name} — {l.whatsapp}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Template</label>
              <Select value={activeTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)}>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </Select>
            </div>

            {previewMessage && (
              <div className="rounded-lg bg-zinc-800/50 p-4 border border-zinc-700">
                <p className="text-xs text-zinc-500 mb-2">Pré-visualização</p>
                <p className="text-sm text-zinc-200 whitespace-pre-wrap">{previewMessage}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleSend} disabled={!selectedLead || !previewMessage} className="flex-1">
                <ExternalLink className="h-4 w-4" />
                Enviar no WhatsApp
              </Button>
              <Button variant="outline" onClick={handleCopy} disabled={!previewMessage}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            {openedPreviewKey === previewKey && previewKey && (
              <Button
                variant="secondary"
                className="w-full"
                disabled={confirmingDirect}
                onClick={handleConfirmDirectSend}
              >
                <CheckCircle className="h-4 w-4" />
                {confirmingDirect ? 'Registrando...' : 'Confirmar que enviei'}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-zinc-300" />
              Templates Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className={`rounded-lg border p-3 cursor-pointer transition-colors ${
                  activeTemplateId === tpl.id ? 'border-white bg-white/5' : 'border-zinc-800 hover:border-zinc-700'
                }`}
                onClick={() => setSelectedTemplateId(tpl.id)}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-zinc-200">{tpl.name}</p>
                  <Badge variant="secondary">{tpl.category}</Badge>
                </div>
                <p className="text-xs text-zinc-500 line-clamp-2">{tpl.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-zinc-300">
              <Clock className="h-5 w-5" />
              Follow-ups Pendentes ({pendingMessages.length})
            </CardTitle>
            <p className="text-xs text-zinc-500">
              O prazo organiza sua fila; você confirma cada envio pelo WhatsApp.
            </p>
          </CardHeader>
          <CardContent>
            {pendingMessages.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <CalendarClock className="mb-2 h-7 w-7 text-zinc-700" />
                <p className="text-sm text-zinc-500">Nenhum follow-up agendado</p>
                <p className="mt-1 text-xs text-zinc-600">Agende pelo detalhe de um lead.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingMessages.map((msg) => {
                  const lead = leads.find((l) => l.id === msg.lead_id);
                  const isDue = new Date(msg.scheduled_for).getTime() <= now;
                  return (
                    <div key={msg.id} className={`rounded-xl border p-3.5 ${isDue ? 'border-amber-500/30 bg-amber-500/5' : 'border-zinc-800 bg-zinc-950/30'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-zinc-200">{lead?.name || 'Lead removido'}</p>
                          <p className="mt-0.5 text-xs text-zinc-500">
                            {formatDate(msg.scheduled_for)} · {formatRelative(msg.scheduled_for)}
                          </p>
                        </div>
                        <Badge variant="outline" className={isDue ? 'border-amber-500/30 bg-amber-500/10 text-amber-300' : ''}>
                          {isDue ? 'Vencido' : msg.delay}
                        </Badge>
                      </div>
                      <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-zinc-500">{msg.content}</p>
                      <div className="mt-3 flex justify-end">
                        {openedMessageId === msg.id ? (
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button size="sm" variant="outline" disabled={!lead} onClick={() => handleScheduledOpen(msg.id)}>
                              <ExternalLink className="h-3.5 w-3.5" />
                              Reabrir
                            </Button>
                            <Button size="sm" disabled={sendingId === msg.id} onClick={() => handleScheduledConfirm(msg.id)}>
                              <CheckCircle className="h-3.5 w-3.5" />
                              {sendingId === msg.id ? 'Registrando...' : 'Confirmar envio'}
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant={isDue ? 'default' : 'outline'}
                            disabled={!lead}
                            onClick={() => handleScheduledOpen(msg.id)}
                          >
                            <Send className="h-3.5 w-3.5" />
                            {isDue ? 'Enviar agora' : 'Antecipar envio'}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <CheckCircle className="h-5 w-5" />
              Mensagens Enviadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sentMessages.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-6">
                Histórico de mensagens aparecerá aqui
              </p>
            ) : (
              <div className="space-y-2">
                {sentMessages.map((msg) => {
                  const lead = leads.find((l) => l.id === msg.lead_id);
                  return (
                    <div key={msg.id} className="rounded-lg border border-zinc-800 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium text-zinc-200">{lead?.name || 'Lead removido'}</p>
                        <span className="shrink-0 text-[11px] text-zinc-600">{formatRelative(msg.sent_at || msg.created_at)}</span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{msg.content}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
