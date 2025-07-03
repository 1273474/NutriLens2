import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from './useApi';

export function useGeneratePlan() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await api.post('/plans/generate');
      return res.data.plan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['latestPlan'] });
    },
  });
} 