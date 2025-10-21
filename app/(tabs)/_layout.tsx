import { Tabs, router } from "expo-router";
import { BarChart3, Settings, Calendar, Home, Plus } from "lucide-react-native";
import React from "react";
import { View, StyleSheet } from "react-native";

// Removed Colors import - using hardcoded values

const styles = StyleSheet.create({
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#34B27B',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: '#34B27B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 20,
  },
});

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#34B27B',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity & Stats",
          tabBarIcon: ({ color }) => <BarChart3 color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="add-entry"
        options={{
          title: "",
          tabBarIcon: () => (
            <View style={styles.addButton}>
              <Plus size={24} color="#FFFFFF" />
            </View>
          ),
          href: null,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push('/add-entry');
          },
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color }) => <Calendar color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Settings color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
