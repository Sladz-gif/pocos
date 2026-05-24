import { create } from 'zustand';
import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface ActivityLog {
  id: string;
  userId?: string;
  userName: string;
  action: string;
  entityType?: string;
  entityId?: string;
  ranchId: string;
  createdAt: string;
}

interface ActivityLogStore {
  logs: ActivityLog[];
  isLoading: boolean;
  fetchLogs: (ranchId: string) => Promise<void>;
  logActivity: (entry: { userId?: string; userName: string; action: string; entityType?: string; entityId?: string; ranchId: string }) => Promise<void>;
}

export const useActivityLogStore = create<ActivityLogStore>((set) => ({
  logs: [],
  isLoading: false,

  fetchLogs: async (ranchId) => {
    if (!ranchId) return;
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('ranch_id', ranchId)
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) {
      set({ isLoading: false });
      return;
    }
    const logs: ActivityLog[] = (data || []).map((l: any) => ({
      id: l.id,
      userId: l.user_id,
      userName: l.user_name || 'Unknown',
      action: l.action,
      entityType: l.entity_type,
      entityId: l.entity_id,
      ranchId: l.ranch_id,
      createdAt: l.created_at,
    }));
    set({ logs, isLoading: false });
  },

  logActivity: async ({ userId, userName, action, entityType, entityId, ranchId }) => {
    const id = uuidv4();
    await supabase.from('activity_logs').insert({
      id,
      user_id: userId,
      user_name: userName,
      action,
      entity_type: entityType,
      entity_id: entityId,
      ranch_id: ranchId,
    });
    set((state) => ({
      logs: [
        {
          id,
          userId,
          userName,
          action,
          entityType,
          entityId,
          ranchId,
          createdAt: new Date().toISOString(),
        },
        ...state.logs,
      ],
    }));
  },
}));
