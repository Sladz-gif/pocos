import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { PInput, PButton } from '../../components/ui';

type ConsumerSignUpScreenProps = {
  navigation: StackNavigationProp<AuthStackParamList, 'ConsumerSignUp'>;
};

export const ConsumerSignUpScreen: React.FC<ConsumerSignUpScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signupAsConsumer, isLoading } = useAuthStore();

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    try {
      await signupAsConsumer({ name, email, password });
      // Story 1.3: once logged in, you're always logged in until you explicitly sign out.
      // The authStore handles AsyncStorage persistence.
    } catch (e: any) {
      setError(e.message || 'Failed to create account');
    }
  };

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
            <Text style={styles.title}>Join Pocos</Text>
            <Text style={styles.subtitle}>Discover and order quality ranch products directly from the source.</Text>
          </View>

          <View style={styles.form}>
            <PInput
              label="Full Name"
              placeholder="Abena Frimpong"
              value={name}
              onChangeText={setName}
              autoFocus
              // Story 1.3: Name field triggers autocomplete on iOS
              autoCapitalize="words"
            />
            <PInput
              label="Email Address"
              placeholder="abena@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <PInput
              label="Create Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry // Story 1.1 pattern: show/hide toggle
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <PButton 
              title={isLoading ? "Creating Account..." : "Create Account"}
              onPress={handleSignUp}
              loading={isLoading}
              style={styles.submitButton}
            />

            <TouchableOpacity 
              style={styles.loginLink}
              onPress={() => navigation.navigate('ConsumerSignIn')}
            >
              <Text style={styles.loginText}>Already have an account? <Text style={styles.loginLinkText}>Sign In</Text></Text>
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
  },
  subtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.mutedSienna,
    marginTop: 8,
  },
  form: {
    flex: 1,
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
  loginText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
  },
  loginLinkText: {
    color: Colors.primaryRust,
    fontFamily: 'DMSans-Bold',
  },
});
