import { create } from 'zustand';
import { supabase } from '../config/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { Channel, Message, User } from '../types';

interface ChatStore {
  channels: Channel[];
  messages: Record<string, Message[]>;
  activeChannel: Channel | null;
  contacts: User[];
  isLoading: boolean;
  subscription: RealtimeChannel | null;
  globalSubscription: RealtimeChannel | null;
  totalUnreadCount: number;
  fetchChannels: (ranchId: string, userId: string) => Promise<void>;
  fetchContacts: (ranchId: string) => Promise<void>;
  fetchMessages: (channelId: string) => Promise<void>;
  sendMessage: (channelId: string, content: string, senderId: string, senderName: string) => Promise<void>;
  sendFile: (channelId: string, fileUri: string, fileName: string, fileType: string, senderId: string, senderName: string) => Promise<void>;
  subscribeToChannel: (channelId: string) => void;
  unsubscribeFromChannel: () => void;
  subscribeToAllChannels: (ranchId: string, userId: string) => void;
  unsubscribeFromAllChannels: () => void;
  setActiveChannel: (channel: Channel | null) => void;
  markAsRead: (channelId: string) => void;
  createChannel: (name: string, ranchId: string, createdBy: string, type: 'group' | 'direct' | 'announcement', participantIds: string[]) => Promise<string | null>;
  getOrCreateDirectChannel: (ranchId: string, currentUserId: string, otherUser: User) => Promise<string | null>;
  deleteMessage: (channelId: string, messageId: string) => Promise<void>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  channels: [],
  messages: {},
  activeChannel: null,
  contacts: [],
  isLoading: false,
  subscription: null,
  globalSubscription: null,
  totalUnreadCount: 0,

