import { UserRole, BaseEntity } from './common';

export interface Ranch extends BaseEntity {
  name: string;
  code: string;
  description?: string;
  location?: string;
  logo?: string;
  coverImage?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  notes?: string;
  currency?: string;
  ownerId: string;
  settings: RanchSettings;
}

export interface RanchSettings {
  requireBiometric: boolean;
  requirePin: boolean;
  sessionTimeout: number;
  allowStaffCreation: boolean;
  allowMarketplace: boolean;
}

export interface User extends BaseEntity {
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  ranchId?: string;
  accessCode?: string;
  pin?: string;
  profileImage?: string;
  isActive: boolean;
  permissions: string[];
  lastLoginAt?: string;
}

export interface Session {
  userId: string;
  ranchId: string;
  token: string;
  expiresAt: string;
  deviceInfo?: DeviceInfo;
}

export interface DeviceInfo {
  deviceId: string;
  platform: string;
  osVersion: string;
  appVersion: string;
}

export interface AccessCode {
  code: string;
  userId: string;
  ranchId: string;
  role: UserRole;
  expiresAt?: string;
  isRevoked: boolean;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  ranch: Ranch | null;
  session: Session | null;
}
