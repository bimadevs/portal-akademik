import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Alert, Platform } from 'react-native';

const PHOTOS_DIR = `${FileSystem.documentDirectory ?? ''}photos/`;

export const PhotoService = {
  /**
   * Memastikan direktori photos ada di penyimpanan lokal perangkat.
   */
  async ensurePhotosDir(): Promise<void> {
    if (Platform.OS === 'web' || !FileSystem.documentDirectory) return;
    try {
      const dirInfo = await FileSystem.getInfoAsync(PHOTOS_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(PHOTOS_DIR, { intermediates: true });
      }
    } catch (e) {
      console.warn('Gagal membuat direktori foto:', e);
    }
  },

  /**
   * Salin file foto yang dipilih ke direktori aplikasi agar persisten.
   */
  async saveToDocuments(uri: string): Promise<string> {
    if (Platform.OS === 'web' || !FileSystem.documentDirectory) {
      return uri;
    }

    try {
      await this.ensurePhotosDir();
      const extension = uri.split('.').pop()?.split('?')[0] || 'jpg';
      const filename = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;
      const destination = `${PHOTOS_DIR}${filename}`;
      await FileSystem.copyAsync({ from: uri, to: destination });
      return destination;
    } catch (error) {
      console.warn('Gagal menyalin file foto ke penyimpanan dokumen, menggunakan URI asli:', error);
      return uri;
    }
  },

  /**
   * Buka galeri untuk memilih foto.
   */
  async pickFromGallery(): Promise<string | null> {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) {
        return null;
      }

      const selectedUri = result.assets[0].uri;
      return await this.saveToDocuments(selectedUri);
    } catch (error: any) {
      console.error('Error saat memilih foto dari galeri:', error);
      Alert.alert('Gagal Memilih Foto', error.message || 'Terjadi kesalahan saat membuka galeri.');
      return null;
    }
  },

  /**
   * Buka kamera untuk mengambil foto baru.
   */
  async takePhoto(): Promise<string | null> {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Izin Kamera Ditolak',
          'Aplikasi membutuhkan izin kamera untuk dapat mengambil foto langsung.'
        );
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) {
        return null;
      }

      const capturedUri = result.assets[0].uri;
      return await this.saveToDocuments(capturedUri);
    } catch (error: any) {
      console.error('Error saat mengambil foto dari kamera:', error);
      Alert.alert('Gagal Mengambil Foto', error.message || 'Terjadi kesalahan saat membuka kamera.');
      return null;
    }
  },

  /**
   * Menampilkan dialog pilihan Kamera vs Galeri vs Hapus Foto.
   */
  showPhotoOptions(options: {
    onPhotoSelected: (uri: string) => void;
    onPhotoRemoved?: () => void;
    hasExistingPhoto?: boolean;
    title?: string;
  }): void {
    const buttons: { text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }[] = [
      {
        text: 'Ambil Foto dari Kamera',
        onPress: async () => {
          const uri = await this.takePhoto();
          if (uri) options.onPhotoSelected(uri);
        },
      },
      {
        text: 'Pilih dari Galeri',
        onPress: async () => {
          const uri = await this.pickFromGallery();
          if (uri) options.onPhotoSelected(uri);
        },
      },
    ];

    if (options.hasExistingPhoto && options.onPhotoRemoved) {
      buttons.push({
        text: 'Hapus Foto',
        style: 'destructive',
        onPress: options.onPhotoRemoved,
      });
    }

    buttons.push({
      text: 'Batal',
      style: 'cancel',
    });

    Alert.alert(
      options.title || 'Foto Profil',
      'Pilih metode untuk mengunggah atau mengganti foto profil:',
      buttons
    );
  },
};
