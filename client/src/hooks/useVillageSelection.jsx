import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiService } from '../services/api';

const VillageContext = createContext(undefined);

export const VillageProvider = ({ children }) => {
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [_mapInstance, setMapInstance] = useState(null);
  const [selectedVillagePolygon, setSelectedVillagePolygon] = useState(null);
  const [selectedNDVICategory, setSelectedNDVICategory] = useState(null);
  const [clickedLocation, setClickedLocation] = useState(null);
  const [activeLayers, setActiveLayers] = useState([]);
  const [hoverValue, setHoverValue] = useState(null);
  const [isWorkspaceExpanded, setIsWorkspaceExpanded] = useState(false);
  const [timeRange, setTimeRange] = useState('12M');

  useEffect(() => {
    console.log('[INSTRUMENT 2/3 - useVillageSelection] State render:', {
      selectedVillageId: selectedVillage?.id,
      selectedVillageName: selectedVillage?.name,
      polygonFirstCoord: selectedVillagePolygon?.coordinates?.[0]?.[0] || selectedVillagePolygon?.coordinates?.[0]?.[0]?.[0] || null,
    });
  }, [selectedVillage, selectedVillagePolygon]);

  const handleSetSelectedVillage = useCallback(async (village) => {
    console.log('[INSTRUMENT 2 - useVillageSelection] ENTRY incoming village:', village?.id, village?.name, 'source:', village?.source);
    if (!village) {
      setSelectedVillage(null);
      setSelectedVillagePolygon(null);
      setIsWorkspaceExpanded(false);
      return;
    }

    console.log('[INSTRUMENT 2 - useVillageSelection] Calling setSelectedVillage & setSelectedVillagePolygon with:', village.id);
    setSelectedVillage(village);
    setSelectedVillagePolygon(village.boundary ?? null);

    if (village.source === 'nominatim' && village.boundary) {
      console.log('[INSTRUMENT 3 - useVillageSelection] TAKEN BRANCH: nominatim with boundary', village.id);
      apiService.post('/api/v1/villages/register', {
        id: village.id,
        name: village.name,
        nameHindi: village.nameHindi ?? village.name,
        district: village.district ?? '',
        state: village.state ?? 'India',
        coordinates: [village.coordinates?.[0] ?? 20.0, village.coordinates?.[1] ?? 78.0],
        boundary: village.boundary,
        area: village.area ?? 50.0,
      }).then(() => {
        console.log('[INSTRUMENT 3 - useVillageSelection] Register success for:', village.id);
      }).catch((err) => {
        console.error('[INSTRUMENT 3 - useVillageSelection] Register failed for:', village.id, err);
      });
    } else if (!village.boundary && village.id) {
      console.log('[INSTRUMENT 3 - useVillageSelection] TAKEN BRANCH: fetch from backend (no boundary in object)', village.id);
      try {
        const fullVillage = await apiService.get(`/api/v1/villages/${village.id}`);
        if (fullVillage) {
          console.log('[INSTRUMENT 3 - useVillageSelection] Backend fetched fullVillage:', fullVillage.id, 'has boundary:', !!fullVillage.boundary);
          setSelectedVillage((prev) => (prev?.id === village.id ? { ...prev, ...fullVillage } : prev));
          if (fullVillage.boundary) {
            setSelectedVillagePolygon(fullVillage.boundary);
          }
        }
      } catch (err) {
        console.error('[INSTRUMENT 3 - useVillageSelection] Backend fetch failed for:', village.id, err);
      }
    } else {
      console.log('[INSTRUMENT 3 - useVillageSelection] TAKEN BRANCH: local village with existing boundary', village.id);
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedVillage(null);
    setSelectedVillagePolygon(null);
    setIsWorkspaceExpanded(false);
  }, []);

  const flyToVillage = useCallback(() => {}, []);

  return (
    <VillageContext.Provider
      value={{
        selectedVillage,
        setSelectedVillage: handleSetSelectedVillage,
        selectedYear,
        setSelectedYear,
        clearSelection,
        flyToVillage,
        setMapInstance,
        selectedVillagePolygon,
        selectedNDVICategory,
        setSelectedNDVICategory,
        clickedLocation,
        setClickedLocation,
        activeLayers,
        setActiveLayers,
        hoverValue,
        setHoverValue,
        isWorkspaceExpanded,
        setIsWorkspaceExpanded,
        timeRange,
        setTimeRange,
      }}
    >
      {children}
    </VillageContext.Provider>
  );
};

export const useVillageSelection = () => {
  const context = useContext(VillageContext);
  if (context === undefined) {
    throw new Error('useVillageSelection must be used within a VillageProvider');
  }
  return context;
};
