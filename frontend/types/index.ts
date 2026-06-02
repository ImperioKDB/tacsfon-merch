// --- Auth & Profiles ---
export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  delivery_address: string | null;   // ← ADDED: backed by DB migration
  role: 'student' | 'admin';
  created_at: string;
}

// --- Catalogue ---
export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string | null;
  color: string | null;
  stock_qty: number;
  price_override: number | null;
  created_at: string;
  product?: Product;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  category_id: string | null;
  image_url: string | null;
  model_url: string | null;
  is_available: boolean;
  stock_type: 'stock' | 'preorder' | 'both';
  created_at: string;
  updated_at: string;
  category?: Category;
  variants?: ProductVariant[];
}

// --- Cart ---
export interface CartItem {
  id: string;
  cart_id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
  variant?: ProductVariant & { product?: Product };
}

export interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
  total: number;
}

// --- Orders ---
export type OrderStatus =
  | 'pending_payment'
  | 'payment_submitted'
  | 'confirmed'
  | 'dispatched'
  | 'received'
  | 'cancelled';

export type PaymentStatus = 'unpaid' | 'paid' | 'incomplete';
export type OrderType     = 'online' | 'walkin';

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  type: OrderType;
  total: number;
  delivery_address: string | null;
  phone: string | null;
  customer_name: string | null;
  proof_url: string | null;
  created_at: string;
  updated_at: string;
  items?: any[];
  profile?: Profile;
}

// --- Notifications ---
export interface Notification {
  id: string;
  user_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
  variant?: ProductVariant & { product?: Product };
}

export interface BankDetails {
  bank_name: string;
  account_number: string;
  account_name: string;
}
