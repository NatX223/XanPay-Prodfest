import { Stack } from 'expo-router';
import React from 'react';
import { OnboardingProvider } from '@/contexts/OnboardingContext';

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: false, // Prevent swipe back during onboarding
        }}
      >
        <Stack.Screen name="welcome" />
        <Stack.Screen name="accept-payment" />
        <Stack.Screen name="business-management" />
        <Stack.Screen name="account-setup" />
      </Stack>
    </OnboardingProvider>
  );
}