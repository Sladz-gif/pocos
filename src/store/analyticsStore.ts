import { create } from 'zustand';
import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface AnalyticsSnapshot {
  id: string;
  snapshotDate: string;
  totalAnimals: number;
  totalPregnancies: number;
  activeMedications: number;
  pendingTasks: number;
  completedTasks: number;
  totalOrders: number;
  totalRevenue: number;
  activeListings: number;
  staffCount: number;
  metadata?: any;
  ranchId: string;
  createdAt: string;
}

export interface AnalyticsMetrics {
  totalAnimals: number;
  totalPregnancies: number;
  activeMedications: number;
  pendingTasks: number;
  completedTasks: number;
  totalOrders: number;
  totalRevenue: number;
  activeListings: number;
  staffCount: number;
}

interface AnalyticsStore {
  current: AnalyticsMetrics | null;
  snapshots: AnalyticsSnapshot[];
  isLoading: boolean;

  computeCurrent: (ranchId: string) => Promise<void>;
  fetchSnapshots: (ranchId: string) => Promise<void>;
  saveSnapshot: (ranchId: string) => Promise<void>;
}

function mapSnapshot(s: any): AnalyticsSnapshot {
  return {
    id: s.id,
    snapshotDate: s.snapshot_date,
    totalAnimals: s.total_animals || 0,
    totalPregnancies: s.total_pregnancies || 0,
    activeMedications: s.active_medications || 0,
    pendingTasks: s.pending_tasks || 0,
    completedTasks: s.completed_tasks || 0,
    totalOrders: s.total_orders || 0,
    totalRevenue: s.total_revenue || 0,
    activeListings: s.active_listings || 0,
    staffCount: s.staff_count || 0,
    metadata: s.metadata,
    ranchId: s.ranch_id,
    createdAt: s.created_at,
  };
}

export const useAnalyticsStore = create<AnalyticsStore>((set, get) => ({
  current: null,
  snapshots: [],
  isLoading: false,

  computeCurrent: async (ranchId) => {
    if (!ranchId) return;
    set({ isLoading: true });

    const [animalsRes, pregRes, medsRes, tasksRes, ordersRes, listingsRes, staffRes] = await Promise.all([
      supabase.from('animals').select('id', { count: 'exact', head: true }).eq('ranch_id', ranchId),
      supabase.from('pregnancy_records').select('id, animals!inner(ranch_id)', { count: 'exact', head: true }).eq('status', 'pregnant').eq('animals.ranch_id', ranchId),
      supabase.from('medication_records').select('id, animals!inner(ranch_id)', { count: 'exact', head: true }).eq('animals.ranch_id', ranchId),
      supabase.from('tasks').select('id, status').eq('ranch_id', ranchId),
      supabase.from('orders').select('id, total_amount').eq('ranch_id', ranchId),
      supabase.from('store_listings').select('id', { count: 'exact', head: true }).eq('ranch_id', ranchId).eq('status', 'listed'),
      supabase.from('ranch_users').select('id', { count: 'exact', head: true }).eq('ranch_id', ranchId).eq('is_active', true),
    ]);

    const tasks = tasksRes.data || [];
    const orders = ordersRes.data || [];

    const metrics: AnalyticsMetrics = {
      totalAnimals: animalsRes.count || 0,
      totalPregnancies: pregRes.count || 0,
      activeMedications: medsRes.count || 0,
      pendingTasks: tasks.filter((t: any) => t.status !== 'completed').length,
      completedTasks: tasks.filter((t: any) => t.status === 'completed').length,
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0),
      activeListings: listingsRes.count || 0,
      staffCount: staffRes.count || 0,
    };

    set({ current: metrics, isLoading: false });
  },

  fetchSnapshots: async (ranchId) => {
    if (!ranchId) return;
    const { data, error } = await supabase
      .from('analytics_snapshots')
      .select('*')
      .eq('ranch_id', ranchId)
      .order('snapshot_date', { ascending: false })
      .limit(180);
    if (error) return;
    set({ snapshots: (data || []).map(mapSnapshot) });
  },

  saveSnapshot: async (ranchId) => {
    const { current } = get();
    if (!current || !ranchId) return;
    const id = uuidv4();
    const today = new Date().toISOString().split('T')[0];
    const row = {
      id,
      snapshot_date: today,
      total_animals: current.totalAnimals,
      total_pregnancies: current.totalPregnancies,
      active_medications: current.activeMedications,
      pending_tasks: current.pendingTasks,
      completed_tasks: current.completedTasks,
      total_orders: current.totalOrders,
      total_revenue: current.totalRevenue,
      active_listings: current.activeListings,
      staff_count: current.staffCount,
      ranch_id: ranchId,
    };
    const { error } = await supabase.from('analytics_snapshots').insert(row);
    if (error) return;
    set((state) => ({ snapshots: [mapSnapshot(row), ...state.snapshots] }));
  },
}));

