import { EnhancedFormInput, SignUpButton } from "@/components/account-setup";
import { WelcomeText } from "@/components/welcome/WelcomeText";
import { useAuth } from "@/contexts/AuthContext";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

interface FormValidation {
  email: { isValid: boolean; error?: string };
  password: { isValid: boolean; error?: string };
}

export default function SignInScreen() {
  const {
    signInWithEmail,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validation, setValidation] = useState<FormValidation>({
    email: { isValid: false },
    password: { isValid: false },
  });
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Animation values for staggered fade-in effects
  const headlineOpacity = useSharedValue(0);
  const headlineTranslateY = useSharedValue(30);
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(25);
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(15);

  // Animated styles for staggered animations
  const headlineAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headlineOpacity.value,
    transform: [{ translateY: headlineTranslateY.value }],
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  useEffect(() => {
    // Staggered animations with 600ms duration as per requirements
    headlineOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    headlineTranslateY.value = withDelay(300, withTiming(0, { duration: 600 }));

    formOpacity.value = withDelay(500, withTiming(1, { duration: 600 }));
    formTranslateY.value = withDelay(500, withTiming(0, { duration: 600 }));

    buttonOpacity.value = withDelay(700, withTiming(1, { duration: 600 }));
    buttonTranslateY.value = withDelay(700, withTiming(0, { duration: 600 }));
  }, []);

  // Redirect to main app if already authenticated
  if (!authLoading && isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  const isFormValid = validation.email.isValid && validation.password.isValid;

  const handleValidation = (
    field: keyof FormValidation,
    isValid: boolean,
    error?: string
  ) => {
    setValidation((prev) => ({
      ...prev,
      [field]: { isValid, error },
    }));

    // Clear submit error when user fixes validation issues
    if (isValid && submitError) {
      setSubmitError(null);
    }
  };

  // Clear submit error when user starts typing
  const handleInputChange = (field: "email" | "password", value: string) => {
    if (submitError) {
      setSubmitError(null);
    }

    switch (field) {
      case "email":
        setEmail(value);
        break;
      case "password":
        setPassword(value);
        break;
    }
  };

  const handleSignIn = async () => {
    if (!isFormValid) return;

    setIsLoading(true);
    setSubmitError(null);

    try {
      await signInWithEmail(email, password);
      // Navigation will be handled automatically by the redirect above
    } catch (error: any) {
      let errorMessage = "Failed to sign in. Please try again.";

      // Handle specific error messages from our custom backend
      if (error.message.includes("No account found with this email address")) {
        errorMessage = "No account found with this email address.";
        setValidation((prev) => ({
          ...prev,
          email: { isValid: false, error: errorMessage },
        }));
      } else if (error.message.includes("Incorrect password")) {
        errorMessage = "Incorrect password. Please try again.";
        setValidation((prev) => ({
          ...prev,
          password: { isValid: false, error: errorMessage },
        }));
      } else if (error.message.includes("Email and password are required")) {
        errorMessage = "Please fill in all required fields.";
        setSubmitError(errorMessage);
      } else if (
        error.message.includes("Network request failed") ||
        error.message.includes("Network error")
      ) {
        errorMessage =
          "Network error. Please check your connection and try again.";
        setSubmitError(errorMessage);
      } else {
        // For other errors, show the message from the backend or a generic message
        errorMessage = error.message || "Failed to sign in. Please try again.";
        setSubmitError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Animated.View style={headlineAnimatedStyle}>
              <WelcomeText
                type="headline"
                style={styles.headline}
                color="#000000"
              >
                Sign in
              </WelcomeText>
            </Animated.View>

            <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
              <EnhancedFormInput
                label="Email Address"
                type="email"
                value={email}
                onChangeText={(value: string) =>
                  handleInputChange("email", value)
                }
                placeholder="Enter your email address"
                error={validation.email.error}
                onValidation={(isValid: boolean, error?: string) =>
                  handleValidation("email", isValid, error)
                }
              />

              <EnhancedFormInput
                label="Password"
                type="password"
                value={password}
                onChangeText={(value: string) =>
                  handleInputChange("password", value)
                }
                placeholder="Enter your password"
                error={validation.password.error}
                onValidation={(isValid: boolean, error?: string) =>
                  handleValidation("password", isValid, error)
                }
              />

              {submitError && (
                <View style={styles.submitErrorContainer}>
                  <WelcomeText
                    type="body"
                    style={styles.submitErrorText}
                    color="#FF3B30"
                  >
                    {submitError}
                  </WelcomeText>
                </View>
              )}
            </Animated.View>
          </View>
        </ScrollView>

        <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
          <SignUpButton
            onPress={handleSignIn}
            disabled={!isFormValid}
            isLoading={isLoading}
            title="Sign In"
            loadingTitle="Signing In..."
          />
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 160,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    minHeight: 600,
  },
  headline: {
    marginBottom: 96,
    marginTop: -80,
    textShadowColor: "transparent",
  },
  formContainer: {
    width: "100%",
    maxWidth: 320,
  },
  buttonContainer: {
    paddingBottom: 40,
    paddingTop: 20,
  },
  submitErrorContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 59, 48, 0.3)",
  },
  submitErrorText: {
    color: "#FF3B30",
    fontSize: 14,
    textAlign: "center",
  },
});
