import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PCard, PButton } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { AdminStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';

type PricingPlansScreenProps = {
  navigation: StackNavigationProp<AdminStackParamList, 'PricingPlans'>;
};

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 50,
    currency: 'GHS',
    period: '/month',
    features: [
      'Up to 5 staff members',
      'Basic task management',
      'Bird tracking',
      'Activity logs',
    ],
    popular: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 150,
    currency: 'GHS',
    period: '/month',
    features: [
      'Up to 20 staff members',
      'Advanced task management',
      'Bird tracking & analytics',
      'Activity logs',
      'Priority support',
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 400,
    currency: 'GHS',
    period: '/month',
    features: [
      'Unlimited staff members',
      'Full task management',
      'Bird tracking & analytics',
      'Activity logs',
      'Priority support',
      'Custom integrations',
    ],
    popular: false,
  },
];

export const PricingPlansScreen: React.FC<PricingPlansScreenProps> = ({ navigation }) => {
  const { user, ranch } = useAuthStore();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleActivatePlan = async () => {
    if (!selectedPlan) return;

    setProcessing(true);
    const plan = PLANS.find(p => p.id === selectedPlan);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const message = selectedPlan === 'starter' 
        ? 'Plan Activated' 
        : 'Plan Upgraded';

      Alert.alert(
        message,
        `You have successfully ${message.toLowerCase()} to ${plan?.name} plan for ${plan?.price} ${plan?.currency}${plan?.period}`,
        [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to activate plan. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Pricing Plans</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Choose the plan that fits your farm</Text>

        {PLANS.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planCard,
              selectedPlan === plan.id && styles.planCardSelected,
              plan.popular && styles.planCardPopular,
            ]}
            onPress={() => handleSelectPlan(plan.id)}
            activeOpacity={0.8}
          >
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
              </View>
            )}
            <View style={styles.planHeader}>
              <Text style={styles.planName}>{plan.name}</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>{plan.price}</Text>
                <Text style={styles.currency}>{plan.currency}</Text>
              </View>
              <Text style={styles.period}>{plan.period}</Text>
            </View>
            <View style={styles.features}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.feature}>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.accent} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
            {selectedPlan === plan.id && (
              <View style={styles.selectedIndicator}>
                <Ionicons name="checkmark-circle" size={24} color={Colors.accent} />
                <Text style={styles.selectedText}>Selected</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        <PButton
          title={processing ? 'Processing...' : selectedPlan ? 'Activate Plan' : 'Select a Plan'}
          onPress={handleActivatePlan}
          disabled={!selectedPlan || processing}
          style={styles.activateButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.primarySurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.xl,
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
  },
  subtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  planCard: {
    backgroundColor: Colors.primarySurface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: Colors.deepBlack,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  planCardSelected: {
    borderColor: Colors.accent,
  },
  planCardPopular: {
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: Spacing.xl,
    backgroundColor: Colors.gold,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  popularBadgeText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 10,
    color: Colors.primarySurface,
    textTransform: 'uppercase',
  },
  planHeader: {
    marginBottom: Spacing.lg,
  },
  planName: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize['2xl'],
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  price: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 36,
    color: Colors.accent,
  },
  currency: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  period: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  features: {
    gap: Spacing.sm,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  featureText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  selectedText: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.accent,
  },
  activateButton: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
});
