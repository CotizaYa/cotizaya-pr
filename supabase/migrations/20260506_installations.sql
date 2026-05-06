-- Tabla de Instalaciones
CREATE TABLE IF NOT EXISTS installations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 120,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE installations ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad
CREATE POLICY "Users can manage their own installations"
  ON installations FOR ALL
  USING (auth.uid() = owner_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_installations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_installations_timestamp
  BEFORE UPDATE ON installations
  FOR EACH ROW
  EXECUTE FUNCTION update_installations_updated_at();
