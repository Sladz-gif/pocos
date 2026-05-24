import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing } from '../../constants';
import { useUIStore } from '../../store/uiStore';
import { Ionicons } from '@expo/vector-icons';

export const BuyerPreviewBanner = () => {
  const { setBuyerPreview } = useUIStore();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="eye-outline" size={20} color="#FFFFFF" />
        <Text style={styles.text}>You are in Buyer Preview mode</Text>
      </View>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => setBuyerPreview(false)}
      >
        <Text style={styles.buttonText}>Return to Manager</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.deepPlum,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    marginLeft: Spacing.xs,
  },
  button: {
    backgroundColor: Colors.primaryRust,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
  },
});
