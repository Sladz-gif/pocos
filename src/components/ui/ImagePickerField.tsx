import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { pickAndUploadImage } from '../../services/imageUpload';

interface ImagePickerFieldProps {
  label?: string;
  value?: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  size?: number;
  aspect?: [number, number];
  placeholder?: string;
  fullWidth?: boolean;
}

export function ImagePickerField({
  label,
  value,
  onChange,
  folder = 'misc',
  size = 120,
  aspect = [1, 1],
  placeholder = 'Add Photo',
  fullWidth = false,
}: ImagePickerFieldProps) {
  const [uploading, setUploading] = useState(false);

  const handlePick = async () => {
    try {
      setUploading(true);
      const url = await pickAndUploadImage(folder, aspect);
      if (url) onChange(url);
    } catch (e: any) {
      Alert.alert('Upload failed', e.message || 'Could not upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange(null);
  };

  const pickerStyle: any = {
    width: fullWidth ? '100%' : size,
    aspectRatio: aspect[0] / aspect[1],
  };

  return (
    <View style={[styles.container, fullWidth && { width: '100%' }]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity 
        style={[styles.picker, pickerStyle]}
        onPress={handlePick}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color={Colors.primaryRust} />
        ) : value ? (
          <Image source={{ uri: value }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="camera-outline" size={32} color={Colors.mutedSienna} />
            <Text style={styles.placeholderText}>{placeholder}</Text>
          </View>
        )}
      </TouchableOpacity>
      {value && !uploading ? (
        <TouchableOpacity onPress={handleRemove} style={styles.removeBtn}>
          <Text style={styles.removeText}>Remove</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    alignItems: 'flex-start',
  },
  label: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
    marginBottom: Spacing.sm,
  },
  picker: {
    backgroundColor: Colors.softAsh,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.softAsh,
    borderStyle: 'dashed',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.xs,
    color: Colors.mutedSienna,
    marginTop: 4,
  },
  removeBtn: {
    marginTop: Spacing.sm,
  },
  removeText: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.xs,
    color: Colors.dangerCrimson,
  },
});
