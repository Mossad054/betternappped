/**
 * AuthGuard Component
 * Handles deferred authentication for restricted pages
 * Shows login/signup prompt when unauthenticated users try to access protected features
 */

import React, { ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Lock, UserPlus, LogIn } from 'lucide-react-native';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  fallback?: ReactNode;
}

export function AuthGuard({ children, requireAuth = true, fallback }: AuthGuardProps) {
  const { user, isGuest } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [showAuthPrompt, setShowAuthPrompt] = React.useState(false);

  // If auth not required, or user is authenticated, render children
  if (!requireAuth || user) {
    return <>{children}</>;
  }

  // If guest mode and requires auth, show auth prompt
  if (isGuest && requireAuth) {
    return (
      <>
        {fallback || (
          <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.content}>
              <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.primary}20` }]}>
                <Lock size={48} color={theme.colors.primary} />
              </View>

              <Text style={[styles.title, { color: theme.colors.text }]}>
                Sign In Required
              </Text>

              <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
                To access this feature, please create an account or sign in to continue your wellness journey.
              </Text>

              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => {
                    router.push('/auth/auth');
                  }}
                >
                  <UserPlus size={20} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={styles.primaryButtonText}>Create Account</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.secondaryButton, { borderColor: theme.colors.border }]}
                  onPress={() => {
                    router.push('/auth/auth');
                  }}
                >
                  <LogIn size={20} color={theme.colors.text} style={styles.buttonIcon} />
                  <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>
                    Sign In
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => router.back()}
                >
                  <Text style={[styles.backButtonText, { color: theme.colors.textSecondary }]}>
                    Go Back
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </>
    );
  }

  // Loading state or no user
  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonsContainer: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
