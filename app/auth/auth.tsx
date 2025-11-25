import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import GradientBackground from '@/components/GradientBackground';
import { Mail, Lock, Eye, EyeOff, UserPlus, LogIn, Chrome, User } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Apple } from 'lucide-react-native';

export default function Auth() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { signIn, signUp, signInWithGoogle, signInWithApple, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(email.trim())) {
      Alert.alert('Validation Error', 'Invalid email address');
      return;
    }

    // Password validation for sign in: any length (let backend validate per userflow.md)

    setLoading(true);
    try {
      const result = await signIn(email.trim(), password);

      if (!result.success) {
        let errorMessage = 'Invalid credentials';
        
        if (result.error?.includes('Invalid login credentials') || result.error?.includes('Invalid credentials')) {
          errorMessage = 'Invalid credentials';
        } else if (result.error?.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before signing in.';
        } else if (result.error?.includes('rate limit')) {
          errorMessage = 'Too many failed attempts. Please wait a moment and try again.';
        } else if (result.error) {
          errorMessage = result.error;
        }
        
        Alert.alert('Sign In Failed', errorMessage);
      } else {
        console.log('✅ Auth: Sign in successful');
        // Mark onboarding as completed
        await AsyncStorage.setItem('onboarding_completed', 'true');
        router.replace('/(tabs)/home');
      }
    } catch (err: any) {
      console.error('❌ Auth: Sign in error:', err);
      Alert.alert('Sign In Failed', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(email.trim())) {
      Alert.alert('Validation Error', 'Invalid email address');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const result = await signUp(email.trim(), password, preferredName.trim() || undefined);

      if (!result.success) {
        let errorMessage = 'An unexpected error occurred. Please try again.';
        
        if (result.error?.includes('already registered') || result.error?.includes('already exists')) {
          errorMessage = 'This email is already registered. Try signing in instead.';
        } else if (result.error?.includes('password')) {
          errorMessage = 'Password must be at least 6 characters';
        } else if (result.error?.includes('email')) {
          errorMessage = 'Invalid email address';
        } else if (result.error?.includes('rate limit')) {
          errorMessage = 'Too many attempts. Please wait a moment and try again.';
        } else if (result.error) {
          errorMessage = result.error;
        }
        
        Alert.alert('Sign Up Failed', errorMessage);
      } else if (result.needsVerification) {
        console.log('✅ Auth: Sign up successful, needs verification');
        Alert.alert(
          'Account Created Successfully! 🎉',
          'Check your inbox for a confirmation email to verify your account.',
          [{ text: 'OK', onPress: () => setIsSignUp(false) }],
        );
      } else {
        console.log('✅ Auth: Sign up successful, auto-confirmed');
        // Mark onboarding as completed
        await AsyncStorage.setItem('onboarding_completed', 'true');
        Alert.alert(
          'Welcome! 🎉',
          'Your account has been created successfully.',
          [{ text: 'Get Started', onPress: () => router.replace('/(tabs)/home') }],
        );
      }
    } catch (err: any) {
      console.error('❌ Auth: Sign up error:', err);
      Alert.alert('Sign Up Failed', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your email address to reset your password.');
      return;
    }

    if (!validateEmail(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(email.trim());
      if (result.success) {
        Alert.alert(
          'Password Reset Email Sent',
          'Check your inbox for instructions to reset your password.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to send reset email. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (!result.success) {
        Alert.alert('Sign In Failed', result.error || 'Failed to sign in with Google.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithApple();
      if (!result.success) {
        Alert.alert('Sign In Failed', result.error || 'Failed to sign in with Apple.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in with Apple. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (isSignUp) {
      handleSignUp();
    } else {
      handleSignIn();
    }
  };

  return (
    <GradientBackground useGradient={true}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {isSignUp 
                ? 'Join Betternapped to start tracking your wellness journey' 
                : 'Sign in to continue your wellness journey'
              }
            </Text>
          </View>

          <View style={styles.form}>
            {isSignUp && (
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Preferred Name</Text>
                <View style={[styles.inputWrapper, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                  <User size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    value={preferredName}
                    onChangeText={setPreferredName}
                    placeholder="How should we call you?"
                    placeholderTextColor={theme.colors.textTertiary}
                    autoCapitalize="words"
                    autoComplete="name"
                    editable={!loading}
                  />
                </View>
                <Text style={[styles.hint, { color: theme.colors.textTertiary }]}>
                  Optional - We'll use this to personalize your experience
                </Text>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Email</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Mail size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.colors.textTertiary}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Password</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Lock size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.colors.textTertiary}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={theme.colors.textSecondary} />
                  ) : (
                    <Eye size={20} color={theme.colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {!isSignUp && (
              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={handleForgotPassword}
                disabled={loading}
              >
                <Text style={[styles.forgotPasswordText, { color: theme.colors.primary }]}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  {isSignUp ? (
                    <UserPlus size={20} color="#FFFFFF" style={styles.buttonIcon} />
                  ) : (
                    <LogIn size={20} color="#FFFFFF" style={styles.buttonIcon} />
                  )}
                  <Text style={styles.submitButtonText}>
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsSignUp(!isSignUp)}
              disabled={loading}
            >
              <Text style={[styles.switchText, { color: theme.colors.textSecondary }]}>
                {isSignUp 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Sign up"
                }
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
              <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>OR</Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
            </View>

            <TouchableOpacity
              style={[styles.oauthButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
              onPress={handleGoogleSignIn}
              disabled={loading}
            >
              <Chrome size={20} color={theme.colors.text} style={styles.oauthIcon} />
              <Text style={[styles.oauthButtonText, { color: theme.colors.text }]}>
                Continue with Google
              </Text>
            </TouchableOpacity>

            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={[styles.oauthButton, styles.appleButton, { borderColor: theme.colors.border }]}
                onPress={handleAppleSignIn}
                disabled={loading}
              >
                <Apple size={20} color="#FFFFFF" style={styles.oauthIcon} />
                <Text style={[styles.oauthButtonText, { color: '#FFFFFF' }]}>
                  Continue with Apple
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
    marginBottom: 24,
    backgroundColor: '#1E1E1E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  switchButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 24,
  },
  switchText: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 16,
    paddingVertical: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  oauthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  oauthIcon: {
    marginRight: 8,
  },
  oauthButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});