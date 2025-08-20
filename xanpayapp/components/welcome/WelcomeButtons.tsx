import React, { useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { WelcomeColors } from '@/constants/Colors';
import { WelcomeText } from './WelcomeText';

interface WelcomeButtonsProps {
  onSignUp: () => void;
  onLogIn: () => void;
}

export function WelcomeButtons({ onSignUp, onLogIn }: WelcomeButtonsProps) {
  const buttonsOpacity = useSharedValue(0);
  const buttonsTranslateY = useSharedValue(30);
  const signUpScale = useSharedValue(1);
  const logInScale = useSharedValue(1);

  useEffect(() => {
    buttonsOpacity.value = withDelay(1600, withTiming(1, { duration: 600 }));
    buttonsTranslateY.value = withDelay(1600, withTiming(0, { duration: 600 }));
  }, []);

  const buttonsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: buttonsTranslateY.value }],
  }));

  const signUpAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: signUpScale.value }],
  }));

  const logInAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logInScale.value }],
  }));

  const handleSignUpPressIn = () => {
    signUpScale.value = withSpring(1.05);
  };

  const handleSignUpPressOut = () => {
    signUpScale.value = withSpring(1);
  };

  const handleLogInPressIn = () => {
    logInScale.value = withSpring(1.05);
  };

  const handleLogInPressOut = () => {
    logInScale.value = withSpring(1);
  };

  return (
    <Animated.View style={[styles.buttonsContainer, buttonsAnimatedStyle]}>
      <TouchableOpacity
        onPressIn={handleSignUpPressIn}
        onPressOut={handleSignUpPressOut}
        onPress={onSignUp}
        activeOpacity={1}
      >
        <Animated.View style={[styles.signUpButton, signUpAnimatedStyle]}>
          <WelcomeText type="body" style={styles.signUpButtonText}>
            Sign Up
          </WelcomeText>
        </Animated.View>
      </TouchableOpacity>

      <TouchableOpacity
        onPressIn={handleLogInPressIn}
        onPressOut={handleLogInPressOut}
        onPress={onLogIn}
        activeOpacity={1}
      >
        <Animated.View style={[styles.logInButton, logInAnimatedStyle]}>
          <WelcomeText type="body" style={styles.logInButtonText}>
            Log In
          </WelcomeText>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 60,
  },
  signUpButton: {
    backgroundColor: WelcomeColors.buttonBlack,
    borderRadius: 100,
    width: 140,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logInButton: {
    backgroundColor: WelcomeColors.buttonPrimary,
    borderRadius: 100,
    width: 140,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpButtonText: {
    color: WelcomeColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  logInButtonText: {
    color: WelcomeColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});