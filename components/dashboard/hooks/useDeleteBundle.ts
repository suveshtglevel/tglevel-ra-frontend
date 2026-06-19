'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { deleteBundle } from '@/components/dashboard/services/bundle.service';
import { getApiErrorMessage } from '@/lib/errors/api-error';

// Deletes a bundle, then refreshes the bundle list so it disappears from the picker.
export function useDeleteBundle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBundle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bundles'] });
      toast.success('Bundle deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}
