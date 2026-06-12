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
