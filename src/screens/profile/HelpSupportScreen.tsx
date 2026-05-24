import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PCard } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { AdminStackParamList } from '../../navigation/types';

type HelpSupportScreenProps = {
  navigation: StackNavigationProp<AdminStackParamList, 'HelpSupport'>;
};

export const HelpSupportScreen: React.FC<HelpSupportScreenProps> = ({ navigation }) => {
  const faqs = [
    { q: 'How do I add a new animal?', a: 'Go to the Herd tab and tap the "+" button at the top right.' },
    { q: 'Can I change my access code?', a: 'Staff access codes are managed by the Ranch Owner or Admin.' },
    { q: 'How to mark a task as complete?', a: 'Tap on a task in the Task Board, then tap "Complete Task" at the bottom.' },
  ];

  const contactSupport = () => {
    Linking.openURL('mailto:support@pocosranch.com');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.charcoalInk} />
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {faqs.map((faq, index) => (
          <PCard key={index} style={styles.faqCard}>
            <Text style={styles.faqQuestion}>{faq.q}</Text>
            <Text style={styles.faqAnswer}>{faq.a}</Text>
          </PCard>
        ))}

        <Text style={styles.sectionTitle}>Contact Us</Text>
        <TouchableOpacity style={styles.contactCard} onPress={contactSupport}>
          <View style={styles.contactIcon}>
            <Ionicons name="mail-outline" size={24} color={Colors.primaryRust} />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>Email Support</Text>
            <Text style={styles.contactValue}>support@pocosranch.com</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.softAsh} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactCard} onPress={() => Linking.openURL('https://pocosranch.com')}>
          <View style={styles.contactIcon}>
            <Ionicons name="globe-outline" size={24} color={Colors.primaryRust} />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>Website</Text>
            <Text style={styles.contactValue}>www.pocosranch.com</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.softAsh} />
        </TouchableOpacity>
        
        <View style={{ height: 40 }} />
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
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  faqCard: {
    marginBottom: Spacing.md,
  },
  faqQuestion: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
    marginBottom: Spacing.xs,
  },
  faqAnswer: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
    lineHeight: 20,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: Spacing.lg,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.softAsh,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.warmSand,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.xs,
    color: Colors.mutedSienna,
  },
  contactValue: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
  },
});
