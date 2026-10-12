import React from 'react';
import { View, StyleSheet, Platform, useSafeAreaInsets } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors, Spacing } from '../constants';

interface FloatingTabBarProps {
  children: React.ReactNode;
  style?: any;
}

export const FloatingTabBar: React.FC<FloatingTabBarProps> = ({ children, style }) => {
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = React.useState(0);

  return (
    <View
      style={[styles.container, { marginBottom: insets.bottom > 0 ? insets.bottom + 8 : 16 }]}
      onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
    >
      <View style={[styles.floatingBar, style]}>
        <Svg
          width="100%"
          height="100%"
          style={StyleSheet.absoluteFill}
        >
          <Path
            d={getNotchPath(barWidth)}
            fill={Colors.primarySurface}
            stroke={Colors.border}
            strokeWidth={1}
          />
        </Svg>
        {children}
      </View>
    </View>
  );
};

const getNotchPath = (width: number): string => {
  if (width === 0) return '';

  const barHeight = 64;
  const notchWidth = width * 0.18; // ~18% of bar width
  const notchDepth = 35;
  const radius = barHeight / 2;
  const centerX = width / 2;

  // Start from top-left
  let path = `M 0 ${radius}`;
  // Left rounded corner
  path += ` A ${radius} ${radius} 0 0 1 ${radius} 0`;
  // Top edge to notch start
  path += ` L ${centerX - notchWidth / 2} 0`;
  // Notch curve (smooth S-curve going down and back up)
  path += ` C ${centerX - notchWidth / 4} ${notchDepth * 0.3} ${centerX - notchWidth / 8} ${notchDepth} ${centerX} ${notchDepth}`;
  path += ` C ${centerX + notchWidth / 8} ${notchDepth} ${centerX + notchWidth / 4} ${notchDepth * 0.3} ${centerX + notchWidth / 2} 0`;
  // Top edge to right corner
  path += ` L ${width - radius} 0`;
  // Right rounded corner
  path += ` A ${radius} ${radius} 0 0 1 ${width} ${radius}`;
  // Right edge
  path += ` L ${width} ${barHeight}`;
  // Bottom right corner
  path += ` A ${radius} ${radius} 0 0 1 ${width - radius} ${barHeight}`;
  // Bottom edge
  path += ` L ${radius} ${barHeight}`;
  // Bottom left corner
  path += ` A ${radius} ${radius} 0 0 1 0 ${radius}`;
  // Left edge
  path += ` Z`;

  return path;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  floatingBar: {
    width: '100%',
    height: 64,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});
