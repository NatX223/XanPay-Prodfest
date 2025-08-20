import { useEffect, useState } from 'react';
import { onboardingStorage } from '@/utils/onboardingStorage';

export function useAppState() {
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const state = await onboardingStorage.getOnboardingState();
      setOnboardingCompleted(state.isCompleted);
    } catch (error) {
      console.warn('Failed to check onboarding status:', error);
      // Default to showing onboarding on error
      setOnboardingCompleted(false);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAppState = async () => {
    setIsLoading(true);
    await checkOnboardingStatus();
  };

  return {
    onboardingCompleted,
    isLoading,
    refreshAppState,
  };
}