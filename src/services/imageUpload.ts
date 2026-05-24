import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../config/supabase';
import { Platform } from 'react-native';

const BUCKET = 'pocos-images';

export async function pickImage(aspect: [number, number] = [1, 1]): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permission to access media library denied');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect,
    quality: 0.7,
    base64: false,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null;
  }

  return result.assets[0].uri;
}

export async function uploadImage(uri: string, folder: string = 'misc'): Promise<string> {
  const ext = uri.split('.').pop()?.split('?')[0]?.toLowerCase() || 'jpg';
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

  let fileData: Blob | ArrayBuffer;
  let contentType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;

  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    fileData = await response.blob();
    contentType = fileData.type || contentType;
  } else {
    const response = await fetch(uri);
    const arrayBuffer = await response.arrayBuffer();
    fileData = arrayBuffer;
  }

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, fileData as any, {
      contentType,
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

export async function pickAndUploadImage(folder: string = 'misc', aspect: [number, number] = [1, 1]): Promise<string | null> {
  const uri = await pickImage(aspect);
  if (!uri) return null;
  return uploadImage(uri, folder);
}
