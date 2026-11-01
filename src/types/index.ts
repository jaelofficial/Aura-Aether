export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number; // in GHS
  originalPrice?: number | null;
  size: string; // e.g. "50ml", "100ml"
  stock: number;
  inStock: boolean;
  isFeatured: boolean;
  isGiftSet: boolean;
  isSale: boolean;
  scentNotes: string; // e.g. "BREEZY & JOYFUL"
  topNotes?: string | null;
  heartNotes?: string | null;
  baseNotes?: string | null;
  image: string;
  images?: string[];
  categoryId: string;
  category?: Category;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CartItem {
  id: string; // productId
  productId: string;
  name: string;
  slug: string;
  price: number;
  size: string;
  image: string;
  quantity: number;
  stock: number;
  scentNotes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  createdAt?: string | Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  size?: string | null;
  image?: string | null;
}

export interface Payment {
  id: string;
  orderId: string;
  reference: string;
  paystackId?: string | null;
  amount: number;
  currency: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | "REVERSED";
  channel?: string | null;
  paidAt?: string | Date | null;
  createdAt?: string | Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  city: string;
  notes?: string | null;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  status: "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus: "PENDING" | "SUCCESS" | "FAILED" | "REVERSED";
  paymentReference: string;
  items: OrderItem[];
  payment?: Payment | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}
