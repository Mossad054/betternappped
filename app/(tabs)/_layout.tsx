import { Tabs, router } from "expo-router";
import { BarChart3, Settings, Calendar, Home, Plus, TestTube, BookOpen, TrendingUp } from "lucide-react-native";
import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.iconActive,
        tabBarInactiveTintColor: theme.colors.iconInactive,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.borderLight,
          borderTopWidth: 1,
          ...theme.elevation.large,
          paddingBottom: theme.spacing.sm,
          paddingTop: theme.spacing.sm,
          height: 64,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.iconContainer,
              { backgroundColor: focused ? theme.colors.primary : 'transparent', borderRadius: theme.radii.xl }
            ]}>
              <Home color={focused ? theme.colors.textPrimary : color} size={24} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="lessons"
        options={{
          title: "Lessons",
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.iconContainer,
              { backgroundColor: focused ? theme.colors.primary : 'transparent', borderRadius: theme.radii.xl }
            ]}>
              <BookOpen color={focused ? theme.colors.textPrimary : color} size={24} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.iconContainer,
              { backgroundColor: focused ? theme.colors.primary : 'transparent', borderRadius: theme.radii.xl }
            ]}>
              <Calendar color={focused ? theme.colors.textPrimary : color} size={24} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="journal"
        options={{
          title: "Journal",
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.iconContainer,
              { backgroundColor: focused ? theme.colors.primary : 'transparent', borderRadius: theme.radii.xl }
            ]}>
              <Plus color={focused ? theme.colors.textPrimary : color} size={24} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.iconContainer,
              { backgroundColor: focused ? theme.colors.primary : 'transparent', borderRadius: theme.radii.xl }
            ]}>
              <TrendingUp color={focused ? theme.colors.textPrimary : color} size={24} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity & Stats",
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.iconContainer,
              { backgroundColor: focused ? theme.colors.primary : 'transparent', borderRadius: theme.radii.xl }
            ]}>
              <BarChart3 color={focused ? theme.colors.textPrimary : color} size={24} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.iconContainer,
              { backgroundColor: focused ? theme.colors.primary : 'transparent', borderRadius: theme.radii.xl }
            ]}>
              <Settings color={focused ? theme.colors.textPrimary : color} size={24} />
            </View>
          ),
        }}
      />
      {__DEV__ && (
        <Tabs.Screen
          name="dev-tools"
          options={{
            title: "Dev Tools",
            tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.iconContainer,
              { backgroundColor: focused ? theme.colors.primary : 'transparent', borderRadius: theme.radii.xl }
            ]}>
              <TestTube color={focused ? theme.colors.textPrimary : color} size={24} />
            </View>
          ),
          }}
        />
      )}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  addButton: {
    width: 56,
    height: 56,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 20,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});