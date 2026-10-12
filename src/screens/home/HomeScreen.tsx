import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { useAuthStore } from '../../store/authStore';
import { useLivestockStore } from '../../store/livestockStore';
import { useTaskStore } from '../../store/taskStore';
import { useActivityLogStore, ActivityLog } from '../../store/activityLogStore';
import { useProfileStore } from '../../store/profileStore';
import { Ionicons } from '@expo/vector-icons';
import { PCard } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '../../navigation/types';
import { format } from 'date-fns';

type HomeScreenProps = {
  navigation: StackNavigationProp<HomeStackParamList, 'Home'>;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, ranch, staff, fetchStaff } = useAuthStore();
  const { animals, medicationRecords, fetchAnimals, fetchMedicationRecords } = useLivestockStore();
  const { tasks, fetchTasks, addTask } = useTaskStore();
  const { logs, fetchLogs } = useActivityLogStore();
  const { profiles, fetchProfiles } = useProfileStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showTaskInput, setShowTaskInput] = useState(false);
  const [newTask, setNewTask] = useState('');

  useFocusEffect(
    useCallback(() => {
      if (ranch?.id) {
        fetchAnimals(ranch.id);
        fetchMedicationRecords(ranch.id);
        fetchTasks(ranch.id);
        fetchLogs(ranch.id);
        fetchStaff(ranch.id);
        fetchProfiles(ranch.id);
      }
    }, [ranch?.id, fetchAnimals, fetchMedicationRecords, fetchTasks, fetchLogs, fetchStaff, fetchProfiles])
  );

  // Check if any cages exist
  const hasCages = profiles.some((profile: any) => {
    if (profile.customFields) {
      const cagesField = profile.customFields.find((f: any) => f.key === 'cages');
      if (cagesField) {
        try {
          const cages = JSON.parse(cagesField.value);
          return cages.length > 0;
        } catch (e) {
          return false;
        }
      }
    }
    return false;
  });

  // Count total cages across all profiles
  const totalCages = profiles.reduce((total, profile: any) => {
    if (profile.customFields) {
      const cagesField = profile.customFields.find((f: any) => f.key === 'cages');
      if (cagesField) {
        try {
          const cages = JSON.parse(cagesField.value);
          return total + cages.length;
        } catch (e) {
          return total;
        }
      }
    }
    return total;
  }, 0);

  const handleAddTask = async () => {
    if (newTask.trim() && ranch?.id) {
      try {
        await addTask({
          title: newTask.trim(),
          description: '',
          dueDate: format(new Date(), 'yyyy-MM-dd'),
          priority: 'medium',
          status: 'pending',
        }, ranch.id);
        setNewTask('');
        setShowTaskInput(false);
        await fetchTasks(ranch.id);
      } catch (error) {
        Alert.alert('Error', 'Failed to add task');
      }
    }
  };

  // Show all onboarded staff members
  const onboardedStaff = staff;

  // Story 2.1: Update date automatically
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      if (now.getDate() !== currentDate.getDate()) {
        setCurrentDate(now);
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [currentDate]);

  const stats = [
    {
      label: 'On Medication',
      value: medicationRecords.length.toString(),
      icon: 'medkit' as keyof typeof Ionicons.glyphMap,
      alert: medicationRecords.length > 0,
      onPress: () => navigation.navigate('FlockStack' as never)
    },
    {
      label: 'Birds on Diet',
      value: animals.filter(a => a.isSpecialFeeding).length.toString(),
      icon: 'restaurant' as keyof typeof Ionicons.glyphMap,
      onPress: () => navigation.navigate('FlockStack' as never)
    },
    {
      label: 'Tasks Due Today',
      value: tasks.filter(t => t.status !== 'completed' && t.dueDate === format(new Date(), 'yyyy-MM-dd')).length.toString(),
      icon: 'calendar' as keyof typeof Ionicons.glyphMap,
      onPress: () => navigation.navigate('TasksStack' as never)
    },
    {
      label: 'Staff On Duty',
      value: onboardedStaff.length.toString(),
      icon: 'people' as keyof typeof Ionicons.glyphMap,
      onPress: () => navigation.navigate('StaffActivityMonitor')
    },
  ];

  const renderActivityItem = ({ item }: { item: ActivityLog }) => (
    <TouchableOpacity 
      style={styles.activityItem}
      onPress={() => {
        if (item.entityType === 'animal') {
          navigation.navigate('FlockStack' as never);
        } else if (item.entityType === 'task') {
          navigation.navigate('TasksStack' as never);
        }
      }}
    >
      <View style={styles.activityDot} />
      <View style={styles.activityContent}>
        <Text style={styles.activityText}>
          <Text style={styles.activityUser}>{item.userName}</Text> {item.action}
        </Text>
        <Text style={styles.activityTime}>{format(new Date(item.createdAt), 'h:mm a')}</Text>
      </View>
      <Ionicons name="chevron-forward" size={14} color={Colors.softAsh} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.ranchTitle}>{ranch?.name || 'AmanA Farm'}</Text>
            <Text style={styles.dateText}>{format(currentDate, 'EEEE, d MMMM yyyy')}</Text>
          </View>
        </View>

        <View style={styles.userRow}>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{(user?.role || 'Staff').replace('_', ' ').toUpperCase()}</Text>
          </View>
          <Text style={styles.welcomeUser}>Hi, {user?.name}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tasks Today</Text>
            <TouchableOpacity onPress={() => setShowTaskInput(!showTaskInput)}>
              <Ionicons name={showTaskInput ? 'close' : 'add'} size={24} color={Colors.primaryRust} />
            </TouchableOpacity>
          </View>
          {showTaskInput && (
            <View style={styles.taskInputContainer}>
              <TextInput
                style={styles.taskInput}
                placeholder="Add a task..."
                value={newTask}
                onChangeText={setNewTask}
                placeholderTextColor={Colors.mutedSienna}
              />
              <TouchableOpacity style={styles.addTaskButton} onPress={handleAddTask}>
                <Ionicons name="checkmark" size={20} color={Colors.primarySurface} />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.taskList}>
            {tasks.filter(t => t.dueDate === format(new Date(), 'yyyy-MM-dd')).slice(0, 3).map((task) => (
              <PCard key={task.id} style={styles.taskCard}>
                <View style={styles.taskLeft}>
                  <Ionicons
                    name={task.status === 'completed' ? 'checkmark-circle' : 'radio-button-off'}
                    size={20}
                    color={task.status === 'completed' ? Colors.successMoss : Colors.mutedSienna}
                  />
                  <Text style={styles.taskText}>{task.title}</Text>
                </View>
                <PBadge
                  text={task.status.toUpperCase()}
                  variant={task.status === 'completed' ? 'success' : 'neutral'}
                />
              </PCard>
            ))}
            {tasks.filter(t => t.dueDate === format(new Date(), 'yyyy-MM-dd')).length === 0 && (
              <Text style={styles.emptyText}>No tasks for today</Text>
            )}
          </View>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <PCard key={index} style={styles.statCard} onPress={stat.onPress}>
              <View style={styles.statHeader}>
                <Ionicons
                  name={stat.icon as any}
                  size={20}
                  color={stat.alert ? Colors.primaryRust : Colors.mutedSienna}
                />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </PCard>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('FlockStack' as never, { screen: 'SelectAnimalType' })}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="add" size={24} color={Colors.primaryRust} />
              </View>
              <Text style={styles.actionText}>Add Bird</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('TasksStack' as never)}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="checkbox-outline" size={24} color={Colors.primaryRust} />
              </View>
              <Text style={styles.actionText}>New Task</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                if (profiles.length > 0) {
                  navigation.navigate('FlockStack' as never, { screen: 'BirdProfileDetail', params: { id: profiles[0].id } });
                } else {
                  Alert.alert('No Profiles', 'Please create a bird profile first');
                }
              }}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="stats-chart-outline" size={24} color={Colors.primaryRust} />
              </View>
              <Text style={styles.actionText}>Bird Stats</Text>
            </TouchableOpacity>
            {totalCages === 0 ? (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('FlockStack' as never, { screen: 'CreateProfile' })}
              >
                <View style={styles.actionIcon}>
                  <Ionicons name="grid-outline" size={24} color={Colors.primaryRust} />
                </View>
                <Text style={styles.actionText}>Add First Cage</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  if (profiles.length > 0) {
                    navigation.navigate('FlockStack' as never, { screen: 'BirdProfileDetail', params: { id: profiles[0].id } });
                  } else {
                    Alert.alert('No Profiles', 'Please create a bird profile first');
                  }
                }}
              >
                <View style={styles.actionIcon}>
                  <Ionicons name="grid-outline" size={24} color={Colors.primaryRust} />
                </View>
                <Text style={styles.actionText}>Add Cage</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => navigation.navigate('StaffActivityMonitor')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <PCard style={styles.activityCard}>
            {logs.slice(0, 5).map((log, index) => (
              <React.Fragment key={log.id}>
                {renderActivityItem({ item: log })}
                {index < 4 && index < logs.length - 1 && <View style={styles.activityDivider} />}
              </React.Fragment>
            ))}
            {logs.length === 0 && (
              <Text style={styles.emptyText}>No recent activity</Text>
            )}
          </PCard>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Staff On Duty</Text>
            <TouchableOpacity onPress={() => navigation.getParent()?.getParent()?.navigate('AdminModal', { screen: 'ManageTeam' })}>
              <Text style={styles.viewAllText}>Manage Team</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.staffScroll}>
            {onboardedStaff.length > 0 ? (
              onboardedStaff.map((staffMember) => (
                <TouchableOpacity key={staffMember.id} style={styles.staffItem}>
                  <View style={styles.avatarContainer}>
                    <View style={styles.avatarPlaceholder}>
                      <Text style={{ fontFamily: 'DMSans-Bold', fontSize: 18, color: Colors.mutedSienna }}>
                        {staffMember.name?.[0] || '?'}
                      </Text>
                    </View>
                    <View style={styles.onlineDot} />
                  </View>
                  <Text style={styles.staffName}>{staffMember.name?.split(' ')[0] || 'Unknown'}</Text>
                  <Text style={{ fontFamily: 'DMSans-Regular', fontSize: 9, color: Colors.mutedSienna }}>
                    {staffMember.role === 'super_admin' ? 'Admin' : staffMember.role === 'store_manager' ? 'Manager' : 'Staff'}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No staff onboarded yet.</Text>
            )}
          </ScrollView>
        </View>
      </ScrollView>
      <View style={{ height: 90 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  ranchTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 28,
    color: Colors.charcoalInk,
  },
  dateText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: Colors.mutedSienna,
    marginTop: 4,
    opacity: 0.8,
    textTransform: 'uppercase',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  roleBadge: {
    backgroundColor: Colors.primaryAccent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginRight: Spacing.md,
  },
  roleText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  welcomeUser: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: Colors.charcoalInk,
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: Spacing.lg,
  },
  statHeader: {
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 28,
    color: Colors.charcoalInk,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: Colors.mutedSienna,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: Colors.charcoalInk,
    marginBottom: Spacing.md,
  },
  taskInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  taskInput: {
    flex: 1,
    backgroundColor: Colors.primarySurface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: Colors.textPrimary,
  },
  addTaskButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryRust,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskList: {
    gap: Spacing.sm,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  taskText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: Colors.charcoalInk,
  },
  viewAllText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: Colors.primaryRust,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    width: '23%',
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primarySurface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  actionText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 10,
    color: Colors.charcoalInk,
    textAlign: 'center',
  },
  activityCard: {
    padding: Spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primaryRust,
    marginRight: Spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: Colors.charcoalInk,
  },
  activityUser: {
    fontFamily: 'DMSans-Bold',
  },
  activityTime: {
    fontFamily: 'DMSans-Regular',
    fontSize: 11,
    color: Colors.mutedSienna,
    marginTop: 2,
  },
  activityDivider: {
    height: 1,
    backgroundColor: Colors.softAsh,
    marginLeft: Spacing.xl,
  },
  staffScroll: {
    flexDirection: 'row',
  },
  staffItem: {
    alignItems: 'center',
    marginRight: Spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.xs,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.softAsh,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.successMoss,
    borderWidth: 2,
    borderColor: Colors.primarySurface,
  },
  staffName: {
    fontFamily: 'DMSans-Medium',
    fontSize: 11,
    color: Colors.charcoalInk,
  },
  emptyText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: Colors.mutedSienna,
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },
});