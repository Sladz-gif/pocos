import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RanchTabParamList } from './types';
import { HomeStack } from './stacks/HomeStack';
import { FlockStack } from './stacks/FlockStack';
import { TasksStack } from './stacks/TasksStack';
import { ChatStack } from './stacks/ChatStack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants';
import { useAuthStore, useChatStore, useTaskStore } from '../store';

const SettingsPlaceholder = ({ navigation }: any) => {
  React.useEffect(() => {
    // Navigate to admin panel when settings is pressed
    navigation.getParent()?.getParent()?.navigate('AdminModal');
  }, [navigation]);
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontFamily: 'DMSans-Medium', fontSize: 16, color: Colors.textSecondary }}>
        Loading Settings...
      </Text>
    </View>
  );
};

const Tab = createBottomTabNavigator<RanchTabParamList>();

export const RanchNavigator = () => {
  const { user, ranch } = useAuthStore();
  const { totalUnreadCount, subscribeToAllChannels, unsubscribeFromAllChannels, fetchChannels, fetchContacts } = useChatStore();
  const { unreadTasksCount, subscribeToTasks, unsubscribeFromTasks, fetchTasks } = useTaskStore();

  useEffect(() => {
    if (ranch?.id && user?.id) {
      fetchChannels(ranch.id, user.id);
      fetchContacts(ranch.id);
      subscribeToAllChannels(ranch.id, user.id);
      
      fetchTasks(ranch.id);
      subscribeToTasks(ranch.id);
    }
    return () => {
      unsubscribeFromAllChannels();
      unsubscribeFromTasks();
    };
  }, [ranch?.id, user?.id, fetchChannels, fetchContacts, subscribeToAllChannels, fetchTasks, subscribeToTasks, unsubscribeFromAllChannels, unsubscribeFromTasks]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.primarySurface,
          borderTopColor: Colors.border,
          paddingTop: 8,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'HomeStack') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'FlockStack') {
            iconName = 'add';
          } else if (route.name === 'TasksStack') {
            iconName = focused ? 'checkbox' : 'checkbox-outline';
          } else if (route.name === 'ChatStack') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeStack"
        component={HomeStack}
        options={{ title: 'Home' }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            const state = navigation.getState();
            if (state.index > 0) {
              navigation.popToTop();
            }
          },
        })}
      />
      <Tab.Screen
        name="TasksStack"
        component={TasksStack}
        options={{
          title: 'Tasks',
          tabBarBadge: unreadTasksCount > 0 ? unreadTasksCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: Colors.accent,
            color: Colors.primarySurface,
          }
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            const state = navigation.getState();
            if (state.index > 0) {
              navigation.popToTop();
            }
          },
        })}
      />
      <Tab.Screen
        name="FlockStack"
        component={FlockStack}
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => (
            <View style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: Colors.accent,
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: -20,
              shadowColor: Colors.accent,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}>
              <Ionicons name="add" size={28} color={Colors.primarySurface} />
            </View>
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.reset({
              index: 0,
              routes: [{ name: 'FlockStack' }],
            });
          },
        })}
      />
      <Tab.Screen
        name="ChatStack"
        component={ChatStack}
        options={{
          title: 'Chat',
          tabBarBadge: totalUnreadCount > 0 ? totalUnreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: Colors.accent,
            color: Colors.primarySurface,
          }
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            const state = navigation.getState();
            if (state.index > 0) {
              navigation.popToTop();
            }
          },
        })}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsPlaceholder}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
};
