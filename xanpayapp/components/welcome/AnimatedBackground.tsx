import React, { useEffect } from "react";
import { StyleSheet, Dimensions, View } from "react-native";
import { Image } from "expo-image";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { WelcomeColors } from "@/constants/Colors";

// Fallback gradient component if expo-linear-gradient is not available
const FallbackGradient = ({ children }: { children: React.ReactNode }) => (
  <View
    style={[styles.gradient, { backgroundColor: WelcomeColors.gradientStart }]}
  >
    {children}
  </View>
);

// Try to import LinearGradient, fallback if not available
let LinearGradient: any;
try {
  LinearGradient = require("expo-linear-gradient").LinearGradient;
} catch {
  LinearGradient = FallbackGradient;
}

const { width, height } = Dimensions.get("window");

export function AnimatedBackground() {
  const floatAnimation = useSharedValue(0);
  const rotateAnimation = useSharedValue(0);
  const pulseAnimation = useSharedValue(0);

  useEffect(() => {
    // Main floating animation
    floatAnimation.value = withRepeat(
      withTiming(1, { duration: 6000 }),
      -1,
      true
    );

    // Rotation animation for shapes
    rotateAnimation.value = withRepeat(
      withTiming(1, { duration: 20000 }),
      -1,
      false
    );

    // Pulse animation for additional elements
    pulseAnimation.value = withRepeat(
      withTiming(1, { duration: 3000 }),
      -1,
      true
    );
  }, []);

  const purpleWaveStyle = useAnimatedStyle(() => {
    const translateY = interpolate(floatAnimation.value, [0, 1], [-15, 15]);
    const rotate = interpolate(rotateAnimation.value, [0, 1], [0, 360]);
    return {
      transform: [{ translateY }, { rotate: `${rotate}deg` }],
    };
  });

  const greenBlobStyle = useAnimatedStyle(() => {
    const translateY = interpolate(floatAnimation.value, [0, 1], [15, -15]);
    const scale = interpolate(pulseAnimation.value, [0, 1], [0.8, 1.2]);
    return {
      transform: [{ translateY }, { scale }],
    };
  });

  const smallCircle2Style = useAnimatedStyle(() => {
    const translateY = interpolate(floatAnimation.value, [0, 1], [12, -12]);
    const opacity = interpolate(pulseAnimation.value, [0, 1], [0.4, 0.8]);
    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  const sparkleStyle = useAnimatedStyle(() => {
    const scale = interpolate(pulseAnimation.value, [0, 1], [0.5, 1.5]);
    const opacity = interpolate(pulseAnimation.value, [0, 1], [0.8, 0.2]);
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <LinearGradient
      colors={[WelcomeColors.gradientStart, WelcomeColors.gradientEnd]}
      style={styles.gradient}
    >

      {/* Sparkle effects */}
      <Animated.View style={[styles.sparkle1, sparkleStyle]} />
      <Animated.View style={[styles.sparkle2, sparkleStyle]} />
      <Animated.View style={[styles.sparkle3, sparkleStyle]} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  purpleWave: {
    position: "absolute",
    top: -height * 0.2,
    left: -width * 0.3,
    width: width * 1.5,
    height: height * 0.8,
    backgroundColor: WelcomeColors.purpleWave,
    opacity: 0.2,
    borderRadius: width * 0.5,
  },
  greenBlob: {
    position: "absolute",
    bottom: -height * 0.1,
    right: -width * 0.2,
    width: width * 0.6,
    height: width * 0.6,
    backgroundColor: WelcomeColors.greenBlob,
    opacity: 0.15,
    borderRadius: width * 0.3,
  },
  paymentCard1: {
    position: "absolute",
    top: height * 0.15,
    right: width * 0.05,
    width: 280,
    height: 60,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  paymentCard2: {
    position: "absolute",
    top: height * 0.6,
    left: width * 0.05,
    width: 260,
    height: 60,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  paymentCard3: {
    position: "absolute",
    bottom: height * 0.25,
    right: width * 0.05,
    width: 240,
    height: 60,
    backgroundColor: "rgba(16, 185, 129, 0.9)",
    borderRadius: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flex: 1,
  },
  dollarIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2775CA",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardText: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    height: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 4,
    marginBottom: 4,
    width: "70%",
  },
  cardSubtitle: {
    height: 12,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 4,
    width: "50%",
  },
  cardAmount: {
    height: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 4,
    width: 60,
  },
  sparkle1: {
    position: "absolute",
    top: height * 0.25,
    left: width * 0.2,
    width: 8,
    height: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
  },
  sparkle2: {
    position: "absolute",
    top: height * 0.45,
    right: width * 0.3,
    width: 6,
    height: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
  },
  sparkle3: {
    position: "absolute",
    bottom: height * 0.4,
    left: width * 0.7,
    width: 10,
    height: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
  },
});
