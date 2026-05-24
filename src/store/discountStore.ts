import { create } from 'zustand';
import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface Discount {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  status: 'active' | 'expired' | 'disabled';
  usageCount: number;
  expiresAt?: string;
  ranchId: string;
  createdAt: string;
}

interface DiscountStore {
  discounts: Discount[];
  isLoading: boolean;
  fetchDiscounts: (ranchId: string) => Promise<void>;
  addDiscount: (d: { code: string; discountType: 'percentage' | 'fixed'; value: number; ranchId: string; expiresAt?: string }) => Promise<void>;
  updateDiscount: (id: string, updates: Partial<Discount>) => Promise<void>;
  deleteDiscount: (id: string) => Promise<void>;
}

export const useDiscountStore = create<DiscountStore>((set) => ({
  discounts: [],
  isLoading: false,

  fetchDiscounts: async (ranchId) => {
    if (!ranchId) return;
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('discounts')
      .select('*')
      .eq('ranch_id', ranchId)
      .order('created_at', { ascending: false });
    if (error) {
      set({ isLoading: false });
      return;
    }
    const discounts: Discount[] = (data || []).map((d: any) => ({
      id: d.id,
      code: d.code,
      discountType: d.discount_type,
      value: d.value,
      status: d.status,
      usageCount: d.usage_count || 0,
      expiresAt: d.expires_at,
      ranchId: d.ranch_id,
      createdAt: d.created_at,
    }));
    set({ discounts, isLoading: false });
  },

  addDiscount: async ({ code, discountType, value, ranchId, expiresAt }) => {
    const id = uuidv4();
    const row = {
      id,
      code: code.toUpperCase(),
      discount_type: discountType,
      value,
      status: 'active',
      usage_count: 0,
      expires_at: expiresAt,
      ranch_id: ranchId,
    };
    const { error } = await supabase.from('discounts').insert(row);
    if (error) throw error;
    set((state) => ({
      discounts: [
        {
          id,
          code: code.toUpperCase(),
          discountType,
          value,
          status: 'active',
          usageCount: 0,
          expiresAt,
          ranchId,
          createdAt: new Date().toISOString(),
        },
        ...state.discounts,
      ],
    }));
  },

  updateDiscount: async (id, updates) => {
    const row: any = {};
    if (updates.code) row.code = updates.code.toUpperCase();
    if (updates.value !== undefined) row.value = updates.value;
    if (updates.status) row.status = updates.status;
    if (updates.discountType) row.discount_type = updates.discountType;
    await supabase.from('discounts').update(row).eq('id', id);
    set((state) => ({
      discounts: state.discounts.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    }));
  },

  deleteDiscount: async (id) => {
    await supabase.from('discounts').delete().eq('id', id);
    set((state) => ({ discounts: state.discounts.filter((d) => d.id !== id) }));
  },
}));
