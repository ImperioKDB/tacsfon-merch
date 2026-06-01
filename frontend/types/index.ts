
export type OrderStatus = 'pending_payment' | 'payment_submitted' | 'confirmed' | 'dispatched' | 'received' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'incomplete';

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  total: number;
  delivery_address: string | null;
  phone: string | null;
  created_at: string;
  items?: any[];
}
