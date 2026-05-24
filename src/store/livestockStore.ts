import { create } from 'zustand';
import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';
import { Animal, MedicationRecord, PregnancyRecord, FeedingRecord } from '../types';

interface LivestockStore {
  animals: Animal[];
  selectedAnimal: Animal | null;
  medicationRecords: MedicationRecord[];
  pregnancyRecords: PregnancyRecord[];
  feedingRecords: FeedingRecord[];
  isLoading: boolean;
  
  // Actions
  fetchAnimals: (ranchId: string) => Promise<void>;
  fetchMedicationRecords: (ranchId: string) => Promise<void>;
  fetchPregnancyRecords: (ranchId: string) => Promise<void>;
  fetchFeedingRecords: (ranchId: string) => Promise<void>;
  addAnimal: (animal: Partial<Animal>, ranchId: string) => Promise<void>;
  updateAnimal: (id: string, updates: Partial<Animal>) => Promise<void>;
  deleteAnimal: (id: string) => Promise<void>;
  addMedicationRecord: (record: Partial<MedicationRecord>) => Promise<void>;
  deleteMedicationRecord: (id: string) => Promise<void>;
  addPregnancyRecord: (record: Partial<PregnancyRecord>) => Promise<void>;
  deletePregnancyRecord: (id: string) => Promise<void>;
  addFeedingRecord: (record: Partial<FeedingRecord>) => Promise<void>;
  deleteFeedingRecord: (id: string) => Promise<void>;
  setSelectedAnimal: (animal: Animal | null) => void;
}

