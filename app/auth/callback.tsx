import { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/contexts/ThemeContext';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { access_token, refresh_token, error, error_description } = params;

        // Check for errors
        if (error) {
          console.error('Auth callback error:', error, error_description);
          router.replace('/auth/auth');
          return;
        }

        // Set the session if tokens are provided
        if (access_token && refresh_token) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: access_token as string,
            refresh_token: refresh_token as string,
          });

          if (sessionError) {
            console.error('Error setting session:', sessionError);
            router.replace('/auth/auth');
            return;
          }

          console.log('✅ Auth callback: Session set successfully');
        }

        // Redirect to home
        router.replace('/(tabs)/home');
      } catch (error) {
        console.error('Auth callback exception:', error);
        router.replace('/auth/auth');
      }
    };

    handleCallback();
  }, [params, router]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
        Completing sign in...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
  },
});
