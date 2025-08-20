import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onboardingStorage, OnboardingState } from '@/utils/onboardingStorage';

interface OnboardingContextType {
  state: OnboardingState;
  isLoading: boolean;
  completeOnboarding: () => Promise<void>;
  updateStep: (step: number) => void;
  resetOnboarding: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

interface OnboardingProviderProps {
  children: ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [state, setState] = useState<OnboardingState>({
    isCompleted: false,
    currentStep: 1,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOnboardingState();
  }, []);

  const loadOnboardingState = async () => {
    try {
      const savedState = await onboardingStorage.getOnboardingState();
      setState(savedState);
    } catch (error) {
      console.warn('Failed to load onboarding state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      await onboardingStorage.setOnboardingCompleted();
      setState(prev => ({
        ...prev,
        isCompleted: true,
        currentStep: 2,
      }));
    } catch (error) {
      console.warn('Failed to complete onboarding:', error);
    }
  };

  const updateStep = async (step: number) => {
    try {
      await onboardingStorage.updateOnboardingStep(step);
      setState(prev => ({
        ...prev,
        currentStep: step,
      }));
    } catch (error) {
      console.warn('Failed to update onboarding step:', error);
    }
  };

  const resetOnboarding = async () => {
    try {
      await onboardingStorage.resetOnboarding();
      setState({
        isCompleted: false,
        currentStep: 1,
      });
    } catch (error) {
      console.warn('Failed to reset onboarding:', error);
    }
  };

  const value: OnboardingContextType = {
    state,
    isLoading,
    completeOnboarding,
    updateStep,
    resetOnboarding,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextType {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}