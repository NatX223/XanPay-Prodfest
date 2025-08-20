import React, { useEffect } from "react";
import { StyleSheet, Dimensions, View } from "react-native";
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

export function AccountSetupAnimatedBackground() {
  const floatAnimation = useSharedValue(0);
  const rotateAnimation = useSharedValue(0);
  const pulseAnimation = useSharedValue(0);

  useEffect(() => {
    // Main floating animation - 5000ms duration as per requirements
    floatAnimation.value = withRepeat(
      withTiming(1, { duration: 5000 }),
      -1,
      true
    );

    // Rotation animation for shapes
    rotateAnimation.value = withRepeat(
      withTiming(1, { duration: 25000 }),
      -1,
      false
    );

    // Pulse animation for sparkles - 3500ms duration as per requirements
    pulseAnimation.value = withRepeat(
      withTiming(1, { duration: 3500 }),
      -1,
      true
    );
  }, []);

  const blueWaveStyle = useAnimatedStyle(() => {
    const translateY = interpolate(floatAnimation.value, [0, 1], [-15, 15]);
    const rotate = interpolate(rotateAnimation.value, [0, 1], [0, 360]);
    return {
      transform: [{ translateY }, { rotate: `${rotate}deg` }],
    };
  });

  const orangeBlobStyle = useAnimatedStyle(() => {
    const translateY = interpolate(floatAnimation.value, [0, 1], [20, -20]);
    const scale = interpolate(pulseAnimation.value, [0, 1], [0.9, 1.1]);
    return {
      transform: [{ translateY }, { scale }],
    };
  });

  const sparkle1Style = useAnimatedStyle(() => {
    const scale = interpolate(pulseAnimation.value, [0, 1], [0.6, 1.4]);
    const opacity = interpolate(pulseAnimation.value, [0, 1], [0.7, 0.3]);
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const sparkle2Style = useAnimatedStyle(() => {
    const scale = interpolate(pulseAnimation.value, [0, 1], [0.8, 1.2]);
    const opacity = interpolate(pulseAnimation.value, [0, 1], [0.5, 0.8]);
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const sparkle3Style = useAnimatedStyle(() => {
    const scale = interpolate(pulseAnimation.value, [0, 1], [0.7, 1.3]);
    const opacity = interpolate(pulseAnimation.value, [0, 1], [0.6, 0.4]);
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const sparkle4Style = useAnimatedStyle(() => {
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
      {/* Blue Wave Shape - positioned top-right with 18% opacity */}
      <Animated.View style={[styles.blueWave, blueWaveStyle]} />

      {/* Orange Blob - positioned bottom-left with 12% opacity */}
      <Animated.View style={[styles.orangeBlob, orangeBlobStyle]} />

      {/* White sparkle effects at strategic positions */}
      <Animated.View style={[styles.sparkle1, sparkle1Style]} />
      <Animated.View style={[styles.sparkle2, sparkle2Style]} />
      <Animated.View style={[styles.sparkle3, sparkle3Style]} />
      <Animated.View style={[styles.sparkle4, sparkle4Style]} />
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
  blueWave: {
    position: "absolute",
    top: -height * 0.1,
    right: -width * 0.3,
    width: width * 1.2,
    height: height * 0.6,
    backgroundColor: "#3B82F6", // Blue color as specified
    opacity: 0.18, // 18% opacity as per requirements
    borderRadius: width * 0.4,
  },
  orangeBlob: {
    position: "absolute",
    bottom: -height * 0.1,
    left: -width * 0.2,
    width: width * 0.6,
    height: width * 0.6,
    backgroundColor: "#F97316", // Orange color as specified
    opacity: 0.12, // 12% opacity as per requirements
    borderRadius: width * 0.3,
  },
  sparkle1: {
    position: "absolute",
    top: height * 0.25,
    right: width * 0.2,
    width: 8,
    height: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
  },
  sparkle2: {
    position: "absolute",
    top: height * 0.45,
    left: width * 0.3,
    width: 6,
    height: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
  },
  sparkle3: {
    position: "absolute",
    bottom: height * 0.4,
    right: width * 0.65,
    width: 10,
    height: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
  },
  sparkle4: {
    position: "absolute",
    top: height * 0.6,
    left: width * 0.1,
    width: 7,
    height: 7,
    backgroundColor: "#FFFFFF",
    borderRadius: 3.5,
  },
});