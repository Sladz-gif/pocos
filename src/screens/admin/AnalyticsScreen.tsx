import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PCard, PBadge, PChip, PEmptyState } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { AdminStackParamList } from '../../navigation/types';
import { useAnalyticsStore, AnalyticsSnapshot } from '../../store/analyticsStore';
import { useAuthStore } from '../../store/authStore';
import { format, isSameWeek, isSameMonth, isSameYear } from 'date-fns';
import { LineChart, BarChart } from 'react-native-gifted-charts';

type AnalyticsScreenProps = {
  navigation: StackNavigationProp<AdminStackParamList, 'Analytics'>;
};

type TimeFilter = 'all' | 'week' | 'month' | 'year';

const screenWidth = Dimensions.get('window').width;

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ navigation }) => {
  const { current, snapshots, fetchSnapshots, computeCurrent, isLoading } = useAnalyticsStore();
  const { ranch } = useAuthStore();
  const [filter, setFilter] = useState<TimeFilter>('month');
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

  useEffect(() => {
    if (ranch?.id) {
      computeCurrent(ranch.id);
      fetchSnapshots(ranch.id);
    }
  }, [ranch?.id, computeCurrent, fetchSnapshots]);

  const filteredSnapshots = snapshots.filter(s => {
    const date = new Date(s.snapshotDate);
    const now = new Date();
    switch (filter) {
      case 'week': return isSameWeek(date, now);
      case 'month': return isSameMonth(date, now);
      case 'year': return isSameYear(date, now);
      default: return true;
    }
  }).sort((a, b) => new Date(a.snapshotDate).getTime() - new Date(b.snapshotDate).getTime());

  const revenueData = filteredSnapshots.map(s => ({
    value: s.totalRevenue,
    label: format(new Date(s.snapshotDate), 'dd/MM'),
  }));

  const animalData = filteredSnapshots.map(s => ({
    value: s.totalAnimals,
    label: format(new Date(s.snapshotDate), 'dd/MM'),
    frontColor: Colors.primaryRust,
  }));

  const renderOverview = () => (
    <ScrollView style={styles.content}>
      <View style={styles.metricsGrid}>
        <PCard style={styles.metricCard}>
          <Text style={styles.metricLabel}>Total Revenue</Text>
          <Text style={styles.metricValue}>GHS {current?.totalRevenue.toLocaleString() || '0'}</Text>
          <View style={styles.trendRow}>
            <Ionicons name="trending-up" size={16} color={Colors.successMoss} />
            <Text style={styles.trendText}>+12% vs last month</Text>
          </View>
        </PCard>
        <PCard style={styles.metricCard}>
          <Text style={styles.metricLabel}>Total Animals</Text>
          <Text style={styles.metricValue}>{current?.totalAnimals || '0'}</Text>
          <Text style={styles.metricSubtext}>{current?.totalPregnancies || '0'} active pregnancies</Text>
        </PCard>
      </View>

      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Revenue Growth</Text>
        {revenueData.length > 0 ? (
          <View style={styles.chartWrapper}>
            <LineChart
              data={revenueData}
              width={screenWidth - Spacing.xl * 4}
              height={200}
              color={Colors.primaryRust}
              thickness={3}
              dataPointsColor={Colors.deepPlum}
              noOfSections={4}
              yAxisTextStyle={styles.axisText}
              xAxisLabelTextStyle={styles.axisText}
              hideRules
              curved
            />
          </View>
        ) : (
          <View style={styles.emptyChart}>
            <Text style={styles.emptyText}>Not enough data for chart</Text>
          </View>
        )}
      </View>

      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Livestock Population</Text>
        {animalData.length > 0 ? (
          <View style={styles.chartWrapper}>
            <BarChart
              data={animalData}
              width={screenWidth - Spacing.xl * 4}
              height={200}
              barWidth={22}
              noOfSections={4}
              barBorderRadius={4}
              frontColor={Colors.primaryRust}
              yAxisTextStyle={styles.axisText}
              xAxisLabelTextStyle={styles.axisText}
              hideRules
            />
          </View>
        ) : (
          <View style={styles.emptyChart}>
            <Text style={styles.emptyText}>Not enough data for chart</Text>
          </View>
        )}
      </View>

      <View style={styles.bottomStats}>
        <PCard style={styles.statRow}>
          <View style={styles.statInfo}>
            <Ionicons name="checkbox-outline" size={24} color={Colors.primaryRust} />
            <View style={styles.statText}>
              <Text style={styles.statLabel}>Task Completion Rate</Text>
              <Text style={styles.statSub}>Total: {current ? current.pendingTasks + current.completedTasks : 0} tasks</Text>
            </View>
          </View>
          <Text style={styles.statValue}>
            {current && (current.pendingTasks + current.completedTasks) > 0 
              ? Math.round((current.completedTasks / (current.pendingTasks + current.completedTasks)) * 100)
              : 0}%
          </Text>
        </PCard>
      </View>
    </ScrollView>
  );

  const renderHistory = () => {
    // Group by month
    const grouped: { [key: string]: AnalyticsSnapshot[] } = {};
    snapshots.forEach(s => {
      const key = format(new Date(s.snapshotDate), 'MMMM yyyy');
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(s);
    });

    return (
      <ScrollView style={styles.content}>
        {Object.keys(grouped).length > 0 ? (
          Object.keys(grouped).map(month => (
            <View key={month} style={styles.historyGroup}>
              <Text style={styles.historyMonth}>{month}</Text>
              {grouped[month].map(s => (
                <PCard key={s.id} style={styles.historyItem}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyDate}>{format(new Date(s.snapshotDate), 'MMM dd, yyyy')}</Text>
                    <PBadge text="SNAPSHOT" variant="neutral" />
                  </View>
                  <View style={styles.historyGrid}>
                    <View style={styles.historyStat}>
                      <Text style={styles.hStatVal}>GHS {s.totalRevenue}</Text>
                      <Text style={styles.hStatLab}>Revenue</Text>
                    </View>
                    <View style={styles.historyStat}>
                      <Text style={styles.hStatVal}>{s.totalAnimals}</Text>
                      <Text style={styles.hStatLab}>Animals</Text>
                    </View>
                    <View style={styles.historyStat}>
                      <Text style={styles.hStatVal}>{s.completedTasks}</Text>
                      <Text style={styles.hStatLab}>Tasks Done</Text>
                    </View>
                  </View>
                </PCard>
              ))}
            </View>
          ))
        ) : (
          <PEmptyState 
            icon="time-outline"
            title="No history yet"
            message="Analytics snapshots will appear here over time as your ranch grows."
          />
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.charcoalInk} />
        </TouchableOpacity>
        <Text style={styles.title}>Ranch Analytics</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>History</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'overview' && (
        <View style={styles.filterBar}>
          {['week', 'month', 'year', 'all'].map((f) => (
            <PChip
              key={f}
              label={f.toUpperCase()}
              selected={filter === f}
              onPress={() => setFilter(f as TimeFilter)}
            />
          ))}
        </View>
      )}

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primaryRust} />
        </View>
      ) : activeTab === 'overview' ? renderOverview() : renderHistory()}
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
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.xl,
    color: Colors.charcoalInk,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softAsh,
  },
  tab: {
    paddingVertical: Spacing.md,
    marginRight: Spacing.xl,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
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
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  metricCard: {
    flex: 1,
    padding: Spacing.lg,
  },
  metricLabel: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.xs,
    color: Colors.mutedSienna,
    marginBottom: Spacing.xs,
  },
  metricValue: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.lg,
    color: Colors.charcoalInk,
    marginBottom: Spacing.xs,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 10,
    color: Colors.successMoss,
  },
  metricSubtext: {
    fontFamily: 'DMSans-Regular',
    fontSize: 10,
    color: Colors.mutedSienna,
  },
  chartSection: {
    marginTop: Spacing.xl,
    backgroundColor: '#FFFFFF',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    ...Shadows.sm,
  },
  sectionTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
    marginBottom: Spacing.lg,
  },
  chartWrapper: {
    alignItems: 'center',
    paddingRight: Spacing.md,
  },
  axisText: {
    fontSize: 10,
    color: Colors.mutedSienna,
  },
  emptyChart: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'DMSans-Regular',
    color: Colors.mutedSienna,
  },
  bottomStats: {
    marginTop: Spacing.xl,
    marginBottom: Spacing['3xl'],
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  statInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  statText: {
    gap: 2,
  },
  statLabel: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
  },
  statSub: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.xs,
    color: Colors.mutedSienna,
  },
  statValue: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.xl,
    color: Colors.primaryRust,
  },
  historyGroup: {
    marginTop: Spacing.xl,
  },
  historyMonth: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
  },
  historyItem: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softAsh,
  },
  historyDate: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
  },
  historyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyStat: {
    alignItems: 'flex-start',
  },
  hStatVal: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
  },
  hStatLab: {
    fontFamily: 'DMSans-Regular',
    fontSize: 10,
    color: Colors.mutedSienna,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
