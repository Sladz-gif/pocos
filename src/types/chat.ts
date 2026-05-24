import { BaseEntity } from './common';

export interface Channel extends BaseEntity {
  name: string;
  type: 'group' | 'direct' | 'announcement';
  description?: string;
  ranchId: string;
  participants: string[];
  createdBy: string;
  isAnnouncement: boolean;
  lastMessage?: Message;
  unreadCount: number;
}

export interface Message extends BaseEntity {
  channelId: string;
  senderId: string;
  senderName: string;
  content: string;
  imageUrl?: string;
  type: 'text' | 'image' | 'file' | 'system';
  attachments?: Attachment[];
  replyTo?: string;
  isRead: boolean;
  readBy: string[];
  sentAt?: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}
