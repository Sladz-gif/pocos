import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PCard, PBadge, PEmptyState } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '../../navigation/types';
import { useActivityLogStore } from '../../store/activityLogStore';
import { useAuthStore } from '../../store/authStore';
import { formatDate, formatTime } from '../../utils/date';

type StaffActivityMonitorScreenProps = {
  navigation: StackNavigationProp<HomeStackParamList, 'StaffActivityMonitor'>;
};

export const StaffActivityMonitorScreen: React.FC<StaffActivityMonitorScreenProps> = ({ navigation }) => {
  const { logs, fetchLogs, isLoading } = useActivityLogStore();
  const { ranch } = useAuthStore();

  useEffect(() => {
    if (ranch?.id) {
      fetchLogs(ranch.id);
    }
  }, [ranch?.id, fetchLogs]);

  const renderItem = ({ item }: { item: any }) => (
    <PCard style={styles.activityCard}>
      <View style={styles.activityIcon}>
        <Ionicons name="person" size={20} color={Colors.primaryRust} />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityUser}>{item.userName}</Text>
        <Text style={styles.activityAction}>{item.action}</Text>
        <Text style={styles.activityTime}>{formatDate(item.createdAt)} • {formatTime(item.createdAt)}</Text>
      </View>
    </PCard>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.charcoalInk} />
        </TouchableOpacity>
        <Text style={styles.title}>Activity Monitor</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={logs}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.headerTitle}>Live Activity</Text>
            <Text style={styles.headerSubtitle}>Real-time monitoring of ranch operations</Text>
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <PEmptyState 
              icon="eye-outline" 
              title="No activity recorded" 
              message="When staff members take actions, they will show up here in real-time." 
            />
          ) : null
        }
      />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softAsh,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.xl,
    color: Colors.charcoalInk,
  },
  listContent: {
    padding: Spacing.xl,
  },
  listHeader: {
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.lg,
    color: Colors.charcoalInk,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
  },
  activityCard: {
    flexDirection: 'row',
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.warmSand,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  activityContent: {
    flex: 1,
  },
  activityUser: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
    marginBottom: 2,
  },
  activityAction: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
    marginBottom: 4,
  },
  activityTime: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.xs,
    color: Colors.mutedSienna,
    opacity: 0.7,
  },
  emptyState: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.mutedSienna,
  },
});
