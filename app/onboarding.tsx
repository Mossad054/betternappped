/**
 * Onboarding Screen
 * Collects user information after registration
 * Asks for name, profile preferences, and optional profile picture
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { User, Camera, ChevronRight, Check } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ProfileService } from '@/services/profile.service';

interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: 'Welcome to Betternapped! 👋',
    subtitle: "Let's personalize your experience",
  },
  {
    id: 2,
    title: 'Add Your Photo',
    subtitle: 'Optional: Upload a profile picture',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { colors, typography, spacing } = theme;

  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Validation
  const isStep1Valid = fullName.trim().length >= 2;

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need permission to access your photos to set a profile picture.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need permission to access your camera to take a photo.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && isStep1Valid) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      handleComplete();
    }
  };

  const handleSkip = () => {
    if (currentStep === 2) {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Update profile with name
      const profileResult = await ProfileService.upsertProfile(user.id, {
        full_name: fullName.trim(),
        email: user.email || '',
      });

      if (profileResult.error) {
        Alert.alert('Error', 'Failed to save your information. Please try again.');
        setLoading(false);
        return;
      }

      // Upload profile picture if provided
      if (profilePicture) {
        setUploadingPhoto(true);
        const uploadResult = await ProfileService.uploadProfilePicture(
          user.id,
          profilePicture
        );
        setUploadingPhoto(false);

        if (uploadResult.error) {
          console.error('Failed to upload profile picture:', uploadResult.error);
          // Don't block completion if photo upload fails
        }
      }

      // Navigate to main app
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Onboarding error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconCircle}>
        <User size={48} color={colors.primary} />
      </View>

      <Text style={[styles.title, { color: colors.text }, typography.h2]}>
        {ONBOARDING_STEPS[0].title}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }, typography.body]}>
        {ONBOARDING_STEPS[0].subtitle}
      </Text>

      <View style={styles.inputSection}>
        <Text style={[styles.label, { color: colors.text }, typography.h5]}>
          Your preferred name
        </Text>
        <Text style={[styles.labelHint, { color: colors.textSecondary }]}>
          This is how we'll greet you throughout the app
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: colors.border,
              backgroundColor: colors.surface,
              color: colors.text,
            },
            typography.body,
          ]}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter your name"
          placeholderTextColor={colors.textSecondary}
          autoFocus
          autoCapitalize="words"
        />
        <Text style={[styles.hint, { color: colors.textSecondary }, typography.caption]}>
          This will be displayed on your profile
        </Text>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.title, { color: colors.text }, typography.h2]}>
        {ONBOARDING_STEPS[1].title}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }, typography.body]}>
        {ONBOARDING_STEPS[1].subtitle}
      </Text>

      <TouchableOpacity
        style={[styles.avatarPicker, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={handlePickImage}
        disabled={uploadingPhoto}
      >
        {profilePicture ? (
          <Image source={{ uri: profilePicture }} style={styles.avatarImage} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
            <Camera size={32} color={colors.surface} />
          </View>
        )}
        {uploadingPhoto && (
          <View style={styles.uploadOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.photoActions}>
        <TouchableOpacity
          style={[styles.photoButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={handlePickImage}
          disabled={uploadingPhoto}
        >
          <Camera size={20} color={colors.text} />
          <Text style={[styles.photoButtonText, { color: colors.text }, typography.body]}>
            Choose Photo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.photoButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={handleTakePhoto}
          disabled={uploadingPhoto}
        >
          <Camera size={20} color={colors.text} />
          <Text style={[styles.photoButtonText, { color: colors.text }, typography.body]}>
            Take Photo
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.skipText, { color: colors.textSecondary }, typography.caption]}>
        You can always add a photo later in your profile settings
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.progressBar}>
          {ONBOARDING_STEPS.map((step) => (
            <View
              key={step.id}
              style={[
                styles.progressSegment,
                {
                  backgroundColor:
                    step.id <= currentStep ? colors.primary : colors.border,
                },
              ]}
            />
          ))}
        </View>
        <Text style={[styles.stepCounter, { color: colors.textSecondary }, typography.caption]}>
          Step {currentStep} of {ONBOARDING_STEPS.length}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + 16,
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
        ]}
      >
        <View style={styles.footerButtons}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={handleBack}
              disabled={loading}
            >
              <Text style={[styles.backButtonText, { color: colors.text }, typography.h6]}>
                Back
              </Text>
            </TouchableOpacity>
          )}

          {currentStep === 2 && (
            <TouchableOpacity
              style={[styles.skipButton, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={handleSkip}
              disabled={loading}
            >
              <Text style={[styles.skipButtonText, { color: colors.textSecondary }, typography.h6]}>
                Skip
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.nextButton,
              { backgroundColor: colors.primary },
              (currentStep === 1 && !isStep1Valid) && styles.disabledButton,
            ]}
            onPress={handleNext}
            disabled={loading || (currentStep === 1 && !isStep1Valid)}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.surface} />
            ) : (
              <>
                <Text style={[styles.nextButtonText, { color: colors.surface }, typography.h6]}>
                  {currentStep === ONBOARDING_STEPS.length ? 'Get Started' : 'Next'}
                </Text>
                {currentStep < ONBOARDING_STEPS.length && (
                  <ChevronRight size={20} color={colors.surface} />
                )}
                {currentStep === ONBOARDING_STEPS.length && (
                  <Check size={20} color={colors.surface} />
                )}
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  stepCounter: {
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
  },
  stepContainer: {
    alignItems: 'center',
    paddingTop: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
  },
  inputSection: {
    width: '100%',
    marginTop: 16,
  },
  label: {
    marginBottom: 4,
  },
  labelHint: {
    fontSize: 14,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  hint: {
    marginTop: 8,
    textAlign: 'center',
  },
  avatarPicker: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  photoButtonText: {
    fontSize: 14,
  },
  skipText: {
    marginTop: 16,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  backButtonText: {},
  skipButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  skipButtonText: {},
  nextButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  nextButtonText: {},
  disabledButton: {
    opacity: 0.5,
  },
});
