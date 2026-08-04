import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Image, Dimensions, RefreshControl, ActivityIndicator, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useCoopTimeline, useRequestLiveView } from '../../hooks/useCoops';
import { PButton } from '../../components/ui';
import type { BirdDetectionEvent } from '../../types/coop';
import { format, formatDistanceToNow } from 'date-fns';
import { supabase } from '../../config/supabase';

const { width: screenWidth } = Dimensions.get('window');

// Hardcoded device address for live view and timeline (Jetson Nano)
const JETSON_DEVICE_ADDRESS = '989347d6c29e5e8b';

type CoopTimelineScreenProps = {
  navigation: StackNavigationProp<any, any>;
  route?: { params?: { profileId?: string; deviceAddress?: string; coopName?: string } };
};

export const CoopTimelineScreen: React.FC<CoopTimelineScreenProps> = ({ navigation, route }) => {
  const assetId = JETSON_DEVICE_ADDRESS; // Use hardcoded address instead of route param
  const coopName = route?.params?.coopName || 'Coop';
  const { groupedEntries, isLoading, error, refresh } = useCoopTimeline(assetId);
  const { requestLiveView } = useRequestLiveView();
  const [selectedImage, setSelectedImage] = useState<BirdDetectionEvent | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  
  // Live view state
  const [isWatching, setIsWatching] = useState(false);
  const [frameUrl, setFrameUrl] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const appState = useRef(AppState.currentState);
  const intervalsRef = useRef<{ frameInterval: NodeJS.Timeout; leaseInterval: NodeJS.Timeout } | null>(null);

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const startWatching = useCallback(async () => {
    // Use hardcoded device address instead of requiring device linking
    const success = await requestLiveView(JETSON_DEVICE_ADDRESS, 2);
    if (!success) {
      setIsOffline(true);
      return;
    }

    setIsWatching(true);
    setIsOffline(false);
    setFrameUrl(null);
    setLastUpdated(null);

    // Start frame polling (1s interval)
    const frameInterval = setInterval(() => {
      fetchLiveFrame();
    }, 1000);

    // Start lease renewal (60s interval)
    const leaseInterval = setInterval(() => {
      if (appState.current === 'active') {
        requestLiveView(JETSON_DEVICE_ADDRESS, 2);
      }
    }, 60000);

    intervalsRef.current = { frameInterval, leaseInterval };
  }, [requestLiveView]);

  const stopWatching = useCallback(() => {
    if (intervalsRef.current) {
      clearInterval(intervalsRef.current.frameInterval);
      clearInterval(intervalsRef.current.leaseInterval);
      intervalsRef.current = null;
    }

    setIsWatching(false);
    setFrameUrl(null);
    setLastUpdated(null);
    setIsOffline(false);
  }, []);

  const fetchLiveFrame = useCallback(() => {
    try {
      const { data } = supabase.storage
        .from('poultry-images')
        .getPublicUrl(`live_view_${JETSON_DEVICE_ADDRESS}.jpg`);

      const urlWithCacheBust = `${data.publicUrl}?t=${Date.now()}`;

      // Preload image to check if it loads successfully
      Image.getSize(urlWithCacheBust, () => {
        setFrameUrl(urlWithCacheBust);
        setLastUpdated(new Date());
        setIsOffline(false);
      }, () => {
        // Image failed to load
        setLastUpdated(prev => {
          if (prev && Date.now() - prev.getTime() > 10000) {
            setIsOffline(true);
            setIsWatching(false);
          }
          return prev;
        });
      });
    } catch (e) {
      console.error('Failed to fetch live frame:', e);
    }
  }, []);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      appState.current = nextAppState;

      if (nextAppState !== 'active' && isWatching) {
        stopWatching();
      }
    });

    return () => subscription.remove();
  }, [isWatching, stopWatching]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (intervalsRef.current) {
        clearInterval(intervalsRef.current.frameInterval);
        clearInterval(intervalsRef.current.leaseInterval);
      }
    };
  }, []);

  const renderGroupHeader = (dateLabel: string) => (
    <View style={styles.dateHeader}>
      <Text style={styles.dateHeaderText}>{dateLabel}</Text>
    </View>
  );

  const renderThumb = (detection: BirdDetectionEvent) => {
    const hasCount = typeof detection.intervalCount === 'number';
    return (
      <TouchableOpacity
        key={detection.id}
        style={styles.detectionThumbContainer}
        onPress={() => detection.imageUrl && setSelectedImage(detection)}
        activeOpacity={0.8}
      >
        {detection.imageUrl ? (
          <Image
            source={{ uri: detection.imageUrl }}
            style={styles.detectionThumb}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.detectionThumbPlaceholder}>
            <Ionicons name="image-outline" size={32} color={Colors.softAsh} />
          </View>
        )}
        {hasCount && (
          <View style={styles.countBadge} pointerEvents="none">
            <Text style={styles.countBadgeText}>{detection.intervalCount}</Text>
          </View>
        )}
        <Text style={styles.detectionTime}>
          {format(new Date(detection.detectedAt), 'h:mm a')}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderGroup = (entry: { date: string; dateLabel?: string; detections: BirdDetectionEvent[] }) => (
    <View style={styles.groupContainer} key={entry.date}>
      {renderGroupHeader(entry.dateLabel || new Date(entry.date).toDateString())}
      <View style={styles.detectionGrid}>
        {entry.detections.map(renderThumb)}
      </View>
    </View>
  );

  const renderEmptyState = () => {
    if (!assetId) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="link-outline" size={48} color={Colors.softAsh} />
          <Text style={styles.emptyText}>No device linked yet</Text>
          <Text style={styles.emptySubtext}>Link a device to this coop to view timeline photos</Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyState}>
        <Ionicons name="images-outline" size={48} color={Colors.softAsh} />
        <Text style={styles.emptyText}>No photos yet</Text>
        <Text style={styles.emptySubtext}>Once the camera runs through the day, periodic snapshots will appear here</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.charcoalInk} />
        </TouchableOpacity>
        <Text style={styles.title}>Timeline — {coopName}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Live View Section */}
      {assetId && (
        <View style={styles.liveViewSection}>
          <Text style={styles.sectionTitle}>Live View</Text>
          {!isWatching && !isOffline ? (
            <PButton
              title="Watch Feed"
              onPress={startWatching}
              style={styles.watchButton}
            />
          ) : isOffline ? (
            <View style={styles.offlineContainer}>
              <Ionicons name="wifi-outline" size={32} color={Colors.mutedSienna} />
              <Text style={styles.offlineText}>Camera's offline — can't start a live view right now</Text>
            </View>
          ) : (
            <View style={styles.liveViewContainer}>
              <View style={styles.liveViewHeader}>
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveBadgeText}>live</Text>
                </View>
                {lastUpdated && (
                  <Text style={styles.liveUpdatedText}>
                    updated {formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })}
                  </Text>
                )}
                <TouchableOpacity onPress={stopWatching} style={styles.stopButton}>
                  <Ionicons name="close" size={20} color={Colors.charcoalInk} />
                </TouchableOpacity>
              </View>
              {frameUrl ? (
                <Image
                  source={{ uri: frameUrl }}
                  style={styles.liveFrame}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.liveFramePlaceholder}>
                  <ActivityIndicator color={Colors.primaryRust} />
                  <Text style={styles.loadingText}>Loading feed...</Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={groupedEntries}
        renderItem={({ item }) => renderGroup(item as any)}
        keyExtractor={item => item.date}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refresh} colors={[Colors.primaryRust]} />
        }
        ListEmptyComponent={renderEmptyState()}
      />

      <Modal
        visible={!!selectedImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <TouchableOpacity
          style={styles.imageModalContainer}
          activeOpacity={1}
          onPress={() => setSelectedImage(null)}
        >
          <TouchableOpacity activeOpacity={1} onPress={e => e.stopPropagation()} style={styles.imageModalInner}>
            {selectedImage?.imageUrl && (
              <Image
                source={{ uri: selectedImage.imageUrl }}
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
            )}
            {selectedImage && (
              <View style={styles.imageCaption}>
                {typeof selectedImage.intervalCount === 'number' && (
                  <Text style={styles.captionCount}>{selectedImage.intervalCount} birds</Text>
                )}
                {typeof selectedImage.intervalCount === 'number' && (
                  <Text style={styles.captionSeparator}> · </Text>
                )}
                <Text style={styles.captionTime}>
                  {format(new Date(selectedImage.detectedAt), 'h:mm a')}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeImageButton}
            onPress={() => setSelectedImage(null)}
          >
            <Ionicons name="close-circle" size={40} color="#FFFFFF" />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.paleParchment,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softAsh,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.xl,
    color: Colors.charcoalInk,
  },
  listContent: {
    padding: Spacing.xl,
  },
  groupContainer: {
    marginBottom: Spacing.xl,
  },
  dateHeader: {
    marginBottom: Spacing.md,
  },
  dateHeaderText: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.lg,
    color: Colors.charcoalInk,
  },
  detectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  detectionThumbContainer: {
    width: (screenWidth - Spacing.xl * 2 - Spacing.md) / 3,
    alignItems: 'center',
  },
  detectionThumb: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Radius.md,
    backgroundColor: Colors.softAsh,
  },
  detectionThumbPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Radius.md,
    backgroundColor: Colors.softAsh,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(13, 13, 13, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
    minWidth: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: {
    fontFamily: 'DMMono-Bold',
    fontSize: Typography.fontSize.sm,
    color: '#FFFFFF',
  },
  detectionTime: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
    marginTop: Spacing.xs,
  },
  errorContainer: {
    backgroundColor: Colors.dangerCrimson + '20',
    padding: Spacing.md,
    margin: Spacing.xl,
    borderRadius: Radius.md,
  },
  errorText: {
    color: Colors.dangerCrimson,
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: Spacing.xl,
  },
  emptyText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.mutedSienna,
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  imageModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  imageModalInner: {
    width: '100%',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '75%',
    borderRadius: Radius.lg,
  },
  imageCaption: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionCount: {
    fontFamily: 'DMMono-Bold',
    fontSize: Typography.fontSize.base,
    color: '#FFFFFF',
  },
  captionSeparator: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.base,
    color: 'rgba(255,255,255,0.75)',
  },
  captionTime: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.base,
    color: 'rgba(255,255,255,0.85)',
  },
  closeImageButton: {
    position: 'absolute',
    top: 50,
    right: 20,
  },
  liveViewSection: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
    marginBottom: Spacing.sm,
  },
  watchButton: {
    marginTop: Spacing.sm,
  },
  offlineContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.softAsh + '30',
    borderRadius: Radius.md,
  },
  offlineText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  liveViewContainer: {
    backgroundColor: Colors.charcoalInk,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  liveViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dangerCrimson,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: Spacing.xs,
  },
  liveBadgeText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 10,
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  liveUpdatedText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  stopButton: {
    padding: Spacing.xs,
  },
  liveFrame: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.charcoalInk,
  },
  liveFramePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.charcoalInk,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: '#FFFFFF',
    marginTop: Spacing.sm,
  },
});
