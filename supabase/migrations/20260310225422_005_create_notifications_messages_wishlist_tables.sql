/*
  Notifications, Messages, and Wishlist Tables

  New Tables:
  - notifications: User notifications center
  - messages: Support tickets and seller communications
  - message_threads: Conversation threads
  - wishlists: User wishlists
  - wishlist_items: Items saved to wishlists
  - saved_for_later: Cart items saved for later

  Security:
  - RLS enabled - users access only their own data
  - Notifications and messages private per user
*/

CREATE TYPE notification_type AS ENUM (
  'ORDER_CONFIRMATION',
  'ORDER_SHIPPED',
  'ORDER_DELIVERED',
  'ORDER_CANCELLED',
  'RETURN_UPDATE',
  'REFUND_PROCESSED',
  'PRICE_DROP',
  'BACK_IN_STOCK',
  'ACCOUNT_SECURITY',
  'PROMOTIONAL',
  'SYSTEM'
);

CREATE TYPE message_type AS ENUM (
  'SUPPORT_TICKET',
  'SELLER_MESSAGE',
  'RETURN_INQUIRY',
  'ORDER_INQUIRY',
  'GENERAL'
);

CREATE TYPE message_status AS ENUM (
  'OPEN',
  'IN_PROGRESS',
  'WAITING_FOR_USER',
  'RESOLVED',
  'CLOSED'
);

CREATE TABLE IF NOT EXISTS notifications (
  notification_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profile(user_id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  action_url text,
  action_label text,
  related_order_id uuid REFERENCES orders(order_id) ON DELETE SET NULL,
  related_return_id uuid REFERENCES returns(return_id) ON DELETE SET NULL,
  is_read boolean NOT NULL DEFAULT false,
  is_archived boolean NOT NULL DEFAULT false,
  sent_via_email boolean NOT NULL DEFAULT false,
  sent_via_sms boolean NOT NULL DEFAULT false,
  sent_via_push boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS message_threads (
  thread_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profile(user_id) ON DELETE CASCADE,
  type message_type NOT NULL,
  subject text NOT NULL,
  status message_status NOT NULL DEFAULT 'OPEN',
  related_order_id uuid REFERENCES orders(order_id) ON DELETE SET NULL,
  related_return_id uuid REFERENCES returns(return_id) ON DELETE SET NULL,
  seller_id text,
  assigned_to text,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  message_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES message_threads(thread_id) ON DELETE CASCADE,
  sender_type text NOT NULL,
  sender_id uuid,
  message_text text NOT NULL,
  attachments jsonb,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wishlists (
  wishlist_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profile(user_id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'My Wishlist',
  is_public boolean NOT NULL DEFAULT false,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wishlist_items (
  item_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id uuid NOT NULL REFERENCES wishlists(wishlist_id) ON DELETE CASCADE,
  product_id text NOT NULL,
  product_title text NOT NULL,
  product_image_url text,
  variant_id text,
  current_price decimal(10,2),
  original_price decimal(10,2),
  currency_code text NOT NULL DEFAULT 'INR',
  in_stock boolean NOT NULL DEFAULT true,
  priority int NOT NULL DEFAULT 0,
  notes text,
  added_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS saved_for_later (
  saved_item_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profile(user_id) ON DELETE CASCADE,
  product_id text NOT NULL,
  product_title text NOT NULL,
  product_image_url text,
  variant_id text,
  quantity int NOT NULL DEFAULT 1,
  price decimal(10,2),
  currency_code text NOT NULL DEFAULT 'INR',
  saved_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_for_later ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own message threads"
  ON message_threads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own message threads"
  ON message_threads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own message threads"
  ON message_threads FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  TO authenticated
  USING (thread_id IN (SELECT thread_id FROM message_threads WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert messages in own threads"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (thread_id IN (SELECT thread_id FROM message_threads WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own wishlists"
  ON wishlists FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wishlists"
  ON wishlists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wishlists"
  ON wishlists FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlists"
  ON wishlists FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own wishlist items"
  ON wishlist_items FOR SELECT
  TO authenticated
  USING (wishlist_id IN (SELECT wishlist_id FROM wishlists WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own wishlist items"
  ON wishlist_items FOR INSERT
  TO authenticated
  WITH CHECK (wishlist_id IN (SELECT wishlist_id FROM wishlists WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own wishlist items"
  ON wishlist_items FOR DELETE
  TO authenticated
  USING (wishlist_id IN (SELECT wishlist_id FROM wishlists WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own saved items"
  ON saved_for_later FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved items"
  ON saved_for_later FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved items"
  ON saved_for_later FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_threads_user_id ON message_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_status ON message_threads(status);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_wishlist_id ON wishlist_items(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_saved_for_later_user_id ON saved_for_later(user_id);
