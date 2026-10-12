// MACHINE LEARNING / JETSON NANO - DISABLED
// App is now for poultry and goats only
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';

type CoopTimelineScreenProps = {
  navigation: StackNavigationProp<any, any>;
  route?: { params?: { profileId?: string; deviceAddress?: string; coopName?: string } };
};

// DETECTION TIMELINE - DISABLED
// App is now for poultry and goats only
export const CoopTimelineScreen: React.FC<CoopTimelineScreenProps> = ({ navigation, route }) => {
  const coopName = route?.params?.coopName || 'Coop';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.charcoalInk} />
        </TouchableOpacity>
        <Text style={styles.title}>Timeline — {coopName}</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.emptyState}>
        <Ionicons name="images-outline" size={48} color={Colors.softAsh} />
        <Text style={styles.emptyText}>Timeline disabled</Text>
        <Text style={styles.emptySubtext}>Detection features have been removed</Text>
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
    borderBottomColor: Colors.softAsh,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.xl,
    color: Colors.charcoalInk,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: Spacing.xl,
  },
  emptyText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.mutedSienna,
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});
