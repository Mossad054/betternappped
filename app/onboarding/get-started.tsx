import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, Eye, ArrowRight } from 'lucide-react-native';
import GradientBackground from '@/components/GradientBackground';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function GetStartedScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { continueAsGuest } = useAuth();

  const handleSignUp = async () => {
    // Set onboarding_completed before navigating (per userflow.md)
    await AsyncStorage.setItem('onboarding_completed', 'true');
    router.push('/auth/auth');
  };

  const handleSignIn = async () => {
    // Set onboarding_completed before navigating (per userflow.md)
    await AsyncStorage.setItem('onboarding_completed', 'true');
    router.push('/auth/auth');
  };

  const handleContinueAsGuest = async () => {
    try {
      // Mark onboarding as completed
      await AsyncStorage.setItem('onboarding_completed', 'true');
      
      // Set guest mode
      await AsyncStorage.setItem('guest_mode', 'true');
      
      // Call continueAsGuest function
      await continueAsGuest();
      
      // Navigate to home
      router.replace('/(tabs)/home' as any);
    } catch (error) {
      console.error('Error continuing as guest:', error);
    }
  };

  return (
    <GradientBackground useGradient={true}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Main Content */}
          <View style={styles.mainContent}>
            <View style={styles.iconContainer}>
              <UserPlus size={80} color={theme.colors.primary} />
            </View>
            
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Ready to Get Started?
            </Text>
            
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Choose how you'd like to begin your wellness journey
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleSignUp}
            >
              <Text style={styles.primaryButtonText}>Create Account</Text>
              <ArrowRight size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: theme.colors.border }]}
              onPress={handleSignIn}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.guestButton, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}
              onPress={handleContinueAsGuest}
            >
              <Eye size={20} color={theme.colors.textSecondary} />
              <Text style={[styles.guestButtonText, { color: theme.colors.textSecondary }]}>
                Continue as Guest
              </Text>
            </TouchableOpacity>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressDot, styles.inactiveDot]} />
            <View style={[styles.progressDot, styles.inactiveDot]} />
            <View style={[styles.progressDot, styles.inactiveDot]} />
            <View style={[styles.progressDot, styles.inactiveDot]} />
            <View style={[styles.progressDot, { backgroundColor: theme.colors.primary }]} />
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(209, 255, 78, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Inter',
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 40,
    fontFamily: 'Inter',
  },
  actionsContainer: {
    gap: 16,
    marginBottom: 40,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 50,
    shadowColor: '#D1FF4E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 5,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 50,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 50,
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  inactiveDot: {
    backgroundColor: 'rgba(110, 110, 115, 0.3)',
  },
});

