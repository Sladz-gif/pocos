import React, { useEffect } from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { RanchTabParamList } from './types';
import { HomeStack } from './stacks/HomeStack';
import { FlockStack } from './stacks/FlockStack';
import { TasksStack } from './stacks/TasksStack';
import { ChatStack } from './stacks/ChatStack';
import { AdminPanelHomeScreen } from '../screens/admin/AdminPanelHomeScreen';
import { ManageTeamScreen } from '../screens/admin/ManageTeamScreen';
import { OnboardStaffScreen } from '../screens/admin/OnboardStaffScreen';
import { StaffActivityScreen } from '../screens/admin/StaffActivityScreen';
import { AnalyticsScreen } from '../screens/admin/AnalyticsScreen';
import { ManageRanchProfileScreen } from '../screens/admin/ManageRanchProfileScreen';
import { StaffProfileScreen } from '../screens/profile/StaffProfileScreen';
import { NotificationSettingsScreen } from '../screens/profile/NotificationSettingsScreen';
import { HelpSupportScreen } from '../screens/profile/HelpSupportScreen';
import { PricingPlansScreen } from '../screens/profile/PricingPlansScreen';
import { AdminNavigator } from './AdminNavigator';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants';
import { useAuthStore, useChatStore, useTaskStore } from '../store';

const Tab = createBottomTabNavigator<RanchTabParamList>();
const SettingsStack = createStackNavigator();
const RanchStack = createStackNavigator();

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
    <RanchStack.Navigator screenOptions={{ headerShown: false }}>
      <RanchStack.Screen name="TabNavigator">
        {() => (
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarActiveTintColor: Colors.accentRed,
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
                  backgroundColor: Colors.accentRed,
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
                    backgroundColor: Colors.accentRed,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: -20,
                    shadowColor: Colors.accentRed,
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
                  backgroundColor: Colors.accentRed,
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
              options={{ title: 'Settings', headerShown: false }}
            >
              {() => (
                <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
                  <SettingsStack.Screen
                    name="SettingsHome"
                    component={AdminPanelHomeScreen}
                  />
                  <SettingsStack.Screen
                    name="ManageTeam"
                    component={ManageTeamScreen}
                  />
                  <SettingsStack.Screen
                    name="OnboardStaff"
                    component={OnboardStaffScreen}
                  />
                  <SettingsStack.Screen
                    name="StaffActivity"
                    component={StaffActivityScreen}
                  />
                  <SettingsStack.Screen
                    name="Analytics"
                    component={AnalyticsScreen}
                  />
                  <SettingsStack.Screen
                    name="ManageRanchProfile"
                    component={ManageRanchProfileScreen}
                  />
                  <SettingsStack.Screen
                    name="ProfileHome"
                    component={StaffProfileScreen}
                  />
                  <SettingsStack.Screen
                    name="NotificationSettings"
                    component={NotificationSettingsScreen}
                  />
                  <SettingsStack.Screen
                    name="HelpSupport"
                    component={HelpSupportScreen}
                  />
                  <SettingsStack.Screen
                    name="PricingPlans"
                    component={PricingPlansScreen}
                  />
                </SettingsStack.Navigator>
              )}
            </Tab.Screen>
          </Tab.Navigator>
        )}
      </RanchStack.Screen>
      <RanchStack.Screen
        name="AdminModal"
        component={AdminNavigator}
        options={{ presentation: 'modal' }}
      />
    </RanchStack.Navigator>
  );
};
