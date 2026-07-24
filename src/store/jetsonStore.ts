import { create } from 'zustand';
import { supabase } from '../config/supabase';
import { Asset, BirdDetection, DeviceTestSnapshot } from '../types';

interface JetsonStore {
  assets: Asset[];
  birdDetections: Map<string, BirdDetection[]>; // key: assetId
  testSnapshots: Map<string, DeviceTestSnapshot[]>; // key: assetId
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAssets: () => Promise<void>;
  fetchBirdDetections: (assetId: string, page?: number) => Promise<void>;
  fetchTestSnapshots: (assetId: string) => Promise<void>;
  linkCoopDevice: (coopId: string, deviceAddress: string) => Promise<boolean>;
  requestTestSnapshot: (assetId: string) => Promise<boolean>;
  clearError: () => void;
}

export const useJetsonStore = create<JetsonStore>((set, get) => ({
  assets: [],
  birdDetections: new Map(),
  testSnapshots: new Map(),
  isLoading: false,
  error: null,

  fetchAssets: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      set({ assets: data as Asset[] });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch assets' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchBirdDetections: async (assetId: string, page = 0) => {
    const PAGE_SIZE = 30;
    try {
      const { data, error } = await supabase
        .from('bird_detections')
        .select('*')
        .eq('asset_id', assetId)
        .order('detected_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (error) throw error;

      set((state) => {
        const newDetections = new Map(state.birdDetections);
        if (page === 0) {
          newDetections.set(assetId, data as BirdDetection[]);
        } else {
          const existing = newDetections.get(assetId) || [];
          newDetections.set(assetId, [...existing, ...(data as BirdDetection[])]);
        }
        return { birdDetections: newDetections };
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch bird detections' });
    }
  },

  fetchTestSnapshots: async (assetId: string) => {
    try {
      const { data, error } = await supabase
        .from('device_test_snapshots')
        .select('*')
        .eq('asset_id', assetId)
        .order('captured_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      set((state) => {
        const newSnapshots = new Map(state.testSnapshots);
        newSnapshots.set(assetId, data as DeviceTestSnapshot[]);
        return { testSnapshots: newSnapshots };
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch test snapshots' });
    }
  },

  linkCoopDevice: async (coopId: string, deviceAddress: string) => {
    try {
      const { data, error } = await supabase.rpc('link_coop_device', {
        p_coop_id: coopId,
        p_device_address: deviceAddress,
      });

      if (error) throw error;

      return data as boolean;
    } catch (err: any) {
      set({ error: err.message || 'Failed to link device' });
      return false;
    }
  },

  requestTestSnapshot: async (assetId: string) => {
    try {
      const { data, error } = await supabase.rpc('request_test_snapshot', {
        p_asset_id: assetId,
      });

      if (error) throw error;

      return data as boolean;
    } catch (err: any) {
      set({ error: err.message || 'Failed to request test snapshot' });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
