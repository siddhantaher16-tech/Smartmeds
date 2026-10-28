import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfile } from '../services/authService';
import { toast } from 'sonner';
import type { Profile } from '../types';

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fields: Partial<Profile>) => updateProfile(fields),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      toast.success('Profile updated');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err?.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    },
  });
};
