-- ============================================
-- CAMPOS COMPLEMENTARIOS PARA SUPLIDORES
-- Alinea la tabla suppliers con la UI móvil de CotizaYa.
-- ============================================

ALTER TABLE suppliers
  ADD COLUMN IF NOT EXISTS contact_person text,
  ADD COLUMN IF NOT EXISTS address text;

CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(owner_id, name);
