import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RanchTabParamList } from './types';
import { HomeStack } from './stacks/HomeStack';
import { HerdStack } from './stacks/HerdStack';
import { TasksStack } from './stacks/TasksStack';
import { ChatStack } from './stacks/ChatStack';
import { StoreStack } from './stacks/StoreStack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants';
import { useAuthStore, useChatStore, useTaskStore } from '../store';

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

  // Only Super Admin (Owner) and Store Manager can access the Store tab
  const canAccessStore = user?.role === 'super_admin' || user?.role === 'store_manager' || user?.role === 'ranch_owner';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primaryRust,
        tabBarInactiveTintColor: Colors.mutedSienna,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: Colors.softAsh,
          paddingTop: 8,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'HomeStack') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'HerdStack') {
            iconName = focused ? 'paw' : 'paw-outline';
          } else if (route.name === 'TasksStack') {
            iconName = focused ? 'checkbox' : 'checkbox-outline';
          } else if (route.name === 'ChatStack') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'StoreStack') {
            iconName = focused ? 'storefront' : 'storefront-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="HomeStack" 
        component={HomeStack} 
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="HerdStack" 
        component={HerdStack} 
        options={{ title: 'Herd' }}
      />
      <Tab.Screen 
        name="TasksStack" 
        component={TasksStack} 
        options={{ 
          title: 'Tasks',
          tabBarBadge: unreadTasksCount > 0 ? unreadTasksCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: Colors.primaryRust,
            color: '#FFFFFF',
          }
        }}
      />
      <Tab.Screen 
        name="ChatStack" 
        component={ChatStack} 
        options={{ 
          title: 'Chat',
          tabBarBadge: totalUnreadCount > 0 ? totalUnreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: Colors.primaryRust,
            color: '#FFFFFF',
          }
        }}
      />
      {canAccessStore && (
        <Tab.Screen 
          name="StoreStack" 
          component={StoreStack} 
          options={{ title: 'Store' }}
        />
      )}
    </Tab.Navigator>
  );
};
