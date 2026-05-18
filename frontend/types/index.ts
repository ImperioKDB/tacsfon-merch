// ── Auth / Profiles ──────────────────────────────────────────────────────────

export interface Profile {
  id: string
  full_name: string
  email: string
  phone: string | null
  role: 'student' | 'admin'
  created_at: string
}

// ── Catalogue ─────────────────────────────────────────────────────────────────

export interface Category {
  id: string
  name: string
  created_at: string
}

/**
 * Maps to product_variants table.
 * size: 'S' | 'M' | 'L' | 'XL' | 'One Size' | null
 * color: 'White' | 'Black' | 'Red' | 'Yellow' | ... | null
 * price_override: null means use product.base_price
 */
export interface ProductVariant {
  id: string
  product_id: string
  size: string | null
  color: string | null
  stock_qty: number
  price_override: number | null
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  base_price: number
  category_id: string | null
  image_url: string | null
  /** Supabase Storage URL — /product-assets/models/{id}/model.glb */
  model_url: string | null
  is_available: boolean
  stock_type: 'stock' | 'preorder' | 'both'
  created_at: string
  updated_at: string
  category?: Category
  variants?: ProductVariant[]
}

// ── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string
  cart_id: string
  variant_id: string
  quantity: number
  variant?: ProductVariant & { product?: Product }
}

export interface Cart {
  id: string
  user_id: string
  items: CartItem[]
  total: number
}

// ── Orders ───────────────────────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'confirmed' | 'dispatched' | 'completed' | 'cancelled'
export type PaymentStatus = 'pending' | 'confirmed' | 'rejected'
export type OrderType = 'online' | 'walkin'

export interface OrderItem {
  id: string
  order_id: string
  variant_id: string
  quantity: number
  unit_price: number
  variant?: ProductVariant & { product?: Product }
}

export interface Order {
  id: string
  user_id: string
  status: OrderStatus
  type: OrderType
  payment_status: PaymentStatus
  total_amount: number
  delivery_address: string | null
  created_at: string
  items?: OrderItem[]
  profile?: Profile
}

// ── Notifications ─────────────────────────────────────────────────────────────

export interface Notification {
  id: string
  user_id: string
  message: string
  is_read: boolean
  created_at: string
}

// ── API envelope (matches backend standard response) ─────────────────────────

export interface ApiSuccessResponse<T> {
  success: true
  data: T
  message?: string
}

export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    field?: string
  }
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

// ── Admin ─────────────────────────────────────────────────────────────────────

export interface AdminLog {
  id: string
  admin_id: string
  action: string
  details: Record<string, unknown>
  created_at: string
  admin?: Profile
}

export interface BankDetails {
  bank_name: string
  account_number: string
  account_name: string
}