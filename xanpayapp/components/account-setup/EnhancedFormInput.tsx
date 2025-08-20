import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Text,
  TouchableOpacity,
  TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";

interface EnhancedFormInputProps extends Omit<TextInputProps, "style"> {
  label: string;
  type?: "text" | "email" | "password";
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  onValidation?: (isValid: boolean, error?: string) => void;
}

export function EnhancedFormInput({
  label,
  type = "text",
  value,
  onChangeText,
  error,
  onValidation,
  ...textInputProps
}: EnhancedFormInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Animation values
  const focusAnimation = useSharedValue(0);
  const errorAnimation = useSharedValue(0);

  useEffect(() => {
    focusAnimation.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
  }, [isFocused]);

  useEffect(() => {
    const hasError = !!(error || localError);
    errorAnimation.value = withTiming(hasError ? 1 : 0, { duration: 200 });
  }, [error, localError]);

  const validateInput = (
    text: string
  ): { isValid: boolean; error?: string } => {
    switch (type) {
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!text.trim()) {
          return { isValid: false, error: "Email is required" };
        }
        if (!emailRegex.test(text)) {
          return {
            isValid: false,
            error: "Please enter a valid email address",
          };
        }
        return { isValid: true };

      case "password":
        if (!text) {
          return { isValid: false, error: "Password is required" };
        }
        if (text.length < 8) {
          return {
            isValid: false,
            error: "Password must be at least 8 characters",
          };
        }
        return { isValid: true };

      case "text":
      default:
        if (!text.trim()) {
          return { isValid: false, error: `${label} is required` };
        }
        return { isValid: true };
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const validation = validateInput(value);
    setLocalError(validation.error || null);
    onValidation?.(validation.isValid, validation.error);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setLocalError(null);
  };

  const handleChangeText = (text: string) => {
    onChangeText(text);
    // Clear error when user starts typing
    if (localError) {
      setLocalError(null);
    }
  };

  const containerAnimatedStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focusAnimation.value,
      [0, 1],
      ["#645b6b", "#8A63D2"]
    );

    const errorBorderColor = interpolateColor(
      errorAnimation.value,
      [0, 1],
      [borderColor, "#FF3B30"]
    );

    return {
      borderColor: errorBorderColor,
    };
  });

  const getKeyboardType = () => {
    switch (type) {
      case "email":
        return "email-address";
      default:
        return "default";
    }
  };

  const getAutoCapitalize = () => {
    switch (type) {
      case "email":
        return "none";
      case "password":
        return "none";
      case "text":
        return "words"; // Auto-capitalize for business name
      default:
        return "none";
    }
  };

  const displayError = error || localError;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <Animated.View style={[styles.inputContainer, containerAnimatedStyle]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType={getKeyboardType()}
          autoCapitalize={getAutoCapitalize()}
          autoCorrect={type !== "email" && type !== "password"}
          secureTextEntry={type === "password" && !showPassword}
          placeholderTextColor="#645b6b"
          accessible={true}
          accessibilityLabel={label}
          accessibilityHint={`Enter your ${label.toLowerCase()}`}
          accessibilityState={{
            selected: isFocused,
            invalid: !!(error || localError),
          }}
          {...textInputProps}
        />

        {type === "password" && (
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setShowPassword(!showPassword)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={
              showPassword ? "Hide password" : "Show password"
            }
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color="rgba(255, 255, 255, 0.7)"
            />
          </TouchableOpacity>
        )}
      </Animated.View>

      {displayError && <Text style={styles.errorText}>{displayError}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: "Clash",
    color: "#8a63d2",
    fontWeight: "500",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    backgroundColor: "rgba(255, 255, 255, 0.1)", // Glassmorphism background
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Clash",
    color: "#8a63d2",
    height: "100%",
  },
  passwordToggle: {
    padding: 4,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    fontFamily: "Clash",
    color: "#FF3B30",
    marginTop: 4,
    marginLeft: 4,
  },
});