export const useLivestockStore = create<LivestockStore>((set) => ({
  animals: [],
  selectedAnimal: null,
  medicationRecords: [],
  pregnancyRecords: [],
  feedingRecords: [],
  isLoading: false,

  fetchAnimals: async (ranchId: string) => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .eq('ranch_id', ranchId)
      .order('animal_id', { ascending: true });
    if (!error && data) {
      const animals: Animal[] = data.map((row: any) => ({
        id: row.id,
        animalId: row.animal_id,
        sex: row.sex,
        gender: row.sex?.toLowerCase() === 'male' ? 'male' : 'female',
        breed: row.breed || 'Unknown',
        weight: row.weight,
        color: row.color,
        motherId: row.dam_id,
        fatherId: row.sire_id,
        healthStatus: row.health_status,
        isSpecialFeeding: row.is_special_feeding,
        specialFeedingName: row.special_feeding_name,
        isMedicated: row.is_medicated,
        medicationName: row.medication_name,
        medicationDate: row.medication_date,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
      set({ animals, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  addAnimal: async (animalData: Partial<Animal>, ranchId: string) => {
    const animal = { 
      id: uuidv4(), 
      animal_id: animalData.animalId || `AS-${Date.now()}`,
      sex: animalData.sex,
      breed: animalData.breed || 'Brahman',
      color: animalData.color,
      weight: animalData.weight,
      dam_id: animalData.motherId,
      sire_id: animalData.fatherId,
      health_status: animalData.healthStatus || 'healthy',
      is_special_feeding: animalData.isSpecialFeeding || false,
      special_feeding_name: animalData.specialFeedingName,
      is_medicated: animalData.isMedicated || false,
      medication_name: animalData.medicationName,
      medication_date: animalData.medicationDate,
      ranch_id: ranchId,
    };
    const { error } = await supabase.from('animals').insert(animal);
    if (!error) {
      const newAnimal: Animal = {
        id: animal.id,
        animalId: animal.animal_id,
        sex: animal.sex,
        gender: animal.sex?.toLowerCase() === 'male' ? 'male' : 'female',
        breed: animal.breed,
        weight: animal.weight,
        color: animal.color,
        motherId: animal.dam_id,
        fatherId: animal.sire_id,
        healthStatus: animal.health_status as any,
        isSpecialFeeding: animal.is_special_feeding,
        specialFeedingName: animal.special_feeding_name,
        isMedicated: animal.is_medicated,
        medicationName: animal.medication_name,
        medicationDate: animal.medication_date,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      set((state: any) => ({ animals: [...state.animals, newAnimal] }));
    }
  },

  updateAnimal: async (id: string, updates: Partial<Animal>) => {
    const supabaseUpdates: any = {};
    if (updates.weight) supabaseUpdates.weight = updates.weight;
    if (updates.healthStatus) supabaseUpdates.health_status = updates.healthStatus;
    if (updates.breed) supabaseUpdates.breed = updates.breed;
    
    await supabase.from('animals').update(supabaseUpdates).eq('id', id);
    set((state: any) => ({
      animals: state.animals.map((a: any) => a.id === id ? { ...a, ...updates } : a),
    }));
  },

  deleteAnimal: async (id: string) => {
    await supabase.from('animals').delete().eq('id', id);
    set((state: any) => ({ animals: state.animals.filter((a: any) => a.id !== id) }));
  },

  fetchMedicationRecords: async (ranchId: string) => {
    const { data } = await supabase
      .from('medication_records')
      .select('*, animals!inner(ranch_id)')
      .eq('animals.ranch_id', ranchId)
      .order('administered_at', { ascending: false });
    if (data) {
      const medicationRecords: MedicationRecord[] = data.map((row: any) => ({
        id: row.id,
        animalId: row.animal_id,
        medicationName: row.medication_name,
        administeredAt: row.administered_at,
        administeredDate: row.administered_at?.split('T')[0],
        wearOffDate: row.wear_off_at?.split('T')[0],
        dosage: row.dosage || 'N/A',
        notes: row.notes,
      }));
      set({ medicationRecords });
    }
  },

  addMedicationRecord: async (record: Partial<MedicationRecord>) => {
    const newRecordId = uuidv4();
    const supabaseRecord = { 
      id: newRecordId, 
      animal_id: record.animalId,
      medication_name: record.medicationName,
      administered_at: record.administeredAt || new Date().toISOString(),
      wear_off_at: record.wearOffDate ? new Date(record.wearOffDate).toISOString() : null,
      dosage: record.dosage,
      notes: record.notes,
    };
    const { error } = await supabase.from('medication_records').insert(supabaseRecord);
    if (!error) {
      const newRecord: MedicationRecord = {
        id: newRecordId,
        animalId: record.animalId,
        medicationName: record.medicationName!,
        administeredAt: supabaseRecord.administered_at,
        administeredDate: supabaseRecord.administered_at.split('T')[0],
        wearOffDate: record.wearOffDate,
        dosage: record.dosage || 'N/A',
        notes: record.notes,
      };
      set((state: any) => ({ medicationRecords: [newRecord, ...state.medicationRecords] }));
    }
  },

  deleteMedicationRecord: async (id: string) => {
    const { error } = await supabase.from('medication_records').delete().eq('id', id);
    if (!error) {
      set((state: any) => ({
        medicationRecords: state.medicationRecords.filter((m: any) => m.id !== id)
      }));
    }
  },

  fetchPregnancyRecords: async (ranchId: string) => {
    const { data } = await supabase
      .from('pregnancy_records')
      .select('*, animals!inner(ranch_id)')
      .eq('animals.ranch_id', ranchId)
      .order('mating_date', { ascending: false });
    if (data) {
      const pregnancyRecords: PregnancyRecord[] = data.map((row: any) => ({
        id: row.id,
        animalId: row.dam_id,
        startDate: row.mating_date,
        expectedBirthDate: row.expected_delivery_date,
        actualBirthDate: row.actual_delivery_date,
        sireId: row.sire_id,
        outcome: row.status === 'delivered' ? 'successful' : row.status === 'failed' ? 'failed' : 'pending',
        notes: row.notes,
      }));
      set({ pregnancyRecords });
    }
  },

  addPregnancyRecord: async (record: any) => {
    const newRecordId = uuidv4();
    const supabaseRecord = { 
      id: newRecordId, 
      dam_id: record.animalId,
      sire_id: record.sireId,
      mating_date: record.startDate,
      expected_delivery_date: record.expectedBirthDate,
      status: 'pregnant',
      notes: record.notes,
    };
    const { error } = await supabase.from('pregnancy_records').insert(supabaseRecord);
    if (!error) {
      const newRecord: PregnancyRecord = {
        id: newRecordId,
        startDate: record.startDate,
        expectedBirthDate: record.expectedBirthDate,
        sireId: record.sireId,
        outcome: 'pending',
        notes: record.notes,
      };
      set((state: any) => ({ pregnancyRecords: [newRecord, ...state.pregnancyRecords] }));
    }
  },

  deletePregnancyRecord: async (id: string) => {
    const { error } = await supabase.from('pregnancy_records').delete().eq('id', id);
    if (!error) {
      set((state: any) => ({
        pregnancyRecords: state.pregnancyRecords.filter((p: any) => p.id !== id)
      }));
    }
  },

  fetchFeedingRecords: async (ranchId: string) => {
    const { data } = await supabase
      .from('feed_records')
      .select('*, animals!inner(ranch_id)')
      .eq('animals.ranch_id', ranchId)
      .order('fed_at', { ascending: false });
    if (data) {
      const feedingRecords: FeedingRecord[] = data.map((row: any) => ({
        id: row.id,
        animalId: row.animal_id,
        feedType: row.feed_type,
        quantity: row.quantity,
        unit: row.unit,
        fedAt: row.fed_at,
        notes: row.notes,
      }));
      set({ feedingRecords });
    }
  },

  addFeedingRecord: async (record: Partial<FeedingRecord>) => {
    const newRecordId = uuidv4();
    const supabaseRecord = {
      id: newRecordId,
      animal_id: record.animalId,
      feed_type: record.feedType,
      quantity: record.quantity,
      unit: record.unit || 'kg',
      fed_at: record.fedAt || new Date().toISOString(),
      notes: record.notes,
    };
    const { error } = await supabase.from('feed_records').insert(supabaseRecord);
    if (!error) {
      const newRecord: FeedingRecord = {
        id: newRecordId,
        animalId: record.animalId,
        feedType: record.feedType!,
        quantity: record.quantity!,
        unit: record.unit || 'kg',
        fedAt: supabaseRecord.fed_at,
        notes: record.notes,
      };
      set((state: any) => ({ feedingRecords: [newRecord, ...state.feedingRecords] }));
    }
  },

  deleteFeedingRecord: async (id: string) => {
    const { error } = await supabase.from('feed_records').delete().eq('id', id);
    if (!error) {
      set((state: any) => ({
        feedingRecords: state.feedingRecords.filter((f: any) => f.id !== id)
      }));
    }
  },

  setSelectedAnimal: (animal) => set({ selectedAnimal: animal }),
}));