  fetchContacts: async (ranchId: string) => {
    const { data, error } = await supabase
      .from('ranch_users')
      .select('*')
      .eq('ranch_id', ranchId)
      .eq('is_active', true);
    
    if (!error && data) {
      const contacts: User[] = data.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        accessCode: u.access_code,
        isActive: u.is_active,
        permissions: [],
        createdAt: u.created_at,
        updatedAt: u.updated_at,
      }));
      set({ contacts });
    }
  },

  fetchChannels: async (ranchId: string, userId: string) => {
    // 1. Get channels where user is a participant
    const { data: participation, error: pError } = await supabase
      .from('channel_participants')
      .select('channel_id')
      .eq('user_id', userId);
    
    if (pError) return;
    const channelIds = participation.map(p => p.channel_id);

    if (channelIds.length === 0) {
      set({ channels: [] });
      return;
    }

    // 2. Fetch those channels and all their participants
    const { data, error } = await supabase
      .from('chat_channels')
      .select(`
        *,
        channel_participants (
          user_id
        ),
        chat_messages (
          id,
          content,
          sender_id,
          sender_name,
          created_at
        )
      `)
      .in('id', channelIds)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const channels: Channel[] = data.map((ch: any) => {
        // Sort messages to get the latest one
        const sortedMessages = (ch.chat_messages || []).sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const lastMsg = sortedMessages[0];

        return {
          id: ch.id,
          name: ch.name,
          type: ch.type,
          ranchId: ch.ranch_id,
          createdBy: ch.created_by,
          participants: ch.channel_participants.map((p: any) => p.user_id),
          isAnnouncement: ch.type === 'announcement',
          unreadCount: 0,
          lastMessage: lastMsg ? {
            id: lastMsg.id,
            channelId: ch.id,
            senderId: lastMsg.sender_id,
            senderName: lastMsg.sender_name,
            content: lastMsg.content,
            type: 'text' as const,
            status: 'sent',
            isRead: false,
            readBy: [],
            createdAt: lastMsg.created_at,
            updatedAt: lastMsg.created_at,
          } : undefined,
          createdAt: ch.created_at,
          updatedAt: ch.created_at,
        };
      });
      set({ channels });
    }
  },

  fetchMessages: async (channelId: string) => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true })
      .limit(50);
    if (!error && data) {
      const messages: Message[] = data.map((msg: any) => ({
        id: msg.id,
        channelId: msg.channel_id,
        senderId: msg.sender_id,
        senderName: msg.sender_name,
        content: msg.content,
        imageUrl: msg.image_url,
        type: 'text',
        status: 'sent',
        isRead: false,
        readBy: [],
        createdAt: msg.created_at,
        updatedAt: msg.created_at,
      }));
      set((state) => ({
        messages: { ...state.messages, [channelId]: messages },
        isLoading: false,
      }));
    } else {
      set({ isLoading: false });
    }
  },

  sendMessage: async (channelId: string, content: string, senderId: string, senderName: string) => {
    const message = {
      id: uuidv4(),
      channel_id: channelId,
      sender_id: senderId,
      sender_name: senderName,
      content,
    };
    const { error } = await supabase.from('chat_messages').insert(message);
    if (error) {
      console.error('Send message error:', error.message);
      throw new Error('Failed to send message');
    }
  },

  sendFile: async (channelId, fileUri, fileName, fileType, senderId, senderName) => {
    try {
      // 1. Upload to Supabase Storage
      const fileExt = fileName.split('.').pop();
      const path = `${channelId}/${uuidv4()}.${fileExt}`;
      
      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        name: fileName,
        type: fileType,
      } as any);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pocos-images')
        .upload(path, formData);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('pocos-images')
        .getPublicUrl(path);

      // 2. Create message with attachment
      const isImage = fileType.startsWith('image/');
      const message = {
        id: uuidv4(),
        channel_id: channelId,
        sender_id: senderId,
        sender_name: senderName,
        content: isImage ? 'Sent an image' : `Sent a file: ${fileName}`,
        image_url: isImage ? publicUrl : null,
      };

      const { error: msgError } = await supabase.from('chat_messages').insert(message);
      if (msgError) throw msgError;
    } catch (error: any) {
      console.error('Send file error:', error.message);
      throw new Error('Failed to send file');
    }
  },

  subscribeToChannel: (channelId: string) => {
    const existing = get().subscription;
    if (existing) {
      supabase.removeChannel(existing);
    }

    const subscription = supabase
      .channel(`chat:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          const newMessage: Message = {
            id: payload.new.id,
            channelId: payload.new.channel_id,
            senderId: payload.new.sender_id,
            senderName: payload.new.sender_name,
            content: payload.new.content,
            imageUrl: payload.new.image_url,
            type: 'text' as const,
            status: 'sent',
            isRead: false,
            readBy: [],
            createdAt: payload.new.created_at,
            updatedAt: payload.new.created_at,
          };
          set((state) => ({
            messages: {
              ...state.messages,
              [channelId]: [
                ...(state.messages[channelId] || []),
                newMessage,
              ],
            },
          }));
        }
      )
      .subscribe();

    set({ subscription });
  },

  unsubscribeFromChannel: () => {
    const subscription = get().subscription;
    if (subscription) {
      supabase.removeChannel(subscription);
      set({ subscription: null });
    }
  },

  setActiveChannel: (channel: Channel | null) => {
    set({ activeChannel: channel });
    if (channel) {
      get().markAsRead(channel.id);
    }
  },

  markAsRead: (channelId: string) => {
    set((state) => {
      const channels = state.channels.map(ch => 
        ch.id === channelId ? { ...ch, unreadCount: 0 } : ch
      );
      const totalUnreadCount = channels.reduce((sum, ch) => sum + (ch.unreadCount || 0), 0);
      return { channels, totalUnreadCount };
    });
  },

  subscribeToAllChannels: (ranchId: string, userId: string) => {
    const existing = get().globalSubscription;
    if (existing) {
      supabase.removeChannel(existing);
    }

    const subscription = supabase
      .channel(`global_chat:${ranchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        async (payload) => {
          const newMessage = payload.new;
          const currentUserId = userId;
          
          // Update last message for the channel
          set((state: any) => {
            const channels = state.channels.map((ch: any) => {
              if (ch.id === newMessage.channel_id) {
                return {
                  ...ch,
                  lastMessage: {
                    id: newMessage.id,
                    channelId: newMessage.channel_id,
                    senderId: newMessage.sender_id,
                    senderName: newMessage.sender_name,
                    content: newMessage.content,
                    type: 'text' as const,
                    status: 'sent' as const,
                    isRead: false,
                    readBy: [],
                    createdAt: newMessage.created_at,
                    updatedAt: newMessage.created_at,
                  },
                  // Only increment unread if not the active channel and not from current user
                  unreadCount: (ch.id !== get().activeChannel?.id && newMessage.sender_id !== currentUserId) 
                    ? (ch.unreadCount || 0) + 1 
                    : ch.unreadCount
                };
              }
              return ch;
            });
            const totalUnreadCount = channels.reduce((sum: any, ch: any) => sum + (ch.unreadCount || 0), 0);
            return { channels, totalUnreadCount };
          });
        }
      )
      .subscribe();

    set({ globalSubscription: subscription });
  },

  unsubscribeFromAllChannels: () => {
    const subscription = get().globalSubscription;
    if (subscription) {
      supabase.removeChannel(subscription);
      set({ globalSubscription: null });
    }
  },

  getOrCreateDirectChannel: async (ranchId, currentUserId, otherUser) => {
    // 1. Try to find existing direct channel between these two users
    // This is a bit complex in SQL without a join, but we can do it:
    // Find all direct channels for current user, then see if other user is also in one.
    
    const { data: myParticipations } = await supabase
      .from('channel_participants')
      .select('channel_id, chat_channels!inner(type)')
      .eq('user_id', currentUserId)
      .eq('chat_channels.type', 'direct');
    
    if (myParticipations && myParticipations.length > 0) {
      const myChannelIds = myParticipations.map(p => p.channel_id);
      const { data: commonParticipation } = await supabase
        .from('channel_participants')
        .select('channel_id')
        .in('channel_id', myChannelIds)
        .eq('user_id', otherUser.id)
        .single();
      
      if (commonParticipation) {
        return commonParticipation.channel_id;
      }
    }

    // 2. Create new direct channel if none exists
    const channelName = otherUser.name; // Display name for the channel
    const id = await get().createChannel(channelName, ranchId, currentUserId, 'direct', [currentUserId, otherUser.id]);
    return id;
  },

  createChannel: async (name, ranchId, createdBy, type = 'direct', participantIds) => {
    const id = uuidv4();
    const row = {
      id,
      name,
      type,
      ranch_id: ranchId,
      created_by: createdBy,
    };
    const { error } = await supabase.from('chat_channels').insert(row);
    if (error) {
      console.error('Create channel error:', error.message);
      return null;
    }

    // Add participants
    const participantRows = participantIds.map((pid) => ({
      id: uuidv4(),
      channel_id: id,
      user_id: pid,
    }));
    const { error: pError } = await supabase.from('channel_participants').insert(participantRows);
    if (pError) {
      console.error('Add participants error:', pError.message);
      return id; // Still return ID even if adding participants fails
    }

    await get().fetchChannels(ranchId, createdBy);
    return id;
  },

  deleteMessage: async (channelId: string, messageId: string) => {
    const { error } = await supabase.from('chat_messages').delete().eq('id', messageId);
    if (error) {
      console.error('Delete message error:', error.message);
      throw new Error('Failed to delete message');
    }
  },
}));
