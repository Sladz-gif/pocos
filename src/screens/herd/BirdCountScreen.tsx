import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PCard } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { HerdStackParamList } from '../../navigation/types';
import { usePoultryStore } from '../../store/poultryStore';
import { usePoultry } from '../../hooks/usePoultry';
import { format } from 'date-fns';

type BirdCountScreenProps = {
  navigation: StackNavigationProp<HerdStackParamList, 'BirdCount'>;
};

export const BirdCountScreen: React.FC<BirdCountScreenProps> = ({ navigation }) => {
  const { liveStatus, history, isLoading, error } = usePoultryStore();
  const { refresh } = usePoultry();

  const todayRecords = useMemo(() => {
    const today = new Date().toDateString();
    return history.filter(record => new Date(record.timestamp).toDateString() === today);
  }, [history]);

  const renderDailyCountTable = () => {
    if (todayRecords.length === 0) {
      return (
        <View style={styles.emptyTable}>
          <Text style={styles.emptyTableText}>No records for today</Text>
        </View>
      );
    }

    return (
      <PCard style={styles.tableCard}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Time</Text>
          <Text style={styles.tableHeaderText}>Total Birds</Text>
          <Text style={styles.tableHeaderText}>Interval</Text>
        </View>
        {todayRecords.map((record) => (
          <View key={record.id} style={styles.tableRow}>
            <Text style={styles.tableCell}>{format(new Date(record.timestamp), 'h:mm a')}</Text>
            <Text style={styles.tableCellCount}>{record.total_birds}</Text>
            <Text style={[styles.tableCellCount, { color: record.interval_birds >= 0 ? Colors.successMoss : Colors.dangerCrimson }]}>
              {record.interval_birds > 0 ? `+${record.interval_birds}` : record.interval_birds}
            </Text>
          </View>
        ))}
      </PCard>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.charcoalInk} />
        </TouchableOpacity>
        <Text style={styles.title}>Poultry Bird Count</Text>
        <TouchableOpacity onPress={() => navigation.navigate('BirdCountHistory')}>
          <Ionicons name="time-outline" size={24} color={Colors.primaryRust} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refresh} colors={[Colors.primaryRust]} />
        }
      >
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Real-time Feed</Text>
        <Text style={styles.sectionSubtitle}>
          Real-time status from counting device
        </Text>

        <PCard style={styles.liveCard}>
          <View style={styles.liveHeader}>
            <View style={styles.liveIndicator}>
              <View style={[styles.dot, liveStatus?.is_active ? styles.dotActive : styles.dotInactive]} />
              <Text style={styles.liveStatusText}>
                {liveStatus?.is_active ? 'System Active' : 'System Offline'}
              </Text>
            </View>
            <Text style={styles.lastUpdatedText}>
              Last updated: {liveStatus?.last_updated ? format(new Date(liveStatus.last_updated), 'h:mm a') : 'N/A'}
            </Text>
          </View>

          <View style={styles.countContainer}>
            <View style={styles.countItem}>
              <Text style={styles.countLabel}>Live Count</Text>
              <Text style={styles.countValue}>{liveStatus?.total_count ?? '--'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.countItem}>
              <Text style={styles.countLabel}>Device ID</Text>
              <Text style={styles.deviceIdText}>{history[0]?.device_id ?? 'N/A'}</Text>
            </View>
          </View>
        </PCard>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Logs</Text>
          <Text style={styles.logInterval}>Recorded every 15m</Text>
        </View>
        
        {renderDailyCountTable()}
      </ScrollView>
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
  content: {
    flex: 1,
    padding: Spacing.xl,
  },
  errorContainer: {
    backgroundColor: Colors.dangerCrimson + '20',
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.lg,
  },
  errorText: {
    color: Colors.dangerCrimson,
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
  },
  sectionTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.xl,
    color: Colors.charcoalInk,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
    marginBottom: Spacing.lg,
  },
  liveCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primaryRust,
  },
  liveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  dotActive: {
    backgroundColor: Colors.successMoss,
  },
  dotInactive: {
    backgroundColor: Colors.mutedSienna,
  },
  liveStatusText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: Colors.charcoalInk,
    textTransform: 'uppercase',
  },
  lastUpdatedText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 10,
    color: Colors.mutedSienna,
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countItem: {
    flex: 1,
    alignItems: 'center',
  },
  countLabel: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
    marginBottom: 4,
  },
  countValue: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 48,
    color: Colors.primaryRust,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.softAsh,
  },
  deviceIdText: {
    fontFamily: 'DMMono-Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: Spacing.md,
  },
  logInterval: {
    fontFamily: 'DMSans-Regular',
    fontSize: 10,
    color: Colors.mutedSienna,
  },
  tableCard: {
    padding: 0,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.softAsh,
    padding: Spacing.md,
  },
  tableHeaderText: {
    flex: 1,
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: Colors.mutedSienna,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softAsh,
  },
  tableCell: {
    flex: 1,
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
    textAlign: 'center',
  },
  tableCellCount: {
    flex: 1,
    fontFamily: 'DMMono-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
    textAlign: 'center',
  },
  emptyTable: {
    padding: Spacing.xl,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.softAsh,
  },
  emptyTableText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
  },
});
