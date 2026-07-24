import { create } from 'zustand';
import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';
import { Task, Subtask, Comment } from '../types';
import { useActivityLogStore } from './activityLogStore';
import { RealtimeChannel } from '@supabase/supabase-js';

interface TaskStore {
  tasks: Task[];
  selectedTask: Task | null;
  isLoading: boolean;
  filter: 'all' | 'pending' | 'in_progress' | 'completed';
  subscription: RealtimeChannel | null;
  unreadTasksCount: number;
  
  // Actions
  fetchTasks: (ranchId: string) => Promise<void>;
  addTask: (taskData: Partial<Task> & { recurrence?: any; recurring?: any }, ranchId: string) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setSelectedTask: (task: Task | null) => void;
  setFilter: (filter: 'all' | 'pending' | 'in_progress' | 'completed') => void;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  addSubtask: (taskId: string, title: string) => Promise<void>;
  addComment: (taskId: string, content: string, userId: string, userName: string) => Promise<void>;
  deleteComment: (taskId: string, commentId: string) => Promise<void>;
  subscribeToTasks: (ranchId: string) => void;
  unsubscribeFromTasks: () => void;
  markTasksAsRead: () => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  selectedTask: null,
  isLoading: false,
  filter: 'all',
  subscription: null,
  unreadTasksCount: 0,

