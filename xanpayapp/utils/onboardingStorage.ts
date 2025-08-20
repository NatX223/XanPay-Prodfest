import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@xanpay_onboarding_completed';

export interface OnboardingState {
  isCompleted: boolean;
  currentStep: number;
  userPreferences?: {
    notifications: boolean;
    biometrics: boolean;
  };
}

export const onboardingStorage = {
  async getOnboardingState(): Promise<OnboardingState> {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (value) {
        const parsed = JSON.parse(value);
        // Validate the parsed data structure
        if (typeof parsed.isCompleted === 'boolean' && typeof parsed.currentStep === 'number') {
          return parsed;
        } else {
          // Corrupted data, reset to default
          console.warn('Corrupted onboarding data detected, resetting to default');
          await this.resetOnboarding();
          return {
            isCompleted: false,
            currentStep: 1,
          };
        }
      }
      return {
        isCompleted: false,
        currentStep: 1,
      };
    } catch (error) {
      console.warn('Failed to load onboarding state:', error);
      // Try to reset corrupted storage
      try {
        await this.resetOnboarding();
      } catch (resetError) {
        console.warn('Failed to reset corrupted onboarding storage:', resetError);
      }
      return {
        isCompleted: false,
        currentStep: 1,
      };
    }
  },

  async setOnboardingCompleted(): Promise<void> {
    try {
      const state: OnboardingState = {
        isCompleted: true,
        currentStep: 2,
      };
      await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save onboarding completion:', error);
    }
  },

  async updateOnboardingStep(step: number): Promise<void> {
    try {
      const currentState = await this.getOnboardingState();
      const updatedState: OnboardingState = {
        ...currentState,
        currentStep: step,
      };
      await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(updatedState));
    } catch (error) {
      console.warn('Failed to update onboarding step:', error);
    }
  },

  async resetOnboarding(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ONBOARDING_KEY);
    } catch (error) {
      console.warn('Failed to reset onboarding:', error);
    }
  },
};