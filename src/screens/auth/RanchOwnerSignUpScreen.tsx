import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { PInput, PButton } from '../../components/ui';

type RanchOwnerSignUpScreenProps = {
  navigation: StackNavigationProp<AuthStackParamList, 'RanchOwnerSignUp'>;
};

export const RanchOwnerSignUpScreen: React.FC<RanchOwnerSignUpScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ranchName, setRanchName] = useState('');
  const [ranchLocation, setRanchLocation] = useState('');
  
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  const { signupAsRanchOwner, isLoading } = useAuthStore();

  const validateEmail = (val: string) => {
    setEmail(val);
    if (!val) {
      setEmailError('');
      return;
    }
    // Story 1.1: real-time validation (no dot after @ is a fail)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const validatePassword = (val: string) => {
    setPassword(val);
    if (val.length > 0 && val.length < 8) {
      setPasswordError('Password must be at least 8 characters');
    } else {
      setPasswordError('');
    }
  };

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !ranchName.trim() || !ranchLocation.trim()) {
      setFormError('Please fill in all fields');
      return;
    }
    if (emailError || passwordError) return;
    
    setFormError('');
    try {
      await signupAsRanchOwner({ name, email, password, ranchName, ranchLocation });
      // Story 1.1: brief success state before navigate
      setShowSuccess(true);
    } catch (e: any) {
      setFormError(e.message || 'Failed to create account');
    }
  };

  if (showSuccess) {
    return (
      <SafeAreaView style={styles.successContainer}>
        <View style={styles.successContent}>
          <Ionicons name="checkmark-circle" size={100} color={Colors.successMoss} />
          <Text style={styles.successTitle}>Ranch Registered!</Text>
          <Text style={styles.successSubtitle}>Welcome to Pocos, {name}. Your ranch is ready.</Text>
          <ActivityIndicator color={Colors.primaryRust} style={{ marginTop: 20 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.charcoalInk} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Register Your Ranch</Text>
            <Text style={styles.subtitle}>Join the network of modern African ranches.</Text>
          </View>

          <View style={styles.form}>
            <PInput
              label="Ranch Name"
              placeholder="e.g. Asante Farms"
              value={ranchName}
              onChangeText={setRanchName}
              autoFocus // Story 1.1: Auto-focus first field
            />
            <PInput
              label="Your Full Name"
              placeholder="Emmanuel Asante"
              value={name}
              onChangeText={setName}
            />
            <PInput
              label="Email Address"
              placeholder="emmanuel@asante.com"
              value={email}
              onChangeText={validateEmail}
              keyboardType="email-address"
              error={emailError} // Story 1.1: Inline error
            />
            <View style={styles.passwordHeader}>
              <Text style={styles.passwordHint}>Min. 8 characters</Text>
            </View>
            <PInput
              label="Create Password"
              placeholder="••••••••"
              value={password}
              onChangeText={validatePassword}
              secureTextEntry // Story 1.1: Show/hide toggle handled in PInput
              error={passwordError}
            />
            <PInput
              label="Ranch Location"
              placeholder="e.g. Kumasi, Ghana"
              value={ranchLocation}
              onChangeText={setRanchLocation}
            />

            {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

            <PButton 
              title={isLoading ? "Creating Account..." : "Register Ranch"}
              onPress={handleSignUp}
              loading={isLoading}
              style={styles.submitButton}
            />

            <TouchableOpacity 
              style={styles.loginLink}
              onPress={() => navigation.navigate('RanchOwnerLogin')}
            >
              <Text style={styles.loginLinkText}>Already have a ranch? Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.paleParchment,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing['4xl'],
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  header: {
    marginBottom: Spacing['3xl'],
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize['3xl'],
    color: Colors.charcoalInk,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.mutedSienna,
    lineHeight: 24,
  },
  form: {
    flex: 1,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: -Spacing.xs,
  },
  passwordHint: {
    fontFamily: 'DMSans-Regular',
    fontSize: 10,
    color: Colors.mutedSienna,
  },
  errorText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.dangerCrimson,
    marginBottom: Spacing.md,
  },
  submitButton: {
    marginTop: Spacing.xl,
  },
  loginLink: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  loginLinkText: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.sm,
    color: Colors.primaryRust,
    textDecorationLine: 'underline',
  },
  successContainer: {
    flex: 1,
    backgroundColor: Colors.paleParchment,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContent: {
    alignItems: 'center',
    padding: Spacing['3xl'],
  },
  successTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize['2xl'],
    color: Colors.charcoalInk,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  successSubtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.mutedSienna,
    textAlign: 'center',
    lineHeight: 24,
  },
});
