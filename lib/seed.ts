import type { Lead, LeadActivity, MessageTemplate, Pipeline, Profile } from '@/types';
import { DEFAULT_STAGES } from '@/types';

const DEMO_USER_ID = 'demo-user-001';

export const DEMO_PROFILE: Profile = {
  id: DEMO_USER_ID,
  email: 'admin@powergym.com.br',
  full_name: 'Carlos Mendes',
  business_name: 'PowerGym Academia',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEMO_PIPELINE: Pipeline = {
  id: 'pipeline-001',
  user_id: DEMO_USER_ID,
  name: 'Funil Principal',
  is_default: true,
  stages: DEFAULT_STAGES.map((s, i) => ({
    ...s,
    id: `stage-${i}`,
    pipeline_id: 'pipeline-001',
    created_at: new Date().toISOString(),
  })),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEMO_TEMPLATES: MessageTemplate[] = [
  {
    id: 'tpl-001',
    user_id: DEMO_USER_ID,
    name: 'Boas-vindas',
    content:
      'Olá {{nome}}! 👋 Sou da PowerGym Academia. Vi que você demonstrou interesse em treinar conosco. Posso te ajudar com informações sobre planos e horários?',
    category: 'welcome',
    is_default: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tpl-002',
    user_id: DEMO_USER_ID,
    name: 'Follow-up 1 hora',
    content:
      'Oi {{nome}}, tudo bem? Passando para saber se conseguiu ver nossas opções de planos. Temos uma promoção especial essa semana! 💪',
    category: 'followup',
    is_default: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tpl-003',
    user_id: DEMO_USER_ID,
    name: 'Follow-up 1 dia',
    content:
      '{{nome}}, ainda estou à disposição para tirar suas dúvidas sobre a PowerGym. Que tal agendar uma visita gratuita? 🏋️',
    category: 'followup',
    is_default: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tpl-004',
    user_id: DEMO_USER_ID,
    name: 'Proposta comercial',
    content:
      'Olá {{nome}}! Preparei uma proposta especial para você:\n\n✅ Plano Anual: R$ 89,90/mês\n✅ Acesso ilimitado\n✅ Avaliação física grátis\n✅ 1 mês de personal incluso\n\nPosso reservar sua vaga?',
    category: 'proposal',
    is_default: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tpl-005',
    user_id: DEMO_USER_ID,
    name: 'Fechamento',
    content:
      '{{nome}}, parabéns por dar esse passo! 🎉 Sua matrícula na PowerGym está confirmada. Te espero amanhã às 7h para sua avaliação física!',
    category: 'closing',
    is_default: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function daysAgo(days: number, hours = 10): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hours, 0, 0, 0);
  return d.toISOString();
}

export const DEMO_LEADS: Lead[] = [
  { id: 'lead-001', user_id: DEMO_USER_ID, name: 'Rafael Oliveira', whatsapp: '11987654321', email: 'rafael@email.com', source: 'instagram', status: 'novo', estimated_value: 1078.8, tags: ['promo-verao'], notes: 'Viu story da promoção de verão', last_interaction_at: daysAgo(0, 9), created_at: daysAgo(0, 8), updated_at: daysAgo(0, 9) },
  { id: 'lead-002', user_id: DEMO_USER_ID, name: 'Juliana Costa', whatsapp: '11976543210', email: 'ju.costa@email.com', source: 'indicacao', status: 'novo', estimated_value: 1078.8, tags: ['indicacao-amiga'], notes: 'Indicada pela aluna Fernanda', last_interaction_at: daysAgo(0, 7), created_at: daysAgo(0, 6), updated_at: daysAgo(0, 7) },
  { id: 'lead-003', user_id: DEMO_USER_ID, name: 'Marcos Pereira', whatsapp: '11965432109', source: 'site', status: 'em_contato', estimated_value: 899, tags: ['site-form'], notes: 'Preencheu formulário no site', last_interaction_at: daysAgo(1), created_at: daysAgo(2), updated_at: daysAgo(1) },
  { id: 'lead-004', user_id: DEMO_USER_ID, name: 'Ana Beatriz Silva', whatsapp: '11954321098', email: 'ana.silva@email.com', source: 'whatsapp', status: 'em_contato', estimated_value: 1078.8, tags: ['musculacao'], notes: 'Quer treinar musculação 3x por semana', last_interaction_at: daysAgo(1, 14), created_at: daysAgo(3), updated_at: daysAgo(1, 14) },
  { id: 'lead-005', user_id: DEMO_USER_ID, name: 'Pedro Henrique', whatsapp: '11943210987', source: 'instagram', status: 'em_contato', estimated_value: 599, tags: ['crossfit'], notes: 'Interessado no plano crossfit', last_interaction_at: daysAgo(2), created_at: daysAgo(4), updated_at: daysAgo(2) },
  { id: 'lead-006', user_id: DEMO_USER_ID, name: 'Camila Rodrigues', whatsapp: '11932109876', email: 'camila@email.com', source: 'indicacao', status: 'interessado', estimated_value: 1078.8, tags: ['vip'], notes: 'Quer plano anual com desconto', last_interaction_at: daysAgo(2, 16), created_at: daysAgo(5), updated_at: daysAgo(2, 16) },
  { id: 'lead-007', user_id: DEMO_USER_ID, name: 'Lucas Martins', whatsapp: '11921098765', source: 'site', status: 'interessado', estimated_value: 899, tags: ['estudante'], notes: 'Pediu desconto estudante', last_interaction_at: daysAgo(3), created_at: daysAgo(6), updated_at: daysAgo(3) },
  { id: 'lead-008', user_id: DEMO_USER_ID, name: 'Fernanda Lima', whatsapp: '11910987654', email: 'fe.lima@email.com', source: 'whatsapp', status: 'interessado', estimated_value: 1299, tags: ['personal'], notes: 'Quer personal trainer incluso', last_interaction_at: daysAgo(3, 11), created_at: daysAgo(7), updated_at: daysAgo(3, 11) },
  { id: 'lead-009', user_id: DEMO_USER_ID, name: 'Bruno Alves', whatsapp: '11909876543', source: 'instagram', status: 'proposta', estimated_value: 1078.8, tags: ['promo-verao'], notes: 'Proposta enviada - plano anual', last_interaction_at: daysAgo(4), created_at: daysAgo(8), updated_at: daysAgo(4) },
  { id: 'lead-010', user_id: DEMO_USER_ID, name: 'Patricia Souza', whatsapp: '11998765432', email: 'paty@email.com', source: 'indicacao', status: 'proposta', estimated_value: 899, tags: [], notes: 'Aguardando resposta da proposta', last_interaction_at: daysAgo(4, 15), created_at: daysAgo(9), updated_at: daysAgo(4, 15) },
  { id: 'lead-011', user_id: DEMO_USER_ID, name: 'Diego Santos', whatsapp: '11987651234', source: 'site', status: 'fechado', estimated_value: 1078.8, tags: ['fechado-anual'], notes: 'Matriculado plano anual', last_interaction_at: daysAgo(5), created_at: daysAgo(10), updated_at: daysAgo(5) },
  { id: 'lead-012', user_id: DEMO_USER_ID, name: 'Larissa Mendes', whatsapp: '11976542345', email: 'lari@email.com', source: 'whatsapp', status: 'fechado', estimated_value: 899, tags: ['fechado-mensal'], notes: 'Plano mensal - início segunda', last_interaction_at: daysAgo(6), created_at: daysAgo(11), updated_at: daysAgo(6) },
  { id: 'lead-013', user_id: DEMO_USER_ID, name: 'Thiago Ribeiro', whatsapp: '11965433456', source: 'instagram', status: 'fechado', estimated_value: 1299, tags: ['fechado-vip'], notes: 'Plano VIP com personal', last_interaction_at: daysAgo(6, 13), created_at: daysAgo(12), updated_at: daysAgo(6, 13) },
  { id: 'lead-014', user_id: DEMO_USER_ID, name: 'Gabriela Nunes', whatsapp: '11954324567', source: 'outro', status: 'perdido', estimated_value: 599, tags: ['preco'], notes: 'Achou caro, foi para concorrente', last_interaction_at: daysAgo(7), created_at: daysAgo(13), updated_at: daysAgo(7) },
  { id: 'lead-015', user_id: DEMO_USER_ID, name: 'André Vieira', whatsapp: '11943215678', email: 'andre@email.com', source: 'site', status: 'perdido', estimated_value: 899, tags: ['distancia'], notes: 'Mora longe da academia', last_interaction_at: daysAgo(8), created_at: daysAgo(14), updated_at: daysAgo(8) },
  { id: 'lead-016', user_id: DEMO_USER_ID, name: 'Isabela Ferreira', whatsapp: '11932106789', source: 'instagram', status: 'novo', estimated_value: 1078.8, tags: ['stories'], notes: 'Respondeu enquete nos stories', last_interaction_at: daysAgo(1), created_at: daysAgo(1, 8), updated_at: daysAgo(1) },
  { id: 'lead-017', user_id: DEMO_USER_ID, name: 'Rodrigo Campos', whatsapp: '11921097890', source: 'whatsapp', status: 'em_contato', estimated_value: 599, tags: [], notes: 'Perguntou horários de funcionamento', last_interaction_at: daysAgo(2, 9), created_at: daysAgo(3, 7), updated_at: daysAgo(2, 9) },
  { id: 'lead-018', user_id: DEMO_USER_ID, name: 'Vanessa Almeida', whatsapp: '11910988901', email: 'vanessa@email.com', source: 'indicacao', status: 'interessado', estimated_value: 1078.8, tags: ['casal'], notes: 'Quer plano para casal', last_interaction_at: daysAgo(4, 10), created_at: daysAgo(6, 5), updated_at: daysAgo(4, 10) },
  { id: 'lead-019', user_id: DEMO_USER_ID, name: 'Felipe Gomes', whatsapp: '11909879012', source: 'site', status: 'proposta', estimated_value: 899, tags: ['corporativo'], notes: 'Empresa quer plano corporativo', last_interaction_at: daysAgo(5, 14), created_at: daysAgo(9, 3), updated_at: daysAgo(5, 14) },
  { id: 'lead-020', user_id: DEMO_USER_ID, name: 'Mariana Dias', whatsapp: '11998760123', email: 'mari@email.com', source: 'instagram', status: 'novo', estimated_value: 1078.8, tags: ['influencer'], notes: 'Micro-influencer fitness - possível parceria', last_interaction_at: daysAgo(0, 11), created_at: daysAgo(0, 10), updated_at: daysAgo(0, 11) },
];

export const DEMO_ACTIVITIES: LeadActivity[] = [
  { id: 'act-001', lead_id: 'lead-001', user_id: DEMO_USER_ID, type: 'created', title: 'Lead criado', description: 'Lead cadastrado via Instagram', created_at: daysAgo(0, 8) },
  { id: 'act-002', lead_id: 'lead-003', user_id: DEMO_USER_ID, type: 'whatsapp_sent', title: 'Mensagem enviada', description: 'Boas-vindas enviada via WhatsApp', created_at: daysAgo(1) },
  { id: 'act-003', lead_id: 'lead-006', user_id: DEMO_USER_ID, type: 'status_change', title: 'Status alterado', description: 'Movido para Interessado', metadata: { from: 'em_contato', to: 'interessado' }, created_at: daysAgo(2, 16) },
  { id: 'act-004', lead_id: 'lead-009', user_id: DEMO_USER_ID, type: 'whatsapp_sent', title: 'Proposta enviada', description: 'Template de proposta comercial utilizado', created_at: daysAgo(4) },
  { id: 'act-005', lead_id: 'lead-011', user_id: DEMO_USER_ID, type: 'status_change', title: 'Lead fechado! 🎉', description: 'Matrícula confirmada - Plano Anual', metadata: { from: 'proposta', to: 'fechado' }, created_at: daysAgo(5) },
  { id: 'act-006', lead_id: 'lead-014', user_id: DEMO_USER_ID, type: 'status_change', title: 'Lead perdido', description: 'Optou por academia concorrente', metadata: { from: 'proposta', to: 'perdido' }, created_at: daysAgo(7) },
  { id: 'act-007', lead_id: 'lead-020', user_id: DEMO_USER_ID, type: 'note', title: 'Nota adicionada', description: 'Possível parceria com influencer', created_at: daysAgo(0, 11) },
  { id: 'act-008', lead_id: 'lead-004', user_id: DEMO_USER_ID, type: 'whatsapp_scheduled', title: 'Follow-up agendado', description: 'Follow-up de 1 dia agendado', metadata: { delay: '1d' }, created_at: daysAgo(1, 14) },
];

export function applyTemplate(template: string, leadName: string, businessName = 'PowerGym Academia'): string {
  return template
    .replace(/\{\{nome\}\}/g, leadName.split(' ')[0])
    .replace(/\{\{empresa\}\}/g, businessName);
}