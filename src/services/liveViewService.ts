import { supabase } from '../config/supabase';
import { useLiveViewStore } from '../store/liveViewStore';

// Hardcoded device address for Jetson Nano
const JETSON_DEVICE_ADDRESS = '989347d6c29e5e8b';
const TEMP_DEVICE_SECRET = 'xwguiyFjxzKfEXLs9MYPVdgIh4GDCqw3NK-6VrHpaXQ';

class LiveViewService {
  private subscription: any = null;
  private leaseInterval: NodeJS.Timeout | null = null;
  private frameInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize live view and setup real-time subscriptions
   */
  async initialize() {
    const store = useLiveViewStore.getState();
    store.setLoading(true);
    store.setError(null);

    try {
      // 1. Request live view lease
      const { data, error } = await supabase.rpc('request_live_view', {
        p_asset_id: JETSON_DEVICE_ADDRESS,
        p_lease_minutes: 2,
        p_device_secret: TEMP_DEVICE_SECRET,
      });

      if (error) throw error;
      if (!data) {
        store.setError('Failed to start live view');
        return;
      }

      store.setIsWatching(true);

      // 2. Start frame polling (1 second interval)
      this.startFramePolling();

      // 3. Start lease renewal (60 second interval)
      this.startLeaseRenewal();

      // 4. Setup Realtime Subscriptions for assets table (to detect device status)
      this.setupSubscriptions();

    } catch (error: any) {
      console.error('Error initializing live view service:', error);
      store.setError(error.message || 'Failed to initialize live view');
      store.setIsWatching(false);
    } finally {
      store.setLoading(false);
    }
  }

  private startFramePolling() {
    // Clear existing interval if any
    if (this.frameInterval) {
      clearInterval(this.frameInterval);
    }

    // Poll for new frames every second
    this.frameInterval = setInterval(() => {
      this.fetchLiveFrame();
    }, 1000);
  }

  private startLeaseRenewal() {
    // Clear existing interval if any
    if (this.leaseInterval) {
      clearInterval(this.leaseInterval);
    }

    // Renew lease every 60 seconds
    this.leaseInterval = setInterval(async () => {
      try {
        const { data, error } = await supabase.rpc('request_live_view', {
          p_asset_id: JETSON_DEVICE_ADDRESS,
          p_lease_minutes: 2,
          p_device_secret: TEMP_DEVICE_SECRET,
        });

        if (error) {
          console.error('Lease renewal failed:', error);
          const store = useLiveViewStore.getState();
          store.setError('Lease renewal failed');
        }
      } catch (error) {
        console.error('Lease renewal error:', error);
      }
    }, 60000);
  }

  private async fetchLiveFrame() {
    try {
      const { data } = supabase.storage
        .from('poultry-images')
        .getPublicUrl(`live_view_${JETSON_DEVICE_ADDRESS}.jpg`);

      const urlWithCacheBust = `${data.publicUrl}?t=${Date.now()}`;

      // Update store with new URL - component will handle image loading
      const store = useLiveViewStore.getState();
      store.setFrameUrl(urlWithCacheBust);
      store.setLastUpdated(new Date());
      store.setIsOffline(false);
    } catch (e) {
      console.error('Failed to fetch live frame:', e);
      const store = useLiveViewStore.getState();
      const lastUpdated = store.lastUpdated;
      if (lastUpdated && Date.now() - lastUpdated.getTime() > 10000) {
        store.setIsOffline(true);
        store.setIsWatching(false);
      }
    }
  }

  private setupSubscriptions() {
    const store = useLiveViewStore.getState();

    // Cleanup existing subscription if any
    if (this.subscription) {
      supabase.removeChannel(this.subscription);
    }

    // Subscribe to assets table to monitor device status
    this.subscription = supabase
      .channel('live_view_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'assets', filter: `asset_id=eq.${JETSON_DEVICE_ADDRESS}` },
        (payload) => {
          console.log('Asset status update received:', payload);
          if (payload.new) {
            // Update last seen time
            store.setLastUpdated(new Date(payload.new.last_seen_at || Date.now()));
          }
        }
      )
      .subscribe();
  }

  /**
   * Stop live view and cleanup
   */
  stop() {
    const store = useLiveViewStore.getState();
    store.setIsWatching(false);
    store.setFrameUrl(null);
    store.setLastUpdated(null);
    store.setIsOffline(false);

    // Clear intervals
    if (this.frameInterval) {
      clearInterval(this.frameInterval);
      this.frameInterval = null;
    }
    if (this.leaseInterval) {
      clearInterval(this.leaseInterval);
      this.leaseInterval = null;
    }

    // Remove subscription
    if (this.subscription) {
      supabase.removeChannel(this.subscription);
      this.subscription = null;
    }
  }

  /**
   * Manually refresh the live view
   */
  async refresh() {
    this.stop();
    await this.initialize();
  }

  /**
   * Cleanup subscriptions
   */
  destroy() {
    this.stop();
  }
}

export const liveViewService = new LiveViewService();
