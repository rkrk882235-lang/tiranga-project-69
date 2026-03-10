/*
  # Core User Tables and Authentication

  1. New Tables
    - `user_profile`
      - `user_id` (uuid, primary key, references auth.users)
      - `first_name` (text, required)
      - `last_name` (text)
      - `email` (text, required, unique)
      - `phone_e164` (text)
      - `preferred_locale` (text, default 'en-US', BCP 47 format)
      - `time_zone` (text, default 'UTC')
      - `marketing_opt_in` (boolean, default false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `user_credentials`
      - `user_id` (uuid, primary key)
      - `password_changed_at` (timestamptz)
      - `mfa_enabled` (boolean, default false)
      - `mfa_secret` (text, encrypted)
      - `created_at` (timestamptz)
    
    - `user_webauthn_credentials`
      - `credential_id` (text, primary key)
      - `user_id` (uuid, references user_profile)
      - `public_key_cose` (bytea, required)
      - `sign_count` (bigint)
      - `transports` (text array)
      - `device_name` (text)
      - `created_at` (timestamptz)
    
    - `user_sessions`
      - `session_id` (uuid, primary key)
      - `user_id` (uuid, references user_profile)
      - `device_info` (jsonb)
      - `ip_address` (inet)
      - `last_active_at` (timestamptz)
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only read/update their own data
    - Authenticated users only
    - Step-up auth required for credential changes (enforced in application)
*/

CREATE TABLE IF NOT EXISTS user_profile (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text,
  email text NOT NULL UNIQUE,
  phone_e164 text,
  preferred_locale text NOT NULL DEFAULT 'en-US',
  time_zone text NOT NULL DEFAULT 'UTC',
  marketing_opt_in boolean NOT NULL DEFAULT false,
  email_verified boolean NOT NULL DEFAULT false,
  phone_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_credentials (
  user_id uuid PRIMARY KEY REFERENCES user_profile(user_id) ON DELETE CASCADE,
  password_changed_at timestamptz,
  mfa_enabled boolean NOT NULL DEFAULT false,
  mfa_secret text,
  backup_codes text[],
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_webauthn_credentials (
  credential_id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES user_profile(user_id) ON DELETE CASCADE,
  public_key_cose bytea NOT NULL,
  sign_count bigint DEFAULT 0,
  transports text[],
  device_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_sessions (
  session_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profile(user_id) ON DELETE CASCADE,
  device_info jsonb,
  ip_address inet,
  last_active_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);

ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_webauthn_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profile FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profile FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own credentials"
  ON user_credentials FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credentials"
  ON user_credentials FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own passkeys"
  ON user_webauthn_credentials FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own passkeys"
  ON user_webauthn_credentials FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own passkeys"
  ON user_webauthn_credentials FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sessions"
  ON user_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON user_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_profile_email ON user_profile(email);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
