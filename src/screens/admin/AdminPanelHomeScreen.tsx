import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PCard, PButton } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { AdminStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';

type AdminPanelHomeScreenProps = {
  navigation: StackNavigationProp<AdminStackParamList, 'AdminPanelHome'>;
};

export const AdminPanelHomeScreen: React.FC<AdminPanelHomeScreenProps> = ({ navigation }) => {
  const { logout, ranch, user } = useAuthStore();
  const isOwner = user?.role === 'super_admin' || user?.role === 'ranch_owner';

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out of your ranch account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            navigation.getParent()?.goBack();
            logout();
          } 
        },
      ]
    );
  };

  const handleClose = () => {
    // Dismiss the modal
    const parent = navigation.getParent();
    if (parent) {
      parent.goBack();
    } else {
      navigation.goBack();
    }
  };

  if (!isOwner) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={28} color={Colors.charcoalInk} />
          </TouchableOpacity>
          <Text style={styles.title}>Account</Text>
          <View style={{ width: 28 }} />
        </View>
        <ScrollView style={styles.content}>
          <View style={styles.staffInfoCard}>
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color={Colors.primaryRust} />
            </View>
            <Text style={styles.staffName}>{user?.name}</Text>
            <Text style={styles.staffRole}>
              {user?.role === 'super_admin' ? 'Admin' : 'Ranch Staff'} • {ranch?.name}
            </Text>
          </View>

          <PCard style={styles.menuItem} onPress={() => {
            navigation.navigate('ProfileHome');
          }}>
            <View style={styles.menuIcon}>
              <Ionicons name="person-outline" size={24} color={Colors.primaryRust} />
            </View>
            <View style={styles.menuText}>
              <Text style={styles.menuTitle}>My Profile</Text>
              <Text style={styles.menuSubtitle}>Update your personal information</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.mutedSienna} />
          </PCard>

          <PButton 
            title="Logout" 
            variant="danger" 
            onPress={handleLogout} 
            style={styles.logoutButton}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose}>
          <Ionicons name="close" size={28} color={Colors.charcoalInk} />
        </TouchableOpacity>
        <Text style={styles.title}>Admin Control</Text>
        <View style={{ width: 28 }} />
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ranch Management</Text>
          <PCard style={styles.menuItem} onPress={() => navigation.navigate('ManageRanchProfile')}>
            <View style={styles.menuIcon}>
              <Ionicons name="business-outline" size={24} color={Colors.primaryRust} />
            </View>
            <View style={styles.menuText}>
              <Text style={styles.menuTitle}>Ranch Profile</Text>
              <Text style={styles.menuSubtitle}>Branding, location, and contact info</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.mutedSienna} />
          </PCard>

          <PCard style={styles.menuItem} onPress={() => navigation.navigate('ManageTeam')}>
            <View style={styles.menuIcon}>
              <Ionicons name="people-outline" size={24} color={Colors.primaryRust} />
            </View>
            <View style={styles.menuText}>
              <Text style={styles.menuTitle}>Manage Team</Text>
              <Text style={styles.menuSubtitle}>Edit, remove, or update staff info</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.mutedSienna} />
          </PCard>

          <PCard style={styles.menuItem} onPress={() => navigation.navigate('OnboardStaff')}>
            <View style={styles.menuIcon}>
              <Ionicons name="person-add-outline" size={24} color={Colors.primaryRust} />
            </View>
            <View style={styles.menuText}>
              <Text style={styles.menuTitle}>Onboard Staff</Text>
              <Text style={styles.menuSubtitle}>Generate access codes for team members</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.mutedSienna} />
          </PCard>

          <PCard style={styles.menuItem} onPress={() => navigation.navigate('StaffActivity')}>
            <View style={styles.menuIcon}>
              <Ionicons name="eye-outline" size={24} color={Colors.primaryRust} />
            </View>
            <View style={styles.menuText}>
              <Text style={styles.menuTitle}>Staff Activity Audit</Text>
              <Text style={styles.menuSubtitle}>Review all actions taken by your team</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.mutedSienna} />
          </PCard>

          <PCard style={styles.menuItem} onPress={() => navigation.navigate('Analytics')}>
            <View style={styles.menuIcon}>
              <Ionicons name="analytics-outline" size={24} color={Colors.primaryRust} />
            </View>
            <View style={styles.menuText}>
              <Text style={styles.menuTitle}>Ranch Analytics</Text>
              <Text style={styles.menuSubtitle}>Deep insights and version history</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.mutedSienna} />
          </PCard>
        </View>

        <PButton 
          title="Logout" 
          variant="danger" 
          onPress={handleLogout} 
          style={styles.logoutButton}
        />
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.softAsh,
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.xl,
    color: Colors.charcoalInk,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.lg,
    color: Colors.charcoalInk,
    marginBottom: Spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.warmSand,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
  },
  menuSubtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.xs,
    color: Colors.mutedSienna,
  },
  logoutButton: {
    marginTop: Spacing.xl,
    marginBottom: Spacing['4xl'],
  },
  staffInfoCard: {
    alignItems: 'center',
    padding: Spacing['2xl'],
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.softAsh,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.warmSand,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  staffName: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.xl,
    color: Colors.charcoalInk,
  },
  staffRole: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
    marginTop: 4,
  },
});
