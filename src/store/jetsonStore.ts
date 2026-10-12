// MACHINE LEARNING / JETSON NANO - DISABLED
// App is now for poultry and goats only
// Jetson store for device management has been removed

export const useJetsonStore = {
  assets: [],
  birdDetections: new Map(),
  testSnapshots: new Map(),
  isLoading: false,
  error: null,
  fetchAssets: async () => {},
  fetchBirdDetections: async () => {},
  fetchTestSnapshots: async () => {},
  linkCoopDevice: async () => false,
  requestTestSnapshot: async () => false,
  clearError: () => {},
};

