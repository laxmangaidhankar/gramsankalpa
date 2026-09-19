import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useVillageSelection } from './useVillageSelection';

export const useScores = (villageId, year) => {
  const { selectedVillagePolygon } = useVillageSelection();
  const queryKey = ['scores', villageId, year, selectedVillagePolygon ? JSON.stringify(selectedVillagePolygon).slice(0, 50) : null];

  const queryResult = useQuery({
    queryKey,
    queryFn: async () => {
      if (selectedVillagePolygon) {
        const url = `/api/v1/scores/analyze`;
        return apiService.post(url, {
          village_id: villageId,
          polygon: selectedVillagePolygon,
          year: year
        });
      }
      const url = `/api/v1/scores/${villageId}`;
      return apiService.get(url, { year });
    },
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
