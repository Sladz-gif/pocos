import { create } from 'zustand';
import { BirdCount, PoultryLiveStatus } from '../types';

interface PoultryState {
  liveStatus: PoultryLiveStatus | null;
  history: BirdCount[];
  isLoading: boolean;
  error: string | null;

  setLiveStatus: (status: PoultryLiveStatus) => void;
  setHistory: (history: BirdCount[]) => void;
  addHistoryItem: (item: BirdCount) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const usePoultryStore = create<PoultryState>((set) => ({
  liveStatus: null,
  history: [],
  isLoading: false,
  error: null,

  setLiveStatus: (liveStatus) => set({ liveStatus }),
  setHistory: (history) => set({ history }),
  addHistoryItem: (item) => set((state) => ({ 
    history: [item, ...state.history].slice(0, 100) // Keep last 100 logs
  })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
