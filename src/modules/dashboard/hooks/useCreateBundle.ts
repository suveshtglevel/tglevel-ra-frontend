'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createBundle } from '@/modules/dashboard/services/bundle.service';
import { getApiErrorMessage } from '@/lib/errors/api-error';

// Creates a bundle, then refreshes the bundle list so it appears in the picker.
export function useCreateBundle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBundle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bundles'] });
      toast.success('Bundle created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}
