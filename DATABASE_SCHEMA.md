# Database Schema Documentation

## Overview

The database consists of 15+ tables organized into 5 main categories, all with Row Level Security (RLS) enabled.

## User & Identity Tables

### user_profile
Core user information and preferences.
```sql
- user_id (uuid, PK, references auth.users)
- first_name (text, required)
- last_name (text)
- email (text, required, unique)
- phone_e164 (text)
- preferred_locale (text, default 'en-US')
- time_zone (text, default 'UTC')
- marketing_opt_in (boolean, default false)
- email_verified (boolean, default false)
- phone_verified (boolean, default false)
- created_at, updated_at (timestamptz)
```

### user_credentials
Password and MFA settings.
```sql
- user_id (uuid, PK)
- password_changed_at (timestamptz)
- mfa_enabled (boolean, default false)
- mfa_secret (text, encrypted)
- backup_codes (text[])
- created_at (timestamptz)
```

### user_webauthn_credentials
Passkey storage for passwordless authentication.
```sql
- credential_id (text, PK)
- user_id (uuid, references user_profile)
- public_key_cose (bytea, required)
- sign_count (bigint)
- transports (text[])
- device_name (text)
- created_at (timestamptz)
```

### user_sessions
Active session tracking.
```sql
- session_id (uuid, PK)
- user_id (uuid, references user_profile)
- device_info (jsonb)
- ip_address (inet)
- last_active_at (timestamptz)
- created_at, expires_at (timestamptz)
```

## Address & Payment Tables

### user_addresses
Delivery addresses with international support.
```sql
- address_id (uuid, PK)
- user_id (uuid, references user_profile)
- label (text, e.g., "Home", "Work")
- recipient_name (text, required)
- phone_e164 (text)
- line1, line2 (text)
- city, region, postal_code (text)
- country_code (text, required, ISO 3166-1 alpha-2)
- is_default_shipping (boolean, default false)
- delivery_instructions (text)
- created_at, updated_at (timestamptz)

Unique constraint: One default address per user
```

### user_payment_methods
Tokenized payment methods (PCI-compliant, no raw card data).
```sql
- payment_method_id (uuid, PK)
- user_id (uuid, references user_profile)
- type (text, e.g., "CARD", "UPI", "WALLET")
- provider (text, e.g., "STRIPE", "RAZORPAY")
- token (text, required, PSP token)
- last4 (text)
- brand (text, e.g., "VISA", "MASTERCARD")
- expiry_month, expiry_year (int)
- is_default (boolean, default false)
- created_at, updated_at (timestamptz)

Unique constraint: One default payment method per user
```

### user_refund_instruments
Refund destination preferences.
```sql
- instrument_id (uuid, PK)
- user_id (uuid, references user_profile)
- type (text, e.g., "BANK", "WALLET", "ORIGINAL_PAYMENT")
- account_last4 (text)
- ifsc_code (text, for Indian bank transfers)
- account_holder_name (text)
- is_default (boolean, default false)
- created_at (timestamptz)

Unique constraint: One default refund instrument per user
```

## Orders & Fulfillment Tables

### orders
Main order records with comprehensive status tracking.
```sql
- order_id (uuid, PK)
- user_id (uuid, references user_profile)
- order_number (text, unique)
- status (order_status enum)
- subtotal_amount, tax_amount, shipping_amount, discount_amount, total_amount (decimal)
- currency_code (text, default 'INR')
- shipping_address_id, billing_address_id (uuid, references user_addresses)
- payment_method_id (uuid, references user_payment_methods)
- payment_status (text)
- is_gift (boolean, default false)
- gift_message (text)
- can_cancel, can_return (boolean)
- placed_at, confirmed_at, shipped_at, delivered_at, cancelled_at (timestamptz)
- cancellation_reason (cancellation_reason enum)
- created_at, updated_at (timestamptz)

Enums:
- order_status: PENDING, CONFIRMED, PROCESSING, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED, RETURNED, REFUNDED
- cancellation_reason: USER_REQUESTED, PAYMENT_FAILED, OUT_OF_STOCK, ADDRESS_ISSUE, DUPLICATE_ORDER, OTHER
```

