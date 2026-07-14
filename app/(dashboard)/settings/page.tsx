'use client';

import { useState } from 'react';
import { Plus, Trash2, GripVertical, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/hooks/use-store';
import { generateId } from '@/lib/utils';
import type { PipelineStage } from '@/types';

export default function SettingsPage() {
  const { loading, templates, pipeline, updateTemplate, createTemplate, updatePipelineStages } = useStore();

  if (loading) return <p className="text-sm text-zinc-500">Carregando configurações...</p>;

  return <SettingsContent key={`${pipeline.updated_at}-${templates.length}`} templates={templates} pipeline={pipeline} updateTemplate={updateTemplate} createTemplate={createTemplate} updatePipelineStages={updatePipelineStages} />;
}

function SettingsContent({ templates, pipeline, updateTemplate, createTemplate, updatePipelineStages }: Pick<ReturnType<typeof useStore>, 'templates' | 'pipeline' | 'updateTemplate' | 'createTemplate' | 'updatePipelineStages'>) {
  const [editingTemplates, setEditingTemplates] = useState(templates);
  const [stages, setStages] = useState<PipelineStage[]>([...pipeline.stages].sort((a, b) => a.position - b.position));

  const handleSaveTemplate = async (id: string) => {
    const tpl = editingTemplates.find((t) => t.id === id);
    if (!tpl) return;
    try {
      await updateTemplate(id, { name: tpl.name, content: tpl.content });
      toast.success('Template salvo!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar template');
    }
  };

  const handleAddTemplate = async () => {
    const newTpl = await createTemplate({
      name: 'Novo Template',
      content: 'Olá {{nome}}! Mensagem personalizada aqui.',
      category: 'custom',
      is_default: false,
    });
    setEditingTemplates([...editingTemplates, newTpl]);
    toast.success('Template criado!');
  };

  const handleSavePipeline = async () => {
    try {
      await updatePipelineStages(stages);
      toast.success('Pipeline atualizado!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar pipeline');
    }
  };

  const handleAddStage = () => {
    const newStage: PipelineStage = {
      id: generateId(),
      pipeline_id: pipeline.id,
      name: 'Nova Etapa',
      slug: `custom_${Date.now()}` as PipelineStage['slug'],
      color: '#a1a1aa',
      position: stages.length,
      created_at: new Date().toISOString(),
    };
    setStages([...stages, newStage]);
  };

  const handleRemoveStage = (id: string) => {
    if (stages.length <= 2) {
      toast.error('Mínimo de 2 etapas no pipeline');
      return;
    }
    setStages(stages.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Configurações</h1>
        <p className="text-sm text-zinc-500 mt-1">Personalize templates e pipeline</p>
      </div>

      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Templates de Mensagens</CardTitle>
            <CardDescription>Use {'{{nome}}'} e {'{{empresa}}'} como variáveis</CardDescription>
          </div>
          <Button size="sm" onClick={handleAddTemplate}>
            <Plus className="h-4 w-4" />
            Novo Template
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {editingTemplates.map((tpl, idx) => (
            <div key={tpl.id} className="rounded-lg border border-zinc-800 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Input
                  value={tpl.name}
                  onChange={(e) => {
                    const updated = [...editingTemplates];
                    updated[idx] = { ...tpl, name: e.target.value };
                    setEditingTemplates(updated);
                  }}
                  className="flex-1"
                />
                <Badge variant="secondary">{tpl.category}</Badge>
                <Button size="sm" onClick={() => handleSaveTemplate(tpl.id)}>
                  <Save className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                value={tpl.content}
                onChange={(e) => {
                  const updated = [...editingTemplates];
                  updated[idx] = { ...tpl, content: e.target.value };
                  setEditingTemplates(updated);
                }}
                rows={3}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Pipeline Personalizável</CardTitle>
            <CardDescription>Adicione ou remova etapas do funil</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleAddStage}>
              <Plus className="h-4 w-4" />
              Etapa
            </Button>
            <Button size="sm" onClick={handleSavePipeline}>
              <Save className="h-4 w-4" />
              Salvar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {stages.map((stage, idx) => (
            <div key={stage.id} className="flex items-center gap-3 rounded-lg border border-zinc-800 p-3">
              <GripVertical className="h-4 w-4 text-zinc-600" />
              <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
              <Input
                value={stage.name}
                onChange={(e) => {
                  const updated = [...stages];
                  updated[idx] = { ...stage, name: e.target.value };
                  setStages(updated);
                }}
                className="flex-1"
              />
              <Input
                type="color"
                value={stage.color}
                onChange={(e) => {
                  const updated = [...stages];
                  updated[idx] = { ...stage, color: e.target.value };
                  setStages(updated);
                }}
                className="w-12 h-9 p-1 cursor-pointer"
              />
              <Button
                variant="ghost"
                size="icon"
                className="text-zinc-400 hover:text-white"
                onClick={() => handleRemoveStage(stage.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
