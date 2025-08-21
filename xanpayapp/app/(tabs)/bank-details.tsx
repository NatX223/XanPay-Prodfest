import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { BankDetailsForm } from '@/components/bank-details/BankDetailsForm';
import { BankDetailsErrorBoundary } from '@/components/bank-details/BankDetailsErrorBoundary';
import { BankDetailsFormData } from '@/types/bankDetails';
import { bankDetailsService } from '@/services/bankDetailsService';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingColors } from '@/constants/Colors';
import { ErrorMessages } from '@/constants/bankValidation';

export default function BankDetailsPage() {
  const { user } = useAuth();
  const [initialData, setInitialData] = useState<BankDetailsFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBankDetails();
  }, [user]);

  const loadBankDetails = async () => {
    if (!user?.uid) {
      setError(ErrorMessages.AUTHENTICATION_ERROR);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const bankDetails = await bankDetailsService.getBankDetailsForForm(user.uid);
      setInitialData(bankDetails);
    } catch (error) {
      console.error('Failed to load bank details:', error);
      setError('Failed to load bank details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: BankDetailsFormData) => {
    if (!user?.uid) {
      throw new Error(ErrorMessages.AUTHENTICATION_ERROR);
    }

    try {
      setIsSaving(true);
      
      const savedDetails = await bankDetailsService.updateBankDetails(user.uid, formData);
      
      // Update initial data to reflect saved state
      setInitialData({
        bankCode: savedDetails.bankCode,
        accountNumber: formData.accountNumber, // Keep unencrypted for form
        isVerified: savedDetails.isVerified,
        lastUpdated: savedDetails.updatedAt,
      });

      // Show success message
      Alert.alert(
        'Success',
        'Your bank details have been saved successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Optionally navigate back or to another screen
              // router.back();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Failed to save bank details:', error);
      throw error; // Re-throw to let form handle the error
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel',
      'Are you sure you want to go back?',
      [
        {
          text: 'Stay',
          style: 'cancel',
        },
        {
          text: 'Go Back',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const handleRetry = () => {
    loadBankDetails();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={OnboardingColors.accent} />
          <Text style={styles.loadingText}>Loading bank details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons 
            name="alert-circle-outline" 
            size={48} 
            color="#FF3B30" 
            style={styles.errorIcon}
          />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          
          <View style={styles.errorButtonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.retryButton]}
              onPress={handleRetry}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.backButton]}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={OnboardingColors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bank Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <BankDetailsErrorBoundary>
          <BankDetailsForm
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isSaving}
          />
        </BankDetailsErrorBoundary>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OnboardingColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Clash',
    fontWeight: '600',
    color: OnboardingColors.text,
  },
  headerSpacer: {
    width: 32, // Same width as back button to center title
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Clash',
    color: OnboardingColors.text,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: 'Clash',
    fontWeight: '600',
    color: OnboardingColors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    fontFamily: 'Clash',
    color: '#645b6b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  errorButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: OnboardingColors.accent,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Clash',
    fontWeight: '500',
    color: OnboardingColors.buttonText,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Clash',
    fontWeight: '500',
    color: '#645b6b',
  },
});