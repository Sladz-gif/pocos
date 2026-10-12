import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors, Spacing, Typography, Radius } from '../constants';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'medium', showText = true }) => {
  const sizeStyles = {
    small: {
      container: { width: 40, height: 40 },
      icon: 24,
      text: Typography.fontSize.lg,
    },
    medium: {
      container: { width: 64, height: 64 },
      icon: 36,
      text: Typography.fontSize.xl,
    },
    large: {
      container: { width: 96, height: 96 },
      icon: 48,
      text: Typography.fontSize['3xl'],
    },
  };

  const config = sizeStyles[size];

  return (
    <View style={styles.container}>
      <View style={[styles.logoContainer, config.container]}>
        <Image
          source={require('../assets/icon.png')}
          style={[styles.logoImage, config.container]}
          resizeMode="contain"
        />
      </View>
      {showText && (
        <Text style={[styles.logoText, { fontSize: config.text }]}>AmanA</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  logoContainer: {
    backgroundColor: Colors.primaryRust + '15',
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoText: {
    fontFamily: 'PlayfairDisplay-Bold',
    color: Colors.deepPlum,
    marginTop: Spacing.sm,
  },
});
