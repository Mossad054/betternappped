import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { NotificationInitializer } from "@/components/notifications/NotificationInitializer";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="mental-clarity-test" options={{ presentation: "modal" }} />
      <Stack.Screen name="sleep-wellness-hub" options={{ presentation: "card" }} />
      <Stack.Screen name="intimacy-hub-main" options={{ presentation: "card" }} />
      <Stack.Screen name="onboarding/welcome" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding/track-wellness" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding/experiments" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding/insights" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding/get-started" options={{ headerShown: false }} />
      <Stack.Screen name="auth/auth" options={{ headerShown: false }} />
      <Stack.Screen name="experiments-hub" options={{ presentation: "card" }} />
      <Stack.Screen name="create-experiment" options={{ presentation: "modal" }} />
      <Stack.Screen name="habit-library" options={{ presentation: "card" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <NotificationInitializer />
            <GestureHandlerRootView style={styles.container}>
              <RootLayoutNav />
            </GestureHandlerRootView>
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});