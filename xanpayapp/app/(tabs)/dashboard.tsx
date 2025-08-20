import React from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { OnboardingColors } from '@/constants/Colors';

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView
        style={styles.container}
        lightColor={OnboardingColors.background}
        darkColor={OnboardingColors.background}
      >
        {/* Logo Header */}
        <View style={styles.logoContainer}>
          <ThemedText
            style={styles.logoText}
            lightColor={OnboardingColors.logoText}
            darkColor={OnboardingColors.logoText}
          >
            XanPay
          </ThemedText>
        </View>

        {/* Content Area */}
        <View style={styles.contentContainer}>
          <ThemedText
            style={styles.placeholderText}
            lightColor={OnboardingColors.text}
            darkColor={OnboardingColors.text}
          >
            Dashboard Page
          </ThemedText>
          <ThemedText
            style={styles.subText}
            lightColor={OnboardingColors.text}
            darkColor={OnboardingColors.text}
          >
            View your analytics and insights
          </ThemedText>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: OnboardingColors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'flex-start',
    marginTop: 60,
    marginBottom: 32,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'left',
    fontFamily: 'Clash',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Clash',
    marginBottom: 16,
  },
  subText: {
    fontSize: 16,
    fontFamily: 'Clash',
    opacity: 0.7,
  },
});