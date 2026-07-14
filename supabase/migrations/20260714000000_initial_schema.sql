-- NG COMPANY - migration inicial para Supabase
-- Execute no SQL Editor do Supabase

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILES
-- =============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  business_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger para criar profile ao registrar
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
    (new_pipeline_id, 'Novo', 'novo', '#fafafa', 0),
    (new_pipeline_id, 'Em Contato', 'em_contato', '#d4d4d8', 1),
    (new_pipeline_id, 'Interessado', 'interessado', '#a1a1aa', 2),
    (new_pipeline_id, 'Proposta', 'proposta', '#71717a', 3),
    (new_pipeline_id, 'Fechado', 'fechado', '#52525b', 4),
    (new_pipeline_id, 'Perdido', 'perdido', '#27272a', 5);

  INSERT INTO message_templates (user_id, name, content, category, is_default) VALUES
    (NEW.id, 'Boas-vindas', 'Olá {{nome}}! Como posso ajudar?', 'welcome', TRUE),
    (NEW.id, 'Follow-up 1 dia', 'Olá {{nome}}! Passando para saber se ficou alguma dúvida.', 'followup', TRUE),
    (NEW.id, 'Proposta', 'Olá {{nome}}! Preparei uma proposta especial para você.', 'proposal', TRUE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- PIPELINES
-- =============================================
CREATE TABLE pipelines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Funil Principal',
  is_default BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own pipelines" ON pipelines
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- PIPELINE STAGES
-- =============================================
CREATE TABLE pipeline_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pipeline_id UUID NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#a1a1aa',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own stages" ON pipeline_stages
  FOR ALL USING (
    pipeline_id IN (SELECT id FROM pipelines WHERE user_id = auth.uid())
  );

-- =============================================
-- LEADS
-- =============================================
CREATE TYPE lead_source AS ENUM ('instagram', 'site', 'indicacao', 'whatsapp', 'outro');
CREATE TYPE lead_status AS ENUM ('novo', 'em_contato', 'interessado', 'proposta', 'fechado', 'perdido');

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT,
  source lead_source NOT NULL DEFAULT 'outro',
  status lead_status NOT NULL DEFAULT 'novo',
  estimated_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  last_interaction_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_source ON leads(source);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own leads" ON leads
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- LEAD ACTIVITIES
-- =============================================
CREATE TYPE activity_type AS ENUM (
  'status_change', 'note', 'whatsapp_sent', 'whatsapp_scheduled', 'created', 'updated'
);

CREATE TABLE lead_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type activity_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activities_lead_id ON lead_activities(lead_id);

ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own activities" ON lead_activities
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- MESSAGE TEMPLATES
-- =============================================
CREATE TYPE template_category AS ENUM ('welcome', 'followup', 'proposal', 'closing', 'custom');

CREATE TABLE message_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  category template_category NOT NULL DEFAULT 'custom',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own templates" ON message_templates
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- SCHEDULED MESSAGES (Follow-ups)
-- =============================================
CREATE TYPE followup_delay AS ENUM ('1h', '1d', '3d');
CREATE TYPE message_status AS ENUM ('pending', 'sent', 'cancelled');

CREATE TABLE scheduled_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  template_id UUID REFERENCES message_templates(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  delay followup_delay NOT NULL,
  status message_status NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE scheduled_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own scheduled messages" ON scheduled_messages
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- REALTIME
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE leads;
ALTER PUBLICATION supabase_realtime ADD TABLE lead_activities;

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER pipelines_updated_at BEFORE UPDATE ON pipelines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER templates_updated_at BEFORE UPDATE ON message_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
