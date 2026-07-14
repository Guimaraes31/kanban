ALTER TABLE pipeline_stages
  ALTER COLUMN color SET DEFAULT '#a1a1aa';

UPDATE pipeline_stages
SET color = CASE position
  WHEN 0 THEN '#fafafa'
  WHEN 1 THEN '#d4d4d8'
  WHEN 2 THEN '#a1a1aa'
  WHEN 3 THEN '#71717a'
  WHEN 4 THEN '#52525b'
  ELSE '#27272a'
END;
