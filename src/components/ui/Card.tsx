import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Radius, Shadows } from '../../constants';

interface CardProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  variant?: 'default' | 'elevated' | 'outlined';
  onPress?: () => void;
}

export function PCard({
  children,
  style,
  padding = Spacing.lg,
  variant = 'default',
  onPress,
}: CardProps) {
  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: '#FFFFFF',
      borderRadius: Radius.lg,
      padding,
      borderWidth: 1,
      borderColor: Colors.softAsh,
    };

    switch (variant) {
      case 'elevated':
        return { ...baseStyle, ...Shadows.md };
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: Colors.border,
        };
      default:
        return baseStyle;
    }
  };

  if (onPress) {
    return (
      <TouchableOpacity 
        onPress={onPress} 
        activeOpacity={0.7}
        style={[styles.card, getContainerStyle(), style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.card, getContainerStyle(), style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});
