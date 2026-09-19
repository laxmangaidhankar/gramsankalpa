import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useVillageSelection } from './useVillageSelection';

export const useSatelliteData = (villageId, year) => {
  const { selectedVillagePolygon } = useVillageSelection();

  const queryKey = ['satellite', villageId, year, selectedVillagePolygon ? JSON.stringify(selectedVillagePolygon).slice(0, 50) : null];

  const queryResult = useQuery({
    queryKey,
    queryFn: async () => {
      if (selectedVillagePolygon) {
        const url = `/api/v1/analyze`;
        const res = await apiService.post(url, {
          village_id: villageId,
          polygon: selectedVillagePolygon,
          year: year
        });
        return res.metrics;
      }
      const url = `/api/v1/satellite/${villageId}/metrics`;
      return apiService.get(url, { year });
    },
    enabled: !!villageId,
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });

  const geeStatus = {
    loading: queryResult.isLoading || queryResult.isFetching,
    cached: queryResult.data?.dataSource === 'cached' || queryResult.data?.dataSource === 'mock',
    error: queryResult.error?.message,
  };

  return {
    data: queryResult.data,
    geeStatus,
    isLoading: queryResult.isLoading,
    isFetching: queryResult.isFetching,
    error: queryResult.error,
  };
};
