import { useQuery } from '@tanstack/react-query';
import { useApi } from './useApi';

export function useLatestPlan() {
  const api = useApi();

  return useQuery({
    queryKey: ['latestPlan'],
    queryFn: async () => {
      const res = await api.get('/plans/latest');
      return res.data.plan;
    },
    staleTime: 1000 * 60, // 1 minute
  });
} 