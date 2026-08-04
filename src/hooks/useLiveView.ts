import { useEffect } from 'react';
import { AppState } from 'react-native';
import { liveViewService } from '../services/liveViewService';

export const useLiveView = () => {
  useEffect(() => {
    // Initialize live view service
    liveViewService.initialize();

    // Handle app state changes (background/foreground)
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState !== 'active') {
        // Stop watching when app goes to background
        liveViewService.stop();
      }
    });

    return () => {
      subscription.remove();
      liveViewService.destroy();
    };
  }, []);

  return {
    start: () => liveViewService.initialize(),
    stop: () => liveViewService.stop(),
    refresh: () => liveViewService.refresh(),
  };
};
