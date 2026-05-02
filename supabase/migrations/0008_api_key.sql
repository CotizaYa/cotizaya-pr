-- Agregar columna para API Key de Anthropic del contratista
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS anthropic_api_key text;
