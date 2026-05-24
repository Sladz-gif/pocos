import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PBadge, PCard, LoadingState } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { BrowseStackParamList } from '../../navigation/types';
import { RouteProp } from '@react-navigation/native';
import { useMarketplaceStore } from '../../store/marketplaceStore';

type RanchProfileScreenProps = {
  route: RouteProp<BrowseStackParamList, 'RanchProfile'>;
  navigation: StackNavigationProp<BrowseStackParamList, 'RanchProfile'>;
};

export const RanchProfileScreen: React.FC<RanchProfileScreenProps> = ({ route, navigation }) => {
  const { id } = route.params;
  const { currentRanch, fetchRanchDetails, listings, fetchListings, isLoading } = useMarketplaceStore();
  const [activeSubTab, setActiveSubTab] = React.useState<'Products' | 'About' | 'Reviews'>('Products');

  useEffect(() => {
    fetchRanchDetails(id);
    fetchListings(id);
  }, [id, fetchRanchDetails, fetchListings]);

  if (isLoading || !currentRanch) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingState variant="profile" />
      </SafeAreaView>
    );
  }

  const ranchListings = listings.filter(l => l.ranchId === id && l.status === 'listed');
  const cattleListings = ranchListings.filter(l => l.category?.toLowerCase() === 'cattle' || l.category?.toLowerCase() === 'livestock');

  const renderContent = () => {
    if (activeSubTab === 'About') {
      return (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>About {currentRanch.name}</Text>
          <Text style={styles.description}>
            {currentRanch.description || "No description provided for this ranch yet."}
          </Text>

          <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Contact Information</Text>
          <View style={styles.contactCard}>
            <View style={styles.contactRow}>
              <Ionicons name="location-outline" size={20} color={Colors.primaryRust} />
              <Text style={styles.contactText}>{currentRanch.location || 'Location not specified'}</Text>
            </View>
            {currentRanch.contact_email && (
              <View style={styles.contactRow}>
                <Ionicons name="mail-outline" size={20} color={Colors.primaryRust} />
                <Text style={styles.contactText}>{currentRanch.contact_email}</Text>
              </View>
            )}
            {currentRanch.contact_phone && (
              <View style={styles.contactRow}>
                <Ionicons name="call-outline" size={20} color={Colors.primaryRust} />
                <Text style={styles.contactText}>{currentRanch.contact_phone}</Text>
              </View>
            )}
            {currentRanch.website && (
              <View style={styles.contactRow}>
                <Ionicons name="globe-outline" size={20} color={Colors.primaryRust} />
                <Text style={styles.contactText}>{currentRanch.website}</Text>
              </View>
            )}
          </View>
        </View>
      );
    }

    if (activeSubTab === 'Reviews') {
      return (
        <View style={styles.content}>
          <View style={styles.emptyContainer}>
            <Ionicons name="star-outline" size={48} color={Colors.softAsh} />
            <Text style={styles.emptyText}>No reviews yet.</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.content}>
        {cattleListings.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Featured Cattle</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {cattleListings.map(listing => (
                <PCard key={listing.id} style={styles.featuredCard} onPress={() => navigation.navigate('ProductDetail', { id: listing.id })}>
                  <View style={styles.featuredImage}>
                    {listing.image_url ? (
                      <Image source={{ uri: listing.image_url }} style={styles.cardImage} />
                    ) : (
                      <Ionicons name="paw" size={32} color={Colors.primaryRust} />
                    )}
                  </View>
                  <Text style={styles.featuredName} numberOfLines={1}>{listing.title}</Text>
                  <Text style={styles.featuredPrice}>GHS {listing.price?.toLocaleString()}</Text>
                </PCard>
              ))}
            </ScrollView>
          </>
        )}

        <Text style={styles.sectionTitle}>All Products</Text>
        {ranchListings.length > 0 ? (
          <View style={styles.productGrid}>
            {ranchListings.map(listing => (
              <PCard key={listing.id} style={styles.gridCard} onPress={() => navigation.navigate('ProductDetail', { id: listing.id })}>
                <View style={styles.gridImage}>
                  {listing.image_url ? (
                    <Image source={{ uri: listing.image_url }} style={styles.cardImage} />
                  ) : (
                    <Ionicons name="cube-outline" size={24} color={Colors.mutedSienna} />
                  )}
                </View>
                <Text style={styles.gridName} numberOfLines={1}>{listing.title}</Text>
                <Text style={styles.gridPrice}>GHS {listing.price?.toLocaleString()}</Text>
              </PCard>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="basket-outline" size={48} color={Colors.softAsh} />
            <Text style={styles.emptyText}>No products listed yet.</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.coverPlaceholder}>
            {currentRanch.cover_url ? (
              <Image source={{ uri: currentRanch.cover_url }} style={styles.coverImage} />
            ) : (
              <View style={styles.coverOverlay} />
            )}
          </View>
          <View style={styles.profileSection}>
            <View style={styles.logoContainer}>
              {currentRanch.logo_url ? (
                <Image source={{ uri: currentRanch.logo_url }} style={styles.logoImage} />
              ) : (
                <Ionicons name="business" size={48} color={Colors.primaryRust} />
              )}
            </View>
            <Text style={styles.ranchName}>{currentRanch.name}</Text>
            <Text style={styles.ranchLocation}>
              {currentRanch.location} • Established {currentRanch.created_at ? new Date(currentRanch.created_at).getFullYear() : '2024'}
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>4.9</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{ranchListings.length}</Text>
                <Text style={styles.statLabel}>Products</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>--</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={[styles.tab, activeSubTab === 'Products' && styles.activeTab]}
            onPress={() => setActiveSubTab('Products')}
          >
            <Text style={[styles.tabText, activeSubTab === 'Products' && styles.activeTabText]}>Products</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeSubTab === 'About' && styles.activeTab]}
            onPress={() => setActiveSubTab('About')}
          >
            <Text style={[styles.tabText, activeSubTab === 'About' && styles.activeTabText]}>About</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeSubTab === 'Reviews' && styles.activeTab]}
            onPress={() => setActiveSubTab('Reviews')}
          >
            <Text style={[styles.tabText, activeSubTab === 'Reviews' && styles.activeTabText]}>Reviews</Text>
          </TouchableOpacity>
        </View>

        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.paleParchment,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'DMSans-Medium',
    color: Colors.mutedSienna,
  },
  header: {
    backgroundColor: Colors.deepPlum,
    paddingBottom: Spacing.xl,
  },
  backButton: {
    position: 'absolute',
    top: Spacing.lg,
    left: Spacing.xl,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverPlaceholder: {
    height: 150,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: -40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.warmSand,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.deepPlum,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  ranchName: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize['2xl'],
    color: '#FFFFFF',
    marginTop: Spacing.md,
  },
  ranchLocation: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.warmSand,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: Spacing.xl,
    gap: Spacing['2xl'],
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.lg,
    color: '#FFFFFF',
  },
  statLabel: {
    fontFamily: 'DMSans-Regular',
    fontSize: 10,
    color: Colors.warmSand,
    textTransform: 'uppercase',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.softAsh,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: Colors.primaryRust,
  },
  tabText: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
  },
  activeTabText: {
    color: Colors.primaryRust,
  },
  content: {
    padding: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.xl,
    color: Colors.charcoalInk,
    marginBottom: Spacing.lg,
  },
  description: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
    lineHeight: 22,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.softAsh,
    gap: Spacing.md,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  contactText: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
  },
  horizontalScroll: {
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  featuredCard: {
    width: 160,
    padding: Spacing.md,
  },
  featuredImage: {
    height: 100,
    backgroundColor: Colors.softAsh,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredName: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
  },
  featuredPrice: {
    fontFamily: 'DMMono-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.primaryRust,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  gridCard: {
    width: '47%',
    padding: Spacing.md,
  },
  gridImage: {
    height: 80,
    backgroundColor: Colors.softAsh,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  gridName: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
  },
  gridPrice: {
    fontFamily: 'DMMono-Regular',
    fontSize: Typography.fontSize.xs,
    color: Colors.primaryRust,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
  },
  emptyText: {
    fontFamily: 'DMSans-Regular',
    color: Colors.softAsh,
    marginTop: Spacing.md,
  },
});

