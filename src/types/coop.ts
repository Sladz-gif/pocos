import type { BirdCount } from './poultry';

export interface Coop {
  id: string;
  ranchId: string;
  name: string;
  location?: string;
  deviceAddress?: string;
  targetBirds?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BirdDetectionEvent {
  id: string;
  assetId: string;
  detectedAt: string;
  imageUrl?: string;
  confidence?: number;
  trackId?: string;
  count?: number;
  intervalCount: number | null;
  createdAt: string;
}

export interface CoopTimelineEntry {
  date: string;
  detections: BirdDetectionEvent[];
}

export type { BirdCount };
