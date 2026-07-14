UPDATE pipeline_stages
SET color = CASE slug
  WHEN 'novo' THEN '#3b82f6'
  WHEN 'em_contato' THEN '#f59e0b'
  WHEN 'interessado' THEN '#a855f7'
  WHEN 'proposta' THEN '#f97316'
  WHEN 'fechado' THEN '#22c55e'
  WHEN 'perdido' THEN '#ef4444'
  ELSE color
END;

ALTER TABLE pipeline_stages
  ALTER COLUMN color SET DEFAULT '#3b82f6';