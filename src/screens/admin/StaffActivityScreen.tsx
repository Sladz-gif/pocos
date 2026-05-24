import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PCard, PBadge, PEmptyState } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { AdminStackParamList } from '../../navigation/types';
import { useActivityLogStore } from '../../store/activityLogStore';
import { useAuthStore } from '../../store/authStore';
import { formatDate, formatTime } from '../../utils/date';

type StaffActivityScreenProps = {
  navigation: StackNavigationProp<AdminStackParamList, 'StaffActivity'>;
};

export const StaffActivityScreen: React.FC<StaffActivityScreenProps> = ({ navigation }) => {
  const { logs, fetchLogs, isLoading } = useActivityLogStore();
  const { ranch } = useAuthStore();

  useEffect(() => {
    if (ranch?.id) {
      fetchLogs(ranch.id);
    }
  }, [ranch?.id, fetchLogs]);

  const renderLog = ({ item }: { item: any }) => (
    <PCard style={styles.logCard}>
      <View style={styles.logHeader}>
        <Text style={styles.logUser}>{item.userName}</Text>
        <Text style={styles.logTime}>{formatDate(item.createdAt)}, {formatTime(item.createdAt)}</Text>
      </View>
      <Text style={styles.logAction}>{item.action}</Text>
    </PCard>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.charcoalInk} />
        </TouchableOpacity>
        <Text style={styles.title}>Activity Log</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={logs}
        renderItem={renderLog}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.headerTitle}>Global Activity Log</Text>
            <Text style={styles.headerSubtitle}>Complete history of all ranch operations</Text>
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <PEmptyState 
              title="No activity yet" 
              message="Team actions and ranch updates will appear here."
              icon="analytics-outline"
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.softAsh,
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.xl,
    color: Colors.charcoalInk,
  },
  listHeader: {
    marginBottom: Spacing.xl,
  },
  headerTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.xl,
    color: Colors.charcoalInk,
  },
  headerSubtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
  },
  listContent: {
    padding: Spacing.xl,
  },
  logCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  logUser: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
  },
  logTime: {
    fontFamily: 'DMSans-Regular',
    fontSize: 10,
    color: Colors.mutedSienna,
  },
  logAction: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
  },
});
