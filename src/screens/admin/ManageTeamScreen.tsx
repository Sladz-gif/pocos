import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PInput, PButton, PChip, PCard, PEmptyState, PModal } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { AdminStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import { User, UserRole } from '../../types';

type ManageTeamScreenProps = {
  navigation: StackNavigationProp<AdminStackParamList, 'AdminPanelHome'>;
};

const ROLES: UserRole[] = ['staff', 'store_manager', 'super_admin'];

export const ManageTeamScreen: React.FC<ManageTeamScreenProps> = ({ navigation }) => {
  const { ranch, staff, fetchStaff, updateStaff, deleteStaff, isLoading } = useAuthStore();
  const [editingStaff, setEditingStaff] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('staff');
  const [accessCode, setAccessCode] = useState('');

  useEffect(() => {
    if (ranch?.id) {
      fetchStaff(ranch.id);
    }
  }, [ranch?.id, fetchStaff]);

  const handleEdit = (user: User) => {
    setEditingStaff(user);
    setName(user.name);
    setRole(user.role);
    setAccessCode(user.accessCode || '');
  };

  const handleUpdate = async () => {
    if (!editingStaff) return;
    if (!name.trim() || !accessCode.trim()) {
      Alert.alert('Error', 'Name and Access Code are required.');
      return;
    }

    try {
      await updateStaff(editingStaff.id, {
        name: name.trim(),
        role: role,
        accessCode: accessCode.trim().toUpperCase(),
      });
      Alert.alert('Success', 'Staff member updated successfully.');
      setEditingStaff(null);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update staff member.');
    }
  };

  const handleDelete = (user: User) => {
    Alert.alert(
      'Delete Staff',
      `Are you sure you want to remove ${user.name} from the system? They will no longer be able to log in.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await deleteStaff(user.id);
              Alert.alert('Success', 'Staff member removed.');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to remove staff member.');
            }
          } 
        }
      ]
    );
  };

  const renderStaffItem = ({ item }: { item: User }) => {
    const isAdmin = item.role === 'super_admin';
    const displayRole = isAdmin ? 'Admin' : item.role.replace('_', ' ').toUpperCase();

    return (
      <PCard style={styles.staffCard}>
        <View style={styles.staffHeader}>
          <View style={styles.staffInfo}>
            <Text style={styles.staffName}>{item.name}</Text>
            <View style={[styles.roleBadge, { backgroundColor: isAdmin ? Colors.primaryRust : Colors.warmSand }]}>
              <Text style={[styles.roleText, { color: isAdmin ? '#FFFFFF' : Colors.primaryRust }]}>
                {displayRole}
              </Text>
            </View>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionButton}>
              <Ionicons name="create-outline" size={22} color={Colors.primaryRust} />
            </TouchableOpacity>
            {!isAdmin && (
              <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionButton}>
                <Ionicons name="trash-outline" size={22} color={Colors.mutedSienna} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <Text style={styles.accessCode}>Access Code: <Text style={styles.codeValue}>{item.accessCode}</Text></Text>
      </PCard>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.charcoalInk} />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Team</Text>
        <TouchableOpacity onPress={() => (navigation as any).navigate('OnboardStaff')}>
          <Ionicons name="add-circle-outline" size={28} color={Colors.primaryRust} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={staff}
        keyExtractor={(item) => item.id}
        renderItem={renderStaffItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <PEmptyState 
            icon="people-outline"
            title="No Staff Found"
            message="Onboard your first team member to see them here."
          />
        }
        refreshing={isLoading}
        onRefresh={() => ranch?.id && fetchStaff(ranch.id)}
      />

      <PModal
        visible={!!editingStaff}
        onClose={() => setEditingStaff(null)}
        title="Edit Staff Info"
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <PInput 
            label="Full Name"
            value={name}
            onChangeText={setName}
          />

          <View style={styles.roleSection}>
            <Text style={styles.roleLabel}>Role</Text>
            <View style={styles.chipRow}>
              {ROLES.map(r => (
                <PChip 
                  key={r}
                  label={r === 'super_admin' ? 'ADMIN' : r.replace('_', ' ').toUpperCase()}
                  selected={role === r}
                  onPress={() => setRole(r)}
                />
              ))}
            </View>
          </View>

          <PInput 
            label="Access Code"
            value={accessCode}
            onChangeText={setAccessCode}
            autoCapitalize="characters"
          />

          <View style={styles.modalActions}>
            <PButton 
              title="Cancel"
              variant="outline"
              onPress={() => setEditingStaff(null)}
              style={styles.flex1}
            />
            <PButton 
              title="Save Changes"
              onPress={handleUpdate}
              loading={isLoading}
              style={[styles.flex1, { marginLeft: Spacing.md }]}
            />
          </View>
        </ScrollView>
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
  listContent: {
    padding: Spacing.xl,
  },
  staffCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  staffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
    marginBottom: 4,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: Spacing.md,
    padding: 4,
  },
  accessCode: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.xs,
    color: Colors.mutedSienna,
  },
  codeValue: {
    fontFamily: 'DMMono-Medium',
    color: Colors.charcoalInk,
  },
  roleSection: {
    marginBottom: Spacing.lg,
  },
  roleLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
    marginBottom: Spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  flex1: {
    flex: 1,
  },
});
