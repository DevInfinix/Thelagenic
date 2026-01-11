import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  dietaryPreferences: string[];
  location: { latitude: number; longitude: number } | null;
  currentCity: string | null;
  profilePhoto: string | null;
  createdAt: number;
}

interface UserContextType {
  user: UserProfile | null;
  isLoading: boolean;
  onboardingComplete: boolean;
  setOnboardingComplete: (complete: boolean) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const DEFAULT_USER: UserProfile = {
  id: 'user_' + Date.now(),
  name: '',
  email: '',
  phone: '',
  dietaryPreferences: [],
  location: null,
  currentCity: null,
  profilePhoto: null,
  createdAt: Date.now(),
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingComplete, setOnboardingCompleteState] = useState(false);

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('userProfile');
      const onboardingStatus = await AsyncStorage.getItem('onboardingComplete');

      if (savedUser) {
        setUser(JSON.parse(savedUser));
        setOnboardingCompleteState(onboardingStatus === 'true');
      } else {
        setUser(null);
        setOnboardingCompleteState(false);
      }
    } catch (error) {
      console.error('Error initializing user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (profile: Partial<UserProfile>) => {
    try {
      const updatedUser = { ...user, ...profile } as UserProfile;
      setUser(updatedUser);
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userProfile');
      await AsyncStorage.removeItem('onboardingComplete');
      setUser(null);
      setOnboardingCompleteState(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const value: UserContextType = {
    user,
    isLoading,
    onboardingComplete,
    setOnboardingComplete: (complete: boolean) => {
      // Update state immediately (synchronously)
      setOnboardingCompleteState(complete);
      
      // Then persist to AsyncStorage in background
      if (complete && user) {
        AsyncStorage.setItem('userProfile', JSON.stringify(user)).catch(err =>
          console.error('Error saving user profile:', err)
        );
      }
      AsyncStorage.setItem('onboardingComplete', String(complete)).catch(err =>
        console.error('Error saving onboarding status:', err)
      );
    },
    updateUserProfile,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
