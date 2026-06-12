import { supabase } from '../config/supabase';
import { BirdCount, PoultryLiveStatus } from '../types';
import { usePoultryStore } from '../store/poultryStore';

class PoultryService {
  private subscription: any = null;

  /**
   * Initialize poultry data and setup real-time subscriptions
   */
  async initialize() {
    const store = usePoultryStore.getState();
    store.setLoading(true);
    store.setError(null);

    try {
      // 1. Fetch initial live status
      const { data: liveData, error: liveError } = await supabase
        .from('poultry_live_status')
        .select('*')
        .eq('id', 'current_status')
        .single();

      if (liveError) throw liveError;
      if (liveData) store.setLiveStatus(liveData as PoultryLiveStatus);

      // 2. Fetch recent history (last 15-min logs)
      const { data: historyData, error: historyError } = await supabase
        .from('bird_counts')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (historyError) throw historyError;
      if (historyData) store.setHistory(historyData as BirdCount[]);

      // 3. Setup Realtime Subscriptions
      this.setupSubscriptions();

    } catch (error: any) {
      console.error('Error initializing poultry service:', error);
      store.setError(error.message || 'Failed to fetch poultry data');
    } finally {
      store.setLoading(false);
    }
  }

  private setupSubscriptions() {
    const store = usePoultryStore.getState();

    // Cleanup existing subscription if any
    if (this.subscription) {
      supabase.removeChannel(this.subscription);
    }

    // Subscribe to both tables
    this.subscription = supabase
      .channel('poultry_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'poultry_live_status', filter: 'id=eq.current_status' },
        (payload) => {
          console.log('Live status update received:', payload);
          if (payload.new) {
            store.setLiveStatus(payload.new as PoultryLiveStatus);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bird_counts' },
        (payload) => {
          console.log('New bird count log received:', payload);
          if (payload.new) {
            store.addHistoryItem(payload.new as BirdCount);
          }
        }
      )
      .subscribe();
  }

  /**
   * Manually refresh the data (can be used for the 15-minute interval if needed)
   */
  async refresh() {
    await this.initialize();
  }

  /**
   * Cleanup subscriptions
   */
  destroy() {
    if (this.subscription) {
      supabase.removeChannel(this.subscription);
      this.subscription = null;
    }
  }
}

export const poultryService = new PoultryService();
