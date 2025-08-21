import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppState } from '@/hooks/useAppState';
import { OnboardingColors } from '@/constants/Colors';
import { AuthProvider } from '@/contexts/AuthContext';
import { BusinessProvider } from '@/contexts/BusinessContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Clash: require('../assets/fonts/ClashDisplay-Variable.ttf'),
  });
  const { onboardingCompleted, isLoading } = useAppState();

  if (!loaded || isLoading) {
    // Show loading screen while fonts load or onboarding status is being checked
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: OnboardingColors.background 
      }}>
        <ActivityIndicator size="large" color={OnboardingColors.accent} />
      </View>
    );
  }

  return (
    <AuthProvider>
      <BusinessProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            {onboardingCompleted ? (
              // Main app navigation (will handle auth internally)
              <>
                <Stack.Screen name="signin" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </>
            ) : (
              // Onboarding navigation
              <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
            )}
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </BusinessProvider>
    </AuthProvider>
  );
}