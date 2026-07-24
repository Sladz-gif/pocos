export interface BirdCount {
  id: number;
  timestamp: string;
  total_birds: number;
  interval_birds: number;
  device_id: string;
}

export interface PoultryLiveStatus {
  id: string;
  last_updated: string;
  total_count: number;
  is_active: boolean;
}

export interface Asset {
  asset_id: string;
  owner_user_id?: string;
  status: string;
  last_seen_at?: string;
  pending_test_snapshot: boolean;
  unsynced_detections: number;
  unsynced_daily_counts: number;
  pending_images_on_disk: number;
  created_at: string;
  updated_at: string;
}

export interface BirdDetection {
  id: string;
  asset_id: string;
  detected_at: string;
  image_url?: string;
  confidence?: number;
  track_id?: string;
  count?: number;
  created_at: string;
}

export interface DeviceTestSnapshot {
  id: string;
  asset_id: string;
  image_url?: string;
  captured_at: string;
  cpu_temp_c?: number;
  uptime_seconds?: number;
  fps?: number;
  created_at: string;
}
