import React, { useEffect } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withRepeat,
  withSequence,
  interpolate,
} from "react-native-reanimated";
import { WelcomeColors } from "@/constants/Colors";
import { WelcomeText } from "../welcome/WelcomeText";

interface SignUpButtonProps {
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  title?: string;
  loadingTitle?: string;
}

export function SignUpButton({
  onPress,
  disabled = false,
  isLoading = false,
  title = "Sign Up",
  loadingTitle = "Creating Account...",
}: SignUpButtonProps) {
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(30);
  const buttonScale = useSharedValue(1);
  const glowAnimation = useSharedValue(0);
  const shimmerAnimation = useSharedValue(0);

  useEffect(() => {
    buttonOpacity.value = withDelay(1600, withTiming(1, { duration: 600 }));
    buttonTranslateY.value = withDelay(1600, withTiming(0, { duration: 600 }));

    // Glow effect
    glowAnimation.value = withDelay(
      2000,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 2000 }),
          withTiming(0, { duration: 2000 })
        ),
        -1,
        false
      )
    );

    // Shimmer effect
    shimmerAnimation.value = withDelay(
      2200,
      withRepeat(withTiming(1, { duration: 3000 }), -1, false)
    );
  }, []);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [
      { translateY: buttonTranslateY.value },
      { scale: buttonScale.value },
    ],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => {
    const glowOpacity = interpolate(glowAnimation.value, [0, 1], [0.3, 0.8]);
    return {
      opacity: glowOpacity,
    };
  });

  const shimmerAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmerAnimation.value, [0, 1], [-200, 200]);
    return {
      transform: [{ translateX }],
    };
  });

  const handlePressIn = () => {
    buttonScale.value = withSpring(1.05);
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1);
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      activeOpacity={1}
      disabled={disabled || isLoading}
    >
      <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
        {/* Glow effect */}
        <Animated.View style={[styles.buttonGlow, glowAnimatedStyle]} />

        <View
          style={[
            styles.button,
            (disabled || isLoading) && styles.buttonDisabled,
          ]}
        >
          {/* Shimmer effect */}
          <Animated.View style={[styles.shimmer, shimmerAnimatedStyle]} />

          <WelcomeText
            type="body"
            style={[
              styles.buttonText,
              (disabled || isLoading) && styles.buttonTextDisabled,
            ]}
          >
            {isLoading ? loadingTitle : title}
          </WelcomeText>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    position: "relative",
    alignSelf: "center",
  },
  buttonGlow: {
    position: "absolute",
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    backgroundColor: "rgba(16, 185, 129, 0.4)",
    borderRadius: 100,
    shadowColor: WelcomeColors.buttonPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  button: {
    backgroundColor: WelcomeColors.buttonPrimary,
    borderRadius: 100,
    width: 200,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  shimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    width: 50,
    transform: [{ skewX: "-20deg" }],
  },
  buttonText: {
    color: WelcomeColors.white,
    fontFamily: "Clash",
    fontSize: 16,
    fontWeight: "600",
    zIndex: 1,
  },
  buttonDisabled: {
    backgroundColor: "#CCCCCC",
    opacity: 0.6,
  },
  buttonTextDisabled: {
    color: "#999999",
  },
});
