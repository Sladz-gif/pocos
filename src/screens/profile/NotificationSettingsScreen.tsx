import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PCard } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { AdminStackParamList } from '../../navigation/types';

type NotificationSettingsScreenProps = {
  navigation: StackNavigationProp<AdminStackParamList, 'NotificationSettings'>;
};

export const NotificationSettingsScreen: React.FC<NotificationSettingsScreenProps> = ({ navigation }) => {
  const [pushEnabled, setPushEnabled] = React.useState(true);
  const [taskReminders, setTaskReminders] = React.useState(true);
  const [newMessages, setNewMessages] = React.useState(true);
  const [herdAlerts, setHerdAlerts] = React.useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.charcoalInk} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Global Settings</Text>
        <PCard style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDesc}>Enable all mobile alerts</Text>
            </View>
            <Switch 
              value={pushEnabled} 
              onValueChange={setPushEnabled}
              trackColor={{ false: Colors.softAsh, true: Colors.primaryRust }}
            />
          </View>
        </PCard>

        <Text style={styles.sectionTitle}>Specific Alerts</Text>
        <PCard style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>New Tasks</Text>
              <Text style={styles.settingDesc}>When a task is assigned to you</Text>
            </View>
            <Switch 
              value={taskReminders} 
              onValueChange={setTaskReminders}
              trackColor={{ false: Colors.softAsh, true: Colors.primaryRust }}
            />
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Messages</Text>
              <Text style={styles.settingDesc}>Chat notifications from team</Text>
            </View>
            <Switch 
              value={newMessages} 
              onValueChange={setNewMessages}
              trackColor={{ false: Colors.softAsh, true: Colors.primaryRust }}
            />
          </View>
          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Herd Alerts</Text>
              <Text style={styles.settingDesc}>Health or breeding updates</Text>
            </View>
            <Switch 
              value={herdAlerts} 
              onValueChange={setHerdAlerts}
              trackColor={{ false: Colors.softAsh, true: Colors.primaryRust }}
            />
          </View>
        </PCard>
      </ScrollView>
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.softAsh,
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.xl,
    color: Colors.charcoalInk,
  },
  content: {
    padding: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.xs,
    color: Colors.mutedSienna,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  settingsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softAsh,
  },
  settingInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingLabel: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
  },
  settingDesc: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.xs,
    color: Colors.mutedSienna,
    marginTop: 2,
  },
});
