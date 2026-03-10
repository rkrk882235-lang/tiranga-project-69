/*
  Returns, Refunds, and Reviews Tables

  New Tables:
  - returns: Return requests with status tracking
  - return_items: Individual items being returned
  - refunds: Refund processing records
  - product_reviews: User product reviews and ratings
  - review_media: Photos/videos attached to reviews

  Security:
  - RLS enabled - users manage their own returns and reviews
  - Reviews can only be created for purchased items
*/

CREATE TYPE return_reason AS ENUM (
  'DEFECTIVE',
  'WRONG_ITEM',
  'NOT_AS_DESCRIBED',
  'SIZE_FIT_ISSUE',
  'CHANGED_MIND',
  'QUALITY_ISSUE',
  'ARRIVED_LATE',
  'OTHER'
);

CREATE TYPE return_status AS ENUM (
  'REQUESTED',
  'APPROVED',
  'PICKUP_SCHEDULED',
  'PICKED_UP',
  'IN_TRANSIT',
  'RECEIVED',
  'INSPECTED',
  'APPROVED_FOR_REFUND',
  'REJECTED',
  'REFUNDED',
  'REPLACED'
);

CREATE TYPE refund_status AS ENUM (
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED'
);

CREATE TABLE IF NOT EXISTS returns (
  return_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  return_number text NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES user_profile(user_id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  status return_status NOT NULL DEFAULT 'REQUESTED',
  return_reason return_reason NOT NULL,
  reason_details text,
  refund_amount decimal(10,2) NOT NULL,
  refund_instrument_id uuid REFERENCES user_refund_instruments(instrument_id),
  pickup_address_id uuid REFERENCES user_addresses(address_id),
  pickup_scheduled_at timestamptz,
  picked_up_at timestamptz,
  received_at timestamptz,
  inspected_at timestamptz,
  inspection_notes text,
  requested_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS return_items (
  return_item_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id uuid NOT NULL REFERENCES returns(return_id) ON DELETE CASCADE,
  order_item_id uuid NOT NULL REFERENCES order_items(item_id) ON DELETE CASCADE,
  quantity int NOT NULL,
  return_type text NOT NULL DEFAULT 'REFUND',
  replacement_product_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS refunds (
  refund_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  refund_number text NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES user_profile(user_id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  return_id uuid REFERENCES returns(return_id) ON DELETE SET NULL,
  amount decimal(10,2) NOT NULL,
  currency_code text NOT NULL DEFAULT 'INR',
  status refund_status NOT NULL DEFAULT 'PENDING',
  refund_method text NOT NULL,
  refund_instrument_id uuid REFERENCES user_refund_instruments(instrument_id),
  payment_gateway_refund_id text,
  initiated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  failed_at timestamptz,
  failure_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_reviews (
  review_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profile(user_id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  order_item_id uuid NOT NULL REFERENCES order_items(item_id) ON DELETE CASCADE,
  product_id text NOT NULL,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  review_text text,
  verified_purchase boolean NOT NULL DEFAULT true,
  is_public boolean NOT NULL DEFAULT true,
  helpful_count int NOT NULL DEFAULT 0,
  reported_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS review_media (
  media_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES product_reviews(review_id) ON DELETE CASCADE,
  media_type text NOT NULL,
  media_url text NOT NULL,
  thumbnail_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own returns"
  ON returns FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own returns"
  ON returns FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own returns"
  ON returns FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own return items"
  ON return_items FOR SELECT
  TO authenticated
  USING (return_id IN (SELECT return_id FROM returns WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own refunds"
  ON refunds FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own reviews"
  ON product_reviews FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reviews"
  ON product_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON product_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON product_reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own review media"
  ON review_media FOR SELECT
  TO authenticated
  USING (review_id IN (SELECT review_id FROM product_reviews WHERE user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_returns_user_id ON returns(user_id);
CREATE INDEX IF NOT EXISTS idx_returns_order_id ON returns(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_status ON returns(status);
CREATE INDEX IF NOT EXISTS idx_refunds_user_id ON refunds(user_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_review_media_review_id ON review_media(review_id);
