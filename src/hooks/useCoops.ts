import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../config/supabase';
import type { BirdDetectionEvent, CoopTimelineEntry } from '../types/coop';
import { format, isSameDay, isYesterday, startOfMinute, differenceInMinutes } from 'date-fns';
import { TEMP_DEVICE_SECRET } from '../config/liveView';

const PAGE_SIZE = 30;

const mapDetectionRow = (row: any): BirdDetectionEvent => ({
  id: row.id,
  assetId: row.asset_id,
  detectedAt: row.detected_at,
  imageUrl: row.image_url,
  confidence: row.confidence,
  trackId: row.track_id,
  count: row.count,
  intervalCount: row.interval_count ?? null,
  createdAt: row.created_at,
});

const formatDateLabel = (date: Date): string => {
  if (isSameDay(date, new Date())) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d, yyyy');
};

// Group detections by 15-minute intervals
const groupBy15MinInterval = (detections: BirdDetectionEvent[]): Map<string, BirdDetectionEvent[]> => {
  const groups = new Map<string, BirdDetectionEvent[]>();
  detections.forEach(detection => {
    const date = new Date(detection.detectedAt);
    const intervalStart = startOfMinute(date);
    const intervalKey = intervalStart.toISOString();
    if (!groups.has(intervalKey)) groups.set(intervalKey, []);
    groups.get(intervalKey)!.push(detection);
  });
  return groups;
};

// Get the current 15-minute interval's count
const getCurrentIntervalCount = (detections: BirdDetectionEvent[]): number | null => {
  if (detections.length === 0) return null;
  const latestDetection = detections[0];
  return latestDetection.intervalCount ?? null;
};

export const useCoopTimeline = (assetId?: string, page = 0) => {
  const [detections, setDetections] = useState<BirdDetectionEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!assetId) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('bird_detections')
          .select('*')
          .eq('asset_id', assetId)
          .order('detected_at', { ascending: false })
          .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

        if (error) throw error;

        const mapped = (data || []).map(mapDetectionRow);
        if (isMounted) {
          if (page === 0) {
            setDetections(mapped);
          } else {
            setDetections(prev => [...prev, ...mapped]);
          }
        }
      } catch (e: any) {
        if (isMounted) setError(e.message || 'Failed to load timeline');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [assetId, page]);

  const groupedEntries: CoopTimelineEntry[] = useMemo(() => {
    const groupsMap = new Map<string, BirdDetectionEvent[]>();
    detections.forEach(detection => {
      const key = new Date(detection.detectedAt).toDateString();
      if (!groupsMap.has(key)) groupsMap.set(key, []);
      groupsMap.get(key)!.push(detection);
    });

    return Array.from(groupsMap.entries())
      .map(([dateKey, group]) => ({
        date: dateKey,
        detections: group,
        dateLabel: formatDateLabel(new Date(dateKey)),
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) as any;
  }, [detections]);

  const currentIntervalCount = useMemo(() => getCurrentIntervalCount(detections), [detections]);

  return {
    detections,
    groupedEntries,
    currentIntervalCount,
    isLoading,
    error,
    pageSize: PAGE_SIZE,
    refresh: async () => {
      if (!assetId) return;
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('bird_detections')
          .select('*')
          .eq('asset_id', assetId)
          .order('detected_at', { ascending: false })
          .range(0, PAGE_SIZE - 1);
        if (error) throw error;
        setDetections((data || []).map(mapDetectionRow));
      } catch (e: any) {
        setError(e.message || 'Failed to refresh');
      } finally {
        setIsLoading(false);
      }
    },
  };
};

export const useRequestLiveView = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLiveView = async (assetId: string, leaseMinutes: number = 2) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('request_live_view', {
        p_asset_id: assetId,
        p_lease_minutes: leaseMinutes,
        p_device_secret: TEMP_DEVICE_SECRET,
      });

      if (error) throw error;
      return data as boolean;
    } catch (e: any) {
      setError(e.message || 'Failed to request live view');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    requestLiveView,
    isLoading,
    error,
  };
};
