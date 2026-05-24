import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PCard } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { AdminStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';

type StaffProfileScreenProps = { 
  navigation: StackNavigationProp<AdminStackParamList, 'ProfileHome'>;
};

export const StaffProfileScreen: React.FC<StaffProfileScreenProps> = ({ navigation }) => {
  const { user, ranch, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
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

  const getRoleLabel = (role?: string) => {
    if (!role) return 'Staff';
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.charcoalInk} />
        </TouchableOpacity>
        <Text style={styles.title}>My Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || '?'}</Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Staff Member'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{getRoleLabel(user?.role)}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Ranch Information</Text>
          <PCard style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="business-outline" size={20} color={Colors.primaryRust} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Ranch Name</Text>
                <Text style={styles.infoValue}>{ranch?.name || 'Not Assigned'}</Text>
              </View>
            </View>
            <View style={[styles.infoRow, styles.lastRow]}>
              <Ionicons name="location-outline" size={20} color={Colors.primaryRust} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{ranch?.location || 'Not Specified'}</Text>
              </View>
            </View>
          </PCard>

          <Text style={styles.sectionTitle}>Account Details</Text>
          <PCard style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="key-outline" size={20} color={Colors.primaryRust} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Access Code</Text>
                <Text style={styles.infoValue}>{user?.accessCode || 'N/A'}</Text>
                <Text style={styles.helperText}>Used for secure login. Cannot be changed.</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color={Colors.primaryRust} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email || 'No email provided'}</Text>
              </View>
            </View>
            <View style={[styles.infoRow, styles.lastRow]}>
              <Ionicons name="call-outline" size={20} color={Colors.primaryRust} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{user?.phone || 'Not linked'}</Text>
              </View>
            </View>
          </PCard>

          <Text style={styles.sectionTitle}>Preferences</Text>
          <PCard style={styles.infoCard}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigation.navigate('NotificationSettings')}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name="notifications-outline" size={22} color={Colors.primaryRust} />
                <Text style={styles.menuItemText}>Notification Settings</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.softAsh} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.menuItem, styles.lastRow]}
              onPress={() => navigation.navigate('HelpSupport')}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name="help-circle-outline" size={22} color={Colors.primaryRust} />
                <Text style={styles.menuItemText}>Help & Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.softAsh} />
            </TouchableOpacity>
          </PCard>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={Colors.primaryRust} />
          <Text style={styles.logoutText}>Logout from App</Text>
        </TouchableOpacity>
        
        <Text style={styles.footerText}>Pocos Ranch v1.0.0</Text>
        <View style={{ height: 40 }} />
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.softAsh,
  },
  backButton: {
    padding: Spacing.xs,
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.xl,
    color: Colors.charcoalInk,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center', 
    padding: Spacing['3xl'],
    backgroundColor: '#FFFFFF',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.warmSand,
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 3,
    borderColor: Colors.primaryRust,
  },
  avatarText: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 36,
    color: Colors.primaryRust,
  },
  userName: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize['2xl'],
    color: Colors.charcoalInk,
    marginBottom: Spacing.xs,
  },
  roleBadge: {
    backgroundColor: Colors.primaryRust,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  roleText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  infoSection: {
    paddingHorizontal: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
    textTransform: 'uppercase',
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
    marginLeft: 4,
  },
  infoCard: {
    padding: 0,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softAsh,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  infoTextContainer: {
    marginLeft: Spacing.lg,
    flex: 1,
  },
  infoLabel: {
    fontFamily: 'DMSans-Regular',
    fontSize: 10,
    color: Colors.mutedSienna,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softAsh,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.base, 
    color: Colors.charcoalInk, 
    marginLeft: Spacing.lg,
  },
  helperText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 10,
    color: Colors.mutedSienna,
    fontStyle: 'italic',
    marginTop: 2,
  },
  logoutButton: {
    margin: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.softAsh,
    gap: Spacing.sm,
  },
  logoutText: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.base, 
    color: Colors.primaryRust,
  },
  footerText: {
    textAlign: 'center',
    fontFamily: 'DMSans-Regular',
    fontSize: 10,
    color: Colors.softAsh,
  }
});
