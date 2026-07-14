'use client';

import { useState } from 'react';
import { Copy, ExternalLink, Clock, CheckCircle, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { useStore } from '@/hooks/use-store';
import { applyTemplate } from '@/lib/seed';
import { formatDate, formatWhatsAppLink } from '@/lib/utils';

export default function WhatsAppPage() {
  const { templates, leads, scheduledMessages, addActivity } = useStore();
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?.id || '');
  const [previewMessage, setPreviewMessage] = useState('');

  const selectedLead = leads.find((l) => l.id === selectedLeadId);

  const updatePreview = (leadId: string, templateId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    const tpl = templates.find((t) => t.id === templateId);
    if (lead && tpl) {
      setPreviewMessage(applyTemplate(tpl.content, lead.name));
    } else {
      setPreviewMessage('');
    }
  };

  const handleLeadChange = (leadId: string) => {
    setSelectedLeadId(leadId);
    updatePreview(leadId, selectedTemplateId);
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    updatePreview(selectedLeadId, templateId);
  };

  const handleSend = async () => {
    if (!selectedLead || !previewMessage) {
      toast.error('Selecione um lead e um template');
      return;
    }
    navigator.clipboard.writeText(previewMessage);
    await addActivity(selectedLead.id, 'whatsapp_sent', 'Mensagem enviada', previewMessage);
    toast.success('Mensagem copiada! Abrindo WhatsApp...');
    window.open(formatWhatsAppLink(selectedLead.whatsapp, previewMessage), '_blank');
  };

  const handleCopy = () => {
    if (!previewMessage) return;
    navigator.clipboard.writeText(previewMessage);
    toast.success('Mensagem copiada para a área de transferência!');
  };

  const sentMessages = scheduledMessages.filter((m) => m.status === 'sent');
  const pendingMessages = scheduledMessages.filter((m) => m.status === 'pending');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">WhatsApp Automático</h1>
        <p className="text-sm text-zinc-500 mt-1">Templates prontos e follow-ups automáticos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-400" />
              Enviar Mensagem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Selecionar Lead</label>
              <Select value={selectedLeadId} onChange={(e) => handleLeadChange(e.target.value)}>
                <option value="">Escolha um lead...</option>
                {leads.filter((l) => !['fechado', 'perdido'].includes(l.status)).map((l) => (
                  <option key={l.id} value={l.id}>{l.name} — {l.whatsapp}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Template</label>
              <Select value={selectedTemplateId} onChange={(e) => handleTemplateChange(e.target.value)}>
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
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-400" />
              Templates Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className={`rounded-lg border p-3 cursor-pointer transition-colors ${
                  selectedTemplateId === tpl.id ? 'border-violet-500/50 bg-violet-600/5' : 'border-zinc-800 hover:border-zinc-700'
                }`}
                onClick={() => handleTemplateChange(tpl.id)}
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
            <CardTitle className="flex items-center gap-2 text-amber-400">
              <Clock className="h-5 w-5" />
              Follow-ups Pendentes ({pendingMessages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingMessages.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-6">Nenhum follow-up agendado</p>
            ) : (
              <div className="space-y-2">
                {pendingMessages.map((msg) => {
                  const lead = leads.find((l) => l.id === msg.lead_id);
                  return (
                    <div key={msg.id} className="flex items-center justify-between rounded-lg border border-zinc-800 p-3">
                      <div>
                        <p className="text-sm font-medium text-zinc-200">{lead?.name}</p>
                        <p className="text-xs text-zinc-500">Agendado: {formatDate(msg.scheduled_for)}</p>
                      </div>
                      <Badge variant="warning">{msg.delay}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-400">
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
                      <p className="text-sm font-medium text-zinc-200">{lead?.name}</p>
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
