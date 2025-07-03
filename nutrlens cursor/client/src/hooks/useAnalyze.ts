import { useMutation } from '@tanstack/react-query';
import { useApi } from './useApi';

export function useAnalyze() {
  const api = useApi();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/analysis/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.analysis;
    },
  });
} 