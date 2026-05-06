-- Tabla de Suscripciones SaaS
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT CHECK (plan IN ('basic', 'pro', 'enterprise')) DEFAULT 'basic',
  status TEXT CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')) DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Configuración del Chatbot
CREATE TABLE IF NOT EXISTS chatbot_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  whatsapp_phone TEXT,
  whatsapp_api_key TEXT,
  whatsapp_webhook_token TEXT,
  auto_create_quote BOOLEAN DEFAULT true,
  message_template TEXT,
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Mensajes del Chatbot
CREATE TABLE IF NOT EXISTS chatbot_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  message_type TEXT CHECK (message_type IN ('initial', 'reminder', 'follow_up')) DEFAULT 'initial',
  message_text TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  response_text TEXT,
  response_at TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'responded')) DEFAULT 'pending',
  created_quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Historial de Eventos del Chatbot
CREATE TABLE IF NOT EXISTS chatbot_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_events ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad para Subscriptions
CREATE POLICY "Users can view their own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can update their own subscription"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = owner_id);

-- Políticas de Seguridad para Chatbot Settings
CREATE POLICY "Users can manage their own chatbot settings"
  ON chatbot_settings FOR ALL
  USING (auth.uid() = owner_id);

-- Políticas de Seguridad para Chatbot Messages
CREATE POLICY "Users can view their own chatbot messages"
  ON chatbot_messages FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert chatbot messages"
  ON chatbot_messages FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Políticas de Seguridad para Chatbot Events
CREATE POLICY "Users can view their own chatbot events"
  ON chatbot_events FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert chatbot events"
  ON chatbot_events FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscriptions_timestamp
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();

CREATE OR REPLACE FUNCTION update_chatbot_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chatbot_settings_timestamp
  BEFORE UPDATE ON chatbot_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_chatbot_settings_updated_at();

CREATE OR REPLACE FUNCTION update_chatbot_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chatbot_messages_timestamp
  BEFORE UPDATE ON chatbot_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chatbot_messages_updated_at();

-- Índices para optimización
CREATE INDEX idx_subscriptions_owner_id ON subscriptions(owner_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_chatbot_settings_owner_id ON chatbot_settings(owner_id);
CREATE INDEX idx_chatbot_messages_owner_id ON chatbot_messages(owner_id);
CREATE INDEX idx_chatbot_messages_client_id ON chatbot_messages(client_id);
CREATE INDEX idx_chatbot_messages_status ON chatbot_messages(status);
CREATE INDEX idx_chatbot_events_owner_id ON chatbot_events(owner_id);