  fetchTasks: async (ranchId: string) => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assigned_to_user:ranch_users!tasks_assigned_to_fkey (
          name
        ),
        subtasks (*),
        task_comments (*)
      `)
      .eq('ranch_id', ranchId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Fetch tasks error:', error.message);
      set({ isLoading: false });
      return;
    }

    if (data) {
      const tasks: Task[] = data.map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description || '',
        assignedTo: t.assigned_to_user?.name || t.assigned_to || 'Unassigned',
        priority: t.priority as any,
        recurrence: t.recurring as any,
        status: t.status as any,
        dueDate: t.due_date,
        notes: t.notes,
        subtasks: (t.subtasks || []).map((s: any) => ({
          id: s.id,
          title: s.title,
          completed: s.is_completed,
          createdAt: s.created_at,
          updatedAt: s.updated_at,
        })),
        comments: (t.task_comments || []).map((c: any) => ({
          id: c.id,
          userId: c.user_id,
          userName: c.user_name,
          content: c.content,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
        })),
        attachments: t.attachments || [],
        tags: t.tags || [],
        createdAt: t.created_at,
        updatedAt: t.updated_at,
      }));
      set({ tasks, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  addTask: async (taskData: Partial<Task> & { recurrence?: any; recurring?: any }, ranchId: string) => {
    const task = { 
      id: uuidv4(), 
      title: taskData.title,
      description: taskData.description,
      assigned_to: taskData.assignedTo,
      priority: taskData.priority || 'medium',
      recurring: taskData.recurrence || taskData.recurring || 'none',
      due_date: taskData.dueDate,
      notes: taskData.notes,
      ranch_id: ranchId,
    };
    const { error } = await supabase.from('tasks').insert(task);
    if (error) {
      console.error('Add task error:', error.message);
      throw error;
    }

    const newTask: Task = {
      id: task.id,
      title: task.title,
      description: task.description || '',
      assignedTo: task.assigned_to,
      priority: task.priority as any,
      recurrence: task.recurring as any,
      status: 'pending',
      dueDate: task.due_date,
      notes: task.notes,
      subtasks: [],
      comments: [],
      attachments: [],
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state: any) => ({ tasks: [newTask, ...state.tasks] }));

    // Add subtasks if provided
    if (taskData.subtasks && taskData.subtasks.length > 0) {
      const subtasksToInsert = taskData.subtasks
        .filter((st: any) => typeof st === 'string' && st.trim() !== '')
        .map((stTitle: any) => ({
          id: uuidv4(),
          task_id: task.id,
          title: stTitle,
          completed: false,
        }));
      
      if (subtasksToInsert.length > 0) {
        await supabase.from('subtasks').insert(subtasksToInsert.map(s => ({
          id: s.id,
          task_id: s.task_id,
          title: s.title,
          is_completed: s.completed
        })));
        
        // Update local state with subtasks
        set((state: any) => ({
          tasks: state.tasks.map((t: any) => 
            t.id === task.id 
              ? { ...t, subtasks: subtasksToInsert.map(s => ({ id: s.id, title: s.title, completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })) } 
              : t
          )
        }));
      }
    }

    // Log activity
    useActivityLogStore.getState().logActivity({
      userName: 'System',
      action: `created task: ${task.title}`,
      entityType: 'task',
      entityId: task.id,
      ranchId: ranchId,
    });
  },

  updateTask: async (id: string, updates: Partial<Task>) => {
    const supabaseUpdates: any = {};
    if (updates.status) supabaseUpdates.status = updates.status;
    if (updates.priority) supabaseUpdates.priority = updates.priority;
    if (updates.dueDate) supabaseUpdates.due_date = updates.dueDate;
    if (updates.assignedTo) supabaseUpdates.assigned_to = updates.assignedTo;
    
    const { error } = await supabase.from('tasks').update(supabaseUpdates).eq('id', id);
    if (error) {
      console.error('Update task error:', error.message);
      throw error;
    }
    
    set((state: any) => ({
      tasks: state.tasks.map((t: any) => t.id === id ? { ...t, ...updates } : t),
    }));
  },

  deleteTask: async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) {
      console.error('Delete task error:', error.message);
      throw error;
    }
    set((state: any) => ({ tasks: state.tasks.filter((t: any) => t.id !== id) }));
  },

  toggleSubtask: async (taskId: string, subtaskId: string) => {
    const task = get().tasks.find((t: any) => t.id === taskId);
    const subtask = task?.subtasks.find((s: any) => s.id === subtaskId);
    if (!subtask) return;
    const newCompleted = !subtask.completed;
    const { error } = await supabase.from('subtasks').update({ is_completed: newCompleted }).eq('id', subtaskId);
    if (error) {
      console.error('Toggle subtask error:', error.message);
      throw error;
    }
    set((state: any) => ({
      tasks: state.tasks.map((t: any) =>
        t.id === taskId
          ? { ...t, subtasks: t.subtasks.map((s: any) => s.id === subtaskId ? { ...s, completed: newCompleted } : s) }
          : t
      ),
    }));
  },

  addSubtask: async (taskId: string, title: string) => {
    const subtask = { id: uuidv4(), task_id: taskId, title, is_completed: false };
    const { error } = await supabase.from('subtasks').insert(subtask);
    if (error) {
      console.error('Add subtask error:', error.message);
      throw error;
    }
    set((state: any) => ({
      tasks: state.tasks.map((t: any) =>
        t.id === taskId ? { ...t, subtasks: [...t.subtasks, { id: subtask.id, title, completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }] } : t
      ),
    }));
  },

  addComment: async (taskId: string, content: string, userId: string, userName: string) => {
    const comment = { id: uuidv4(), task_id: taskId, user_id: userId, user_name: userName, content };
    const { error } = await supabase.from('task_comments').insert(comment);
    if (error) {
      console.error('Add comment error:', error.message);
      throw error;
    }
    set((state: any) => ({
      tasks: state.tasks.map((t: any) =>
        t.id === taskId ? { ...t, comments: [...t.comments, { id: comment.id, userId, userName, content, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }] } : t
      ),
    }));
  },

  deleteComment: async (taskId: string, commentId: string) => {
    const { error } = await supabase.from('task_comments').delete().eq('id', commentId);
    if (error) {
      console.error('Delete comment error:', error.message);
      throw error;
    }
    set((state: any) => ({
      tasks: state.tasks.map((t: any) =>
        t.id === taskId ? { ...t, comments: t.comments.filter((c: any) => c.id !== commentId) } : t
      ),
    }));
  },

  subscribeToTasks: (ranchId: string) => {
    if (get().subscription) {
      get().unsubscribeFromTasks();
    }

    const subscription = supabase
      .channel(`ranch_tasks:${ranchId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `ranch_id=eq.${ranchId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            set((state) => ({ unreadTasksCount: state.unreadTasksCount + 1 }));
          }
          get().fetchTasks(ranchId);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'subtasks' },
        () => get().fetchTasks(ranchId)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'task_comments' },
        () => get().fetchTasks(ranchId)
      )
      .subscribe();

    set({ subscription });
  },

  unsubscribeFromTasks: () => {
    const { subscription } = get();
    if (subscription) {
      supabase.removeChannel(subscription);
      set({ subscription: null });
    }
  },

  markTasksAsRead: () => set({ unreadTasksCount: 0 }),

  setSelectedTask: (task) => set({ selectedTask: task }),
  setFilter: (filter) => set({ filter }),
}));
