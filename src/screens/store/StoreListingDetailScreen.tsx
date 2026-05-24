import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PCard, PBadge, PButton, PModal, PInput, PChip, ImagePickerField } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { StoreStackParamList } from '../../navigation/types';
import { RouteProp } from '@react-navigation/native';
import { useMarketplaceStore } from '../../store/marketplaceStore';
import { useLivestockStore } from '../../store/livestockStore';
import { useAuthStore } from '../../store/authStore';

type StoreListingDetailScreenProps = {
  route: RouteProp<StoreStackParamList, 'StoreListingDetail'>;
  navigation: StackNavigationProp<StoreStackParamList, 'StoreListingDetail'>;
};

const CATEGORIES = ['Live Cattle', 'Beef / Meat', 'Milk & Dairy', 'Feed & Hay', 'Other'];
const UNITS = ['per kg', 'per head', 'per litre', 'per bale', 'per unit'];

export const StoreListingDetailScreen: React.FC<StoreListingDetailScreenProps> = ({ route, navigation }) => {
  const { id } = route.params;
  const { listings, updateListing } = useMarketplaceStore();
  const { animals, fetchAnimals } = useLivestockStore();
  const { ranch } = useAuthStore();
  
  const listing = listings.find(l => l.id === id);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit form state
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [unit, setUnit] = useState('');
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null]);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);

  useEffect(() => {
    if (listing) {
      setProductName(listing.productName);
      setDescription(listing.description || '');
      setCategory(listing.category);
      setPrice(listing.price.toString());
      setStock(listing.stock.toString());
      setUnit(listing.unit);
      
      const initialPhotos: (string | null)[] = [null, null, null];
      if (listing.photos && listing.photos.length > 0) {
        listing.photos.forEach((p: string, i: number) => {
          if (i < 3) initialPhotos[i] = p;
        });
      } else if (listing.imageUrl) {
        initialPhotos[0] = listing.imageUrl;
      }
      setPhotos(initialPhotos);
      setSelectedAnimalId(listing.animalId);
    }
  }, [listing, showEditModal]);

  useEffect(() => {
    if (ranch?.id) {
      fetchAnimals(ranch.id);
    }
  }, [ranch?.id, fetchAnimals]);

  if (!listing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.charcoalInk} />
          </TouchableOpacity>
          <Text style={styles.title}>Not Found</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centered}>
          <Text>Listing not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleToggleStatus = async () => {
    try {
      setIsUpdating(true);
      const newStatus = listing.status === 'listed' ? 'hidden' : 'listed';
      await updateListing(id, { status: newStatus });
      Alert.alert('Success', `Listing is now ${newStatus}`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateListing = async () => {
    if (!productName.trim() || !price || !stock) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setIsUpdating(true);
      const validPhotos = photos.filter((p): p is string => p !== null);
      
      await updateListing(id, {
        productName: productName.trim(),
        description: description.trim(),
        category,
        price: parseFloat(price),
        stock: parseInt(stock),
        unit,
        imageUrl: validPhotos[0] || null,
        photos: validPhotos,
        animalId: selectedAnimalId,
      });

      setShowEditModal(false);
      Alert.alert('Success', 'Listing updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update listing');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePhotoChange = (uri: string | null, index: number) => {
    const newPhotos = [...photos];
    newPhotos[index] = uri;
    setPhotos(newPhotos);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.charcoalInk} />
        </TouchableOpacity>
        <Text style={styles.title}>Listing Details</Text>
        <TouchableOpacity onPress={() => setShowEditModal(true)}>
          <Ionicons name="create-outline" size={24} color={Colors.primaryRust} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {listing.imageUrl ? (
          <Image source={{ uri: listing.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={64} color={Colors.mutedSienna} />
            <Text style={styles.imageText}>No image provided</Text>
          </View>
        )}

        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <Text style={styles.listingName}>{listing.productName}</Text>
            <PBadge 
              text={listing.status === 'listed' ? 'Live' : 'Hidden'} 
              variant={listing.status === 'listed' ? 'success' : 'neutral'} 
            />
          </View>
          <Text style={styles.listingPrice}>GHS {listing.price.toLocaleString()}</Text>
          <Text style={styles.listingDescription}>
            {listing.description || 'No description provided.'}
          </Text>
        </View>

        <PCard style={styles.statsCard}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Category</Text>
              <Text style={styles.statValue}>{listing.category}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Stock</Text>
              <Text style={styles.statValue}>{listing.stock} {listing.unit}</Text>
            </View>
          </View>
          <View style={[styles.statRow, { marginTop: Spacing.lg }]}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Discount</Text>
              <Text style={styles.statValue}>{listing.discount}%</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Created</Text>
              <Text style={styles.statValue}>{new Date(listing.createdAt).toLocaleDateString()}</Text>
            </View>
          </View>
        </PCard>

        <View style={styles.actions}>
          <PButton 
            title={listing.status === 'listed' ? "Hide Listing" : "Publish Listing"} 
            variant={listing.status === 'listed' ? "secondary" : "success"} 
            onPress={handleToggleStatus} 
            loading={isUpdating}
            style={styles.actionButton}
          />
          <PButton 
            title="Manage Promotion" 
            variant="secondary" 
            onPress={() => navigation.navigate('Discounts')} 
            style={styles.actionButton}
          />
        </View>
      </ScrollView>

      <PModal visible={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Listing">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ maxHeight: 600 }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.photosSection}>
              <Text style={styles.sectionLabel}>Product Photos (Max 3)</Text>
              <View style={styles.photosRow}>
                {photos.map((uri, index) => (
                  <View key={index} style={styles.photoPickerContainer}>
                    <ImagePickerField 
                      value={uri}
                      onChange={(newUri) => handlePhotoChange(newUri, index)}
                      folder="products"
                      size={80}
                    />
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.form}>
              <PInput 
                label="Product Name" 
                placeholder="e.g. Brahman Heifer" 
                value={productName}
                onChangeText={setProductName}
              />
              <PInput 
                label="Description" 
                placeholder="Describe your product..." 
                multiline 
                numberOfLines={4} 
                value={description}
                onChangeText={setDescription}
              />
              
              <View style={styles.modalSection}>
                <Text style={styles.sectionLabel}>Category</Text>
                <View style={styles.chipRow}>
                  {CATEGORIES.map(c => (
                    <PChip 
                      key={c} 
                      label={c} 
                      selected={category === c} 
                      onPress={() => {
                        setCategory(c);
                        if (c !== 'Live Cattle') setSelectedAnimalId(null);
                      }}
                    />
                  ))}
                </View>
              </View>

              {category === 'Live Cattle' && (
                <View style={styles.modalSection}>
                  <Text style={styles.sectionLabel}>Link to Animal Record (Optional)</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.animalPicker}>
                    {animals.map(animal => (
                      <TouchableOpacity 
                        key={animal.id}
                        style={[
                          styles.animalChip,
                          selectedAnimalId === animal.id && styles.animalChipSelected
                        ]}
                        onPress={() => setSelectedAnimalId(selectedAnimalId === animal.id ? null : animal.id)}
                      >
                        <Ionicons 
                          name="paw" 
                          size={16} 
                          color={selectedAnimalId === animal.id ? '#FFFFFF' : Colors.mutedSienna} 
                        />
                        <Text style={[
                          styles.animalChipText,
                          selectedAnimalId === animal.id && styles.animalChipTextSelected
                        ]}>
                          {animal.animalId}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <View style={styles.modalSection}>
                <Text style={styles.sectionLabel}>Unit Type</Text>
                <View style={styles.chipRow}>
                  {UNITS.map(u => (
                    <PChip 
                      key={u} 
                      label={u} 
                      selected={unit === u} 
                      onPress={() => setUnit(u)}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.modalRow}>
                <View style={{ flex: 1, marginRight: Spacing.md }}>
                  <PInput 
                    label="Price (GHS)" 
                    placeholder="0.00" 
                    keyboardType="numeric" 
                    value={price}
                    onChangeText={setPrice}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <PInput 
                    label="Stock" 
                    placeholder="1" 
                    keyboardType="numeric" 
                    value={stock}
                    onChangeText={setStock}
                  />
                </View>
              </View>

              <PButton 
                title="Save Changes" 
                onPress={handleUpdateListing} 
                loading={isUpdating}
                style={styles.saveButton}
              />
              <View style={{ height: 40 }} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 240,
  },
  imagePlaceholder: {
    width: '100%',
    height: 240,
    backgroundColor: Colors.softAsh,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
    marginTop: Spacing.sm,
  },
  infoSection: {
    padding: Spacing.xl,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  listingName: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize['2xl'],
    color: Colors.charcoalInk,
  },
  listingPrice: {
    fontFamily: 'DMMono-Regular',
    fontSize: Typography.fontSize.xl,
    color: Colors.primaryRust,
    marginBottom: Spacing.lg,
  },
  listingDescription: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.mutedSienna,
    lineHeight: 24,
  },
  statsCard: {
    marginHorizontal: Spacing.xl,
    padding: Spacing.lg,
  },
  statRow: {
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.xs,
    color: Colors.mutedSienna,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
  },
  actions: {
    padding: Spacing.xl,
    gap: Spacing.md,
    marginBottom: Spacing['4xl'],
  },
  actionButton: {
    width: '100%',
  },
  // Edit modal styles
  photosSection: {
    padding: Spacing.md,
  },
  sectionLabel: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
    marginBottom: Spacing.sm,
  },
  photosRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  photoPickerContainer: {
    alignItems: 'center',
  },
  form: {
    padding: Spacing.md,
  },
  modalSection: {
    marginBottom: Spacing.lg,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  modalRow: {
    flexDirection: 'row',
  },
  animalPicker: {
    marginTop: Spacing.sm,
  },
  animalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.softAsh,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    marginRight: Spacing.sm,
  },
  animalChipSelected: {
    backgroundColor: Colors.primaryRust,
    borderColor: Colors.primaryRust,
  },
  animalChipText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: Colors.charcoalInk,
    marginLeft: 6,
  },
  animalChipTextSelected: {
    color: '#FFFFFF',
  },
  saveButton: {
    marginTop: Spacing.xl,
  },
});
