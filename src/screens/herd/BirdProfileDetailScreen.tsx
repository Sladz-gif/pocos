import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PCard, PButton, PInput, PDeleteModal } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { HerdStackParamList } from '../../navigation/types';
import { useProfileStore } from '../../store/profileStore';
import { v4 as uuidv4 } from 'uuid';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';

// Hardcoded device address for Jetson Nano
const JETSON_DEVICE_ADDRESS = '989347d6c29e5e8b';

type BirdProfileDetailScreenProps = {
  navigation: StackNavigationProp<HerdStackParamList, 'BirdProfileDetail'>;
  route: { params: { id: string } };
};

interface CageFormData {
  id: string;
  cageName: string;
  birdCount: string;
  feedingType: string;
  medicationName?: string;
  wearOffDate?: Date;
}

export const BirdProfileDetailScreen: React.FC<BirdProfileDetailScreenProps> = ({ navigation, route }) => {
  const { profiles, updateProfile } = useProfileStore();
  const profile = profiles.find(p => p.id === route.params.id);
  
  const [cages, setCages] = useState<CageFormData[]>([]);
  const [showAddCage, setShowAddCage] = useState(false);
  const [editingCage, setEditingCage] = useState<CageFormData | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cageToDelete, setCageToDelete] = useState<string | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const handleAddCage = () => {
    const newCage: CageFormData = {
      id: uuidv4(),
      cageName: '',
      birdCount: '',
      feedingType: '',
    };
    setEditingCage(newCage);
    setShowAddCage(true);
  };

  const handleEditCage = (cage: CageFormData) => {
    setEditingCage(cage);
    setShowAddCage(true);
  };

  const handleSaveCage = () => {
    if (!editingCage) return;

    if (!editingCage.cageName.trim()) {
      Alert.alert('Error', 'Cage name is required');
      return;
    }
    if (!editingCage.birdCount.trim()) {
      Alert.alert('Error', 'Bird count is required');
      return;
    }
    if (!editingCage.feedingType.trim()) {
      Alert.alert('Error', 'Feeding type is required');
      return;
    }

    const existingIndex = cages.findIndex(c => c.id === editingCage.id);
    if (existingIndex >= 0) {
      const updated = [...cages];
      updated[existingIndex] = editingCage;
      setCages(updated);
    } else {
      setCages([...cages, editingCage]);
    }

    setShowAddCage(false);
    setEditingCage(null);
  };

  const handleDeleteCage = (id: string) => {
    setCageToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteCage = () => {
    if (cageToDelete) {
      setCages(cages.filter(c => c.id !== cageToDelete));
      setShowDeleteModal(false);
      setCageToDelete(null);
    }
  };

  const renderCageCard = (cage: CageFormData) => (
    <PCard key={cage.id} style={styles.cageCard}>
      <View style={styles.cageHeader}>
        <View style={styles.cageInfo}>
          <Text style={styles.cageName}>{cage.cageName}</Text>
          <View style={styles.cageMeta}>
            <Ionicons name="people" size={14} color={Colors.mutedSienna} />
            <Text style={styles.cageMetaText}>{cage.birdCount} birds</Text>
          </View>
        </View>
        <View style={styles.cageActions}>
          <TouchableOpacity onPress={() => handleEditCage(cage)} style={styles.actionButton}>
            <Ionicons name="create-outline" size={20} color={Colors.primaryRust} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteCage(cage.id)} style={styles.actionButton}>
            <Ionicons name="trash-outline" size={20} color={Colors.primaryRust} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cageDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="restaurant" size={16} color={Colors.mutedSienna} />
          <Text style={styles.detailText}>{cage.feedingType}</Text>
        </View>

        {cage.medicationName && (
          <View style={styles.detailRow}>
            <Ionicons name="medical" size={16} color={Colors.primaryRust} />
            <Text style={styles.detailText}>{cage.medicationName}</Text>
            {cage.wearOffDate && (
              <Text style={styles.wearOffText}>
                (Wear-off: {format(cage.wearOffDate, 'MMM d, yyyy')})
              </Text>
            )}
          </View>
        )}
      </View>
    </PCard>
  );

  const renderAddCageModal = () => (
    <View style={styles.modal}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>
          {editingCage && cages.find(c => c.id === editingCage.id) ? 'Edit Cage' : 'Add New Cage'}
        </Text>

        <PInput
          label="Cage/Cage Name or Number"
          placeholder="e.g. Cage A-1"
          value={editingCage?.cageName || ''}
          onChangeText={(value) => setEditingCage(prev => prev ? { ...prev, cageName: value } : null)}
        />

        <PInput
          label="Number of Birds"
          placeholder="e.g. 25"
          keyboardType="numeric"
          value={editingCage?.birdCount || ''}
          onChangeText={(value) => setEditingCage(prev => prev ? { ...prev, birdCount: value } : null)}
        />

        <PInput
          label="Feeding Type"
          placeholder="e.g. Layer feed, Scratch"
          value={editingCage?.feedingType || ''}
          onChangeText={(value) => setEditingCage(prev => prev ? { ...prev, feedingType: value } : null)}
        />

        <PInput
          label="Medication Name (Optional)"
          placeholder="e.g. Antibiotic X"
          value={editingCage?.medicationName || ''}
          onChangeText={(value) => setEditingCage(prev => prev ? { ...prev, medicationName: value } : null)}
        />

        {editingCage?.medicationName && (
          <PInput
            label="Wear-off Date/Time (Optional)"
            value={editingCage.wearOffDate ? format(editingCage.wearOffDate, 'MMMM d, yyyy h:mm a') : ''}
            placeholder="Select date and time"
            onPress={() => setDatePickerVisibility(true)}
            editable={false}
          />
        )}

        <View style={styles.modalActions}>
          <PButton
            title="Cancel"
            onPress={() => {
              setShowAddCage(false);
              setEditingCage(null);
            }}
            style={styles.cancelButton}
            variant="ghost"
          />
          <PButton
            title="Save"
            onPress={handleSaveCage}
            style={styles.saveButton}
          />
        </View>
      </View>
    </View>
  );

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Profile not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.charcoalInk} />
        </TouchableOpacity>
        <Text style={styles.title}>{profile.name}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={Colors.charcoalInk} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('BirdCount', { profileId: profile.id })}
          >
            <Ionicons name="add-circle-outline" size={32} color={Colors.primaryRust} />
            <Text style={styles.quickActionText}>Record Count</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('BirdCountHistory', { profileId: profile.id })}
          >
            <Ionicons name="analytics-outline" size={32} color={Colors.primaryRust} />
            <Text style={styles.quickActionText}>View History</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type:</Text>
            <Text style={styles.infoValue}>Bird</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Cages:</Text>
            <Text style={styles.infoValue}>{cages.length}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Birds:</Text>
            <Text style={styles.infoValue}>
              {cages.reduce((sum, cage) => sum + parseInt(cage.birdCount || '0'), 0)}
            </Text>
          </View>
          
          <View style={styles.deviceSection}>
            <View style={styles.deviceHeader}>
              <Text style={styles.infoLabel}>Device Address:</Text>
            </View>
            <Text style={styles.deviceAddressText}>
              {JETSON_DEVICE_ADDRESS} (Jetson Nano)
            </Text>
          </View>
        </View>

        <View style={styles.cagesSection}>
          <View style={styles.cagesHeader}>
            <Text style={styles.cagesTitle}>Cages/Coups</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddCage}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Cage</Text>
            </TouchableOpacity>
          </View>

          {cages.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="grid-outline" size={48} color={Colors.softAsh} />
              <Text style={styles.emptyText}>No cages added yet</Text>
              <TouchableOpacity style={styles.addFirstButton} onPress={handleAddCage}>
                <Text style={styles.addFirstButtonText}>Add First Cage</Text>
              </TouchableOpacity>
            </View>
          ) : (
            cages.map(renderCageCard)
          )}
        </View>
      </ScrollView>

      {showAddCage && renderAddCageModal()}

      <PDeleteModal
        visible={showDeleteModal}
        onConfirm={confirmDeleteCage}
        onClose={() => {
          setShowDeleteModal(false);
          setCageToDelete(null);
        }}
        title="Delete Cage"
        message="Are you sure you want to delete this cage? This action cannot be undone."
      />

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        onConfirm={(date) => {
          setEditingCage(prev => prev ? { ...prev, wearOffDate: date } : null);
          setDatePickerVisibility(false);
        }}
        onCancel={() => setDatePickerVisibility(false)}
        date={editingCage?.wearOffDate || new Date()}
      />
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
    backgroundColor: '#FFFFFF',
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
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.softAsh,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  quickActionText: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.mutedSienna,
  },
  profileInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.softAsh,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softAsh,
  },
  infoLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.base,
    color: Colors.mutedSienna,
  },
  infoValue: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
  },
  deviceSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.softAsh,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  deviceAddressText: {
    fontFamily: 'DMMono-Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
  },
  deviceEditContainer: {
    gap: Spacing.sm,
  },
  deviceInput: {
    marginBottom: 0,
  },
  deviceHelperText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
  },
  deviceActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  deviceCancelButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  deviceCancelText: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.base,
    color: Colors.mutedSienna,
  },
  deviceSaveButton: {
    backgroundColor: Colors.primaryRust,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  deviceSaveText: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.base,
    color: '#FFFFFF',
  },
  cagesSection: {
    flex: 1,
  },
  cagesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  cagesTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.xl,
    color: Colors.charcoalInk,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryRust,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    gap: Spacing.xs,
  },
  addButtonText: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.sm,
    color: '#FFFFFF',
  },
  cageCard: {
    marginBottom: Spacing.md,
  },
  cageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cageInfo: {
    flex: 1,
  },
  cageName: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.lg,
    color: Colors.charcoalInk,
    marginBottom: Spacing.xs,
  },
  cageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  cageMetaText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
  },
  cageActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    padding: Spacing.xs,
  },
  cageDetails: {
    gap: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
  },
  wearOffText: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.sm,
    color: Colors.primaryRust,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
    borderWidth: 2,
    borderColor: Colors.softAsh,
    borderRadius: Radius.lg,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.mutedSienna,
    marginTop: Spacing.md,
  },
  addFirstButton: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primaryRust,
    borderRadius: Radius.md,
  },
  addFirstButtonText: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.sm,
    color: '#FFFFFF',
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.xl,
    color: Colors.charcoalInk,
    marginBottom: Spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});
