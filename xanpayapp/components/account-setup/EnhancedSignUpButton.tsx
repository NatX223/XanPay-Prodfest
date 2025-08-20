import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';

interface EnhancedSignUpButtonProps {
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  title?: string;
  loadingTitle?: string;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export function EnhancedSignUpButton({
  onPress,
  disabled = false,
  isLoading = false,
  title = 'Sign Up',
  loadingTitle = 'Creating Account...',
}: EnhancedSignUpButtonProps) {
  const buttonScale = useSharedValue(1);
  const buttonOpacity = useSharedValue(1);
  const disabledAnimation = useSharedValue(0);

  useEffect(() => {
    disabledAnimation.value = withTiming(
      disabled || isLoading ? 1 : 0,
      { duration: 200 }
    );
  }, [disabled, isLoading]);

  const handlePressIn = () => {
    if (!disabled && !isLoading) {
      buttonScale.value = withTiming(0.98, { duration: 100 });
    }
  };

  const handlePressOut = () => {
    if (!disabled && !isLoading) {
      buttonScale.value = withTiming(1, { duration: 100 });
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      disabledAnimation.value,
      [0, 1],
      ['#8A63D2', 'rgba(138, 99, 210, 0.5)']
    );

    return {
      transform: [{ scale: buttonScale.value }],
      backgroundColor,
      opacity: buttonOpacity.value,
    };
  });

  const handlePress = () => {
    if (!disabled && !isLoading) {
      onPress();
    }
  };

  return (
    <AnimatedTouchableOpacity
      style={[styles.button, animatedStyle]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || isLoading}
      activeOpacity={0.9}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={isLoading ? loadingTitle : title}
      accessibilityHint="Tap to create your account"
      accessibilityState={{ 
        disabled: disabled || isLoading,
        busy: isLoading
      }}
    >
      {isLoading && (
        <ActivityIndicator
          size="small"
          color="#FFFFFF"
          style={styles.spinner}
        />
      )}
      <Text style={styles.buttonText}>
        {isLoading ? loadingTitle : title}
      </Text>
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#8A63D2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Clash',
    fontWeight: '600',
    textAlign: 'center',
  },
  spinner: {
    marginRight: 8,
  },
});