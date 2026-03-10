/*
  Address and Payment Tables

  New Tables:
  - user_addresses: Store delivery addresses with international format support
  - user_payment_methods: Store tokenized payment methods (never raw card data)
  - user_refund_instruments: Store refund destination preferences

  Security:
  - RLS enabled on all tables
  - Users can only manage their own data
  - Unique constraints ensure only one default per user type
*/

CREATE TABLE IF NOT EXISTS user_addresses (
  address_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profile(user_id) ON DELETE CASCADE,
  label text,
  recipient_name text NOT NULL,
  phone_e164 text,
  line1 text NOT NULL,
  line2 text,
  city text NOT NULL,
  region text,
  postal_code text,
  country_code text NOT NULL,
  is_default_shipping boolean NOT NULL DEFAULT false,
  delivery_instructions text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_payment_methods (
  payment_method_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profile(user_id) ON DELETE CASCADE,
  type text NOT NULL,
  provider text NOT NULL,
  token text NOT NULL,
  last4 text,
  brand text,
  expiry_month int,
  expiry_year int,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_refund_instruments (
  instrument_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profile(user_id) ON DELETE CASCADE,
  type text NOT NULL,
  account_last4 text,
  ifsc_code text,
  account_holder_name text,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS one_default_address_per_user
  ON user_addresses(user_id)
  WHERE is_default_shipping = true;

CREATE UNIQUE INDEX IF NOT EXISTS one_default_payment_per_user
  ON user_payment_methods(user_id)
  WHERE is_default = true;

CREATE UNIQUE INDEX IF NOT EXISTS one_default_refund_instrument_per_user
  ON user_refund_instruments(user_id)
  WHERE is_default = true;

ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_refund_instruments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own addresses"
  ON user_addresses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses"
  ON user_addresses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
  ON user_addresses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
  ON user_addresses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own payment methods"
  ON user_payment_methods FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment methods"
  ON user_payment_methods FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment methods"
  ON user_payment_methods FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own payment methods"
  ON user_payment_methods FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own refund instruments"
  ON user_refund_instruments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own refund instruments"
  ON user_refund_instruments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own refund instruments"
  ON user_refund_instruments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own refund instruments"
  ON user_refund_instruments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_payment_methods_user_id ON user_payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_user_refund_instruments_user_id ON user_refund_instruments(user_id);
