-- Novas dimensões do funil e dos leads.
ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'recap' AFTER 'em_contato';
ALTER TYPE lead_source ADD VALUE IF NOT EXISTS 'google_maps';

-- Campo livre para colar link do lead (Maps, Instagram, site, etc.).
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS link TEXT;

CREATE INDEX IF NOT EXISTS idx_leads_user_link
  ON leads(user_id)
  WHERE link IS NOT NULL AND btrim(link) <> '';

-- Adiciona Recap entre Em Contato e Interessado sem duplicar a etapa.
DO $$
DECLARE
  pipeline_record RECORD;
BEGIN
  FOR pipeline_record IN
    SELECT p.id
    FROM pipelines p
    WHERE NOT EXISTS (
      SELECT 1
      FROM pipeline_stages ps
      WHERE ps.pipeline_id = p.id
        AND ps.slug = 'recap'
    )
  LOOP
    UPDATE pipeline_stages
    SET position = position + 1
    WHERE pipeline_id = pipeline_record.id
      AND position >= 2;

    INSERT INTO pipeline_stages (pipeline_id, name, slug, color, position)
    VALUES (pipeline_record.id, 'Recap', 'recap', '#06b6d4', 2);
  END LOOP;
END $$;

-- Garante que contas existentes também tenham os dois prazos disponíveis.
INSERT INTO message_templates (user_id, name, content, category, is_default)
SELECT
  profile.id,
  'Follow-up 1 hora',
  'Oi {{nome}}, tudo bem? Passando para saber se conseguiu ver nossas opções.',
  'followup',
  TRUE
FROM profiles profile
WHERE NOT EXISTS (
  SELECT 1
  FROM message_templates template
  WHERE template.user_id = profile.id
    AND template.category = 'followup'
    AND (
      LOWER(template.name) LIKE '%1 hora%'
      OR LOWER(template.name) LIKE '%1h%'
    )
);

INSERT INTO message_templates (user_id, name, content, category, is_default)
SELECT
  profile.id,
  'Follow-up 1 dia',
  'Olá {{nome}}! Passando para saber se ficou alguma dúvida.',
  'followup',
  TRUE
FROM profiles profile
WHERE NOT EXISTS (
  SELECT 1
  FROM message_templates template
  WHERE template.user_id = profile.id
    AND template.category = 'followup'
    AND (
      LOWER(template.name) LIKE '%1 dia%'
      OR LOWER(template.name) LIKE '%1d%'
    )
);

-- Mantém o provisionamento de novos usuários alinhado ao funil atual.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_pipeline_id UUID;
BEGIN
  INSERT INTO profiles (id, email, full_name, business_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'business_name', '')
  );

  INSERT INTO pipelines (user_id, name, is_default)
  VALUES (NEW.id, 'Funil Principal', TRUE)
  RETURNING id INTO new_pipeline_id;

  INSERT INTO pipeline_stages (pipeline_id, name, slug, color, position) VALUES
    (new_pipeline_id, 'Novo', 'novo', '#3b82f6', 0),
    (new_pipeline_id, 'Em Contato', 'em_contato', '#f59e0b', 1),
    (new_pipeline_id, 'Recap', 'recap', '#06b6d4', 2),
    (new_pipeline_id, 'Interessado', 'interessado', '#a855f7', 3),
    (new_pipeline_id, 'Proposta', 'proposta', '#f97316', 4),
    (new_pipeline_id, 'Fechado', 'fechado', '#22c55e', 5),
    (new_pipeline_id, 'Perdido', 'perdido', '#ef4444', 6);

  INSERT INTO message_templates (user_id, name, content, category, is_default) VALUES
    (NEW.id, 'Boas-vindas', 'Olá {{nome}}! Como posso ajudar?', 'welcome', TRUE),
    (NEW.id, 'Follow-up 1 hora', 'Oi {{nome}}, tudo bem? Passando para saber se conseguiu ver nossas opções.', 'followup', TRUE),
    (NEW.id, 'Follow-up 1 dia', 'Olá {{nome}}! Passando para saber se ficou alguma dúvida.', 'followup', TRUE),
    (NEW.id, 'Proposta', 'Olá {{nome}}! Preparei uma proposta especial para você.', 'proposal', TRUE);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Troca as etapas em uma única transação, evitando deixar o funil vazio.
CREATE OR REPLACE FUNCTION replace_pipeline_stages(
  p_pipeline_id UUID,
  p_stages JSONB
)
RETURNS VOID AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pipelines
    WHERE id = p_pipeline_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Pipeline não encontrado';
  END IF;

  IF p_stages IS NULL
    OR jsonb_typeof(p_stages) IS DISTINCT FROM 'array'
    OR jsonb_array_length(p_stages) < 2 THEN
    RAISE EXCEPTION 'O pipeline precisa ter ao menos duas etapas';
  END IF;

  DELETE FROM pipeline_stages WHERE pipeline_id = p_pipeline_id;

  INSERT INTO pipeline_stages (pipeline_id, name, slug, color, position)
  SELECT p_pipeline_id, stage.name, stage.slug, stage.color, stage.position
  FROM jsonb_to_recordset(p_stages) AS stage(
    name TEXT,
    slug TEXT,
    color TEXT,
    position INTEGER
  );
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;

