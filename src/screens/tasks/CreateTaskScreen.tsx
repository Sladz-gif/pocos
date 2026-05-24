import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, TextInput, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PInput, PButton, PChip, PModal } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { TasksStackParamList } from '../../navigation/types';
import { useTaskStore } from '../../store/taskStore';
import { useAuthStore } from '../../store/authStore';
import { useActivityLogStore } from '../../store/activityLogStore';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';

type CreateTaskScreenProps = {
  navigation: StackNavigationProp<TasksStackParamList, 'CreateTask'>;
};

const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const RECURRENCE = ['None', 'Daily', 'Weekly', 'Custom'];

export const CreateTaskScreen: React.FC<CreateTaskScreenProps> = ({ navigation }) => {
  const { ranch, staff, fetchStaff, user } = useAuthStore();
  const { addTask } = useTaskStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [assignedTo, setAssignedTo] = useState('');
  const [assignedToName, setAssignedToName] = useState('');
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [recurrence, setRecurrence] = useState('None');

  useEffect(() => {
    if (ranch?.id) {
      fetchStaff(ranch.id);
    }
  }, [ranch?.id, fetchStaff]);
  
  // Story 4.1: Subtasks entry flow
  const [subtasks, setSubtasks] = useState<string[]>(['']);
  const subtaskRefs = useRef<(TextInput | null)[]>([]);

  const handleCreate = async () => {
    if (!title.trim() || !ranch?.id) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    const taskData: any = {
      title: title.trim(),
      description: description.trim(),
      notes: notes.trim(),
      priority: priority.toLowerCase(),
      dueDate: dueDate.toISOString(),
      assignedTo: assignedTo || null,
      subtasks: subtasks,
    };

    try {
      await addTask(taskData, ranch.id);
      
      // Log activity manually here since addTask in store doesn't have user name yet
      useActivityLogStore.getState().logActivity({
        userId: user?.id,
        userName: user?.name || 'Admin',
        action: `created task: ${title}`,
        entityType: 'task',
        ranchId: ranch.id,
      });

      Alert.alert('Success', 'Task created successfully');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create task');
    }
  };

  const handleSubtaskChange = (text: string, index: number) => {
    const newSubtasks = [...subtasks];
    newSubtasks[index] = text;
    setSubtasks(newSubtasks);
  };

  const handleSubtaskSubmit = (index: number) => {
    // Story 4.1: If hits 'Return', add new subtask field
    if (index === subtasks.length - 1 && subtasks[index].trim() !== '') {
      setSubtasks([...subtasks, '']);
      // Timeout to wait for the new field to render
      setTimeout(() => {
        subtaskRefs.current[index + 1]?.focus();
      }, 100);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color={Colors.charcoalInk} />
          </TouchableOpacity>
          <Text style={styles.title}>New Task</Text>
          <TouchableOpacity onPress={handleCreate} disabled={!title.trim()}>
            <Text style={[styles.saveText, !title.trim() && { opacity: 0.5 }]}>Create</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <PInput 
              label="Task Title" 
              placeholder="e.g. Repair fence" 
              value={title}
              onChangeText={setTitle}
              autoFocus
            />
            
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Priority</Text>
              <View style={styles.chipRow}>
                {PRIORITIES.map(p => (
                  <PChip 
                    key={p} 
                    label={p} 
                    selected={p === priority} 
                    onPress={() => setPriority(p)}
                  />
                ))}
              </View>
            </View>

            <PInput 
              label="Due Date & Time" 
              value={format(dueDate, 'MMMM d, yyyy • h:mm a')}
              onPress={() => setDatePickerVisibility(true)}
              editable={false}
            />

            <PInput 
              label="Assign To" 
              placeholder="Select staff member" 
              value={assignedToName}
              onPress={() => setShowStaffModal(true)}
              editable={false}
            />

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Subtasks</Text>
              {subtasks.map((subtask, index) => (
                <View key={index} style={styles.subtaskRow}>
                  <Ionicons name="ellipse-outline" size={16} color={Colors.mutedSienna} />
                  <TextInput
                    ref={el => subtaskRefs.current[index] = el}
                    style={styles.subtaskInput}
                    placeholder="Add a subtask..."
                    value={subtask}
                    onChangeText={(text) => handleSubtaskChange(text, index)}
                    onSubmitEditing={() => handleSubtaskSubmit(index)}
                    blurOnSubmit={false}
                    returnKeyType="next"
                  />
                  {subtasks.length > 1 && (
                    <TouchableOpacity onPress={() => setSubtasks(subtasks.filter((_, i) => i !== index))}>
                      <Ionicons name="close-circle" size={16} color={Colors.softAsh} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Recurrence</Text>
              <View style={styles.chipRow}>
                {RECURRENCE.map(r => (
                  <PChip 
                    key={r} 
                    label={r} 
                    selected={r === recurrence} 
                    onPress={() => setRecurrence(r)}
                  />
                ))}
              </View>
            </View>

            <PInput 
              label="Description" 
              placeholder="Detailed description of the task..." 
              multiline 
              numberOfLines={4} 
              value={description}
              onChangeText={setDescription}
            />

            <PInput 
              label="Task Notes" 
              placeholder="Any specific notes for this task..." 
              multiline 
              numberOfLines={4} 
              value={notes}
              onChangeText={setNotes}
            />

            <PButton 
              title="Create Task" 
              onPress={handleCreate} 
              style={styles.submitButton}
              disabled={!title.trim()}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        onConfirm={(date) => {
          setDueDate(date);
          setDatePickerVisibility(false);
        }}
        onCancel={() => setDatePickerVisibility(false)}
        date={dueDate}
      />

      <PModal
        visible={showStaffModal}
        onClose={() => setShowStaffModal(false)}
        title="Assign Task"
      >
        <FlatList
          data={staff}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.staffItem}
              onPress={() => {
                setAssignedTo(item.id);
                setAssignedToName(item.name);
                setShowStaffModal(false);
              }}
            >
              <View style={styles.staffAvatar}>
                <Text style={styles.avatarText}>{item.name[0]}</Text>
              </View>
              <View>
                <Text style={styles.staffName}>{item.name}</Text>
                <Text style={styles.staffRole}>{item.role.replace('_', ' ')}</Text>
              </View>
              {assignedTo === item.id && (
                <Ionicons name="checkmark-circle" size={24} color={Colors.primaryRust} style={{ marginLeft: 'auto' }} />
              )}
            </TouchableOpacity>
          )}
        />
      </PModal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.paleParchment,
  },
  flex: {
    flex: 1,
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
  saveText: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.primaryRust,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
    marginBottom: Spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.md,
    height: 44,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.softAsh,
  },
  subtaskInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: Colors.charcoalInk,
  },
  submitButton: {
    marginTop: Spacing.xl,
    marginBottom: Spacing['4xl'],
  },
  staffItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softAsh,
  },
  staffAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.warmSand,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: Colors.primaryRust,
  },
  staffName: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
  },
  staffRole: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.xs,
    color: Colors.mutedSienna,
    textTransform: 'capitalize',
  },
});