import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Image, Dimensions, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useCoopTimeline } from '../../hooks/useCoops';
import type { BirdDetectionEvent } from '../../types/coop';
import { format } from 'date-fns';

const { width: screenWidth } = Dimensions.get('window');

type CoopTimelineScreenProps = {
  navigation: StackNavigationProp<any, any>;
  route?: { params?: { profileId?: string; deviceAddress?: string; coopName?: string } };
};

export const CoopTimelineScreen: React.FC<CoopTimelineScreenProps> = ({ navigation, route }) => {
  const assetId = route?.params?.deviceAddress;
  const coopName = route?.params?.coopName || 'Coop';
  const { groupedEntries, isLoading, error, refresh } = useCoopTimeline(assetId);
  const [selectedImage, setSelectedImage] = useState<BirdDetectionEvent | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

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
});
