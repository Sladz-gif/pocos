import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../../constants';
import { PButton } from './Button';

interface NetworkErrorProps {
  onRetry: () => void;
  title?: string;
  message?: string;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({ 
  onRetry, 
  title = "Connection Error", 
  message = "We're having trouble connecting to the server. Please check your internet connection and try again." 
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="cloud-offline-outline" size={64} color={Colors.primaryRust} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <PButton 
        title="Retry Connection" 
        onPress={onRetry} 
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['2xl'],
    backgroundColor: Colors.paleParchment,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.warmSand,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.xl,
    color: Colors.charcoalInk,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  message: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.mutedSienna,
    textAlign: 'center',
    marginBottom: Spacing['2xl'],
    lineHeight: 22,
  },
  button: {
    width: '100%',
  },
});
