import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, Typography, Radius } from '../../constants';

interface BadgeProps {
  text: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  style?: ViewStyle;
}

export function PBadge({ text, variant = 'neutral', style }: BadgeProps) {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'success':
        return Colors.successMoss + '20'; // 20 is hex for 12% opacity
      case 'warning':
        return Colors.alertAmber + '20';
      case 'error':
        return Colors.dangerCrimson + '20';
      case 'info':
        return Colors.deepPlum + '20';
      case 'neutral':
      default:
        return Colors.softAsh;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'success':
        return Colors.successMoss;
      case 'warning':
        return Colors.alertAmber;
      case 'error':
        return Colors.dangerCrimson;
      case 'info':
        return Colors.deepPlum;
      case 'neutral':
      default:
        return Colors.mutedSienna;
    }
  };

  return (
    <View style={[styles.badge, { backgroundColor: getBackgroundColor() }, style]}>
      <Text style={[styles.text, { color: getTextColor() }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.body,
  },
});
