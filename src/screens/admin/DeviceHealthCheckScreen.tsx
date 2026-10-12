// MACHINE LEARNING / JETSON NANO - DISABLED
// App is now for poultry and goats only
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { AdminStackParamList, AuthStackParamList } from '../../navigation/types';

type DeviceHealthCheckScreenProps = {
  navigation: StackNavigationProp<AdminStackParamList & AuthStackParamList, any>;
};

// DEVICE HEALTH CHECK SCREEN - DISABLED
// This screen is for Jetson Nano device monitoring which has been removed
export const DeviceHealthCheckScreen: React.FC<DeviceHealthCheckScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.charcoalInk} />
        </TouchableOpacity>
        <Text style={styles.title}>Device Health</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.guardState}>
        <Ionicons name="hardware-chip-outline" size={48} color={Colors.softAsh} />
        <Text style={styles.guardTitle}>Device monitoring disabled</Text>
        <Text style={styles.guardSubtitle}>Jetson Nano device features have been removed</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.paleParchment,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.primarySurface,
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.xl,
    color: Colors.charcoalInk,
  },
  guardState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  guardTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.xl,
    color: Colors.charcoalInk,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  guardSubtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.mutedSienna,
    marginTop: Spacing.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
});
