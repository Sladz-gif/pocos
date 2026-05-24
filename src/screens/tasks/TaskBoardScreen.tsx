import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PCard, PBadge, PChip } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { TasksStackParamList } from '../../navigation/types';
import { useTaskStore } from '../../store/taskStore';
import { useAuthStore } from '../../store/authStore';
import { useFocusEffect } from '@react-navigation/native';

import { format, isValid, parseISO, differenceInHours } from 'date-fns';

type TaskBoardScreenProps = {
  navigation: StackNavigationProp<TasksStackParamList, 'TaskBoard'>;
};

const FILTERS = ['All', 'Pending', 'In Progress', 'Completed'];

export const TaskBoardScreen: React.FC<TaskBoardScreenProps> = ({ navigation }) => {
  const { tasks, fetchTasks, filter: storeFilter, setFilter: setStoreFilter, subscribeToTasks, unsubscribeFromTasks, markTasksAsRead } = useTaskStore();
  const { ranch, staff } = useAuthStore();

  useFocusEffect(
    useCallback(() => {
      markTasksAsRead();
    }, [markTasksAsRead])
  );

  useEffect(() => {
    if (ranch?.id) {
      fetchTasks(ranch.id);
      subscribeToTasks(ranch.id);
    }
    return () => {
      unsubscribeFromTasks();
    };
  }, [ranch?.id, fetchTasks, subscribeToTasks, unsubscribeFromTasks]);

  const getAssignedName = (assignedTo: string) => {
    if (!assignedTo) return 'Unassigned';
    if (assignedTo.length > 20) {
      const assignedStaff = staff.find(s => s.id === assignedTo);
      return assignedStaff ? assignedStaff.name : 'Unknown Staff';
    }
    return assignedTo;
  };

  const getFormattedDate = (dateStr?: string) => {
    if (!dateStr) return 'No date';
    try {
      const date = parseISO(dateStr);
      if (isValid(date)) {
        return format(date, 'MMM d');
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (storeFilter === 'all') return true;
    return task.status === storeFilter;
  });

  const renderTask = ({ item }: { item: typeof tasks[0] }) => {
    const isNew = item.createdAt && differenceInHours(new Date(), new Date(item.createdAt)) < 24;

    return (
      <TouchableOpacity onPress={() => navigation.navigate('TaskDetail', { id: item.id })}>
        <PCard style={styles.taskCard}>
          <View style={styles.taskHeader}>
            <View style={styles.titleContainer}>
              <Text style={styles.taskTitle}>{item.title}</Text>
              {isNew && item.status !== 'completed' && (
                <View style={styles.newTag}>
                  <Text style={styles.newTagText}>NEW</Text>
                </View>
              )}
            </View>
            <PBadge 
              text={item.priority.toUpperCase()} 
              variant={item.priority === 'urgent' || item.priority === 'high' ? 'error' : 'info'} 
            />
          </View>
          <View style={styles.taskFooter}>
            <View style={styles.taskInfo}>
              <Ionicons name="person-outline" size={14} color={Colors.mutedSienna} />
              <Text style={styles.infoText}>{getAssignedName(item.assignedTo)}</Text>
            </View>
            <View style={styles.taskInfo}>
              <Ionicons name="calendar-outline" size={14} color={Colors.mutedSienna} />
              <Text style={styles.infoText}>{getFormattedDate(item.dueDate)}</Text>
            </View>
            <PBadge 
              text={item.status.replace('_', ' ').toUpperCase()} 
              variant={item.status === 'completed' ? 'success' : 'neutral'} 
            />
          </View>
        </PCard>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Task Board</Text>
          <Text style={styles.subtitle}>Manage ranch operations</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.historyButton}
            onPress={() => navigation.navigate('TaskHistory')}
          >
            <Ionicons name="calendar-outline" size={24} color={Colors.primaryRust} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('CreateTask')}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          renderItem={({ item }) => (
            <PChip
              label={item}
              selected={(storeFilter === 'all' && item === 'All') || (storeFilter === item.toLowerCase().replace(' ', '_'))}
              onPress={() => {
                const newFilter = item === 'All' ? 'all' : item.toLowerCase().replace(' ', '_') as any;
                setStoreFilter(newFilter);
              }}
            />
          )}
          keyExtractor={item => item}
          contentContainerStyle={styles.filterList}
        />
      </View>

      <FlatList
        data={filteredTasks}
        renderItem={renderTask}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="clipboard-outline" size={64} color={Colors.softAsh} />
            <Text style={styles.emptyText}>No tasks found in this category.</Text>
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
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize['2xl'],
    color: Colors.charcoalInk,
  },
  subtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  historyButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.warmSand,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notesButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.warmSand,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: Colors.primaryRust,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    marginBottom: Spacing.md,
  },
  filterList: {
    paddingHorizontal: Spacing.xl,
  },
  listContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing['4xl'],
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
  taskCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginRight: Spacing.md,
  },
  newTag: {
    backgroundColor: Colors.primaryRust,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newTagText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 8,
    color: '#FFFFFF',
  },
  taskTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.lg,
    color: Colors.charcoalInk,
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  taskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.xs,
    color: Colors.mutedSienna,
  },
});
