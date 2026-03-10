/*
  Orders and Order Items Tables

  New Tables:
  - orders: Main order records with status tracking
  - order_items: Individual items within each order
  - order_status_history: Timeline of order status changes
  - order_shipments: Shipment tracking information

  Security:
  - RLS enabled - users can only view their own orders
  - Order IDs are UUIDs to prevent enumeration
*/

CREATE TYPE order_status AS ENUM (
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'RETURNED',
  'REFUNDED'
);

CREATE TYPE cancellation_reason AS ENUM (
  'USER_REQUESTED',
  'PAYMENT_FAILED',
  'OUT_OF_STOCK',
  'ADDRESS_ISSUE',
  'DUPLICATE_ORDER',
  'OTHER'
);

CREATE TABLE IF NOT EXISTS orders (
  order_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profile(user_id) ON DELETE CASCADE,
  order_number text NOT NULL UNIQUE,
  status order_status NOT NULL DEFAULT 'PENDING',
  subtotal_amount decimal(10,2) NOT NULL,
  tax_amount decimal(10,2) NOT NULL DEFAULT 0,
  shipping_amount decimal(10,2) NOT NULL DEFAULT 0,
  discount_amount decimal(10,2) NOT NULL DEFAULT 0,
  total_amount decimal(10,2) NOT NULL,
  currency_code text NOT NULL DEFAULT 'INR',
  shipping_address_id uuid REFERENCES user_addresses(address_id),
  billing_address_id uuid REFERENCES user_addresses(address_id),
  payment_method_id uuid REFERENCES user_payment_methods(payment_method_id),
  payment_status text NOT NULL DEFAULT 'PENDING',
  is_gift boolean NOT NULL DEFAULT false,
  gift_message text,
  can_cancel boolean NOT NULL DEFAULT true,
  can_return boolean NOT NULL DEFAULT false,
  placed_at timestamptz NOT NULL DEFAULT now(),
  confirmed_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  cancellation_reason cancellation_reason,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  item_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  product_id text NOT NULL,
  product_title text NOT NULL,
  product_image_url text,
  variant_title text,
  sku text,
  quantity int NOT NULL,
  unit_price decimal(10,2) NOT NULL,
  total_price decimal(10,2) NOT NULL,
  tax_amount decimal(10,2) NOT NULL DEFAULT 0,
  discount_amount decimal(10,2) NOT NULL DEFAULT 0,
  seller_id text,
  seller_name text,
  status order_status NOT NULL DEFAULT 'PENDING',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_status_history (
  history_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  item_id uuid REFERENCES order_items(item_id) ON DELETE CASCADE,
  status order_status NOT NULL,
  notes text,
  location text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_shipments (
  shipment_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  item_id uuid REFERENCES order_items(item_id),
  carrier text NOT NULL,
  tracking_number text NOT NULL,
  tracking_url text,
  estimated_delivery timestamptz,
  shipped_at timestamptz NOT NULL DEFAULT now(),
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (order_id IN (SELECT order_id FROM orders WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own order history"
  ON order_status_history FOR SELECT
  TO authenticated
  USING (order_id IN (SELECT order_id FROM orders WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own order shipments"
  ON order_shipments FOR SELECT
  TO authenticated
  USING (order_id IN (SELECT order_id FROM orders WHERE user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_placed_at ON orders(placed_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_shipments_order_id ON order_shipments(order_id);
