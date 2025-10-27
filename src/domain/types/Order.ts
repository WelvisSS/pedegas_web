export interface OrderItem {
  type?: string;
  product?: string;
  product_name?: string;
  quantity: number;
  price: number;
  brand?: string;
  size?: string;
}

export interface DeliveryAddress {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

export interface GasStation {
  id: string;
  name: string;
  city?: string;
  state?: string;
}

export interface Deliveryman {
  name: string;
}

export interface Order {
  id: string;
  created_at: string;
  delivery_date?: string;
  delivery_time?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  delivery_address?: string | DeliveryAddress;
  items?: OrderItem[];
  status?: string;
  priority?: string;
  total_amount?: number;
  notes?: string;
  invoice_url?: string;
  payment_method?: string;
  payment_status?: string;
  estimated_delivery?: string;
  gas_station?: GasStation;
  gas_station_id?: string;
  deliverymen?: Deliveryman;
  delivery_person?: string;
}
