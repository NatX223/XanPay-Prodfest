import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

interface BusinessImageUploadProps {
  onImageSelected?: (image: ImagePicker.ImagePickerAsset) => void;
  onError?: (error: string) => void;
}

export function BusinessImageUpload({ onImageSelected, onError }: BusinessImageUploadProps) {
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pulse animation for placeholder
  const pulseAnimation = useSharedValue(0);

  useEffect(() => {
    // Subtle pulse animation for placeholder
    pulseAnimation.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => {
    const scale = interpolate(pulseAnimation.value, [0, 1], [1, 1.02]);
    const opacity = interpolate(pulseAnimation.value, [0, 1], [0.8, 1]);
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to upload your business image.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const validateImage = (asset: ImagePicker.ImagePickerAsset): string | null => {
    // Check file size (max 5MB)
    if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
      return 'Image size must be less than 5MB';
    }

    // Check file type
    const validTypes = ['jpg', 'jpeg', 'png', 'webp'];
    const fileExtension = asset.uri.split('.').pop()?.toLowerCase();
    if (!fileExtension || !validTypes.includes(fileExtension)) {
      return 'Please select a valid image format (JPG, PNG, or WebP)';
    }

    return null;
  };

  const handleImagePick = async () => {
    try {
      setError(null);
      
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      setIsLoading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio for squircle
        quality: 0.8,
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        const selectedImage = result.assets[0];
        
        // Validate the selected image
        const validationError = validateImage(selectedImage);
        if (validationError) {
          setError(validationError);
          onError?.(validationError);
          return;
        }

        setImage(selectedImage);
        onImageSelected?.(selectedImage);
      }
    } catch (err) {
      const errorMessage = 'Failed to upload image. Please try again.';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8a63d2" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    if (image) {
      return (
        <Image
          source={{ uri: image.uri }}
          style={styles.selectedImage}
          contentFit="cover"
        />
      );
    }

    return (
      <Animated.View style={[styles.placeholderContent, pulseStyle]}>
        <Ionicons name="camera" size={32} color="#666666" />
        <Text style={styles.placeholderText}>Add Business Image</Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.uploadContainer,
          error && styles.uploadContainerError,
        ]}
        onPress={handleImagePick}
        disabled={isLoading}
        activeOpacity={0.8}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={image ? "Change business image" : "Add business image"}
        accessibilityHint="Tap to select an image from your photo library"
      >
        {renderContent()}
      </TouchableOpacity>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 24,
  },
  uploadContainer: {
    width: 160,
    height: 160,
    borderRadius: 32, // Increased border radius for larger size
    backgroundColor: '#F5F5F5', // Light gray background for white page
    borderWidth: 2,
    borderColor: '#E0E0E0', // Gray border for white background
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  uploadContainerError: {
    borderColor: '#FF3B30',
    borderWidth: 2,
  },
  placeholderContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#666666',
    fontSize: 14,
    fontFamily: 'Clash',
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30, // Slightly smaller to account for border
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#666666',
    fontSize: 12,
    fontFamily: 'Clash',
    marginTop: 8,
  },
  errorText: {
    color: '#FF3B30',
    fontFamily: 'Clash',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 200,
  },
});