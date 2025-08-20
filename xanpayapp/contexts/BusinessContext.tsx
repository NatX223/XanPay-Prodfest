import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { BusinessService, BusinessDetails } from '@/services/businessService';
import { useAuth } from './AuthContext';

interface BusinessContextType {
  businessDetails: BusinessDetails | null;
  isLoading: boolean;
  error: string | null;
  refreshBusinessDetails: () => Promise<void>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

interface BusinessProviderProps {
  children: ReactNode;
}

export function BusinessProvider({ children }: BusinessProviderProps) {
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  const fetchBusinessDetails = async () => {
    if (!isAuthenticated || !user) {
      setBusinessDetails(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const details = await BusinessService.getUserBusinessDetails();
      setBusinessDetails(details);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch business details';
      setError(errorMessage);
      console.error('Error fetching business details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshBusinessDetails = async () => {
    await fetchBusinessDetails();
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchBusinessDetails();
    } else {
      setBusinessDetails(null);
      setError(null);
    }
  }, [isAuthenticated, user]);

  const value: BusinessContextType = {
    businessDetails,
    isLoading,
    error,
    refreshBusinessDetails,
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness(): BusinessContextType {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
}