### order_items
Individual items within each order.
```sql
- item_id (uuid, PK)
- order_id (uuid, references orders)
- product_id (text, required)
- product_title, product_image_url, variant_title, sku (text)
- quantity (int, required)
- unit_price, total_price, tax_amount, discount_amount (decimal)
- seller_id, seller_name (text)
- status (order_status enum)
- created_at (timestamptz)
```

### order_status_history
Complete order event timeline.
```sql
- history_id (uuid, PK)
- order_id (uuid, references orders)
- item_id (uuid, references order_items)
- status (order_status enum, required)
- notes (text)
- location (text)
- created_at (timestamptz)
```

### order_shipments
Tracking information from carriers.
```sql
- shipment_id (uuid, PK)
- order_id (uuid, references orders)
- item_id (uuid, references order_items)
- carrier (text, required)
- tracking_number (text, required)
- tracking_url (text)
- estimated_delivery (timestamptz)
- shipped_at, delivered_at (timestamptz)
- created_at (timestamptz)
```

## Returns & Reviews Tables

### returns
Return requests with pickup scheduling.
```sql
- return_id (uuid, PK)
- return_number (text, unique)
- user_id (uuid, references user_profile)
- order_id (uuid, references orders)
- status (return_status enum)
- return_reason (return_reason enum)
- reason_details (text)
- refund_amount (decimal)
- refund_instrument_id (uuid, references user_refund_instruments)
- pickup_address_id (uuid, references user_addresses)
- pickup_scheduled_at, picked_up_at, received_at, inspected_at (timestamptz)
- inspection_notes (text)
- requested_at, created_at, updated_at (timestamptz)

Enums:
- return_status: REQUESTED, APPROVED, PICKUP_SCHEDULED, PICKED_UP, IN_TRANSIT, RECEIVED, INSPECTED, APPROVED_FOR_REFUND, REJECTED, REFUNDED, REPLACED
- return_reason: DEFECTIVE, WRONG_ITEM, NOT_AS_DESCRIBED, SIZE_FIT_ISSUE, CHANGED_MIND, QUALITY_ISSUE, ARRIVED_LATE, OTHER
```

### return_items
Items being returned.
```sql
- return_item_id (uuid, PK)
- return_id (uuid, references returns)
- order_item_id (uuid, references order_items)
- quantity (int, required)
- return_type (text, default 'REFUND')
- replacement_product_id (text)
- created_at (timestamptz)
```

### refunds
Refund processing records.
```sql
- refund_id (uuid, PK)
- refund_number (text, unique)
- user_id (uuid, references user_profile)
- order_id (uuid, references orders)
- return_id (uuid, references returns)
- amount (decimal, required)
- currency_code (text, default 'INR')
- status (refund_status enum)
- refund_method (text, required)
- refund_instrument_id (uuid, references user_refund_instruments)
- payment_gateway_refund_id (text)
- initiated_at, completed_at, failed_at (timestamptz)
- failure_reason (text)
- created_at (timestamptz)

Enum:
- refund_status: PENDING, PROCESSING, COMPLETED, FAILED
```

### product_reviews
User product reviews and ratings.
```sql
- review_id (uuid, PK)
- user_id (uuid, references user_profile)
- order_id (uuid, references orders)
- order_item_id (uuid, references order_items)
- product_id (text, required)
- rating (int, required, CHECK 1-5)
- title (text)
- review_text (text)
- verified_purchase (boolean, default true)
- is_public (boolean, default true)
- helpful_count, reported_count (int, default 0)
- created_at, updated_at (timestamptz)
```

### review_media
Photos/videos attached to reviews.
```sql
- media_id (uuid, PK)
- review_id (uuid, references product_reviews)
- media_type (text, required)
- media_url (text, required)
- thumbnail_url (text)
- created_at (timestamptz)
```

## Communication Tables

