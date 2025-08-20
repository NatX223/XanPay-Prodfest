import React from "react";
import { StyleSheet, View, SafeAreaView, Text } from "react-native";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { ContinueButton } from "@/components/welcome";
import { router } from "expo-router";
import { Image } from "expo-image";
import Animated from "react-native-reanimated";

export default function WelcomeScreen() {
  const { updateStep } = useOnboarding();

  const handleContinue = () => {
    updateStep(3);
    router.push("/(onboarding)/business-management");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* XanPay Logo - Centered */}
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Animated.View style={styles.imageContainer}>
            <Image
              source={require("@/assets/images/accept_payment.png")}
              style={styles.centerImage}
              contentFit="contain"
            />
          </Animated.View>
          <Text style={styles.subtitleText}>
            Accept crypto payments, settle to fiat and do more with cNGN
          </Text>
        </View>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={styles.progressStep} />
            <View style={[styles.progressStep, styles.activeStep]} />
            <View style={styles.progressStep} />
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <ContinueButton onPress={handleContinue} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 400,
    zIndex: 10,
  },
  logoText: {
    fontSize: 64,
    fontFamily: "Clash",
  },
  xanText: {
    color: "#8a63d2",
  },
  payText: {
    color: "#000000",
  },
  subtitleText: {
    fontSize: 20,
    color: "#666666",
    textAlign: "center",
    marginTop: 8,
    fontFamily: "Clash",
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  centerImage: {
    width: 200,
    height: 200,
  },
  progressContainer: {
    paddingTop: 60,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  progressBar: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  progressStep: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E5E5",
  },
  activeStep: {
    backgroundColor: "#8a63d2",
  },
  progressText: {
    fontSize: 12,
    color: "#999999",
    fontFamily: "Clash",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    paddingBottom: 60,
    paddingHorizontal: 40,
    gap: 16,
    marginTop: "auto",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  dividerText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    marginHorizontal: 16,
  },
});
