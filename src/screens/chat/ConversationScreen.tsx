import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PCard } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { ChatStackParamList } from '../../navigation/types';
import { RouteProp } from '@react-navigation/native';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
} from 'react-native-reanimated';
import { 
  Gesture,
  GestureDetector,
  GestureHandlerRootView 
} from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');

type ConversationScreenProps = {
  route: RouteProp<ChatStackParamList, 'Conversation'>;
  navigation: StackNavigationProp<ChatStackParamList, 'Conversation'>;
};

export const ConversationScreen: React.FC<ConversationScreenProps> = ({ route, navigation }) => {
  const { id } = route.params;
  const [message, setMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const { messages, fetchMessages, sendMessage, sendFile, subscribeToChannel, unsubscribeFromChannel, channels, deleteMessage, contacts } = useChatStore();
  const { user } = useAuthStore();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const activeChannel = channels.find(c => c.id === id);

  const getChannelName = () => {
    if (!activeChannel) return 'Loading...';
    if (activeChannel.type === 'direct') {
      const otherParticipantId = activeChannel.participants.find(p => p !== user?.id);
      if (otherParticipantId) {
        const otherUser = contacts.find(u => u.id === otherParticipantId);
        return otherUser?.name || activeChannel.name;
      }
    }
    return activeChannel.name;
  };

  // Zoom animation values
  const scale = useSharedValue(1);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = event.scale;
      focalX.value = event.focalX;
      focalY.value = event.focalY;
    })
    .onEnd(() => {
      scale.value = withSpring(1);
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: focalX.value },
        { translateY: focalY.value },
        { translateX: -width / 2 },
        { translateY: -height / 2 },
        { scale: scale.value },
        { translateX: -focalX.value },
        { translateY: -focalY.value },
        { translateX: width / 2 },
        { translateY: height / 2 },
      ],
    };
  });

  useEffect(() => {
    fetchMessages(id);
    subscribeToChannel(id);
    return () => {
      unsubscribeFromChannel();
    };
  }, [id, fetchMessages, subscribeToChannel, unsubscribeFromChannel]);

  const channelMessages = messages[id] || [];

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [channelMessages]);

  const handleSend = async () => {
    if (message.trim()) {
      try {
        await sendMessage(id, message.trim(), user?.id || '', user?.name || 'Anonymous');
        setMessage('');
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to send message');
      }
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      try {
        await sendFile(id, asset.uri, asset.fileName || 'photo.jpg', asset.mimeType || 'image/jpeg', user?.id || '', user?.name || 'Anonymous');
      } catch (error: any) {
        Alert.alert('Error', 'Failed to upload image');
      }
    }
  };

  const handleLongPress = (messageItem: any) => {
    const isMe = messageItem.senderId === user?.id;
    if (!isMe) return;

    Alert.alert(
      'Message Options',
      'What would you like to do?',
      [
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMessage(id, messageItem.id);
            } catch (error: any) {
              Alert.alert('Error', 'Failed to delete message');
            }
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const renderMessage = ({ item }: { item: typeof channelMessages[0] }) => {
    const isMe = item.senderId === user?.id;
    const sender = contacts.find(c => c.id === item.senderId);
    const role = sender?.role || 'staff';
    const displayName = sender?.name || item.senderName;

    return (
      <View style={[styles.messageRow, isMe ? styles.myMessageRow : styles.theirMessageRow]}>
        <TouchableOpacity 
          onLongPress={() => handleLongPress(item)}
          activeOpacity={0.8}
          style={[styles.messageBubble, isMe ? styles.myBubble : styles.theirBubble]}
        >
          {!isMe && (
            <View style={styles.senderInfo}>
              <Text style={styles.senderName}>{displayName}</Text>
              <View style={[styles.roleTag, { backgroundColor: role === 'super_admin' ? Colors.primaryRust : Colors.warmSand }]}>
                <Text style={[styles.roleTagText, { color: role === 'super_admin' ? '#FFFFFF' : Colors.primaryRust }]}>
                  {role === 'super_admin' ? 'Admin' : role.replace('_', ' ')}
                </Text>
              </View>
            </View>
          )}
          {item.imageUrl && (
            <TouchableOpacity onPress={() => setSelectedImage(item.imageUrl)}>
              <Image 
                source={{ uri: item.imageUrl }} 
                style={styles.messageImage} 
                contentFit="cover"
              />
            </TouchableOpacity>
          )}
          <Text style={[styles.messageText, isMe ? styles.myText : styles.theirText]}>{item.content}</Text>
          <Text style={[styles.messageTime, isMe ? styles.myTime : styles.theirTime]}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.charcoalInk} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>{getChannelName()}</Text>
            <Text style={styles.subtitle}>Online</Text>
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={channelMessages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.attachButton} onPress={handlePickImage}>
              <Ionicons name="image-outline" size={24} color={Colors.mutedSienna} />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              value={message}
              onChangeText={setMessage}
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
              disabled={!message.trim()}
              onPress={handleSend}
            >
              <Ionicons name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* Full screen image viewer */}
        <Modal
          visible={!!selectedImage}
          transparent={true}
          onRequestClose={() => setSelectedImage(null)}
        >
          <View style={styles.fullScreenOverlay}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setSelectedImage(null)}
            >
              <Ionicons name="close" size={30} color="#FFFFFF" />
            </TouchableOpacity>
            
            <GestureDetector gesture={pinchGesture}>
              <Animated.View style={[{ flex: 1, justifyContent: 'center' }, animatedStyle]}>
                <Image
                  source={{ uri: selectedImage || '' }}
                  style={styles.fullScreenImage}
                  contentFit="contain"
                />
              </Animated.View>
            </GestureDetector>
          </View>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.paleParchment,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.softAsh,
  },
  headerInfo: {
    flex: 1,
    marginLeft: Spacing.lg,
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.lg,
    color: Colors.charcoalInk,
  },
  subtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.xs,
    color: Colors.successMoss,
  },
  listContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  theirMessageRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: Spacing.md,
    borderRadius: Radius.lg,
  },
  myBubble: {
    backgroundColor: Colors.primaryRust,
    borderBottomRightRadius: 2,
  },
  theirBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: Colors.softAsh,
  },
  senderName: {
    fontFamily: 'DMSans-Bold',
    fontSize: 10,
    color: Colors.primaryRust,
    textTransform: 'uppercase',
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 4,
  },
  roleTag: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  roleTagText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 8,
    textTransform: 'uppercase',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
  },
  messageText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
  myText: {
    color: '#FFFFFF',
  },
  theirText: {
    color: Colors.charcoalInk,
  },
  messageTime: {
    fontFamily: 'DMMono-Regular',
    fontSize: 8,
    marginTop: 4,
    textAlign: 'right',
  },
  myTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  theirTime: {
    color: Colors.mutedSienna,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: Colors.softAsh,
  },
  attachButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: Colors.paleParchment,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 8,
    marginHorizontal: Spacing.sm,
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryRust,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.softAsh,
  },
  fullScreenOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: width,
    height: height,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
});
