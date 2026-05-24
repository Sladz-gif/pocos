import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { PInput } from '../../components/ui/Input';
import { PButton } from '../../components/ui/Button';

type RanchLoginScreenProps = {
  navigation: StackNavigationProp<AuthStackParamList, 'RanchLogin'>;
};

export const RanchLoginScreen: React.FC<RanchLoginScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const { loginAsRanch, isLoading } = useAuthStore();

  const handleLogin = async () => {
    const trimmedName = name.trim();
    const trimmedCode = accessCode.trim();
    
    if (!trimmedName || !trimmedCode) {
      setError('Please enter both your name and access code');
      return;
    }

    setError('');
    try {
      await loginAsRanch(trimmedName, trimmedCode);
    } catch (e: any) {
      setError(e.message || 'Invalid name or access code. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.charcoalInk} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Ranch Access</Text>
          <Text style={styles.subtitle}>Sign in with your full name and the access code provided by your ranch admin.</Text>
        </View>

        <View style={styles.form}>
          <PInput
            label="Full Name"
            placeholder="e.g. John Doe"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (error) setError('');
            }}
            autoFocus
          />

          <PInput
            label="Access Code"
            placeholder="e.g. AB1234"
            value={accessCode}
            onChangeText={(text) => {
              setAccessCode(text.toUpperCase());
              if (error) setError('');
            }}
            error={error}
            autoCapitalize="characters"
            monospace
          />

          <PButton 
            title={isLoading ? "Signing in..." : "Sign In"}
            onPress={handleLogin}
            loading={isLoading}
            style={styles.submitButton}
          />

          <TouchableOpacity 
            style={styles.ownerLink}
            onPress={() => navigation.navigate('RanchOwnerLogin')}
          >
            <Text style={styles.ownerLinkText}>I&apos;m a ranch owner — sign in differently</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.paleParchment,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
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
  submitButton: {
    marginTop: Spacing.xl,
  },
  ownerLink: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  ownerLinkText: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.sm,
    color: Colors.primaryRust,
    textDecorationLine: 'underline',
  },
});
