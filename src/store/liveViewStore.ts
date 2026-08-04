import { create } from 'zustand';

interface LiveViewState {
  isWatching: boolean;
  frameUrl: string | null;
  lastUpdated: Date | null;
  isOffline: boolean;
  isLoading: boolean;
  error: string | null;

  setIsWatching: (isWatching: boolean) => void;
  setFrameUrl: (frameUrl: string | null) => void;
  setLastUpdated: (lastUpdated: Date | null) => void;
  setIsOffline: (isOffline: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useLiveViewStore = create<LiveViewState>((set) => ({
  isWatching: false,
  frameUrl: null,
  lastUpdated: null,
  isOffline: false,
  isLoading: false,
  error: null,

  setIsWatching: (isWatching) => set({ isWatching }),
  setFrameUrl: (frameUrl) => set({ frameUrl }),
  setLastUpdated: (lastUpdated) => set({ lastUpdated }),
  setIsOffline: (isOffline) => set({ isOffline }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
