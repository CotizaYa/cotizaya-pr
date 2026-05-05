-- ============================================
-- TABLA: profiles (Ampliación/Seguridad)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id             uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name  text,
  phone          text,
  email          text,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

-- ============================================
-- TABLA: products (Catálogo Maestro)
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE, -- null para globales
  code         text,
  name         text NOT NULL,
  category     text NOT NULL,
  price_type   text NOT NULL CHECK (price_type IN ('por_unidad', 'por_pie_cuadrado', 'por_pie_lineal')),
  base_price   numeric(12,4) DEFAULT 0,
  unit_label   text,
  is_active    boolean DEFAULT true,
  created_at   timestamptz DEFAULT now()
);

-- ============================================
-- TABLA: user_prices (Precios personalizados)
-- ============================================
CREATE TABLE IF NOT EXISTS user_prices (
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id   uuid REFERENCES products(id) ON DELETE CASCADE,
  price        numeric(12,4) NOT NULL,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);

-- ============================================
-- TABLA: clients (Clientes del contratista)
-- ============================================
CREATE TABLE IF NOT EXISTS clients (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    text NOT NULL,
  phone        text,
  email        text,
  address      text,
  created_at   timestamptz DEFAULT now()
);

-- ============================================
-- TABLA: quotes (Cotizaciones)
-- ============================================
CREATE TABLE IF NOT EXISTS quotes (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id          uuid REFERENCES clients(id) ON SET NULL,
  quote_number       text NOT NULL,
  status             text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'cancelled')),
  public_token       uuid DEFAULT gen_random_uuid() UNIQUE,
  notes              text,
  ivu_rate           numeric(5,4) DEFAULT 0.115,
  ivu_amount         numeric(12,4) DEFAULT 0,
  deposit_rate       numeric(5,4) DEFAULT 0.50,
  deposit_amount     numeric(12,4) DEFAULT 0,
  subtotal_materials numeric(12,4) DEFAULT 0,
  subtotal_labor     numeric(12,4) DEFAULT 0,
  total              numeric(12,4) DEFAULT 0,
  balance_amount     numeric(12,4) DEFAULT 0,
  valid_until        timestamptz,
  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz DEFAULT now()
);

-- ============================================
-- TABLA: quote_items (Líneas de cotización)
-- ============================================
CREATE TABLE IF NOT EXISTS quote_items (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id            uuid NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  product_id          uuid REFERENCES products(id) ON SET NULL,
  position            integer NOT NULL DEFAULT 0,
  name_snapshot       text NOT NULL,
  category_snapshot   text NOT NULL,
  price_type_snapshot text NOT NULL,
  unit_price_snapshot numeric(12,4) NOT NULL,
  product_snapshot    jsonb NOT NULL, -- Obligatorio para histórico
  width_inches        numeric(10,4),
  height_inches       numeric(10,4),
  quantity            integer NOT NULL DEFAULT 1,
  line_total          numeric(12,4) NOT NULL,
  metadata            jsonb DEFAULT '{}',
  created_at          timestamptz DEFAULT now()
);

-- ============================================
-- RLS (Row Level Security)
-- ============================================

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "profiles_own" ON profiles FOR ALL USING (id = auth.uid());

-- Políticas para products (Ver globales + propios)
CREATE POLICY "products_view" ON products FOR SELECT USING (owner_id IS NULL OR owner_id = auth.uid());
CREATE POLICY "products_own" ON products FOR ALL USING (owner_id = auth.uid());

-- Políticas para user_prices
CREATE POLICY "user_prices_own" ON user_prices FOR ALL USING (user_id = auth.uid());

-- Políticas para clients
CREATE POLICY "clients_own" ON clients FOR ALL USING (owner_id = auth.uid());

-- Políticas para quotes
CREATE POLICY "quotes_own" ON quotes FOR ALL USING (owner_id = auth.uid());

-- Políticas para quote_items (vía quote owner)
CREATE POLICY "quote_items_own" ON quote_items FOR ALL USING (
  EXISTS (SELECT 1 FROM quotes WHERE id = quote_items.quote_id AND owner_id = auth.uid())
);

-- ============================================
-- RPC para acceso público (Share)
-- ============================================
CREATE OR REPLACE FUNCTION get_public_quote(p_token uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_quote jsonb;
BEGIN
  SELECT jsonb_build_object(
    'id', q.id,
    'quote_number', q.quote_number,
    'status', q.status,
    'notes', q.notes,
    'ivu_rate', q.ivu_rate,
    'ivu_amount', q.ivu_amount,
    'deposit_rate', q.deposit_rate,
    'deposit_amount', q.deposit_amount,
    'subtotal_materials', q.subtotal_materials,
    'subtotal_labor', q.subtotal_labor,
    'total', q.total,
    'balance_amount', q.balance_amount,
    'valid_until', q.valid_until,
    'client', (SELECT jsonb_build_object('full_name', c.full_name, 'phone', c.phone, 'address', c.address) FROM clients c WHERE c.id = q.client_id),
    'profile', (SELECT jsonb_build_object('business_name', pr.business_name, 'phone', pr.phone, 'email', pr.email) FROM profiles pr WHERE pr.id = q.owner_id),
    'items', (SELECT jsonb_agg(i) FROM (SELECT * FROM quote_items WHERE quote_id = q.id ORDER BY position) i)
  ) INTO v_quote
  FROM quotes q
  WHERE q.public_token = p_token;

  RETURN v_quote;
END;
$$;
