import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PCard } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { HerdStackParamList } from '../../navigation/types';
import { usePoultryStore } from '../../store/poultryStore';
import { usePoultry } from '../../hooks/usePoultry';
import { format, isSameDay } from 'date-fns';

type BirdCountHistoryScreenProps = {
  navigation: StackNavigationProp<HerdStackParamList, 'BirdCountHistory'>;
};

export const BirdCountHistoryScreen: React.FC<BirdCountHistoryScreenProps> = ({ navigation }) => {
  const { history, isLoading, error } = usePoultryStore();
  const { refresh } = usePoultry();

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

  const renderItem = ({ item }: { item: { date: string, data: typeof history } }) => (
    <View style={styles.groupContainer}>
      <View style={styles.dateHeader}>
        <Text style={styles.dateHeaderText}>
          {isSameDay(new Date(item.date), new Date()) ? 'Today' : format(new Date(item.date), 'MMMM d, yyyy')}
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.charcoalInk} />
        </TouchableOpacity>
        <Text style={styles.title}>Full Count History</Text>
        <View style={{ width: 24 }} />
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={groupedHistory}
        renderItem={renderItem}
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
});
