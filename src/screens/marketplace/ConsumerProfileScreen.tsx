import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PCard } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import { useMarketplaceStore } from '../../store/marketplaceStore';

type ConsumerProfileScreenProps = { 
  navigation: StackNavigationProp<ProfileStackParamList, 'ProfileHome'>;
};

export const ConsumerProfileScreen: React.FC<ConsumerProfileScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const { fetchBuyerOrders, orders, fetchSavedListings, savedListingIds } = useMarketplaceStore();

  React.useEffect(() => {
    if (user?.id) {
      fetchBuyerOrders(user.id);
      fetchSavedListings(user.id);
    }
  }, [user?.id, fetchBuyerOrders, fetchSavedListings]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => logout() 
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={Colors.primaryRust} />
          </View>
          <Text style={styles.userName}>{user?.name || 'Guest User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'guest@pocos.dev'}</Text>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.getParent()?.navigate('OrdersStack' as any)}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="receipt-outline" size={22} color={Colors.primaryRust} />
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuItemText}>My Orders</Text>
                <Text style={styles.menuItemSubtext}>{orders.length} order{orders.length !== 1 ? 's' : ''}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.softAsh} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.getParent()?.navigate('Saved' as any)}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="heart-outline" size={22} color={Colors.primaryRust} />
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuItemText}>Saved Items</Text>
                <Text style={styles.menuItemSubtext}>{savedListingIds.length} item{savedListingIds.length !== 1 ? 's' : ''} in wishlist</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.softAsh} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('DeliveryAddresses')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="location-outline" size={22} color={Colors.primaryRust} />
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuItemText}>Delivery Addresses</Text>
                <Text style={styles.menuItemSubtext}>Manage your shipping locations</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.softAsh} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('PaymentMethods')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="card-outline" size={22} color={Colors.primaryRust} />
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuItemText}>Payment Methods</Text>
                <Text style={styles.menuItemSubtext}>Manage momo and cards</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.softAsh} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  profileSection: {
    alignItems: 'center', 
    padding: Spacing['3xl'],
    backgroundColor: '#FFFFFF',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.warmSand,
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  userName: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.xl,
    color: Colors.charcoalInk,
  },
  userEmail: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
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
  },
  menuTextContainer: {
    marginLeft: Spacing.lg,
  },
  menuItemSubtext: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    color: Colors.mutedSienna,
    marginTop: 2,
  },
  logoutButton: {
    margin: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', 
    borderWidth: 1,
    borderColor: Colors.softAsh,
  },
  logoutText: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.base, 
    color: Colors.primaryRust,
  },
});
