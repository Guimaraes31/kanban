-- NG COMPANY - Seed Data (Academia PowerGym)
-- Execute APÓS criar um usuário e substituir USER_ID pelo UUID real

-- Substitua este UUID pelo ID do usuário autenticado:
-- SELECT id FROM auth.users LIMIT 1;
DO $$
DECLARE
  v_user_id UUID := '00000000-0000-0000-0000-000000000001'; -- SUBSTITUIR
  v_pipeline_id UUID;
BEGIN
  -- Pipeline padrão
  INSERT INTO pipelines (id, user_id, name, is_default)
  VALUES (uuid_generate_v4(), v_user_id, 'Funil Principal', TRUE)
  RETURNING id INTO v_pipeline_id;

  -- Etapas do pipeline
  INSERT INTO pipeline_stages (pipeline_id, name, slug, color, position) VALUES
    (v_pipeline_id, 'Novo', 'novo', '#3b82f6', 0),
    (v_pipeline_id, 'Em Contato', 'em_contato', '#f59e0b', 1),
    (v_pipeline_id, 'Recap', 'recap', '#06b6d4', 2),
    (v_pipeline_id, 'Interessado', 'interessado', '#a855f7', 3),
    (v_pipeline_id, 'Proposta', 'proposta', '#f97316', 4),
    (v_pipeline_id, 'Fechado', 'fechado', '#22c55e', 5),
    (v_pipeline_id, 'Perdido', 'perdido', '#ef4444', 6);

  -- Templates
  INSERT INTO message_templates (user_id, name, content, category, is_default) VALUES
    (v_user_id, 'Boas-vindas', 'Olá {{nome}}! 👋 Sou da PowerGym Academia. Vi que você demonstrou interesse em treinar conosco. Posso te ajudar?', 'welcome', TRUE),
    (v_user_id, 'Follow-up 1 hora', 'Oi {{nome}}, tudo bem? Passando para saber se conseguiu ver nossas opções de planos. Promoção especial essa semana! 💪', 'followup', TRUE),
    (v_user_id, 'Follow-up 1 dia', '{{nome}}, ainda estou à disposição para tirar suas dúvidas sobre a PowerGym. Que tal agendar uma visita gratuita? 🏋️', 'followup', TRUE),
    (v_user_id, 'Proposta comercial', 'Olá {{nome}}! Proposta especial:\n✅ Plano Anual: R$ 89,90/mês\n✅ Acesso ilimitado\n✅ Avaliação física grátis', 'proposal', TRUE),
    (v_user_id, 'Fechamento', '{{nome}}, parabéns! 🎉 Sua matrícula na PowerGym está confirmada. Te espero amanhã às 7h!', 'closing', TRUE);

  -- 20 Leads da academia
  INSERT INTO leads (user_id, name, whatsapp, email, source, status, estimated_value, notes, tags) VALUES
    (v_user_id, 'Rafael Oliveira', '11987654321', 'rafael@email.com', 'instagram', 'novo', 1078.80, 'Viu story da promoção de verão', ARRAY['promo-verao']),
    (v_user_id, 'Juliana Costa', '11976543210', 'ju.costa@email.com', 'indicacao', 'novo', 1078.80, 'Indicada pela aluna Fernanda', ARRAY['indicacao-amiga']),
    (v_user_id, 'Marcos Pereira', '11965432109', NULL, 'site', 'em_contato', 899.00, 'Preencheu formulário no site', ARRAY['site-form']),
    (v_user_id, 'Ana Beatriz Silva', '11954321098', 'ana.silva@email.com', 'whatsapp', 'em_contato', 1078.80, 'Quer treinar musculação 3x/semana', ARRAY['musculacao']),
    (v_user_id, 'Pedro Henrique', '11943210987', NULL, 'instagram', 'em_contato', 599.00, 'Interessado no plano crossfit', ARRAY['crossfit']),
    (v_user_id, 'Camila Rodrigues', '11932109876', 'camila@email.com', 'indicacao', 'interessado', 1078.80, 'Quer plano anual com desconto', ARRAY['vip']),
    (v_user_id, 'Lucas Martins', '11921098765', NULL, 'site', 'interessado', 899.00, 'Pediu desconto estudante', ARRAY['estudante']),
    (v_user_id, 'Fernanda Lima', '11910987654', 'fe.lima@email.com', 'whatsapp', 'interessado', 1299.00, 'Quer personal trainer incluso', ARRAY['personal']),
    (v_user_id, 'Bruno Alves', '11909876543', NULL, 'instagram', 'proposta', 1078.80, 'Proposta enviada - plano anual', ARRAY['promo-verao']),
    (v_user_id, 'Patricia Souza', '11998765432', 'paty@email.com', 'indicacao', 'proposta', 899.00, 'Aguardando resposta da proposta', ARRAY[]::TEXT[]),
    (v_user_id, 'Diego Santos', '11987651234', NULL, 'site', 'fechado', 1078.80, 'Matriculado plano anual', ARRAY['fechado-anual']),
    (v_user_id, 'Larissa Mendes', '11976542345', 'lari@email.com', 'whatsapp', 'fechado', 899.00, 'Plano mensal - início segunda', ARRAY['fechado-mensal']),
    (v_user_id, 'Thiago Ribeiro', '11965433456', NULL, 'instagram', 'fechado', 1299.00, 'Plano VIP com personal', ARRAY['fechado-vip']),
    (v_user_id, 'Gabriela Nunes', '11954324567', NULL, 'outro', 'perdido', 599.00, 'Achou caro, foi para concorrente', ARRAY['preco']),
    (v_user_id, 'André Vieira', '11943215678', 'andre@email.com', 'site', 'perdido', 899.00, 'Mora longe da academia', ARRAY['distancia']),
    (v_user_id, 'Isabela Ferreira', '11932106789', NULL, 'instagram', 'novo', 1078.80, 'Respondeu enquete nos stories', ARRAY['stories']),
    (v_user_id, 'Rodrigo Campos', '11921097890', NULL, 'whatsapp', 'em_contato', 599.00, 'Perguntou horários de funcionamento', ARRAY[]::TEXT[]),
    (v_user_id, 'Vanessa Almeida', '11910988901', 'vanessa@email.com', 'indicacao', 'interessado', 1078.80, 'Quer plano para casal', ARRAY['casal']),
    (v_user_id, 'Felipe Gomes', '11909879012', NULL, 'site', 'proposta', 899.00, 'Empresa quer plano corporativo', ARRAY['corporativo']),
    (v_user_id, 'Mariana Dias', '11998760123', 'mari@email.com', 'instagram', 'novo', 1078.80, 'Micro-influencer fitness', ARRAY['influencer']);

  -- Exemplo das novas dimensões de classificação.
  UPDATE leads
  SET source = 'google_maps', status = 'recap', category = 'links'
  WHERE user_id = v_user_id AND name = 'Marcos Pereira';

END $$;
