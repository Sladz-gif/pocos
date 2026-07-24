import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius } from '../../constants';
import { PModal } from './Modal';
import { PButton } from './Button';
import { Ionicons } from '@expo/vector-icons';

interface DeleteModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemLabel?: string;
}

export const PDeleteModal: React.FC<DeleteModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  itemLabel,
}) => {
  return (
    <PModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Ionicons name="trash-outline" size={32} color={Colors.dangerCrimson} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        {itemLabel && (
          <View style={styles.itemContainer}>
            <Text style={styles.itemLabel}>{itemLabel}</Text>
          </View>
        )}
        <View style={styles.actions}>
          <PButton
            title="Cancel"
            variant="ghost"
            onPress={onClose}
            style={styles.actionButton}
          />
          <PButton
            title="Delete"
            variant="primary"
            onPress={onConfirm}
            style={[styles.actionButton, styles.deleteButton] as any}
          />
        </View>
      </View>
    </PModal>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(176, 32, 32, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 20,
    color: Colors.charcoalInk,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  message: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    color: Colors.mutedSienna,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  itemContainer: {
    backgroundColor: Colors.softAsh,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    marginBottom: Spacing.xl,
  },
  itemLabel: {
    fontFamily: 'DMMono-Medium',
    fontSize: 14,
    color: Colors.charcoalInk,
  },
  actions: {
    flexDirection: 'row',
    width: '100%',
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  deleteButton: {
    backgroundColor: Colors.dangerCrimson,
  },
});
