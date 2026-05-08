-- ============================================
-- MIGRACIÓN: Agregar campos para perfiles públicos
-- ============================================

-- Agregar columnas a profiles si no existen
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username text UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;

-- Crear índice para búsqueda pública
CREATE INDEX IF NOT EXISTS idx_profiles_public ON profiles(is_public, city) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username) WHERE is_public = true;

-- ============================================
-- RPC: Obtener perfil público con catálogo
-- ============================================
CREATE OR REPLACE FUNCTION get_public_profile(p_username text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile jsonb;
  v_user_id uuid;
BEGIN
  -- Obtener perfil público
  SELECT id INTO v_user_id FROM profiles 
  WHERE username = p_username AND is_public = true;
  
  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Construir respuesta con perfil + catálogo
  SELECT jsonb_build_object(
    'id', p.id,
    'business_name', p.business_name,
    'phone', p.phone,
    'email', p.email,
    'username', p.username,
    'city', p.city,
    'description', p.description,
    'avatar_url', p.avatar_url,
    'products', (
      SELECT jsonb_agg(jsonb_build_object(
        'id', pr.id,
        'code', pr.code,
        'name', pr.name,
        'category', pr.category,
        'price_type', pr.price_type,
        'base_price', COALESCE(up.price, pr.base_price),
        'unit_label', pr.unit_label
      ) ORDER BY pr.category, pr.code)
      FROM products pr
      LEFT JOIN user_prices up ON up.product_id = pr.id AND up.user_id = v_user_id
      WHERE pr.owner_id = v_user_id AND pr.is_active = true
    )
  ) INTO v_profile
  FROM profiles p
  WHERE p.id = v_user_id;

  RETURN v_profile;
END;
$$;

-- ============================================
-- RPC: Buscar fabricantes públicos
-- ============================================
CREATE OR REPLACE FUNCTION search_public_fabricantes(p_search text DEFAULT '', p_city text DEFAULT '')
RETURNS TABLE (
  id uuid,
  business_name text,
  username text,
  city text,
  description text,
  phone text,
  email text,
  avatar_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pr.id,
    pr.business_name,
    pr.username,
    pr.city,
    pr.description,
    pr.phone,
    pr.email,
    pr.avatar_url
  FROM profiles pr
  WHERE pr.is_public = true
    AND (
      p_search = '' OR 
      pr.business_name ILIKE '%' || p_search || '%' OR
      pr.description ILIKE '%' || p_search || '%'
    )
    AND (
      p_city = '' OR
      pr.city ILIKE '%' || p_city || '%'
    )
  ORDER BY pr.business_name;
END;
$$;

-- ============================================
-- Política RLS: Permitir lectura pública de perfiles
-- ============================================
CREATE POLICY "profiles_public_read" ON profiles 
FOR SELECT 
USING (is_public = true OR id = auth.uid());

-- ============================================
-- Política RLS: Permitir lectura pública de productos
-- ============================================
CREATE POLICY "products_public_read" ON products 
FOR SELECT 
USING (
  is_active = true AND (
    owner_id IS NULL OR 
    owner_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = owner_id AND is_public = true)
  )
);
