import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius } from '../../constants';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  size?: number;
  variant?: 'rect' | 'circle' | 'text';
  style?: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = 20, 
  size,
  variant = 'rect',
  style 
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;
  const actualWidth = size !== undefined ? size : width;
  const actualHeight = size !== undefined ? size : height;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  const borderRadius = variant === 'circle' ? (typeof actualHeight === 'number' ? actualHeight / 2 : 50) : variant === 'text' ? Radius.xs : Radius.md;

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: actualWidth,
          height: actualHeight,
          borderRadius,
          opacity,
        },
        style,
      ] as any}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.softAsh,
  },
});
