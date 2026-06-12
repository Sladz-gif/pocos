import { useEffect } from 'react';
import { poultryService } from '../services/poultryService';

export const usePoultry = () => {
  useEffect(() => {
    // Initial fetch and setup subscriptions
    poultryService.initialize();

    // Set up a 15-minute polling interval as a backup or to refresh the history list
    // 15 minutes = 15 * 60 * 1000 ms = 900,000 ms
    const interval = setInterval(() => {
      console.log('15-minute periodic refresh for poultry data');
      poultryService.refresh();
    }, 900000);

    return () => {
      clearInterval(interval);
      poultryService.destroy();
    };
  }, []);

  return {
    refresh: () => poultryService.refresh(),
  };
};
