import { Tabs, Redirect } from "expo-router";
import React from "react";
import { Platform, View, ActivityIndicator } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { OnboardingColors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAuth } from "@/contexts/AuthContext";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: OnboardingColors.background,
        }}
      >
        <ActivityIndicator size="large" color={OnboardingColors.accent} />
      </View>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/signin" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: OnboardingColors.accent,
        tabBarInactiveTintColor: OnboardingColors.text,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          backgroundColor: OnboardingColors.background,
          borderTopWidth: 1,
          borderTopColor: "rgba(0,0,0,0.1)",
          elevation: 8,
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 4,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
          ...Platform.select({
            ios: {
              position: "absolute",
            },
            default: {},
          }),
        },
        tabBarLabelStyle: {
          fontFamily: "Clash",
          fontSize: 11,
          fontWeight: "500",
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: "Products",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="cube" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="chart.bar" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
