import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
}

export const PEmptyState: React.FC<EmptyStateProps> = ({ icon, title, message }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={48} color={Colors.mutedSienna} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['3xl'],
    marginTop: Spacing['4xl'],
  },
  iconContainer: {
    marginBottom: Spacing.lg,
    opacity: 0.5,
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 20,
    color: Colors.charcoalInk,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    color: Colors.mutedSienna,
    textAlign: 'center',
    lineHeight: 22,
  },
});
