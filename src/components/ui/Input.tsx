import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

interface InputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  style?: TextStyle;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'url';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  secureTextEntry?: boolean;
  autoFocus?: boolean;
  monospace?: boolean;
  suffix?: string;
  editable?: boolean;
  onPress?: () => void;
}

export function PInput({
  label,
  error,
  containerStyle,
  style,
  placeholder,
  value,
  onChangeText,
  multiline,
  numberOfLines,
  keyboardType,
  autoCapitalize,
  secureTextEntry,
  autoFocus,
  monospace,
  suffix,
  editable = true,
  onPress,
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const content = (
    <View style={styles.inputWrapper}>
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          secureTextEntry && styles.inputWithIcon,
          monospace && styles.monospaceInput,
          suffix && styles.inputWithSuffix,
          !editable && styles.disabledInput,
          style,
        ]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry && !isPasswordVisible}
        autoFocus={autoFocus}
        placeholderTextColor={Colors.mutedSienna}
        editable={editable && !onPress}
        pointerEvents={onPress ? 'none' : 'auto'}
      />
      {secureTextEntry && (
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
        >
          <Ionicons 
            name={isPasswordVisible ? "eye-off" : "eye"} 
            size={20} 
            color={Colors.mutedSienna} 
          />
        </TouchableOpacity>
      )}
      {suffix && (
        <View style={styles.suffixContainer}>
          <Text style={styles.suffixText}>{suffix}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {onPress ? (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
          {content}
        </TouchableOpacity>
      ) : (
        content
      )}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
    marginBottom: Spacing.sm,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    fontFamily: 'DMSans-Regular',
    backgroundColor: Colors.softAsh,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  monospaceInput: {
    fontFamily: 'DMMono-Regular',
    letterSpacing: 1,
  },
  inputWithIcon: {
    paddingRight: 50,
  },
  inputWithSuffix: {
    paddingRight: 60,
  },
  disabledInput: {
    opacity: 0.8,
  },
  inputError: {
    borderColor: Colors.dangerCrimson,
  },
  iconButton: {
    position: 'absolute',
    right: Spacing.md,
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  suffixContainer: {
    position: 'absolute',
    right: Spacing.md,
    height: '100%',
    justifyContent: 'center',
  },
  suffixText: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
  },
  errorText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.dangerCrimson,
    marginTop: Spacing.xs,
  },
});
