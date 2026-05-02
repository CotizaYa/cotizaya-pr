-- ============================================
-- TABLA: suppliers (suplidores del contratista)
-- ============================================

CREATE TABLE IF NOT EXISTS suppliers (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text NOT NULL,
  category   text NOT NULL CHECK (category IN (
    'aluminio','vidrio','screen','herrajes',
    'tornilleria','pintura','construccion','miscelanea'
  )),
  phone      text,
  whatsapp   text,
  email      text,
  notes      text,
  is_active  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_owner_id ON suppliers(owner_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_category ON suppliers(category);

-- RLS
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "suppliers_own" ON suppliers
  FOR ALL USING (owner_id = auth.uid());
