import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';

import { BankDetailsFormProps, BankDetailsFormData } from '@/types/bankDetails';
import { validateAccountNumber, validateBankCode, ErrorMessages } from '@/constants/bankValidation';
import { OnboardingColors } from '@/constants/Colors';
import { BankDropdown } from './BankDropdown';
import { AccountNumberInput } from './AccountNumberInput';

export function BankDetailsForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: BankDetailsFormProps) {
  const [formData, setFormData] = useState<BankDetailsFormData>({
    bankCode: initialData?.bankCode || '',
    accountNumber: initialData?.accountNumber || '',
  });

  const [errors, setErrors] = useState<{
    bankCode?: string;
    accountNumber?: string;
    form?: string;
  }>({});

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Track changes for unsaved warning
  useEffect(() => {
    const hasChanges = 
      formData.bankCode !== (initialData?.bankCode || '') ||
      formData.accountNumber !== (initialData?.accountNumber || '');
    setHasUnsavedChanges(hasChanges);
  }, [formData, initialData]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    const bankValidation = validateBankCode(formData.bankCode);
    if (!bankValidation.isValid) {
      newErrors.bankCode = bankValidation.error;
    }

    const accountValidation = validateAccountNumber(formData.accountNumber);
    if (!accountValidation.isValid) {
      newErrors.accountNumber = accountValidation.error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setErrors(prev => ({ ...prev, form: ErrorMessages.VALIDATION_ERROR }));
      return;
    }

    try {
      setErrors({});
      await onSubmit(formData);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save bank details:', error);
      setErrors({ form: ErrorMessages.SAVE_FAILED });
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to cancel?',
        [
          {
            text: 'Keep Editing',
            style: 'cancel',
          },
          {
            text: 'Discard Changes',
            style: 'destructive',
            onPress: () => {
              // Reset form to initial data
              setFormData({
                bankCode: initialData?.bankCode || '',
                accountNumber: initialData?.accountNumber || '',
              });
              setErrors({});
              setHasUnsavedChanges(false);
              onCancel?.();
            },
          },
        ]
      );
    } else {
      onCancel?.();
    }
  };

  const handleBankChange = (bankCode: string) => {
    setFormData(prev => ({ ...prev, bankCode }));
    // Clear bank error when user selects a bank
    if (errors.bankCode) {
      setErrors(prev => ({ ...prev, bankCode: undefined }));
    }
  };

  const handleAccountNumberChange = (accountNumber: string) => {
    setFormData(prev => ({ ...prev, accountNumber }));
    // Clear account error when user starts typing
    if (errors.accountNumber) {
      setErrors(prev => ({ ...prev, accountNumber: undefined }));
    }
  };

  const isFormValid = formData.bankCode && formData.accountNumber && 
                     !errors.bankCode && !errors.accountNumber;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bank Details</Text>
        <Text style={styles.subtitle}>
          Enter your bank information for fiat payouts
        </Text>
      </View>

      <View style={styles.form}>
        <BankDropdown
          value={formData.bankCode}
          onValueChange={handleBankChange}
          error={errors.bankCode}
          disabled={isLoading}
        />

        <AccountNumberInput
          value={formData.accountNumber}
          onChangeText={handleAccountNumberChange}
          error={errors.accountNumber}
          disabled={isLoading}
        />

        {errors.form && (
          <View style={styles.formErrorContainer}>
            <Text style={styles.formErrorText}>{errors.form}</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
            disabled={isLoading}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Cancel bank details entry"
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.submitButton,
              (!isFormValid || isLoading) && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={!isFormValid || isLoading}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Save bank details"
            accessibilityState={{
              disabled: !isFormValid || isLoading,
            }}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={OnboardingColors.buttonText} />
            ) : (
              <Text style={[
                styles.submitButtonText,
                (!isFormValid || isLoading) && styles.disabledButtonText,
              ]}>
                Save Details
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Clash',
    fontWeight: '600',
    color: OnboardingColors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Clash',
    color: '#645b6b',
    lineHeight: 22,
  },
  form: {
    flex: 1,
  },
  formErrorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  formErrorText: {
    fontSize: 14,
    fontFamily: 'Clash',
    color: '#FF3B30',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
    paddingTop: 20,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#645b6b',
  },
  submitButton: {
    backgroundColor: OnboardingColors.accent,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Clash',
    fontWeight: '500',
    color: '#645b6b',
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Clash',
    fontWeight: '500',
    color: OnboardingColors.buttonText,
  },
  disabledButtonText: {
    color: '#999',
  },
});