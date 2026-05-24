import { BaseEntity, ProductCategory, OrderStatus } from './common';

export interface Product extends BaseEntity {
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  discount?: number;
  images?: string[];
  ranchId: string;
  ranchName: string;
  storeName?: string;
  inStock: boolean;
  stock?: number;
  quantity: number;
  sku: string;
  tags: string[];
  specifications?: Record<string, string>;
  isPublished: boolean;
  publishedAt?: string;
}

export interface Store extends BaseEntity {
  ranchId: string;
  ranchName: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  products: string[];
  isPublished: boolean;
  rating: number;
  reviewCount: number;
}

export interface Order extends BaseEntity {
  orderId: string;
  buyerId: string;
  buyerName: string;
  ranchId: string;
  ranchName: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress?: Address;
  billingAddress?: Address;
  paymentMethod?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  notes?: string;
  orderDate: string;
  shippedDate?: string;
  deliveredDate?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Review extends BaseEntity {
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  images?: string[];
}
