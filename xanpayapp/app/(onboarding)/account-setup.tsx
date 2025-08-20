import {
  BusinessImageUpload,
  EnhancedFormInput,
  SignUpButton,
} from "@/components/account-setup";
import { WelcomeText } from "@/components/welcome/WelcomeText";
import { auth } from "@/config/firebase";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { AccountService, ImageUploadService } from "@/services";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { signInWithCustomToken } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  Alert,
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
  businessName: { isValid: boolean; error?: string };
  email: { isValid: boolean; error?: string };
  password: { isValid: boolean; error?: string };
}

export default function AccountSetupScreen() {
  const { completeOnboarding } = useOnboarding();
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessImage, setBusinessImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validation, setValidation] = useState<FormValidation>({
    businessName: { isValid: false },
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

  useEffect(() => {
    // Staggered animations with 600ms duration as per requirements
    headlineOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    headlineTranslateY.value = withDelay(300, withTiming(0, { duration: 600 }));

    formOpacity.value = withDelay(500, withTiming(1, { duration: 600 }));
    formTranslateY.value = withDelay(500, withTiming(0, { duration: 600 }));

    buttonOpacity.value = withDelay(700, withTiming(1, { duration: 600 }));
    buttonTranslateY.value = withDelay(700, withTiming(0, { duration: 600 }));
  }, []);

  const isFormValid =
    validation.businessName.isValid &&
    validation.email.isValid &&
    validation.password.isValid &&
    businessImage !== null; // Require business image

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

  const handleImageSelected = (image: ImagePicker.ImagePickerAsset) => {
    setBusinessImage(image);
  };

  const handleImageError = (error: string) => {
    Alert.alert("Image Upload Error", error);
  };

  // Clear submit error when user starts typing
  const handleInputChange = (
    field: "businessName" | "email" | "password",
    value: string
  ) => {
    if (submitError) {
      setSubmitError(null);
    }

    switch (field) {
      case "businessName":
        setBusinessName(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "password":
        setPassword(value);
        break;
    }
  };

  const handleSignUp = async () => {
    if (!isFormValid) return;

    setIsLoading(true);
    setSubmitError(null);

    try {
      let imageUrl = "";

      // Step 1: Upload business image if provided
      if (businessImage) {
        try {
          const uploadResponse = await ImageUploadService.uploadImage(
            businessImage
          );

          imageUrl = uploadResponse.imageUrl;
        } catch (uploadError) {
          throw new Error(
            `Image upload failed: ${
              uploadError instanceof Error
                ? uploadError.message
                : "Unknown error"
            }`
          );
        }
      }

      // Step 2: Create account with image URL
      const accountData = {
        email,
        password,
        businessName,
        businessImage: imageUrl,
      };

      const accountResponse = await AccountService.createAccount(accountData);

      if (!accountResponse.success) {
        throw new Error("Account creation failed");
      }

      await signInWithCustomToken(auth, accountResponse.token).catch((error) => {
        throw new Error(`Authentication failed: ${error.message}`);
      });

      // Step 3: Complete onboarding and navigate to main app
      await completeOnboarding();
      router.replace("/(tabs)");
    } catch (error: any) {
      let errorMessage = "Failed to create account. Please try again.";

      // Handle specific error types
      if (
        error.message.includes("Network request failed") ||
        error.message.includes("fetch")
      ) {
        errorMessage =
          "Network error. Please check your connection and try again.";
        Alert.alert("Network Error", errorMessage);
      } else if (error.message.includes("Image upload failed")) {
        errorMessage = error.message;
        Alert.alert("Image Upload Error", errorMessage);
      } else if (
        error.message.includes("email") &&
        error.message.includes("exists")
      ) {
        errorMessage =
          "This email is already registered. Please use a different email.";
        // Update email field validation to show this error
        setValidation((prev) => ({
          ...prev,
          email: { isValid: false, error: errorMessage },
        }));
      } else if (
        error.message.includes("HTTP error") ||
        error.message.includes("Server")
      ) {
        errorMessage = "Server error occurred. Please try again later.";
        Alert.alert("Server Error", errorMessage);
      } else {
        // Generic error handling
        setSubmitError(errorMessage);
      }

      // Set submit error for display (except for email validation errors which are shown in field)
      if (
        !error.message.includes("email") ||
        !error.message.includes("exists")
      ) {
        setSubmitError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

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
                Create Your Account
              </WelcomeText>
            </Animated.View>

            <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
              <BusinessImageUpload
                onImageSelected={handleImageSelected}
                onError={handleImageError}
              />

              <EnhancedFormInput
                label="Business Name"
                type="text"
                value={businessName}
                onChangeText={(value: string) =>
                  handleInputChange("businessName", value)
                }
                placeholder="Enter your business name"
                error={validation.businessName.error}
                onValidation={(isValid: boolean, error?: string) =>
                  handleValidation("businessName", isValid, error)
                }
              />

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
                placeholder="Create a secure password"
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
            onPress={handleSignUp}
            disabled={!isFormValid}
            isLoading={isLoading}
            title="Sign Up"
            loadingTitle="Creating Account..."
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
  logoContainer: {
    position: "absolute",
    top: 100,
    left: 24,
    zIndex: 10,
  },
  logoText: {
    fontSize: 34,
    fontFamily: "Clash",
    color: "#FFFFFF",
    textShadowColor: "rgba(255, 255, 255, 0.3)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 160, // Account for logo space
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    minHeight: 600, // Ensure minimum height for proper centering
  },
  headline: {
    marginBottom: 96,
    marginTop: -80,
    textShadowColor: "transparent", // Remove white text shadow on white background
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
