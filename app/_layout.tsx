import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider } from "@/contexts/ThemeContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="add-entry" options={{ presentation: "modal" }} />
      <Stack.Screen name="mental-clarity-test" options={{ presentation: "modal" }} />
      <Stack.Screen name="sleep-wellness-hub" options={{ presentation: "card" }} />
      <Stack.Screen name="intimacy-hub" options={{ presentation: "card" }} />
      <Stack.Screen name="experiments-hub" options={{ presentation: "card" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <GestureHandlerRootView style={styles.container}>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
