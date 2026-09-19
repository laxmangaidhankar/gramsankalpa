import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useVillageSelection } from './useVillageSelection';

export const useRecommendations = (villageId, year) => {
  const { selectedVillagePolygon } = useVillageSelection();
  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey: ['recommendations', villageId, year, selectedVillagePolygon ? JSON.stringify(selectedVillagePolygon).slice(0, 50) : null],
    queryFn: async () => {
      if (selectedVillagePolygon) {
        return apiService.post(`/api/v1/recommendations/analyze`, {
          village_id: villageId,
          polygon: selectedVillagePolygon,
          year: year
        });
      }
      return apiService.get(`/api/v1/recommendations/${villageId}`, { year });
    },
    enabled: !!villageId,
    staleTime: Infinity,
    retry: 1,
  });

  const regenerateMutation = useMutation({
    mutationFn: async () => {},
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations', villageId, year] });
    },
  });

  return {
    data: queryResult.data,
    isLoading: queryResult.isLoading || regenerateMutation.isPending,
    error: queryResult.error,
    regenerate: regenerateMutation.mutate,
  };
};

export const useRisks = (villageId, year) => {
  const queryResult = useQuery({
    queryKey: ['risks', villageId, year],
    queryFn: () => apiService.get(`/api/v1/recommendations/${villageId}/risks`, { year }),
    enabled: !!villageId,
    staleTime: Infinity,
  });

  return {
    data: queryResult.data,
    isLoading: queryResult.isLoading,
    error: queryResult.error,
  };
};
