import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PCard, PBadge, PButton, PModal, PInput } from '../../components/ui';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HerdStackParamList } from '../../navigation/types';
import { useLivestockStore } from '../../store/livestockStore';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';

type AnimalDetailScreenProps = {
  route: RouteProp<HerdStackParamList, 'AnimalDetail'>;
  navigation: StackNavigationProp<HerdStackParamList, 'AnimalDetail'>;
};

type SubTab = 'Profiles' | 'Medication' | 'Feeding' | 'Breeding';

export const AnimalDetailScreen: React.FC<AnimalDetailScreenProps> = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { id } = route.params;
  const { 
    animals, 
    medicationRecords, 
    pregnancyRecords, 
    feedingRecords,
    fetchMedicationRecords, 
    fetchPregnancyRecords, 
    fetchFeedingRecords,
    addMedicationRecord, 
    addPregnancyRecord, 
    addFeedingRecord,
    deleteMedicationRecord,
    deletePregnancyRecord,
    deleteFeedingRecord,
    deleteAnimal,
    updateAnimal 
  } = useLivestockStore();
  const { ranch } = useAuthStore();
  const [activeTab, setActiveTab] = useState<SubTab>('Profiles');

  // Modal states
  const [isMedModalVisible, setIsMedModalVisible] = useState(false);
  const [isFeedingModalVisible, setIsFeedingModalVisible] = useState(false);
  const [isBreedingModalVisible, setIsBreedingModalVisible] = useState(false);
  const [isEditAnimalModalVisible, setIsEditAnimalModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDeleteAnimalModalVisible, setIsDeleteAnimalModalVisible] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<{ id: string, type: 'med' | 'feed' | 'breeding' } | null>(null);

  // Form states
  const [medForm, setMedForm] = useState({ medicationName: '', dosage: '', notes: '', wearOffDays: '28' });
  const [feedingForm, setFeedingForm] = useState({ feedType: '', quantity: '', unit: 'kg', notes: '' });
  const [breedingForm, setBreedingForm] = useState({ sireId: '', startDate: new Date().toISOString().split('T')[0], notes: '' });
  const [animalForm, setAnimalForm] = useState({ breed: '', weight: '', healthStatus: '' });

  const animal = animals.find(a => a.id === id);

  useEffect(() => {
    if (animal) {
      setAnimalForm({
        breed: animal.breed || '',
        weight: animal.weight?.toString() || '',
        healthStatus: animal.healthStatus || 'healthy',
      });
    }
  }, [animal]);

  useEffect(() => {
    if (ranch?.id) {
      fetchMedicationRecords(ranch.id);
      fetchPregnancyRecords(ranch.id);
      fetchFeedingRecords(ranch.id);
    }
  }, [ranch?.id, fetchMedicationRecords, fetchPregnancyRecords, fetchFeedingRecords]);

  if (!animal) return null;

  const animalMeds = medicationRecords.filter(m => m.animalId === animal.id);
  const animalPregnancies = pregnancyRecords.filter(p => p.animalId === animal.id);
  const animalFeeding = feedingRecords.filter(f => f.animalId === animal.id);

  const handleAddMed = async () => {
    if (!medForm.medicationName) return Alert.alert('Error', 'Please enter medication name');
    
    const wearOffDate = new Date();
    wearOffDate.setDate(wearOffDate.getDate() + parseInt(medForm.wearOffDays || '0'));

    await addMedicationRecord({
      animalId: animal.id,
      medicationName: medForm.medicationName,
      administeredAt: new Date().toISOString(),
      wearOffDate: wearOffDate.toISOString().split('T')[0],
      dosage: medForm.dosage,
      notes: medForm.notes,
    });
    
    setIsMedModalVisible(false);
    setMedForm({ medicationName: '', dosage: '', notes: '', wearOffDays: '28' });
    Alert.alert('Success', 'Medication record added.');
  };

  const handleAddFeeding = async () => {
    if (!feedingForm.feedType || !feedingForm.quantity) return Alert.alert('Error', 'Please fill in all fields');
    
    await addFeedingRecord({
      animalId: animal.id,
      feedType: feedingForm.feedType,
      quantity: parseFloat(feedingForm.quantity),
      unit: feedingForm.unit,
      notes: feedingForm.notes,
      fedAt: new Date().toISOString(),
    });

    setIsFeedingModalVisible(false);
    setFeedingForm({ feedType: '', quantity: '', unit: 'kg', notes: '' });
    Alert.alert('Success', 'Feeding record added.');
  };

  const handleAddBreeding = async () => {
    if (animal.sex !== 'female') return Alert.alert('Error', 'Breeding records only for females');
    
    const expected = new Date(new Date(breedingForm.startDate).getTime() + 283 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    await addPregnancyRecord({
      animalId: animal.id,
      startDate: breedingForm.startDate,
      expectedBirthDate: expected,
      sireId: breedingForm.sireId,
      notes: breedingForm.notes,
    });
    
    setIsBreedingModalVisible(false);
    setBreedingForm({ sireId: '', startDate: new Date().toISOString().split('T')[0], notes: '' });
    Alert.alert('Success', 'Breeding record added.');
  };

  const handleUpdateAnimal = async () => {
    await updateAnimal(animal.id, {
      breed: animalForm.breed,
      weight: parseFloat(animalForm.weight),
      healthStatus: animalForm.healthStatus as any,
    });
    setIsEditAnimalModalVisible(false);
    Alert.alert('Success', 'Animal profile updated.');
  };

  const confirmDelete = (id: string, type: 'med' | 'feed' | 'breeding') => {
    setRecordToDelete({ id, type });
    setIsDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    if (!recordToDelete) return;

    if (recordToDelete.type === 'med') await deleteMedicationRecord(recordToDelete.id);
    else if (recordToDelete.type === 'feed') await deleteFeedingRecord(recordToDelete.id);
    else if (recordToDelete.type === 'breeding') await deletePregnancyRecord(recordToDelete.id);

    setIsDeleteModalVisible(false);
    setRecordToDelete(null);
  };

  const handleDeleteAnimal = async () => {
    await deleteAnimal(animal.id);
    setIsDeleteAnimalModalVisible(false);
    navigation.goBack();
    Alert.alert('Success', 'Animal record deleted.');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Profiles':
        return (
          <View style={styles.tabContent}>
            <PCard style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Basic Information</Text>
                <TouchableOpacity onPress={() => setIsEditAnimalModalVisible(true)}>
                  <Ionicons name="create-outline" size={20} color={Colors.primaryRust} />
                </TouchableOpacity>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Internal Code</Text>
                <Text style={styles.infoValue}>{animal.animalId}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Breed</Text>
                <Text style={styles.infoValue}>{animal.breed}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Gender</Text>
                <Text style={styles.infoValue}>{animal.sex}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date of Birth</Text>
                <Text style={styles.infoValue}>{animal.createdAt?.split('T')[0] || 'Unknown'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Weight</Text>
                <Text style={styles.infoValue}>{animal.weight ? `${animal.weight} kg` : 'Not recorded'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Health Status</Text>
                <PBadge text={animal.healthStatus.toUpperCase()} variant={animal.healthStatus === 'healthy' ? 'success' : 'warning'} />
              </View>
            </PCard>

            <PButton 
              title="View Ancestry & Family" 
              variant="secondary"
              onPress={() => navigation.navigate('AncestryTree', { id })}
              style={styles.ancestryButton}
            />

            <PButton 
              title="Delete Animal" 
              variant="danger"
              onPress={() => setIsDeleteAnimalModalVisible(true)}
              style={styles.deleteAnimalButton}
            />
          </View>
        );
      case 'Medication':
        return (
          <View style={styles.tabContent}>
            {animalMeds.length > 0 ? (
              animalMeds.map(med => (
                <PCard key={med.id} style={styles.recordCard}>
                  <View style={styles.recordHeader}>
                    <Text style={styles.recordTitle}>{med.medicationName}</Text>
                    <TouchableOpacity onPress={() => confirmDelete(med.id, 'med')}>
                      <Ionicons name="trash-outline" size={20} color={Colors.errorRed} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.recordSubtitle}>Administered: {med.administeredDate}</Text>
                  <Text style={styles.recordSubtitle}>Dosage: {med.dosage}</Text>
                  <Text style={styles.recordSubtitle}>Wear-off: {med.wearOffDate}</Text>
                  {med.notes && <Text style={styles.recordNotes}>{med.notes}</Text>}
                </PCard>
              ))
            ) : (
              <Text style={styles.emptyText}>No medication records found.</Text>
            )}
            <PButton title="Add Medication Record" onPress={() => setIsMedModalVisible(true)} style={styles.addButton} />
          </View>
        );
      case 'Feeding':
        return (
          <View style={styles.tabContent}>
            {animalFeeding.length > 0 ? (
              animalFeeding.map(feed => (
                <PCard key={feed.id} style={styles.recordCard}>
                  <View style={styles.recordHeader}>
                    <Text style={styles.recordTitle}>{feed.feedType}</Text>
                    <TouchableOpacity onPress={() => confirmDelete(feed.id, 'feed')}>
                      <Ionicons name="trash-outline" size={20} color={Colors.errorRed} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.recordSubtitle}>Quantity: {feed.quantity} {feed.unit}</Text>
                  <Text style={styles.recordSubtitle}>Date: {feed.fedAt ? new Date(feed.fedAt).toLocaleDateString() : 'N/A'}</Text>
                  {feed.notes && <Text style={styles.recordNotes}>{feed.notes}</Text>}
                </PCard>
              ))
            ) : (
              <Text style={styles.emptyText}>No feeding records found.</Text>
            )}
            <PButton title="Add Feeding Record" onPress={() => setIsFeedingModalVisible(true)} style={styles.addButton} />
          </View>
        );
      case 'Breeding':
        return (
          <View style={styles.tabContent}>
            {animal.sex === 'female' ? (
              <>
                {animalPregnancies.map(preg => (
                  <PCard key={preg.id} style={styles.recordCard}>
                    <View style={styles.recordHeader}>
                      <Text style={styles.recordTitle}>Pregnancy Record</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
                        <PBadge text={preg.outcome === 'successful' ? 'Delivered' : preg.outcome === 'failed' ? 'Failed' : 'Pending'} variant="info" />
                        <TouchableOpacity onPress={() => confirmDelete(preg.id, 'breeding')}>
                          <Ionicons name="trash-outline" size={20} color={Colors.errorRed} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={styles.recordSubtitle}>Mating Date: {preg.startDate}</Text>
                    <Text style={styles.recordSubtitle}>Expected Date: {preg.expectedBirthDate}</Text>
                    <Text style={styles.recordSubtitle}>Sire ID: {preg.sireId || 'Not recorded'}</Text>
                    {preg.notes && <Text style={styles.recordNotes}>{preg.notes}</Text>}
                  </PCard>
                ))}
                {animalPregnancies.length === 0 && (
                  <PCard style={styles.recordCard}>
                    <View style={styles.recordHeader}>
                      <Text style={styles.recordTitle}>Breeding Status</Text>
                      <PBadge text="Available" variant="info" />
                    </View>
                    <Text style={styles.recordSubtitle}>Last heat cycle: Not recorded</Text>
                  </PCard>
                )}
                <PButton title="Add Breeding Record" onPress={() => setIsBreedingModalVisible(true)} style={styles.addButton} />
              </>
            ) : (
              <Text style={styles.emptyText}>Breeding records only available for females.</Text>
            )}
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Animal Details</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Ionicons name="paw" size={48} color={Colors.primaryRust} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileId}>ID: {animal.animalId}</Text>
            <View style={styles.statusRow}>
              <PBadge text={animal.healthStatus.toUpperCase()} variant={animal.healthStatus === 'healthy' ? 'success' : 'warning'} />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.tabBar}>
        {(['Profiles', 'Medication', 'Feeding', 'Breeding'] as SubTab[]).map(tab => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabLabel, activeTab === tab && styles.activeTabLabel]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {renderTabContent()}
      </ScrollView>

      {/* Medication Modal */}
      <PModal
        visible={isMedModalVisible}
        onClose={() => setIsMedModalVisible(false)}
        title="Add Medication Record"
      >
        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <PInput
            label="Medication Name"
            placeholder="e.g., Penicillin, Vitamin B12"
            value={medForm.medicationName}
            onChangeText={(text) => setMedForm({ ...medForm, medicationName: text })}
          />
          
          <PInput
            label="Dosage"
            placeholder="e.g., 10ml, 1 pill"
            value={medForm.dosage}
            onChangeText={(text) => setMedForm({ ...medForm, dosage: text })}
          />

          <PInput
            label="Wear-off Period"
            placeholder="28"
            value={medForm.wearOffDays}
            onChangeText={(text) => setMedForm({ ...medForm, wearOffDays: text })}
            keyboardType="numeric"
            suffix="days"
          />

          <PInput
            label="Notes / Instructions"
            placeholder="Enter any additional notes..."
            value={medForm.notes}
            onChangeText={(text) => setMedForm({ ...medForm, notes: text })}
            multiline
            numberOfLines={3}
            style={{ height: 80, textAlignVertical: 'top' }}
          />

          <PButton 
            title="Save Medication Record" 
            onPress={handleAddMed} 
            style={styles.modalSubmit} 
          />
          <View style={{ height: 20 }} />
        </ScrollView>
      </PModal>

      {/* Feeding Modal */}
      <PModal
        visible={isFeedingModalVisible}
        onClose={() => setIsFeedingModalVisible(false)}
        title="Add Feeding Record"
      >
        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <PInput
            label="Feed Type"
            placeholder="e.g., Mixed Grain, Alfalfa Hay"
            value={feedingForm.feedType}
            onChangeText={(text) => setFeedingForm({ ...feedingForm, feedType: text })}
          />
          
          <View style={styles.row}>
            <PInput
              label="Quantity"
              placeholder="5.0"
              value={feedingForm.quantity}
              onChangeText={(text) => setFeedingForm({ ...feedingForm, quantity: text })}
              keyboardType="numeric"
              containerStyle={{ flex: 2, marginRight: Spacing.sm }}
            />
            <PInput
              label="Unit"
              placeholder="kg"
              value={feedingForm.unit}
              onChangeText={(text) => setFeedingForm({ ...feedingForm, unit: text })}
              containerStyle={{ flex: 1 }}
            />
          </View>

          <PInput
            label="Notes"
            placeholder="Specific instructions or observations..."
            value={feedingForm.notes}
            onChangeText={(text) => setFeedingForm({ ...feedingForm, notes: text })}
            multiline
            numberOfLines={3}
            style={{ height: 80, textAlignVertical: 'top' }}
          />

          <PButton 
            title="Log Feeding Record" 
            onPress={handleAddFeeding} 
            style={styles.modalSubmit} 
          />
          <View style={{ height: 20 }} />
        </ScrollView>
      </PModal>

      {/* Breeding Modal */}
      <PModal
        visible={isBreedingModalVisible}
        onClose={() => setIsBreedingModalVisible(false)}
        title="Add Breeding Record"
      >
        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <PInput
            label="Sire ID / Tag"
            placeholder="Enter sire tag number..."
            value={breedingForm.sireId}
            onChangeText={(text) => setBreedingForm({ ...breedingForm, sireId: text })}
          />
          
          <PInput
            label="Mating Date"
            placeholder="YYYY-MM-DD"
            value={breedingForm.startDate}
            onChangeText={(text) => setBreedingForm({ ...breedingForm, startDate: text })}
          />

          <PInput
            label="Notes"
            placeholder="Observations about the mating..."
            value={breedingForm.notes}
            onChangeText={(text) => setBreedingForm({ ...breedingForm, notes: text })}
            multiline
            numberOfLines={3}
            style={{ height: 80, textAlignVertical: 'top' }}
          />

          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.mutedSienna} />
            <Text style={styles.infoBoxText}>
              Expected delivery date will be calculated automatically (approx. 283 days).
            </Text>
          </View>

          <PButton 
            title="Save Breeding Record" 
            onPress={handleAddBreeding} 
            style={styles.modalSubmit} 
          />
          <View style={{ height: 20 }} />
        </ScrollView>
      </PModal>

      {/* Edit Animal Modal */}
      <PModal
        visible={isEditAnimalModalVisible}
        onClose={() => setIsEditAnimalModalVisible(false)}
        title="Edit Animal Profile"
      >
        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <PInput
            label="Breed"
            placeholder="e.g., Brahman"
            value={animalForm.breed}
            onChangeText={(text) => setAnimalForm({ ...animalForm, breed: text })}
          />

          <PInput
            label="Current Weight"
            placeholder="e.g., 450.5"
            value={animalForm.weight}
            onChangeText={(text) => setAnimalForm({ ...animalForm, weight: text })}
            keyboardType="numeric"
            suffix="kg"
          />

          <Text style={styles.label}>Health Status</Text>
          <View style={styles.statusChips}>
            {['healthy', 'sick', 'pregnant', 'deceased'].map((status) => (
              <TouchableOpacity 
                key={status}
                style={[
                  styles.statusChip, 
                  animalForm.healthStatus === status && styles.activeStatusChip
                ]}
                onPress={() => setAnimalForm({ ...animalForm, healthStatus: status })}
              >
                <Text style={[
                  styles.statusChipText,
                  animalForm.healthStatus === status && styles.activeStatusChipText
                ]}>
                  {status.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <PButton 
            title="Update Animal Profile" 
            onPress={handleUpdateAnimal} 
            style={styles.modalSubmit} 
          />
          <View style={{ height: 20 }} />
        </ScrollView>
      </PModal>

      {/* Delete Confirmation Modal */}
      <PModal
        visible={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        title="Confirm Delete"
      >
        <View style={styles.modalContent}>
          <Text style={styles.deleteText}>Are you sure you want to delete this record? This action cannot be undone.</Text>
          <View style={styles.modalButtons}>
            <PButton title="Cancel" variant="outline" onPress={() => setIsDeleteModalVisible(false)} style={{ flex: 1 }} />
            <PButton title="Delete" variant="danger" onPress={handleDelete} style={{ flex: 1 }} />
          </View>
        </View>
      </PModal>

      {/* Delete Animal Confirmation Modal */}
      <PModal
        visible={isDeleteAnimalModalVisible}
        onClose={() => setIsDeleteAnimalModalVisible(false)}
        title="Delete Animal"
      >
        <View style={styles.modalContent}>
          <Text style={styles.deleteText}>Are you sure you want to delete this animal and all its records? This action is permanent.</Text>
          <View style={styles.modalButtons}>
            <PButton title="Cancel" variant="outline" onPress={() => setIsDeleteAnimalModalVisible(false)} style={{ flex: 1 }} />
            <PButton title="Delete" variant="danger" onPress={handleDeleteAnimal} style={{ flex: 1 }} />
          </View>
        </View>
      </PModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.paleParchment,
  },
  header: {
    backgroundColor: Colors.deepPlum,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
    paddingBottom: Spacing.xl,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  headerTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.lg,
    color: '#FFFFFF',
  },
  profileHeader: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.warmSand,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.xl,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  profileInfo: {
    flex: 1,
  },
  profileId: {
    fontFamily: 'DMMono-Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.warmSand,
    marginBottom: Spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.softAsh,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.primaryRust,
  },
  tabLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.xs,
    color: Colors.mutedSienna,
  },
  activeTabLabel: {
    color: Colors.primaryRust,
  },
  emptyText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
    textAlign: 'center',
    marginVertical: Spacing.xl,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: Spacing.xl,
  },
  infoCard: {
    marginBottom: Spacing.xl,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.lg,
    color: Colors.charcoalInk,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softAsh,
  },
  medicationInfoRow: {
    borderBottomWidth: 0,
    alignItems: 'flex-start',
    flexDirection: 'column',
    gap: Spacing.xs,
  },
  wearOffContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  wearOffValue: {
    color: Colors.primaryRust,
    fontFamily: 'DMMono-Medium',
  },
  infoLabel: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
  },
  infoValue: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
  },
  ancestryButton: {
    marginTop: Spacing.sm,
  },
  deleteAnimalButton: {
    marginTop: Spacing.md,
  },
  recordCard: {
    marginBottom: Spacing.lg,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  recordTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.lg,
    color: Colors.charcoalInk,
  },
  recordSubtitle: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
    marginBottom: 4,
  },
  recordNotes: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
  addButton: {
    marginTop: Spacing.md,
  },
  modalContent: {
    padding: Spacing.md,
  },
  label: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  modalInput: {
    marginBottom: Spacing.sm,
    justifyContent: 'flex-start',
    paddingHorizontal: Spacing.md,
  },
  modalSubmit: {
    marginTop: Spacing.xl,
  },
  deleteText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.warmSand,
    padding: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  infoBoxText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.xs,
    color: Colors.mutedSienna,
    flex: 1,
  },
  statusChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  statusChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.softAsh,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeStatusChip: {
    backgroundColor: Colors.primaryRust,
    borderColor: Colors.primaryRust,
  },
  statusChipText: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.xs,
    color: Colors.mutedSienna,
  },
  activeStatusChipText: {
    color: '#FFFFFF',
  },
});
