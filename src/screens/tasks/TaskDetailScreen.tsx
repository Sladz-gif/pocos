import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PCard, PBadge, PButton, PModal } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { TasksStackParamList } from '../../navigation/types';
import { RouteProp } from '@react-navigation/native';
import { useTaskStore } from '../../store/taskStore';
import { useAuthStore } from '../../store/authStore';

import { format, isValid, parseISO } from 'date-fns';

type TaskDetailScreenProps = {
  route: RouteProp<TasksStackParamList, 'TaskDetail'>;
  navigation: StackNavigationProp<TasksStackParamList, 'TaskDetail'>;
};

export const TaskDetailScreen: React.FC<TaskDetailScreenProps> = ({ route, navigation }) => {
  const { id } = route.params;
  const { tasks, toggleSubtask, addSubtask, addComment, updateTask, deleteTask, deleteComment, subscribeToTasks, unsubscribeFromTasks } = useTaskStore();
  const { user, staff, ranch } = useAuthStore();
  const [newSubtask, setNewSubtask] = useState('');
  const [newComment, setNewComment] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (ranch?.id) {
      subscribeToTasks(ranch.id);
    }
    return () => {
      unsubscribeFromTasks();
    };
  }, [ranch?.id, subscribeToTasks, unsubscribeFromTasks]);

  const task = tasks.find(t => t.id === id);

  if (!task) return null;

  // Format assigned user name
  const getAssignedName = () => {
    if (!task.assignedTo) return 'Unassigned';
    // If it looks like a UUID, try to find the name in staff
    if (task.assignedTo.length > 20) {
      const assignedStaff = staff.find(s => s.id === task.assignedTo);
      return assignedStaff ? assignedStaff.name : 'Unknown Staff';
    }
    return task.assignedTo;
  };

  // Format date
  const getFormattedDate = () => {
    if (!task.dueDate) return 'No date';
    try {
      const date = parseISO(task.dueDate);
      if (isValid(date)) {
        return format(date, 'MMM d, yyyy • h:mm a');
      }
      return task.dueDate;
    } catch (e) {
      return task.dueDate;
    }
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      addSubtask(task.id, newSubtask.trim());
      setNewSubtask('');
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      addComment(task.id, newComment.trim(), user?.id || 'anon', user?.name || 'Anonymous');
      setNewComment('');
    }
  };

  const handleDeleteComment = (commentId: string) => {
    Alert.alert('Delete Comment', 'Are you sure you want to delete this comment?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteComment(task.id, commentId) },
    ]);
  };

  const handleToggleComplete = () => {
    if (task.status !== 'completed') {
      setShowCompleteModal(true);
    } else {
      const newStatus = 'pending';
      updateTask(task.id, { status: newStatus });
    }
  };

  const confirmComplete = () => {
    updateTask(task.id, { status: 'completed' });
    setShowCompleteModal(false);
  };

  const handleDeleteTask = async () => {
    await deleteTask(task.id);
    setShowDeleteModal(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.charcoalInk} />
        </TouchableOpacity>
        <Text style={styles.title}>Task Details</Text>
        <TouchableOpacity onPress={() => setShowDeleteModal(true)}>
          <Ionicons name="trash-outline" size={24} color={Colors.errorRed} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView style={styles.content}>
          <View style={styles.statusSection}>
            <PBadge 
              text={task.status.charAt(0).toUpperCase() + task.status.slice(1)} 
              variant={task.status === 'completed' ? 'success' : 'warning'} 
            />
            <PBadge 
              text={`${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority`} 
              variant={task.priority === 'urgent' || task.priority === 'high' ? 'error' : 'info'} 
              style={{ marginLeft: Spacing.sm }} 
            />
          </View>

          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskDescription}>
            {task.description || 'No description provided for this task.'}
          </Text>

          {task.notes ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Task Notes</Text>
              <PCard style={styles.notesCard}>
                <Text style={styles.notesText}>{task.notes}</Text>
              </PCard>
            </View>
          ) : null}

          <PCard style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Assigned To</Text>
                <Text style={styles.infoValue}>{getAssignedName()}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Due Date</Text>
                <Text style={styles.infoValue}>{getFormattedDate()}</Text>
              </View>
            </View>
          </PCard>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subtasks</Text>
            {task.subtasks.map(st => (
              <TouchableOpacity 
                key={st.id} 
                style={styles.subtaskItem}
                onPress={() => toggleSubtask(task.id, st.id)}
              >
                <Ionicons 
                  name={st.completed ? "checkbox" : "square-outline"} 
                  size={24} 
                  color={st.completed ? Colors.successMoss : Colors.mutedSienna} 
                />
                <Text style={[styles.subtaskText, st.completed && styles.completedText]}>
                  {st.title}
                </Text>
              </TouchableOpacity>
            ))}
            
            <View style={styles.addSubtaskContainer}>
              <TextInput
                style={styles.addSubtaskInput}
                placeholder="Add new subtask..."
                value={newSubtask}
                onChangeText={setNewSubtask}
                onSubmitEditing={handleAddSubtask}
              />
              <TouchableOpacity onPress={handleAddSubtask} style={styles.addIconButton}>
                <Ionicons name="add-circle" size={28} color={Colors.primaryRust} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Comments</Text>
            {task.comments.map(comment => (
              <PCard key={comment.id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentUser}>
                    {comment.userName} <Text style={styles.commentTime}>• {new Date(comment.createdAt || comment.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                  </Text>
                  {(comment.userId === user?.id || !comment.userId) && (
                    <TouchableOpacity onPress={() => handleDeleteComment(comment.id)}>
                      <Ionicons name="trash-outline" size={14} color={Colors.errorRed} />
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.commentText}>{comment.content}</Text>
              </PCard>
            ))}
            
            <View style={styles.addCommentContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                value={newComment}
                onChangeText={setNewComment}
                multiline
              />
              <TouchableOpacity 
                onPress={handleAddComment} 
                style={[styles.sendButton, !newComment.trim() && styles.disabledSend]}
                disabled={!newComment.trim()}
              >
                <Ionicons name="send" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          <PButton
            title={task.status === 'completed' ? "Reopen Task" : "Complete Task"}
            variant={task.status === 'completed' ? "secondary" : "primary"}
            onPress={handleToggleComplete}
            style={styles.completeButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <PModal visible={showCompleteModal} onClose={() => setShowCompleteModal(false)}>
        <View style={styles.modalContent}>
          <Ionicons name="checkmark-circle" size={64} color={Colors.successMoss} />
          <Text style={styles.modalTitle}>Mark Task as Complete?</Text>
          <Text style={styles.modalText}>
            Are you sure you want to mark &quot;{task.title}&quot; as completed? This action can be undone.
          </Text>
          <View style={styles.modalActions}>
            <PButton
              title="Cancel"
              variant="secondary"
              onPress={() => setShowCompleteModal(false)}
              style={styles.modalButton}
            />
            <PButton
              title="Complete"
              variant="primary"
              onPress={confirmComplete}
              style={styles.modalButton}
            />
          </View>
        </View>
      </PModal>

      <PModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <View style={styles.modalContent}>
          <Ionicons name="trash-outline" size={64} color={Colors.errorRed} />
          <Text style={styles.modalTitle}>Delete Task?</Text>
          <Text style={styles.modalText}>
            Are you sure you want to delete &quot;{task.title}&quot;? This action cannot be undone.
          </Text>
          <View style={styles.modalActions}>
            <PButton
              title="Cancel"
              variant="secondary"
              onPress={() => setShowDeleteModal(false)}
              style={styles.modalButton}
            />
            <PButton
              title="Delete"
              variant="danger"
              onPress={handleDeleteTask}
              style={styles.modalButton}
            />
          </View>
        </View>
      </PModal>
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
  content: {
    flex: 1,
    padding: Spacing.xl,
  },
  statusSection: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  taskTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize['3xl'],
    color: Colors.charcoalInk,
    marginBottom: Spacing.md,
  },
  taskDescription: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.mutedSienna,
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  infoCard: {
    marginBottom: Spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.xs,
    color: Colors.mutedSienna,
    marginBottom: 4,
  },
  infoValue: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
  },
  notesCard: {
    padding: Spacing.md,
    backgroundColor: Colors.warmSand,
  },
  notesText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
    lineHeight: 20,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.lg,
    color: Colors.charcoalInk,
    marginBottom: Spacing.md,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  subtaskText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: Colors.mutedSienna,
  },
  commentCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  commentUser: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
  },
  commentTime: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.xs,
    color: Colors.mutedSienna,
  },
  commentText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
  },
  addSubtaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  addSubtaskInput: {
    flex: 1,
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softAsh,
  },
  addIconButton: {
    padding: Spacing.xs,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  commentInput: {
    flex: 1,
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.softAsh,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryRust,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledSend: {
    backgroundColor: Colors.softAsh,
  },
  completeButton: {
    marginTop: Spacing.lg,
    marginBottom: Spacing['4xl'],
  },
  modalContent: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  modalTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.xl,
    color: Colors.charcoalInk,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  modalText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.mutedSienna,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  modalButton: {
    flex: 1,
  },
});
