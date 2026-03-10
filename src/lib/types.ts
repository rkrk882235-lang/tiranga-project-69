export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED'
  | 'REFUNDED';

export type ReturnStatus =
  | 'REQUESTED'
  | 'APPROVED'
  | 'PICKUP_SCHEDULED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'RECEIVED'
  | 'INSPECTED'
  | 'APPROVED_FOR_REFUND'
  | 'REJECTED'
  | 'REFUNDED'
  | 'REPLACED';

export type NotificationType =
  | 'ORDER_CONFIRMATION'
  | 'ORDER_SHIPPED'
  | 'ORDER_DELIVERED'
  | 'ORDER_CANCELLED'
  | 'RETURN_UPDATE'
  | 'REFUND_PROCESSED'
  | 'PRICE_DROP'
  | 'BACK_IN_STOCK'
  | 'ACCOUNT_SECURITY'
  | 'PROMOTIONAL'
  | 'SYSTEM';

export interface UserProfile {
  user_id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  phone_e164: string | null;
  preferred_locale: string;
  time_zone: string;
  marketing_opt_in: boolean;
  email_verified: boolean;
  phone_verified: boolean;
}

export interface Order {
  order_id: string;
  order_number: string;
  status: OrderStatus;
  total_amount: number;
  currency_code: string;
  placed_at: string;
  delivered_at: string | null;
  can_cancel: boolean;
  can_return: boolean;
}

export interface OrderItem {
  item_id: string;
  product_id: string;
  product_title: string;
  product_image_url: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: OrderStatus;
}

export interface Address {
  address_id: string;
  label: string | null;
  recipient_name: string;
  phone_e164: string | null;
  line1: string;
  line2: string | null;
  city: string;
  region: string | null;
  postal_code: string | null;
  country_code: string;
  is_default_shipping: boolean;
  delivery_instructions: string | null;
}

export interface PaymentMethod {
  payment_method_id: string;
  type: string;
  provider: string;
  last4: string | null;
  brand: string | null;
  expiry_month: number | null;
  expiry_year: number | null;
  is_default: boolean;
}

export interface Return {
  return_id: string;
  return_number: string;
  order_id: string;
  status: ReturnStatus;
  return_reason: string;
  refund_amount: number;
  requested_at: string;
}

export interface Notification {
  notification_id: string;
  type: NotificationType;
  title: string;
  message: string;
  action_url: string | null;
  action_label: string | null;
  is_read: boolean;
  created_at: string;
}

export interface WishlistItem {
  item_id: string;
  product_id: string;
  product_title: string;
  product_image_url: string | null;
  current_price: number | null;
  original_price: number | null;
  in_stock: boolean;
  added_at: string;
}

export interface Review {
  review_id: string;
  product_id: string;
  rating: number;
  title: string | null;
  review_text: string | null;
  verified_purchase: boolean;
  is_public: boolean;
  helpful_count: number;
  created_at: string;
}
