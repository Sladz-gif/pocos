import { create } from 'zustand';
import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';
import { Profile, BirdCountRecord } from '../types';

interface ProfileStore {
  profiles: Profile[];
  birdCountRecords: BirdCountRecord[];
  isLoading: boolean;

  // Actions
  fetchProfiles: (ranchId: string) => Promise<void>;
  addProfile: (profileData: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProfile: (id: string, updates: Partial<Profile>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;

  // Bird count tracking
  recordBirdCount: (record: Omit<BirdCountRecord, 'id'>) => Promise<void>;
  fetchBirdCountHistory: (profileId: string, startDate?: string, endDate?: string) => Promise<void>;
  getLatestBirdCounts: (profileId: string) => BirdCountRecord[];
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profiles: [],
  birdCountRecords: [],
  isLoading: false,
  
  fetchProfiles: async (ranchId: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('ranch_id', ranchId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.log('Profiles table may not exist yet, using local state');
        set({ isLoading: false });
        return;
      }
      
      const profiles: Profile[] = data.map((row: any) => ({
        id: row.id,
        name: row.name,
        animalType: row.animal_type,
        ranchId: row.ranch_id,
        customFields: row.custom_fields || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
      
      set({ profiles, isLoading: false });
    } catch (error) {
      console.error('Error fetching profiles:', error);
      set({ isLoading: false });
    }
  },
  
  addProfile: async (profileData) => {
    try {
      const profile = {
        id: uuidv4(),
        name: profileData.name,
        animal_type: profileData.animalType,
        ranch_id: profileData.ranchId,
        custom_fields: profileData.customFields || [],
      };
      
      const { error } = await supabase.from('profiles').insert(profile);
      
      if (error) {
        console.log('Profiles table may not exist yet, adding to local state only');
        // Add to local state even if DB fails
        const newProfile: Profile = {
          id: profile.id,
          name: profile.name,
          animalType: profile.animal_type,
          ranchId: profile.ranch_id,
          customFields: profile.custom_fields,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ profiles: [newProfile, ...state.profiles] }));
        return;
      }
      
      const newProfile: Profile = {
        id: profile.id,
        name: profile.name,
        animalType: profile.animal_type,
        ranchId: profile.ranch_id,
        customFields: profile.custom_fields,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      set((state) => ({ profiles: [newProfile, ...state.profiles] }));
    } catch (error) {
      console.error('Error adding profile:', error);
      throw error;
    }
  },
  
  updateProfile: async (id, updates) => {
    try {
      const supabaseUpdates: any = {};
      if (updates.name) supabaseUpdates.name = updates.name;
      if (updates.animalType) supabaseUpdates.animal_type = updates.animalType;
      if (updates.customFields) supabaseUpdates.custom_fields = updates.customFields;
      
      const { error } = await supabase
        .from('profiles')
        .update(supabaseUpdates)
        .eq('id', id);
      
      if (!error) {
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        }));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
  
  deleteProfile: async (id) => {
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      
      if (!error) {
        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== id),
        }));
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  },

  recordBirdCount: async (record) => {
    try {
      const birdCount = {
        id: uuidv4(),
        profile_id: record.profileId,
        cage_id: record.cageId,
        count: record.count,
        timestamp: record.timestamp,
      };

      const { error } = await supabase.from('bird_count_records').insert(birdCount);

      if (!error) {
        const newRecord: BirdCountRecord = {
          id: birdCount.id,
          profileId: birdCount.profile_id,
          cageId: birdCount.cage_id,
          count: birdCount.count,
          timestamp: birdCount.timestamp,
        };
        set((state) => ({
          birdCountRecords: [...state.birdCountRecords, newRecord],
        }));
      }
    } catch (error) {
      console.error('Error recording bird count:', error);
      throw error;
    }
  },

  fetchBirdCountHistory: async (profileId, startDate, endDate) => {
    try {
      let query = supabase
        .from('bird_count_records')
        .select('*')
        .eq('profile_id', profileId);

      if (startDate) {
        query = query.gte('timestamp', startDate);
      }
      if (endDate) {
        query = query.lte('timestamp', endDate);
      }

      const { data, error } = await query.order('timestamp', { ascending: false });

      if (error) throw error;

      const records: BirdCountRecord[] = data.map((row: any) => ({
        id: row.id,
        profileId: row.profile_id,
        cageId: row.cage_id,
        count: row.count,
        timestamp: row.timestamp,
      }));

      set({ birdCountRecords: records });
    } catch (error) {
      console.error('Error fetching bird count history:', error);
      throw error;
    }
  },

  getLatestBirdCounts: (profileId) => {
    const records = get().birdCountRecords.filter((r) => r.profileId === profileId);
    const latestByCage = new Map<string, BirdCountRecord>();

    records.forEach((record) => {
      const existing = latestByCage.get(record.cageId);
      if (!existing || new Date(record.timestamp) > new Date(existing.timestamp)) {
        latestByCage.set(record.cageId, record);
      }
    });

    return Array.from(latestByCage.values());
  },
}));
