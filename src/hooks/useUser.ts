import { useState } from 'react';
import { createUser, getUserProfile } from '../api/client';
import { useApp } from '../contexts/AppContext';
import type { UserProfile, CreateUserRequest } from '../types';

interface UseUserResult {
  user: UserProfile | null;
  createProfile: (data: CreateUserRequest) => Promise<UserProfile>;
  fetchProfile: (userId: string) => Promise<UserProfile>;
  isCreating: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useUser = (): UseUserResult => {
  const { setUserId, setBusinessLabel } = useApp();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProfile = async (data: CreateUserRequest): Promise<UserProfile> => {
    setIsCreating(true);
    setError(null);
    try {
      const newUser = await createUser(data);
      setUser(newUser);
      setUserId(newUser.id);
      setBusinessLabel(`${newUser.business_type} • ${newUser.industry}`);
      return newUser;
    } catch (err) {
      console.error('[NaijaLex] Failed to create user profile:', err);
      const msg = 'Failed to create profile. Please try again.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsCreating(false);
    }
  };

  const fetchProfile = async (userId: string): Promise<UserProfile> => {
    setIsLoading(true);
    setError(null);
    try {
      const profile = await getUserProfile(userId);
      setUser(profile);
      return profile;
    } catch (err) {
      console.error('[NaijaLex] Failed to fetch user profile:', userId, err);
      const msg = 'Failed to fetch profile.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    createProfile,
    fetchProfile,
    isCreating,
    isLoading,
    error,
  };
};
