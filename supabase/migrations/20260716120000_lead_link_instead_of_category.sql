-- Substitui a categoria fixa "links" por um campo livre para colar URL.
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS link TEXT;

ALTER TABLE leads
  DROP CONSTRAINT IF EXISTS leads_category_check;

DROP INDEX IF EXISTS idx_leads_user_category;

ALTER TABLE leads
  DROP COLUMN IF EXISTS category;

CREATE INDEX IF NOT EXISTS idx_leads_user_link
  ON leads(user_id)
  WHERE link IS NOT NULL AND btrim(link) <> '';
