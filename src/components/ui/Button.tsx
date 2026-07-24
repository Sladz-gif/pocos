import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Spacing, Typography, Radius } from '../../constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'success';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function PButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const getBackgroundColor = () => {
    if (disabled) return Colors.softAsh;
    switch (variant) {
      case 'primary':
        return Colors.primaryRust;
      case 'secondary':
        return Colors.deepPlum;
      case 'danger':
        return Colors.dangerCrimson;
      case 'success':
        return Colors.successMoss;
      case 'ghost':
      case 'outline':
        return 'transparent';
      default:
        return Colors.primaryRust;
    }
  };

  const getTextColor = () => {
    if (disabled) return Colors.mutedSienna;
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
      case 'success':
        return '#FFFFFF';
      case 'ghost':
      case 'outline':
        return Colors.primaryRust;
      default:
        return '#FFFFFF';
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm };
      case 'medium':
        return { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md };
      case 'large':
        return { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg };
      default:
        return { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return Typography.fontSize.sm;
      case 'medium':
        return Typography.fontSize.base;
      case 'large':
        return Typography.fontSize.lg;
      default:
        return Typography.fontSize.base;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        getPadding(),
        variant === 'ghost' && styles.ghost,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text
          style={[
            styles.text,
            { color: getTextColor(), fontSize: getFontSize() },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghost: {
    borderWidth: 1,
    borderColor: Colors.primaryAccent,
  },
  text: {
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.body,
  },
});
