export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type UserRole = 'super_admin' | 'ranch_owner' | 'staff' | 'store_manager' | 'buyer';

export type Gender = 'male' | 'female';

export type HealthStatus = 'healthy' | 'sick' | 'recovering' | 'quarantined' | 'quarantine' | 'deceased';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'blocked';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskRecurrence = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type ProductCategory = 'cattle' | 'meat' | 'milk' | 'feed' | 'equipment' | 'other';
