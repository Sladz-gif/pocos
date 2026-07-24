import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PCard, PButton } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { AdminStackParamList, AuthStackParamList } from '../../navigation/types';
import { supabase } from '../../config/supabase';
import { useJetsonStore } from '../../store/jetsonStore';
import { useProfileStore } from '../../store/profileStore';
import { useAuthStore } from '../../store/authStore';
import { Asset, DeviceTestSnapshot } from '../../types';
import { format, isWithinInterval, subHours } from 'date-fns';

type DeviceHealthCheckScreenProps = {
  navigation: StackNavigationProp<AdminStackParamList & AuthStackParamList, any>;
};

interface DeviceWithCoop extends Asset {
  coopName?: string;
  latestSnapshot?: DeviceTestSnapshot;
}

export const DeviceHealthCheckScreen: React.FC<DeviceHealthCheckScreenProps> = ({ navigation }) => {
  const { userRole } = useAuthStore();
  const { assets, fetchAssets, fetchTestSnapshots, requestTestSnapshot, error, clearError } = useJetsonStore();
  const { profiles } = useProfileStore();
  const [refreshing, setRefreshing] = useState(false);
  const [devicesWithCoops, setDevicesWithCoops] = useState<DeviceWithCoop[]>([]);
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const isAuthorizedRole = userRole === 'super_admin' || userRole === 'ranch_owner' || userRole === 'staff' || userRole === 'store_manager';

  useEffect(() => {
    let isMounted = true;

    const syncSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (isMounted) {
        setHasSession(!!session);
      }
    };

    syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setHasSession(!!session);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Combine assets with their coops and latest snapshots
    const combined: DeviceWithCoop[] = assets.map(asset => {
      const coop = profiles.find(p => p.deviceAddress === asset.asset_id);
      const snapshots = useJetsonStore.getState().testSnapshots.get(asset.asset_id) || [];
      const latestSnapshot = snapshots.length > 0 ? snapshots[0] : undefined;
      
      return {
        ...asset,
        coopName: coop?.name,
        latestSnapshot,
      };
    });
    setDevicesWithCoops(combined);
  }, [assets, profiles]);

  const loadData = useCallback(async () => {
    if (!hasSession || !isAuthorizedRole) {
      return;
    }

    setRefreshing(true);
    clearError();
    try {
      await fetchAssets();
      const latestAssets = useJetsonStore.getState().assets;
      await Promise.all(latestAssets.map((asset) => fetchTestSnapshots(asset.asset_id)));
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  }, [clearError, fetchAssets, fetchTestSnapshots, hasSession, isAuthorizedRole]);

  useEffect(() => {
    if (hasSession && isAuthorizedRole) {
      loadData();
    } else if (hasSession === false || !isAuthorizedRole) {
      setDevicesWithCoops([]);
    }
  }, [hasSession, isAuthorizedRole, loadData]);

  const handleRequestSnapshot = async (assetId: string) => {
    try {
      const success = await requestTestSnapshot(assetId);
      if (success) {
        Alert.alert('Success', 'Test snapshot requested! The device will upload a photo when it next syncs.');
      } else {
        Alert.alert('Error', 'Failed to request test snapshot.');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to request test snapshot.');
    }
  };

  const isOnline = (asset: Asset) => {
    if (!asset.last_seen_at) return false;
    const now = new Date();
    const twoHoursAgo = subHours(now, 2);
    return isWithinInterval(new Date(asset.last_seen_at), { start: twoHoursAgo, end: now });
  };

  const renderDeviceItem = ({ item }: { item: DeviceWithCoop }) => {
    const online = isOnline(item);
    
    return (
      <PCard style={styles.deviceCard}>
        <View style={styles.deviceHeader}>
          <View style={styles.deviceInfo}>
            <View style={[styles.statusDot, online ? styles.statusOnline : styles.statusOffline]} />
            <View>
              <Text style={styles.deviceName}>
                {item.coopName || 'Unnamed Device'}
              </Text>
              <Text style={styles.deviceId}>{item.asset_id}</Text>
            </View>
          </View>
          <Text style={[styles.statusText, online ? styles.statusTextOnline : styles.statusTextOffline]}>
            {online ? 'Online' : 'Offline'}
          </Text>
        </View>

        {item.latestSnapshot && (
          <View style={styles.snapshotContainer}>
            {item.latestSnapshot.image_url ? (
              <Image
                source={{ uri: item.latestSnapshot.image_url }}
                style={styles.snapshotImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.snapshotPlaceholder}>
                <Ionicons name="camera-outline" size={40} color={Colors.softAsh} />
              </View>
            )}
            <View style={styles.snapshotMeta}>
              <Text style={styles.snapshotTime}>
                {format(new Date(item.latestSnapshot.captured_at), 'MMM d, h:mm a')}
              </Text>
              <View style={styles.diagnosticsRow}>
                {item.latestSnapshot.cpu_temp_c !== undefined && (
                  <Text style={styles.diagnosticText}>
                    CPU: {item.latestSnapshot.cpu_temp_c.toFixed(1)}°C
                  </Text>
                )}
                {item.latestSnapshot.fps !== undefined && (
                  <Text style={styles.diagnosticText}>
                    FPS: {item.latestSnapshot.fps.toFixed(1)}
                  </Text>
                )}
                {item.latestSnapshot.uptime_seconds !== undefined && (
                  <Text style={styles.diagnosticText}>
                    Uptime: {Math.floor(item.latestSnapshot.uptime_seconds / 3600)}h
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        <View style={styles.backlogContainer}>
          <View style={styles.backlogItem}>
            <Ionicons name="images-outline" size={16} color={Colors.mutedSienna} />
            <Text style={styles.backlogText}>
              {item.pending_images_on_disk || 0} pending images
            </Text>
          </View>
          <View style={styles.backlogItem}>
            <Ionicons name="analytics-outline" size={16} color={Colors.mutedSienna} />
            <Text style={styles.backlogText}>
              {item.unsynced_detections || 0} unsynced detections
            </Text>
          </View>
        </View>

        <PButton
          title={item.pending_test_snapshot ? "Snapshot Requested..." : "Request Test Snapshot"}
          onPress={() => handleRequestSnapshot(item.asset_id)}
          style={styles.requestButton}
          disabled={item.pending_test_snapshot}
        />
      </PCard>
    );
  };

  const onlineCount = devicesWithCoops.filter(isOnline).length;
  const totalCount = devicesWithCoops.length;

  const renderGuardState = (icon: keyof typeof Ionicons.glyphMap, title: string, subtitle: string, buttonTitle?: string, onPress?: () => void) => (
    <View style={styles.guardState}>
      <Ionicons name={icon} size={48} color={Colors.softAsh} />
      <Text style={styles.guardTitle}>{title}</Text>
      <Text style={styles.guardSubtitle}>{subtitle}</Text>
      {buttonTitle && onPress ? (
        <PButton title={buttonTitle} onPress={onPress} style={styles.guardButton} />
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.charcoalInk} />
        </TouchableOpacity>
        <Text style={styles.title}>Device Health</Text>
        <View style={{ width: 24 }} />
      </View>

      {hasSession === null ? (
        <View style={styles.guardState}>
          <ActivityIndicator color={Colors.primaryRust} />
          <Text style={styles.guardSubtitle}>Checking session...</Text>
        </View>
      ) : !hasSession ? (
        <View style={styles.guardState}>
          <Ionicons name="lock-closed-outline" size={48} color={Colors.softAsh} />
          <Text style={styles.guardTitle}>Log in to view device health</Text>
          <Text style={styles.guardSubtitle}>
            Device health uses your authenticated ranch session. Sign in with your owner or staff account to continue.
          </Text>
          <View style={{ width: '100%', maxWidth: 280, gap: Spacing.sm, marginTop: Spacing.xl }}>
            <PButton
              title="Owner Login"
              onPress={() => navigation.navigate('RanchOwnerLogin')}
            />
            <PButton
              title="Ranch Access Login"
              variant="outline"
              onPress={() => navigation.navigate('RanchLogin')}
            />
          </View>
        </View>
      ) : !isAuthorizedRole ? (
        renderGuardState(
          'shield-outline',
          'Owner or admin access required',
          'This hidden installer screen is limited to ranch owners and super admins.'
        )
      ) : (
        <>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>
          {onlineCount} of {totalCount} devices online
        </Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={devicesWithCoops}
        renderItem={renderDeviceItem}
        keyExtractor={(item) => item.asset_id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadData} colors={[Colors.primaryRust]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="hardware-chip-outline" size={48} color={Colors.softAsh} />
            <Text style={styles.emptyText}>No devices found</Text>
            <Text style={styles.emptySubtext}>Link a device to a coop to see it here</Text>
          </View>
        }
      />
        </>
      )}
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
  guardState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  guardTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.xl,
    color: Colors.charcoalInk,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  guardSubtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.mutedSienna,
    marginTop: Spacing.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
  guardButton: {
    marginTop: Spacing.xl,
    minWidth: 180,
  },
  summaryCard: {
    backgroundColor: Colors.primaryRust + '10',
    padding: Spacing.md,
    margin: Spacing.xl,
    marginBottom: Spacing.sm,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  summaryText: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.primaryRust,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  deviceCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusOnline: {
    backgroundColor: Colors.successMoss,
  },
  statusOffline: {
    backgroundColor: Colors.mutedSienna,
  },
  deviceName: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.lg,
    color: Colors.charcoalInk,
  },
  deviceId: {
    fontFamily: 'DMMono-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
  },
  statusText: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.sm,
  },
  statusTextOnline: {
    color: Colors.successMoss,
  },
  statusTextOffline: {
    color: Colors.mutedSienna,
  },
  snapshotContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  snapshotImage: {
    width: 100,
    height: 100,
    borderRadius: Radius.md,
    backgroundColor: Colors.softAsh,
  },
  snapshotPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: Radius.md,
    backgroundColor: Colors.softAsh,
    justifyContent: 'center',
    alignItems: 'center',
  },
  snapshotMeta: {
    flex: 1,
    justifyContent: 'center',
  },
  snapshotTime: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
    marginBottom: Spacing.xs,
  },
  diagnosticsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  diagnosticText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
  },
  backlogContainer: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  backlogItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  backlogText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
  },
  requestButton: {
    marginTop: Spacing.sm,
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
});
