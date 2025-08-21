import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Text,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';

import { AccountNumberInputProps } from '@/types/bankDetails';
import { validateAccountNumber } from '@/constants/bankValidation';
import { OnboardingColors } from '@/constants/Colors';

export function AccountNumberInput({
  value,
  onChangeText,
  error,
  disabled = false,
}: AccountNumberInputProps) {
  const [isFocused, setIsFocused] = useState(false);
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

  const handleFocus = () => {
    setIsFocused(true);
    setLocalError(null);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (value.trim()) {
      const validation = validateAccountNumber(value);
      setLocalError(validation.error || null);
    }
  };

  const handleChangeText = (text: string) => {
    // Only allow numeric characters
    const numericText = text.replace(/[^0-9]/g, '');
    
    // Limit to maximum length
    const limitedText = numericText.slice(0, 17);
    
    onChangeText(limitedText);
    
    // Clear error when user starts typing
    if (localError) {
      setLocalError(null);
    }
  };

  const containerAnimatedStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focusAnimation.value,
      [0, 1],
      ['#645b6b', OnboardingColors.accent]
    );

    const errorBorderColor = interpolateColor(
      errorAnimation.value,
      [0, 1],
      [borderColor, '#FF3B30']
    );

    return {
      borderColor: errorBorderColor,
    };
  });

  const displayError = error || localError;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Account Number</Text>

      <Animated.View style={[styles.inputContainer, containerAnimatedStyle]}>
        <TextInput
          style={[styles.input, disabled && styles.disabledInput]}
          value={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType="numeric"
          placeholder="Enter account number"
          placeholderTextColor="#645b6b"
          maxLength={17}
          editable={!disabled}
          accessible={true}
          accessibilityLabel="Account number"
          accessibilityHint="Enter your bank account number, numbers only"
          accessibilityState={{
            selected: isFocused,
            invalid: !!displayError,
            disabled: disabled,
          }}
        />
      </Animated.View>

      {displayError && <Text style={styles.errorText}>{displayError}</Text>}
      
      <Text style={styles.helperText}>
        Enter 8-17 digits. Numbers only.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Clash',
    color: OnboardingColors.accent,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#645b6b',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Clash',
    color: OnboardingColors.accent,
    height: '100%',
  },
  disabledInput: {
    color: '#999',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Clash',
    color: '#FF3B30',
    marginTop: 4,
    marginLeft: 4,
  },
  helperText: {
    fontSize: 12,
    fontFamily: 'Clash',
    color: '#645b6b',
    marginTop: 4,
    marginLeft: 4,
  },
});