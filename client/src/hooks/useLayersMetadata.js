import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export function useLayersMetadata() {
  const [layers, setLayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    const fetchLayers = async () => {
      try {
        setIsLoading(true);
        const res = await apiService.get('/api/v1/satellite/layers');
        if (mounted && res?.layers && res.layers.length > 0) {
          setLayers(res.layers);
        } else if (mounted) {
          setLayers([{
            id: 'DEBUG', provider: 'DebugProvider', category: 'Optical',
            name: 'Debug Layer (API Empty)', description: 'Debug',
            visualization: { palette: [], min: 0, max: 1, opacity: 1, smoothing: true },
            temporal: { supportsHistorical: false, supportsTimeSeries: false },
            analytics: { supportsStatistics: false, supportsExport: false, supportsComparison: false }
          }]);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch layers metadata');
          setLayers([{
            id: 'DEBUG_ERR', provider: 'DebugProvider', category: 'Optical',
            name: 'Debug Layer (API Error)', description: String(err),
            visualization: { palette: [], min: 0, max: 1, opacity: 1, smoothing: true },
            temporal: { supportsHistorical: false, supportsTimeSeries: false },
            analytics: { supportsStatistics: false, supportsExport: false, supportsComparison: false }
          }]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLayers();
    return () => { mounted = false; };
  }, []);

  return { layers, isLoading, error };
}
