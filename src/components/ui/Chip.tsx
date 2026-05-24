import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Typography, Radius } from '../../constants';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  variant?: 'default' | 'filter' | 'status';
}

export function PChip({
  label,
  selected = false,
  onPress,
  variant = 'default',
}: ChipProps) {
  const getBackgroundColor = () => {
    if (variant === 'status') {
      return selected ? Colors.success : Colors.secondarySurface;
    }
    return selected ? Colors.primaryAccent : Colors.secondarySurface;
  };

  const getTextColor = () => {
    if (variant === 'status') {
      return selected ? Colors.textPrimary : Colors.textSecondary;
    }
    return selected ? Colors.textPrimary : Colors.textSecondary;
  };

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        { backgroundColor: getBackgroundColor() },
      ]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Text
        style={[
          styles.label,
          { color: getTextColor() },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.body,
  },
});
