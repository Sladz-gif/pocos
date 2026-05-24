import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PCard, PBadge, PChip } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { TasksStackParamList } from '../../navigation/types';
import { useTaskStore } from '../../store/taskStore';
import { useAuthStore } from '../../store/authStore';
import { format, subDays, subWeeks, subMonths, subYears, isSameDay, isSameWeek, isSameMonth, isSameYear } from 'date-fns';

type TaskHistoryScreenProps = {
  navigation: StackNavigationProp<TasksStackParamList, 'TaskHistory'>;
};

type TimeFilter = 'all' | 'week' | 'month' | 'year' | 'custom';

interface GroupedTasks {
  [key: string]: any[];
}

export const TaskHistoryScreen: React.FC<TaskHistoryScreenProps> = ({ navigation }) => {
  const { tasks, fetchTasks } = useTaskStore();
  const { ranch } = useAuthStore();
  const [filter, setFilter] = useState<TimeFilter>('all');
  const [groupedTasks, setGroupedTasks] = useState<GroupedTasks>({});

  useEffect(() => {
    if (ranch?.id) {
      fetchTasks(ranch.id);
    }
  }, [ranch?.id, fetchTasks]);

  useEffect(() => {
    const now = new Date();
    const filtered = tasks.filter(task => {
      if (!task.updatedAt) return false;
      const taskDate = new Date(task.updatedAt);
      
      switch (filter) {
        case 'week':
          return isSameWeek(taskDate, now, { weekStartsOn: 1 });
        case 'month':
          return isSameMonth(taskDate, now);
        case 'year':
          return isSameYear(taskDate, now);
        case 'all':
        default:
          return true;
      }
    });

    // Group by date
    const grouped: GroupedTasks = {};
    filtered.forEach(task => {
      if (task.updatedAt) {
        const dateKey = format(new Date(task.updatedAt), 'MMMM yyyy');
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(task);
      }
    });

    setGroupedTasks(grouped);
  }, [tasks, filter]);

  const FILTERS = [
    { label: 'All Time', value: 'all' as TimeFilter },
    { label: 'This Week', value: 'week' as TimeFilter },
    { label: 'This Month', value: 'month' as TimeFilter },
    { label: 'This Year', value: 'year' as TimeFilter },
  ];

  const renderTask = ({ item }: { item: typeof tasks[0] }) => (
    <TouchableOpacity 
      style={styles.taskItem}
      onPress={() => navigation.navigate('TaskDetail', { id: item.id })}
    >
      <View style={styles.taskLeft}>
        <Ionicons 
          name={item.status === 'completed' ? 'checkmark-circle' : 'radio-button-off'} 
          size={20} 
          color={item.status === 'completed' ? Colors.successMoss : Colors.mutedSienna} 
        />
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle}>{item.title}</Text>
          <Text style={styles.taskDate}>
            {item.updatedAt ? format(new Date(item.updatedAt), 'MMM dd, yyyy') : 'No date'}
          </Text>
        </View>
      </View>
      <PBadge 
        text={item.status.toUpperCase()} 
        variant={item.status === 'completed' ? 'success' : 'neutral'} 
      />
    </TouchableOpacity>
  );

  const renderGroup = ({ item }: { item: { date: string; tasks: typeof tasks[0][] } }) => (
    <View style={styles.group}>
      <Text style={styles.groupDate}>{item.date}</Text>
      <Text style={styles.groupCount}>{item.tasks.length} tasks</Text>
      <View style={styles.groupTasks}>
        {item.tasks.map(task => renderTask({ item: task }))}
      </View>
    </View>
  );

  const groupData = Object.entries(groupedTasks)
    .map(([date, tasks]) => ({ date, tasks }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.charcoalInk} />
        </TouchableOpacity>
        <Text style={styles.title}>Task History</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {FILTERS.map((f) => (
            <PChip
              key={f.value}
              label={f.label}
              selected={filter === f.value}
              onPress={() => setFilter(f.value)}
              style={styles.filterChip}
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content}>
        {groupData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={Colors.softAsh} />
            <Text style={styles.emptyText}>No tasks found for this period.</Text>
          </View>
        ) : (
          groupData.map((group, index) => (
            <View key={index} style={styles.groupContainer}>
              {renderGroup({ item: group })}
            </View>
          ))
        )}
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
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.xl,
    color: Colors.charcoalInk,
  },
  filterContainer: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softAsh,
  },
  filterChip: {
    marginRight: Spacing.sm,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.base,
    color: Colors.mutedSienna,
    marginTop: Spacing.md,
  },
  groupContainer: {
    marginBottom: Spacing.xl,
  },
  group: {
    marginBottom: Spacing.lg,
  },
  groupDate: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.lg,
    color: Colors.charcoalInk,
    marginBottom: 4,
  },
  groupCount: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
    marginBottom: Spacing.md,
  },
  groupTasks: {
    gap: Spacing.sm,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.softAsh,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
    marginBottom: 2,
  },
  taskDate: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.xs,
    color: Colors.mutedSienna,
  },
});
