import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PCard, PEmptyState, PModal, PButton } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { ChatStackParamList } from '../../navigation/types';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';

type ChatHomeScreenProps = {
  navigation: StackNavigationProp<ChatStackParamList, 'ChatHome'>;
};

export const ChatHomeScreen: React.FC<ChatHomeScreenProps> = ({ navigation }) => {
  const { ranch, user } = useAuthStore();
  const { channels, createChannel, contacts, getOrCreateDirectChannel, setActiveChannel } = useChatStore();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [activeTab, setActiveTab] = useState<'chats' | 'staff'>('chats');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState('');

  useEffect(() => {
    return () => {
      setActiveChannel(null);
    };
  }, [setActiveChannel]);

  const handleCreateGroup = async () => {
    if (!newChannelName.trim() || !ranch?.id || !user?.id) {
      Alert.alert('Required', 'Please enter a group name.');
      return;
    }
    if (selectedMembers.length === 0) {
      Alert.alert('Required', 'Please select at least one member.');
      return;
    }

    const participants = [user.id, ...selectedMembers];
    const id = await createChannel(newChannelName.trim(), ranch.id, user.id, 'group', participants);
    setNewChannelName('');
    setSelectedMembers([]);
    setModalOpen(false);
    if (id) navigation.navigate('Conversation', { id });
  };

  const handleStartDirectChat = async (otherUser: any) => {
    if (!ranch?.id || !user?.id) return;
    try {
      const id = await getOrCreateDirectChannel(ranch.id, user.id, otherUser);
      if (id) navigation.navigate('Conversation', { id });
    } catch (error: any) {
      Alert.alert('Error', 'Could not start chat: ' + error.message);
    }
  };

  const filteredChannels = channels.filter((c: any) =>
    !search.trim() || c.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredStaff = contacts.filter((s: any) =>
    s.id !== user?.id && (!search.trim() || s.name.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleMember = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
    );
  };

  const getChatName = (item: any) => {
    if (item.type === 'direct') {
      const otherParticipantId = item.participants.find((p: string) => p !== user?.id);
      if (otherParticipantId) {
        const otherUser = contacts.find(u => u.id === otherParticipantId);
        return otherUser?.name || item.name;
      }
    }
    return item.name;
  };

  const renderChat = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => {
      setActiveChannel(item);
      navigation.navigate('Conversation', { id: item.id });
    }}>
      <PCard style={styles.chatCard}>
        <View style={styles.avatar}>
          <Ionicons name={item.type === 'group' || item.type === 'announcement' ? 'people' : 'person'} size={24} color={Colors.primaryRust} />
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge} />
          )}
        </View>
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <View style={styles.nameRow}>
              <Text style={styles.chatName}>{getChatName(item)}</Text>
              {item.unreadCount > 0 && (
                <View style={styles.newTag}>
                  <Text style={styles.newTagText}>NEW</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.chatFooter}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage 
                ? `${item.lastMessage.senderId === user?.id ? 'You: ' : `${item.lastMessage.senderName}: `}${item.lastMessage.content}`
                : (item.type === 'direct' ? 'Direct Message' : 'Group Chat')}
            </Text>
          </View>
        </View>
      </PCard>
    </TouchableOpacity>
  );

  const renderStaff = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => handleStartDirectChat(item)}>
      <PCard style={styles.chatCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={24} color={Colors.primaryRust} />
        </View>
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName}>{item.name}</Text>
            <View style={[styles.roleBadge, { backgroundColor: item.role === 'super_admin' ? Colors.primaryRust : Colors.warmSand }]}>
              <Text style={[styles.roleText, { color: item.role === 'super_admin' ? '#FFFFFF' : Colors.primaryRust }]}>
                {item.role === 'super_admin' ? 'Admin' : item.role.replace('_', ' ')}
              </Text>
            </View>
          </View>
          <View style={styles.chatFooter}>
            <Text style={styles.lastMessage}>Tap to message</Text>
          </View>
        </View>
      </PCard>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Team Chat</Text>
        {user?.role === 'super_admin' && (
          <TouchableOpacity onPress={() => setModalOpen(true)}>
            <Ionicons name="add-circle-outline" size={28} color={Colors.primaryRust} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'chats' && styles.activeTab]} 
          onPress={() => setActiveTab('chats')}
        >
          <Text style={[styles.tabText, activeTab === 'chats' && styles.activeTabText]}>Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'staff' && styles.activeTab]} 
          onPress={() => setActiveTab('staff')}
        >
          <Text style={[styles.tabText, activeTab === 'staff' && styles.activeTabText]}>Staff</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.mutedSienna} />
          <TextInput
            style={styles.searchInput}
            placeholder={activeTab === 'chats' ? "Search conversations" : "Find staff member"}
            placeholderTextColor={Colors.mutedSienna}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={activeTab === 'chats' ? filteredChannels : filteredStaff}
        renderItem={activeTab === 'chats' ? renderChat : renderStaff}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <PEmptyState
            icon={activeTab === 'chats' ? "chatbubbles-outline" : "people-outline"}
            title={activeTab === 'chats' ? "No conversations" : "No staff found"}
            message={activeTab === 'chats' ? "Start a chat by visiting the Staff tab." : "All onboarded staff will appear here."}
          />
        }
      />

      <PModal 
        visible={modalOpen} 
        onClose={() => setModalOpen(false)}
        title="Create Team Group"
      >
        <TextInput
          style={styles.modalInput}
          placeholder="Group Name (e.g. Field Crew)"
          placeholderTextColor={Colors.mutedSienna}
          value={newChannelName}
          onChangeText={setNewChannelName}
        />

        <Text style={styles.memberLabel}>Select Members</Text>
        <View style={[styles.searchBar, { marginBottom: Spacing.sm }]}>
          <Ionicons name="search" size={18} color={Colors.mutedSienna} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search staff..."
            value={memberSearch}
            onChangeText={setMemberSearch}
          />
        </View>
        <FlatList
          data={contacts.filter(s => 
            s.id !== user?.id && 
            (!memberSearch.trim() || s.name.toLowerCase().includes(memberSearch.toLowerCase()))
          )}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.memberItem} 
              onPress={() => toggleMember(item.id)}
            >
              <View style={styles.memberInfo}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberInitials}>{item.name.substring(0, 2).toUpperCase()}</Text>
                </View>
                <Text style={styles.memberName}>{item.name}</Text>
              </View>
              <Ionicons 
                name={selectedMembers.includes(item.id) ? "checkbox" : "square-outline"} 
                size={24} 
                color={selectedMembers.includes(item.id) ? Colors.primaryRust : Colors.softAsh} 
              />
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: Spacing.xl }}
        />

        <PButton 
          title={`Create Group (${selectedMembers.length} members)`} 
          onPress={handleCreateGroup} 
          disabled={!newChannelName.trim() || selectedMembers.length === 0}
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
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  tab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    backgroundColor: Colors.warmSand,
  },
  activeTab: {
    backgroundColor: Colors.primaryRust,
  },
  tabText: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.sm,
    color: Colors.primaryRust,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.md,
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.softAsh,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
  },
  listContent: {
    padding: Spacing.xl,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.warmSand,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primaryRust,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
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
  chatName: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  chatTime: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.xs,
    color: Colors.mutedSienna,
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
    flex: 1,
    marginRight: Spacing.md,
  },
  unreadCountBadge: {
    backgroundColor: Colors.primaryRust,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  modalInput: {
    backgroundColor: Colors.paleParchment,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
    marginBottom: Spacing.xl,
  },
  memberLabel: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
    marginBottom: Spacing.sm,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softAsh,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.warmSand,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  memberInitials: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: Colors.primaryRust,
  },
  memberName: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
  },
});
