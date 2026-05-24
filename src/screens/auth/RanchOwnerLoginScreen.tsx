import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { PInput, PButton } from '../../components/ui';

type RanchOwnerLoginScreenProps = {
  navigation: StackNavigationProp<AuthStackParamList, 'RanchOwnerLogin'>;
};

export const RanchOwnerLoginScreen: React.FC<RanchOwnerLoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loginAsOwner, isLoading } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) return;
    await loginAsOwner(email, password);
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
          <Text style={styles.title}>Owner Login</Text>
          <Text style={styles.subtitle}>Sign in with your email and password to manage your ranch.</Text>
        </View>

        <View style={styles.form}>
          <PInput
            label="Email Address"
            placeholder="owner@ranch.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <PInput
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <PButton 
            title="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            style={styles.submitButton}
          />

          <TouchableOpacity 
            style={styles.signupLink}
            onPress={() => navigation.navigate('RanchOwnerSignUp')}
          >
            <Text style={styles.signupText}>New to Pocos? <Text style={styles.signupLinkText}>Create a Ranch</Text></Text>
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
  submitButton: {
    marginTop: Spacing.xl,
  },
  signupLink: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  signupText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
  },
  signupLinkText: {
    fontFamily: 'DMSans-Bold',
    color: Colors.primaryRust,
  },
});
