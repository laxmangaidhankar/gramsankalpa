import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';

export function useRegionalData(year) {
  const queryResult = useQuery({
    queryKey: ['regionalData', year],
    queryFn: async () => {
      const [featuresRes, metricsRes] = await Promise.all([
        apiService.get('/api/v1/villages/boundaries/all'),
        apiService.get('/api/v1/satellite/regions/metrics', { year })
      ]);

      return {
        features: featuresRes,
        metrics: metricsRes
      };
    },
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });

  return {
    data: queryResult.data ?? null,
    isLoading: queryResult.isLoading,
    error: queryResult.error ?? null,
  };
}
