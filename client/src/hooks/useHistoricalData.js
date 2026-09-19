import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';

export const useHistoricalData = (villageId) => {
  const queryResult = useQuery({
    queryKey: ['history', villageId],
    queryFn: () => apiService.get(`/api/v1/history/${villageId}`),
    enabled: !!villageId,
    staleTime: Infinity,
    retry: 1,
  });

  return {
    data: queryResult.data,
    isLoading: queryResult.isLoading,
    error: queryResult.error,
  };
};

export const useHistoricalChanges = (villageId) => {
  const queryResult = useQuery({
    queryKey: ['history', 'changes', villageId],
    queryFn: () => apiService.get(`/api/v1/history/${villageId}/changes`),
    enabled: !!villageId,
    staleTime: Infinity,
    retry: 1,
  });

  return {
    data: queryResult.data,
    isLoading: queryResult.isLoading,
    error: queryResult.error,
  };
};
