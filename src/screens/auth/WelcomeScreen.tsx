import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

type WelcomeScreenProps = {
  navigation: StackNavigationProp<AuthStackParamList, 'Welcome'>;
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const tapCountRef = useRef(0);
  const lastTapAtRef = useRef<number>(0);
  const TAP_WINDOW_MS = 1500;

  const handleLogoTap = async () => {
    const now = Date.now();
    if (now - lastTapAtRef.current > TAP_WINDOW_MS) {
      tapCountRef.current = 1;
    } else {
      tapCountRef.current += 1;
    }
    lastTapAtRef.current = now;

    try {
      Haptics.selectionAsync?.();
    } catch (e) {
      // no-op, haptics best-effort only
    }

    if (tapCountRef.current >= 3) {
      tapCountRef.current = 0;
      navigation.navigate('DeviceHealthCheck');
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Pressable onPress={handleLogoTap} delayLongPress={0} hitSlop={8}>
                <Text style={styles.logoText}>Animal</Text>
              </Pressable>
              <Text style={styles.tagline}>Every herd. Every story.</Text>
            </View>

            <View style={styles.roleContainer}>
              <TouchableOpacity 
                style={styles.roleCard}
                onPress={() => navigation.navigate('RanchLogin')}
              >
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                  <Ionicons name="home" size={32} color={Colors.warmSand} />
                </View>
                <View style={styles.roleTextContainer}>
                  <Text style={styles.roleTitle}>I run a ranch</Text>
                  <Text style={styles.roleSubtitle}>Manage your herd, tasks, and team</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.3)" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.roleCard}
                onPress={() => navigation.navigate('ConsumerSignUp')}
              >
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                  <Ionicons name="cart" size={32} color={Colors.warmSand} />
                </View>
                <View style={styles.roleTextContainer}>
                  <Text style={styles.roleTitle}>I want to buy</Text>
                  <Text style={styles.roleSubtitle}>Discover and order quality ranch products</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.3)" />
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity onPress={() => navigation.navigate('RanchOwnerSignUp')}>
                <Text style={styles.footerText}>
                  Need to register your ranch? <Text style={styles.footerLink}>Create Account</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.paleParchment,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
    justifyContent: 'space-between',
    minHeight: 600, // Ensures content spreads out on larger screens
  },
  header: {
    marginTop: Spacing['4xl'],
    alignItems: 'center',
  },
  logoText: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 64,
    color: Colors.deepPlum,
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.base,
    color: Colors.mutedSienna,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  roleContainer: {
    gap: Spacing.lg,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: Spacing.xl,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.softAsh,
    shadowColor: Colors.charcoalInk,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  roleTextContainer: {
    flex: 1,
  },
  roleTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.xl,
    color: Colors.charcoalInk,
    marginBottom: 4,
  },
  roleSubtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
  },
  footer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  footerText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
  },
  footerLink: {
    color: Colors.primaryRust,
    fontFamily: 'DMSans-Bold',
    textDecorationLine: 'underline',
  },
});
