import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AdminStackParamList } from './types';
import { AdminPanelHomeScreen } from '../screens/admin/AdminPanelHomeScreen';
import { ManageTeamScreen } from '../screens/admin/ManageTeamScreen';
import { OnboardStaffScreen } from '../screens/admin/OnboardStaffScreen';
import { StaffActivityScreen } from '../screens/admin/StaffActivityScreen';
import { AnalyticsScreen } from '../screens/admin/AnalyticsScreen';
import { ManageRanchProfileScreen } from '../screens/admin/ManageRanchProfileScreen';
import { StaffProfileScreen } from '../screens/profile/StaffProfileScreen';
import { NotificationSettingsScreen } from '../screens/profile/NotificationSettingsScreen';
import { HelpSupportScreen } from '../screens/profile/HelpSupportScreen';

const Stack = createStackNavigator<AdminStackParamList>();

export const AdminNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTitleStyle: {
          fontFamily: 'PlayfairDisplay-Bold',
          color: '#1D1814',
        },
        headerTintColor: '#C1440E',
      }}
    >
      <Stack.Screen 
        name="AdminPanelHome" 
        component={AdminPanelHomeScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ManageTeam" 
        component={ManageTeamScreen} 
        options={{ title: 'Manage Team' }}
      />
      <Stack.Screen 
        name="OnboardStaff" 
        component={OnboardStaffScreen} 
        options={{ title: 'Onboard Staff' }}
      />
      <Stack.Screen 
        name="StaffActivity" 
        component={StaffActivityScreen} 
        options={{ title: 'Staff Activity' }}
      />
      <Stack.Screen 
        name="Analytics" 
        component={AnalyticsScreen} 
        options={{ title: 'Analytics' }}
      />
      <Stack.Screen 
        name="ManageRanchProfile" 
        component={ManageRanchProfileScreen} 
        options={{ title: 'Ranch Profile' }}
      />
      <Stack.Screen 
        name="ProfileHome" 
        component={StaffProfileScreen} 
        options={{ title: 'My Profile' }}
      />
      <Stack.Screen 
        name="NotificationSettings" 
        component={NotificationSettingsScreen} 
        options={{ title: 'Notifications' }}
      />
      <Stack.Screen 
        name="HelpSupport" 
        component={HelpSupportScreen} 
        options={{ title: 'Help & Support' }}
      />
    </Stack.Navigator>
  );
};
