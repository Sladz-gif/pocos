import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PInput, PButton, PChip, ImagePickerField } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { StoreStackParamList } from '../../navigation/types';
import { useMarketplaceStore } from '../../store/marketplaceStore';
import { useAuthStore } from '../../store/authStore';
import { useLivestockStore } from '../../store/livestockStore';

type AddListingScreenProps = {
  navigation: StackNavigationProp<StoreStackParamList, 'AddListing'>;
};

const CATEGORIES = ['Live Cattle', 'Beef / Meat', 'Milk & Dairy', 'Feed & Hay', 'Other'];
const UNITS = ['per kg', 'per head', 'per litre', 'per bale', 'per unit'];

export const AddListingScreen: React.FC<AddListingScreenProps> = ({ navigation }) => {
  const { addListing } = useMarketplaceStore();
  const { ranch } = useAuthStore();
  const { animals, fetchAnimals } = useLivestockStore();
  
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Live Cattle');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('1');
  const [unit, setUnit] = useState('per head');
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null]);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (ranch?.id) {
      fetchAnimals(ranch.id);
    }
  }, [ranch?.id, fetchAnimals]);

  const handlePublish = async () => {
    if (!productName.trim() || !price || !stock) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!ranch?.id) {
      Alert.alert('Error', 'No ranch context found');
      return;
    }

    try {
      setIsSubmitting(true);
      const validPhotos = photos.filter((p): p is string => p !== null);
      
      await addListing({
        productName: productName.trim(),
        description: description.trim(),
        category,
        price: parseFloat(price),
        stock: parseInt(stock),
        unit,
        imageUrl: validPhotos[0] || null,
        photos: validPhotos,
        animalId: selectedAnimalId,
        status: 'listed',
      }, ranch.id);

      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create listing');
    } finally {
      setIsSubmitting(false);
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
          <Ionicons name="close" size={28} color={Colors.charcoalInk} />
        </TouchableOpacity>
        <Text style={styles.title}>New Listing</Text>
        <TouchableOpacity onPress={handlePublish} disabled={isSubmitting}>
          <Text style={[styles.saveText, isSubmitting && { opacity: 0.5 }]}>Publish</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.photosSection}>
            <Text style={styles.sectionLabel}>Product Photos (Max 3)</Text>
            <View style={styles.photosRow}>
              {photos.map((uri, index) => (
                <View key={index} style={styles.photoPickerContainer}>
                  <ImagePickerField 
                    value={uri}
                    onChange={(newUri) => handlePhotoChange(newUri, index)}
                    folder="products"
                    size={100}
                  />
                  <Text style={styles.photoLabel}>{index === 0 ? 'Primary' : `Photo ${index + 1}`}</Text>
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
            
            <View style={styles.section}>
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
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Link to Animal Record (Optional)</Text>
                <Text style={styles.sectionHint}>Linking pulls live weight and health data for buyers.</Text>
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

            <View style={styles.section}>
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

            <View style={styles.row}>
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
              title="Publish Listing" 
              onPress={handlePublish} 
              loading={isSubmitting}
              style={styles.submitButton}
            />
            <View style={{ height: 40 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  saveText: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.primaryRust,
  },
  content: {
    flex: 1,
  },
  photosSection: {
    padding: Spacing.xl,
    backgroundColor: '#FFFFFF',
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
    marginBottom: Spacing.sm,
  },
  sectionHint: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    color: Colors.mutedSienna,
    marginBottom: Spacing.sm,
  },
  photosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  photoPickerContainer: {
    alignItems: 'center',
  },
  photoLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: 10,
    color: Colors.mutedSienna,
    marginTop: 4,
  },
  form: {
    padding: Spacing.xl,
    backgroundColor: '#FFFFFF',
    paddingBottom: Spacing['4xl'],
  },
  section: {
    marginBottom: Spacing.xl,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
  },
  animalPicker: {
    flexDirection: 'row',
    marginTop: Spacing.xs,
  },
  animalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.softAsh,
    marginRight: Spacing.sm,
    backgroundColor: '#FFFFFF',
  },
  animalChipSelected: {
    backgroundColor: Colors.primaryRust,
    borderColor: Colors.primaryRust,
  },
  animalChipText: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
    marginLeft: 6,
  },
  animalChipTextSelected: {
    color: '#FFFFFF',
  },
  submitButton: {
    marginTop: Spacing.xl,
  },
});