### notifications
User notifications with multi-channel support.
```sql
- notification_id (uuid, PK)
- user_id (uuid, references user_profile)
- type (notification_type enum)
- title (text, required)
- message (text, required)
- action_url, action_label (text)
- related_order_id (uuid, references orders)
- related_return_id (uuid, references returns)
- is_read, is_archived (boolean, default false)
- sent_via_email, sent_via_sms, sent_via_push (boolean, default false)
- created_at (timestamptz)

Enum:
- notification_type: ORDER_CONFIRMATION, ORDER_SHIPPED, ORDER_DELIVERED, ORDER_CANCELLED, RETURN_UPDATE, REFUND_PROCESSED, PRICE_DROP, BACK_IN_STOCK, ACCOUNT_SECURITY, PROMOTIONAL, SYSTEM
```

### message_threads
Support tickets and seller conversations.
```sql
- thread_id (uuid, PK)
- user_id (uuid, references user_profile)
- type (message_type enum)
- subject (text, required)
- status (message_status enum)
- related_order_id (uuid, references orders)
- related_return_id (uuid, references returns)
- seller_id (text)
- assigned_to (text)
- last_message_at (timestamptz)
- created_at, updated_at (timestamptz)

Enums:
- message_type: SUPPORT_TICKET, SELLER_MESSAGE, RETURN_INQUIRY, ORDER_INQUIRY, GENERAL
- message_status: OPEN, IN_PROGRESS, WAITING_FOR_USER, RESOLVED, CLOSED
```

### messages
Individual messages in threads.
```sql
- message_id (uuid, PK)
- thread_id (uuid, references message_threads)
- sender_type (text, required)
- sender_id (uuid)
- message_text (text, required)
- attachments (jsonb)
- is_read (boolean, default false)
- created_at (timestamptz)
```

### wishlists
User wishlists with privacy controls.
```sql
- wishlist_id (uuid, PK)
- user_id (uuid, references user_profile)
- name (text, default 'My Wishlist')
- is_public, is_default (boolean, default false)
- created_at, updated_at (timestamptz)
```

### wishlist_items
Saved products with price tracking.
```sql
- item_id (uuid, PK)
- wishlist_id (uuid, references wishlists)
- product_id (text, required)
- product_title, product_image_url, variant_id (text)
- current_price, original_price (decimal)
- currency_code (text, default 'INR')
- in_stock (boolean, default true)
- priority (int, default 0)
- notes (text)
- added_at (timestamptz)
```

### saved_for_later
Cart items saved for future purchase.
```sql
- saved_item_id (uuid, PK)
- user_id (uuid, references user_profile)
- product_id (text, required)
- product_title, product_image_url, variant_id (text)
- quantity (int, default 1)
- price (decimal)
- currency_code (text, default 'INR')
- saved_at (timestamptz)
```

## Row Level Security Policies

All tables follow these RLS patterns:

### SELECT Policies
```sql
CREATE POLICY "Users can view own data"
  ON table_name FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
```

### INSERT Policies
```sql
CREATE POLICY "Users can insert own data"
  ON table_name FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

### UPDATE Policies
```sql
CREATE POLICY "Users can update own data"
  ON table_name FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### DELETE Policies
```sql
CREATE POLICY "Users can delete own data"
  ON table_name FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

## Indexes

Performance indexes created on:
- user_profile(email)
- orders(user_id, status, placed_at DESC)
- order_items(order_id)
- returns(user_id, status)
- refunds(user_id, status)
- product_reviews(user_id, product_id)
- notifications(user_id, created_at DESC)
- message_threads(user_id, status)
- wishlists(user_id)
- All foreign key columns

## Migrations Applied

1. `001_create_core_user_tables` - User profiles, credentials, sessions, passkeys
2. `002_create_address_and_payment_tables` - Addresses, payments, refund instruments
3. `003_create_orders_and_items_tables` - Orders, items, shipments, status history
4. `004_create_returns_and_reviews_tables` - Returns, refunds, reviews, media
5. `005_create_notifications_messages_wishlist_tables` - Notifications, messages, wishlists

All migrations include proper RLS policies and indexes.
