-- ============================================
-- TABLA: production_events (Calendario)
-- ============================================
CREATE TABLE IF NOT EXISTS production_events (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        text NOT NULL,
  client_name  text NOT NULL,
  start_date   date NOT NULL,
  end_date     date NOT NULL,
  status       text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  notes        text,
  color        text,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE production_events ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "production_events_own" ON production_events FOR ALL USING (owner_id = auth.uid());
