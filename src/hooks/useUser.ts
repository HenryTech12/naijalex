import { useState } from 'react';
import { createUser } from '../api/client';
import { useApp } from '../contexts/AppContext';
import type { UserProfile } from '../types';

interface UseUserResult {
  createProfile: (data: { business_type: string; industry: string }) => Promise<UserProfile>;
  isCreating: boolean;
  error: string | null;
}

export const useUser = (): UseUserResult => {
  const { setUserId } = useApp();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProfile = async (data: {
    business_type: string;
    industry: string;
  }): Promise<UserProfile> => {
    setIsCreating(true);
    setError(null);
    try {
      const user = await createUser(data);
      setUserId(user.id);
      return user;
    } catch (err) {
      const msg = 'Failed to create profile. Please try again.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsCreating(false);
    }
  };

  return { createProfile, isCreating, error };
};
