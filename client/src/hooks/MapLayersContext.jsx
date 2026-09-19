import { useState, useCallback, createContext, useContext, useMemo } from 'react';
import React from 'react';

const MapLayersContext = createContext(undefined);

export const MapLayersProvider = ({ children }) => {
  const [activeBaseLayer, setActiveBaseLayer] = useState('dark');
  const [activeSatelliteLayer, setActiveSatelliteLayer] = useState(null);

  const toggleSatelliteLayer = useCallback((layerId) => {
    setActiveSatelliteLayer((prev) => prev === layerId ? null : layerId);
  }, []);

  const clearAllLayers = useCallback(() => {
    setActiveSatelliteLayer(null);
  }, []);

  const showNDVI = activeSatelliteLayer === 'ndvi';

  const value = useMemo(() => ({
    activeBaseLayer,
    setActiveBaseLayer,
    activeSatelliteLayer,
    setActiveSatelliteLayer,
    toggleSatelliteLayer,
    showNDVI,
    clearAllLayers,
  }), [activeBaseLayer, activeSatelliteLayer, toggleSatelliteLayer, clearAllLayers, showNDVI]);

  return (
    <MapLayersContext.Provider value={value}>
      {children}
    </MapLayersContext.Provider>
  );
};

export const useMapLayers = () => {
  const context = useContext(MapLayersContext);
  if (context === undefined) {
    throw new Error('useMapLayers must be used within a MapLayersProvider');
  }
  return context;
};