-- Registra uma interação e atualiza o último contato de forma atômica.
CREATE OR REPLACE FUNCTION record_lead_activity(
  p_lead_id UUID,
  p_type activity_type,
  p_title TEXT,
  p_description TEXT,
  p_metadata JSONB
)
RETURNS lead_activities AS $$
DECLARE
  created_activity lead_activities;
  occurred_at TIMESTAMPTZ := NOW();
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM leads
    WHERE id = p_lead_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Lead não encontrado';
  END IF;

  INSERT INTO lead_activities (
    lead_id,
    user_id,
    type,
    title,
    description,
    metadata,
    created_at
  )
  VALUES (
    p_lead_id,
    auth.uid(),
    p_type,
    p_title,
    p_description,
    COALESCE(p_metadata, '{}'::JSONB),
    occurred_at
  )
  RETURNING * INTO created_activity;

  UPDATE leads
  SET last_interaction_at = occurred_at
  WHERE id = p_lead_id AND user_id = auth.uid();

  RETURN created_activity;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;

-- Move o lead e cria o histórico em uma única transação.
CREATE OR REPLACE FUNCTION move_lead_status(
  p_lead_id UUID,
  p_status lead_status
)
RETURNS leads AS $$
DECLARE
  previous_status lead_status;
  moved_lead leads;
  occurred_at TIMESTAMPTZ := NOW();
BEGIN
  SELECT status INTO previous_status
  FROM leads
  WHERE id = p_lead_id AND user_id = auth.uid()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead não encontrado';
  END IF;

  UPDATE leads
  SET status = p_status, last_interaction_at = occurred_at
  WHERE id = p_lead_id AND user_id = auth.uid()
  RETURNING * INTO moved_lead;

  INSERT INTO lead_activities (
    lead_id,
    user_id,
    type,
    title,
    description,
    metadata,
    created_at
  )
  VALUES (
    p_lead_id,
    auth.uid(),
    'status_change',
    'Status alterado',
    'Movido para ' || INITCAP(REPLACE(p_status::TEXT, '_', ' ')),
    jsonb_build_object('from', previous_status, 'to', p_status),
    occurred_at
  );

  RETURN moved_lead;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;

-- Persiste mensagem e histórico de agendamento de forma atômica.
CREATE OR REPLACE FUNCTION schedule_follow_up(
  p_lead_id UUID,
  p_template_id UUID,
  p_content TEXT,
  p_delay followup_delay,
  p_scheduled_for TIMESTAMPTZ
)
RETURNS scheduled_messages AS $$
DECLARE
  created_message scheduled_messages;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM leads
    WHERE id = p_lead_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Lead não encontrado';
  END IF;

  IF p_template_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM message_templates
    WHERE id = p_template_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Template não encontrado';
  END IF;

  INSERT INTO scheduled_messages (
    lead_id,
    user_id,
    template_id,
    content,
    delay,
    scheduled_for
  )
  VALUES (
    p_lead_id,
    auth.uid(),
    p_template_id,
    p_content,
    p_delay,
    p_scheduled_for
  )
  RETURNING * INTO created_message;

  INSERT INTO lead_activities (
    lead_id,
    user_id,
    type,
    title,
    description,
    metadata
  )
  VALUES (
    p_lead_id,
    auth.uid(),
    'whatsapp_scheduled',
    'Follow-up agendado',
    'Follow-up de ' || p_delay::TEXT || ' agendado',
    jsonb_build_object('delay', p_delay, 'scheduled_for', p_scheduled_for)
  );

  RETURN created_message;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;

-- Confirma o envio e atualiza mensagem, atividade e lead na mesma transação.
CREATE OR REPLACE FUNCTION complete_scheduled_message(p_message_id UUID)
RETURNS scheduled_messages AS $$
DECLARE
  completed_message scheduled_messages;
  completed_at TIMESTAMPTZ := NOW();
BEGIN
  SELECT * INTO completed_message
  FROM scheduled_messages
  WHERE id = p_message_id
    AND user_id = auth.uid()
    AND status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Follow-up pendente não encontrado';
  END IF;

  UPDATE scheduled_messages
  SET status = 'sent', sent_at = completed_at
  WHERE id = p_message_id
  RETURNING * INTO completed_message;

  INSERT INTO lead_activities (
    lead_id,
    user_id,
    type,
    title,
    description,
    metadata
  )
  VALUES (
    completed_message.lead_id,
    auth.uid(),
    'whatsapp_sent',
    'Follow-up enviado',
    completed_message.content,
    jsonb_build_object(
      'scheduled_message_id', completed_message.id,
      'delay', completed_message.delay
    )
  );

  UPDATE leads
  SET last_interaction_at = completed_at
  WHERE id = completed_message.lead_id
    AND user_id = auth.uid();

  RETURN completed_message;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;

REVOKE ALL ON FUNCTION replace_pipeline_stages(UUID, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION record_lead_activity(UUID, activity_type, TEXT, TEXT, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION move_lead_status(UUID, lead_status) FROM PUBLIC;
REVOKE ALL ON FUNCTION schedule_follow_up(UUID, UUID, TEXT, followup_delay, TIMESTAMPTZ) FROM PUBLIC;
REVOKE ALL ON FUNCTION complete_scheduled_message(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION replace_pipeline_stages(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION record_lead_activity(UUID, activity_type, TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION move_lead_status(UUID, lead_status) TO authenticated;
GRANT EXECUTE ON FUNCTION schedule_follow_up(UUID, UUID, TEXT, followup_delay, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_scheduled_message(UUID) TO authenticated;
