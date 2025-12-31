-- ============================================================================
-- MIGRATION: Entity Versioning System
-- Description: Sistema de versionamento de entidades
-- ============================================================================

-- Tabela genérica de versionamento
CREATE TABLE IF NOT EXISTS entity_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  version_number INT NOT NULL,
  data JSONB NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  change_summary TEXT,
  CONSTRAINT unique_version UNIQUE (entity_type, entity_id, version_number)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_versions_entity ON entity_versions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_versions_date ON entity_versions(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_versions_user ON entity_versions(changed_by);

-- RLS
ALTER TABLE entity_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view versions"
ON entity_versions FOR SELECT
USING (true);

CREATE POLICY "System can create versions"
ON entity_versions FOR INSERT
WITH CHECK (true);

-- Função para criar versão automaticamente
CREATE OR REPLACE FUNCTION create_entity_version()
RETURNS TRIGGER AS $$
DECLARE
  next_version INT;
BEGIN
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO next_version
  FROM entity_versions
  WHERE entity_type = TG_TABLE_NAME AND entity_id = OLD.id;
  
  INSERT INTO entity_versions (
    entity_type,
    entity_id,
    version_number,
    data,
    changed_by,
    change_summary
  ) VALUES (
    TG_TABLE_NAME,
    OLD.id,
    next_version,
    to_jsonb(OLD),
    auth.uid(),
    'Auto-versioned on update'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger em tabelas críticas (jobs, machines, operators)
DROP TRIGGER IF EXISTS jobs_versioning_trigger ON jobs;
CREATE TRIGGER jobs_versioning_trigger
BEFORE UPDATE ON jobs
FOR EACH ROW EXECUTE FUNCTION create_entity_version();

DROP TRIGGER IF EXISTS machines_versioning_trigger ON machines;
CREATE TRIGGER machines_versioning_trigger
BEFORE UPDATE ON machines
FOR EACH ROW EXECUTE FUNCTION create_entity_version();
