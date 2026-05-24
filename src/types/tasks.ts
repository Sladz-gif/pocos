import { BaseEntity, TaskStatus, TaskPriority, TaskRecurrence } from './common';

export interface Task extends BaseEntity {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string;
  assignedBy?: string;
  createdBy?: string;
  dueDate?: string;
  completedAt?: string;
  notes?: string;
  recurrence?: TaskRecurrence | null;
  recurrenceConfig?: RecurrenceConfig;
  subtasks: Subtask[];
  comments: Comment[];
  attachments: string[];
  tags: string[];
  category?: string;
  reminderEnabled?: boolean;
  reminderTime?: string;
}

export interface RecurrenceConfig {
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  endDate?: string;
  occurrences?: number;
}

export interface Subtask extends BaseEntity {
  title: string;
  completed: boolean;
  completedAt?: string;
}

export interface Comment extends BaseEntity {
  userId: string;
  userName: string;
  content: string;
  attachments?: string[];
}
