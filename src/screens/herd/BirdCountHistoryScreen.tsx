import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Modal, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PCard } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { HerdStackParamList } from '../../navigation/types';
import { usePoultryStore } from '../../store/poultryStore';
import { usePoultry } from '../../hooks/usePoultry';
import { useProfileStore } from '../../store/profileStore';
import { useJetsonStore } from '../../store/jetsonStore';
import { format, isSameDay, isYesterday } from 'date-fns';
import { BirdDetection } from '../../types';

const { width: screenWidth } = Dimensions.get('window');

// Hardcoded device address for timeline (Jetson Nano)
const JETSON_DEVICE_ADDRESS = '989347d6c29e5e8b';

type BirdCountHistoryScreenProps = {
  navigation: StackNavigationProp<HerdStackParamList, 'BirdCountHistory'>;
  route?: { params?: { profileId?: string } };
};

type TabType = 'history' | 'timeline';

export const BirdCountHistoryScreen: React.FC<BirdCountHistoryScreenProps> = ({ navigation, route }) => {
  const { history, isLoading, error } = usePoultryStore();
  const { refresh } = usePoultry();
  const { profiles } = useProfileStore();
  const { birdDetections, fetchBirdDetections } = useJetsonStore();
  
  const [activeTab, setActiveTab] = useState<TabType>('history');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  // Get the profile (coop) from route params if available
  const profile = route?.params?.profileId 
    ? profiles.find(p => p.id === route.params.profileId)
    : null;
  
  const assetId = JETSON_DEVICE_ADDRESS; // Use hardcoded address instead of profile.deviceAddress

  // Fetch bird detections when timeline tab is active and we have an assetId
  useEffect(() => {
    if (activeTab === 'timeline' && assetId) {
      fetchBirdDetections(assetId, 0);
      setCurrentPage(0);
    }
  }, [activeTab, assetId, fetchBirdDetections]);

  const groupedHistory = useMemo(() => {
    const groups: { [key: string]: typeof history } = {};
    history.forEach(item => {
      const dateKey = new Date(item.timestamp).toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(item);
    });
    return Object.keys(groups).map(date => ({
      date,
      data: groups[date]
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [history]);

  // Group bird detections by date
  const groupedDetections = useMemo(() => {
    if (!assetId) return [];
    const detections = birdDetections.get(assetId) || [];
    
    const groups: { [key: string]: BirdDetection[] } = {};
    detections.forEach(item => {
      const dateKey = new Date(item.detected_at).toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(item);
    });
    
    return Object.keys(groups).map(date => ({
      date,
      data: groups[date]
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [birdDetections, assetId]);

  const formatDateLabel = (date: Date) => {
    if (isSameDay(date, new Date())) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d, yyyy');
  };

  const handleLoadMore = () => {
    if (assetId) {
      const nextPage = currentPage + 1;
      fetchBirdDetections(assetId, nextPage);
      setCurrentPage(nextPage);
    }
  };

  const renderHistoryItem = ({ item }: { item: { date: string, data: typeof history } }) => (
    <View style={styles.groupContainer}>
      <View style={styles.dateHeader}>
        <Text style={styles.dateHeaderText}>
          {formatDateLabel(new Date(item.date))}
        </Text>
      </View>
      {item.data.map((record) => (
        <PCard key={record.id} style={styles.recordCard}>
          <View style={styles.recordRow}>
            <View style={styles.timeContainer}>
              <Ionicons name="time-outline" size={16} color={Colors.mutedSienna} />
              <Text style={styles.recordTime}>{format(new Date(record.timestamp), 'h:mm a')}</Text>
            </View>
            <View style={styles.countInfo}>
              <Text style={styles.totalCount}>{record.total_birds}</Text>
              <Text style={styles.countLabel}>birds</Text>
            </View>
            <View style={[styles.intervalBadge, { backgroundColor: record.interval_birds >= 0 ? Colors.successMoss + '20' : Colors.dangerCrimson + '20' }]}>
              <Text style={[styles.intervalText, { color: record.interval_birds >= 0 ? Colors.successMoss : Colors.dangerCrimson }]}>
                {record.interval_birds > 0 ? `+${record.interval_birds}` : record.interval_birds}
              </Text>
            </View>
          </View>
          <View style={styles.recordFooter}>
            <Text style={styles.deviceIdText}>Device: {record.device_id}</Text>
          </View>
        </PCard>
      ))}
    </View>
  );

  const renderTimelineItem = ({ item }: { item: { date: string, data: BirdDetection[] } }) => (
    <View style={styles.groupContainer}>
      <View style={styles.dateHeader}>
        <Text style={styles.dateHeaderText}>
          {formatDateLabel(new Date(item.date))}
        </Text>
      </View>
      <View style={styles.detectionGrid}>
        {item.data.map((detection) => (
          <TouchableOpacity
            key={detection.id}
            style={styles.detectionThumbContainer}
            onPress={() => detection.image_url && setSelectedImage(detection.image_url)}
          >
            {detection.image_url ? (
              <Image
                source={{ uri: detection.image_url }}
                style={styles.detectionThumb}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.detectionThumbPlaceholder}>
                <Ionicons name="image-outline" size={32} color={Colors.softAsh} />
              </View>
            )}
            <Text style={styles.detectionTime}>
              {format(new Date(detection.detected_at), 'h:mm a')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderTimelineEmptyState = () => {
    if (!assetId) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="link-outline" size={48} color={Colors.softAsh} />
          <Text style={styles.emptyText}>No device linked yet</Text>
          <Text style={styles.emptySubtext}>Link a device to this coop to view photos</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons name="images-outline" size={48} color={Colors.softAsh} />
        <Text style={styles.emptyText}>No photos yet</Text>
        <Text style={styles.emptySubtext}>Once the camera detects birds, photos will show up here</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.charcoalInk} />
        </TouchableOpacity>
        <Text style={styles.title}>Count History</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'timeline' && styles.activeTab]}
          onPress={() => setActiveTab('timeline')}
        >
          <Text style={[styles.tabText, activeTab === 'timeline' && styles.activeTabText]}>Timeline</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {activeTab === 'history' ? (
        <FlatList
          data={groupedHistory}
          renderItem={renderHistoryItem}
          keyExtractor={item => item.date}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refresh} colors={[Colors.primaryRust]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color={Colors.softAsh} />
              <Text style={styles.emptyText}>No historical logs found</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={groupedDetections}
          renderItem={renderTimelineItem}
          keyExtractor={item => item.date}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={renderTimelineEmptyState()}
        />
      )}

      {/* Full-screen image modal */}
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
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          )}
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
  recordCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 90,
  },
  recordTime: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
    marginLeft: 4,
  },
  countInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  totalCount: {
    fontFamily: 'DMMono-Regular',
    fontSize: Typography.fontSize.lg,
    color: Colors.primaryRust,
    fontWeight: 'bold',
  },
  countLabel: {
    fontFamily: 'DMSans-Regular',
    fontSize: 10,
    color: Colors.mutedSienna,
    marginLeft: 2,
  },
  intervalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
    minWidth: 45,
    alignItems: 'center',
  },
  intervalText: {
    fontFamily: 'DMMono-Regular',
    fontSize: 12,
    fontWeight: 'bold',
  },
  recordFooter: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.softAsh,
  },
  deviceIdText: {
    fontFamily: 'DMMono-Regular',
    fontSize: 10,
    color: Colors.mutedSienna,
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softAsh,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primaryRust,
  },
  tabText: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.base,
    color: Colors.mutedSienna,
  },
  activeTabText: {
    color: Colors.primaryRust,
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
  detectionTime: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
    marginTop: Spacing.xs,
  },
  imageModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '80%',
  },
  closeImageButton: {
    position: 'absolute',
    top: 50,
    right: 20,
  },
});
