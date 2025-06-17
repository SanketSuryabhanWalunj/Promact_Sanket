import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
  ZoomControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Lake, LakeDetails } from "../types/api.types";
import {
  addToMyLake,
  getAllLakesWithLocation,
  getLakeDetailsByIds,
  getLakeStateList,
  StateOption,
} from "../services/api/lake.service";
import Header from "../components/Header";
import "../styles/styles.css";
import "../styles/common.css";
import pulseIcon from "../assets/pulse.png";
import { APP_STRINGS } from "../constants/strings";
import Supercluster from "supercluster";


import { useNavigate } from "react-router-dom";
import markerIcon from "../assets/marker-icon.png";
import { useLakePulse } from "../context/LakePulseContext";

// Initialize default icon
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon,
  iconSize: [35, 35],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [35, 25],
  className: 'red-marker'
});
const style = document.createElement('style');
style.textContent = `
  .red-marker img {
    filter: hue-rotate(140deg) saturate(120%);
  }
`;
L.Marker.prototype.options.icon = DefaultIcon;
interface LakeMarker extends Lake {
  position: [number, number];
}
interface MapBounds {
  northEast: { lat: number; lng: number };
  southWest: { lat: number; lng: number };
}
const isPointInBounds = (
  point: [number, number],
  bounds: L.LatLngBounds
): boolean => {
  return bounds.contains(L.latLng(point[0], point[1]));
};
/**
 * Debounce function for performance optimization
 * @param func - The function to debounce
 * @param waitFor - The time to wait before calling the function
 * @returns function - The debounced function
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const debounce = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
  return debounced;
};
const throttle = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
) => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let lastRun = 0;
  
  return function (...args: Parameters<F>) {
    if (timeoutId) {
      return;
    }
    const now = Date.now();
    if (now - lastRun >= waitFor) {
      func.apply(this, args);
      lastRun = now;
    } else {
      timeoutId = setTimeout(() => {
        func.apply(this, args);
        lastRun = Date.now();
        timeoutId = undefined;
      }, waitFor);
    }
  };
};
/**
 * Handles map changes with optimizations
 * @param map - The Leaflet map instance
 * @param lakes - The array of lake markers
 * @param onBoundsChange - The callback for when the map bounds change
 */
const handleMapChange = (
  map: L.Map,
  lakes: LakeMarker[],
  onBoundsChange: (lakes: LakeMarker[], bounds: MapBounds) => void
) => {
  const bounds = map.getBounds();
  
  const lakesInBounds = lakes.filter((lake) =>
    isPointInBounds([lake.latitude, lake.longitude], bounds)
  );
  const center = bounds.getCenter();
  const sortedLakes = lakesInBounds.sort((a, b) => {
    const distA = L.latLng(a.latitude, a.longitude).distanceTo(center);
    const distB = L.latLng(b.latitude, b.longitude).distanceTo(center);
    return distA - distB;
  });
  
  const northEast = bounds.getNorthEast();
  const southWest = bounds.getSouthWest();
  
  const mapBounds: MapBounds = {
    northEast: { lat: northEast.lat, lng: northEast.lng },
    southWest: { lat: southWest.lat, lng: southWest.lng },
  };
  onBoundsChange(sortedLakes, mapBounds);
};
/**
 * MapEvents component with performance optimizations
 * @param props - The component props
 * @returns JSX.Element - The MapEvents component
 */
const MapEvents: React.FC<{ 
  onBoundsChange: (lakes: LakeMarker[], bounds: MapBounds) => void;
  lakes: LakeMarker[];
}> = ({ onBoundsChange, lakes }) => {
  const prevZoomRef = useRef<number | null>(null);
  const loadingRef = useRef(false);
  
  const throttledMapChange = useRef(
    throttle(
      (
        map: L.Map,
        lakes: LakeMarker[],
        onBoundsChange: typeof MapEvents.prototype.props.onBoundsChange
      ) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      
      handleMapChange(map, lakes, (visibleLakes, bounds) => {
        onBoundsChange(visibleLakes, bounds);
        loadingRef.current = true;
        });
      },
      500
    )
  ).current;
  const debouncedMapChange = useRef(
    debounce(
      (
        map: L.Map,
        lakes: LakeMarker[],
        onBoundsChange: typeof MapEvents.prototype.props.onBoundsChange
      ) => {
      handleMapChange(map, lakes, onBoundsChange);
      },
      300
    )
  ).current;
  
  const map = useMapEvents({
    moveend: () => {
      if (loadingRef.current) return;
      handleMapChange(map, lakes, onBoundsChange);
    },
    zoomstart: () => {
      prevZoomRef.current = map.getZoom();
    },
    zoomend: () => {
      if (loadingRef.current) return;
      
      const newZoom = map.getZoom();
      const prevZoom = prevZoomRef.current ?? newZoom;
      
      if (newZoom < prevZoom) {
        throttledMapChange(map, lakes, onBoundsChange);
        debouncedMapChange(map, lakes, onBoundsChange);
      } else {
        handleMapChange(map, lakes, onBoundsChange);
      }
      prevZoomRef.current = newZoom;
    },
  });
  return null;
};
declare module "leaflet" {
  interface MarkerOptions {
    lakeId?: string | number;
  }
}
// Define types for GeoJSON feature
interface LakeFeature {
  type: "Feature";
  properties: {
    cluster: boolean;
    lakeId: number;
    name: string;
  };
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
}
interface LakeMarker extends Lake {
  position: [number, number]; // Example position property
}
const getClusterSize = (count: number): string => {
  if (count < 10) return 'small';
  if (count < 100) return 'medium';
  return 'large';
};
const formatDate = (dateString: string) => {
  try {
    // First try parsing as ISO string
    let date = new Date(dateString.split('T')[0]); // Strip time portion
    
    // If invalid, try parsing DD-MM-YYYY format
    if (isNaN(date.getTime()) && dateString.includes('-')) {
      const [day, month, year] = dateString.split('-').map(Number);
      date = new Date(year, month - 1, day);
    }

    // If still invalid, try parsing other common formats
    if (isNaN(date.getTime()) && dateString.includes('/')) {
      const [month, day, year] = dateString.split('/').map(Number);
      date = new Date(year, month - 1, day);
    }

    if (isNaN(date.getTime())) {
      return APP_STRINGS.NO_DATE_AVAILABLE;
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error(APP_STRINGS.DATE_PARSING_ERROR, error, dateString);
    return APP_STRINGS.INVALID_DATE;
  }
};
const SORT_OPTIONS = {
  ASC: 'ASC',
  DESC: 'DESC'
} as const;

const SearchByMap: React.FC = () => {
  const navigate = useNavigate();
  const [visibleLakes, setVisibleLakes] = useState<LakeMarker[]>([]);
  const [selectedLakeDetails, setSelectedLakeDetails] = useState<LakeDetails[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markers, setMarkers] = useState<L.Layer[]>([]);
  const [lakes, setLakes] = useState([]);
  const [lakeIds, setLakeIds] = useState([]);
  const mapRef = useRef<L.Map | null>(null);
  const superclusterRef = useRef<Supercluster | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const [points, setPoints] = useState<LakeFeature[]>([]);
  const [supercluster, setSupercluster] = useState<Supercluster | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bounds, setBounds] = useState<any>(null);
  const [zoom, setZoom] = useState(13); // Default zoom level
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState<number | null>(null);
  const lakesPerPage = 10; // Or get from APP_STRINGS.LAKES_PER_PAGE
  const [allLakesData, setAllLakesData] = useState<LakeFeature[]>([]);
  const [selectedLakeId, setSelectedLakeId] = useState<number | null>(null);
  const [onlyWithMembers, setOnlyWithMembers] = useState(false);
  const [communityMemberSize, setCommunityMemberSize] = useState<number | null>(null);
 
  const [totalCount, setTotalCount] = useState(0);
  const [filterOption, setFilterOption] = useState<string>('');
 
  const [sortDirection, setSortDirection] = useState<string>('');
  const [states, setStates] = useState<StateOption[]>([]);
   const { userRole } = useLakePulse();
    /**
   * Fetches the list of states on component mount
   */
    useEffect(() => {
      const fetchStates = async () => {
        try {
          const stateList = await getLakeStateList();
          setStates(stateList);
        
        } catch (err) {
          setError(APP_STRINGS.STATES_LOAD_ERROR);
          console.error(APP_STRINGS.STATES_LOAD_ERROR, err);
        }
      };
  
      fetchStates();
    }, []);
    
 
  /**
   * main api calling for fetching all 4lakhs of data
   */
  const fetchData = async (): Promise<LakeFeature[]> => {
    setIsLoading(true);
    try {
      // Return cached data if available
      if (allLakesData.length > 0) {
        return allLakesData;
      }
      const lakes = await getAllLakesWithLocation();
      const lakesWithPosition: LakeMarker[] = lakes.map((lake) => ({
                  ...lake,
        position: [lake.longitude, lake.latitude],
      }));
      // Add defensive check for mapRef.current
      if (!mapRef.current?.getContainer()) {
        console.warn('Map not fully initialized');
        setVisibleLakes(lakesWithPosition);
        setLakes(lakes);
        return [];
      }
      try {
               
                const bounds = mapRef.current.getBounds();
        const visibleLakes = lakesWithPosition.filter(
          (lake) =>
            lake &&
            lake.latitude &&
            lake.longitude &&
                  bounds.contains(L.latLng(lake.latitude, lake.longitude))
                );
                setVisibleLakes(visibleLakes);
        } catch (error) {
        console.warn('Error accessing map bounds:', error);
        setVisibleLakes(lakesWithPosition);
      }
      setLakes(lakes);
      setDataLoaded(true);
      const features: LakeFeature[] = lakes.map((lake) => ({
        type: "Feature" as const,
        properties: {
          cluster: false,
          lakeId: lake.lakePulseId,
          name: lake.lakeName || String(lake.lakePulseId),
        },
        geometry: {
          type: "Point" as const,
          coordinates: [lake.longitude, lake.latitude],
        },
      }));
      
      setAllLakesData(features);
      return features;
    } catch (error) {
      console.error("Error fetching lake data:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  /**
   * Fetch lake details based on lake IDs
   */
  const fetchLakeDetails = useCallback(async () => {
    if (!visibleLakes.length) return;
    try {
      setLoading(true);
      const visibleLakeIds = visibleLakes
        .map(lake => lake.lakePulseId); // Keep as numbers
      if (visibleLakeIds.length === 0) {
        setSelectedLakeDetails([]);
          return;
        }
      const details = await getLakeDetailsByIds(visibleLakeIds,filterOption,sortDirection);
      // Filter out unnamed lakes and ensure valid data
      setSelectedLakeDetails(details);
    } catch (error) {
      console.error(APP_STRINGS.ERROR_FETCHING_LAKE_DETAILS, error);
      setError(APP_STRINGS.ERROR_FETCHING_LAKE_DETAILS);
    } finally {
      setLoading(false);
    }
  }, [visibleLakes]);
  // Update the useEffect that calls fetchLakeDetails
  useEffect(() => {
      if (visibleLakes.length > 0) {
      fetchLakeDetails();
    }
  }, [visibleLakes, fetchLakeDetails]);
 
  useEffect(() => {
   
    const loadPoints = async () => {
      if (!mapRef.current?.getContainer()) {
        console.warn(APP_STRINGS.MAP_NOT_FULLY_INITIALIZED);
        return;
      }
      setIsLoading(true);
      try {
        const data = await fetchData();
        setPoints(data);
        
        // Add defensive check for cluster initialization
        try {
          const cluster = new Supercluster({
            log: true,
            radius: 60,
            extent: 256,
            maxZoom: 17,
          });
          cluster.load(data);
          setSupercluster(cluster);
        
        if (mapRef.current) {
            mapRef.current.setView(
              [44.5, -89.5],
              7,
              {
                animate: true,
                duration: 1,
              }
            );
            mapRef.current.fire("moveend");
          }
        } catch (clusterError) {
          console.warn(APP_STRINGS.ERROR_INITIALIZING_CLUSTER, clusterError);
        }
    } catch (error) {
        console.error(APP_STRINGS.ERROR_LOADING_POINTS, error);
      } finally {
        setIsLoading(false);
      }
    };
    if (mapInitialized) {
      loadPoints();
    }
  }, [mapInitialized]);
  // Update MapEvents component to handle map updates
  const MapEventsHandler = () => {
    const map = useMap();
    useEffect(() => {
      if (!map) return;
      if (!mapRef.current) {
        mapRef.current = map;
      }
    }, [map]);
    useMapEvents({
      moveend: () => {
        const mapBounds = map.getBounds();
        const sw = mapBounds.getSouthWest();
        const ne = mapBounds.getNorthEast();
        setBounds([
          [sw.lng, sw.lat],
          [ne.lng, ne.lat],
        ]);
        setZoom(map.getZoom());
      },
    });
    return null;
  };
  const clusters =
    supercluster && bounds ? supercluster.getClusters(bounds.flat(), zoom) : [];
  useEffect(() => {
    if (mapRef.current && lakes && lakes.length > 0) {
      const throttledMapChange = throttle(() => {
        if (mapRef.current) {
          const bounds = mapRef.current.getBounds();
          
          const visibleLakes = lakes.filter(
            (lake) =>
              lake &&
              lake.latitude &&
              lake.longitude &&
            bounds.contains(L.latLng(lake.latitude, lake.longitude))
          );
          const visibleLakeIds = visibleLakes
  .map(lake => lake.lakePulseId)
  .filter(id => typeof id === 'number' && !isNaN(id)); // Only valid numbers

if (visibleLakeIds.length === 0) {
  setSelectedLakeDetails([]);
  return;
}
            getLakeDetailsByIds(visibleLakeIds,filterOption,sortDirection)
              .then((details) => {
                if (details) {
                  setSelectedLakeDetails(details);
                }
              })
              .catch((error) => {
                console.error(APP_STRINGS.ERROR_FETCHING_LAKE_DETAILS, error);
              });
          
        }
      }, 300);
      mapRef.current.on("moveend", throttledMapChange);
      mapRef.current.on("zoomend", throttledMapChange);
      // Initial fetch of visible lakes
      throttledMapChange();
      return () => {
        if (mapRef.current) {
          mapRef.current.off("moveend", throttledMapChange);
          mapRef.current.off("zoomend", throttledMapChange);
        }
      };
    }
  }, [lakes]);
   /**
   * Handles adding the current lake to user's collection
   */
    /**
   * Handles adding the current lake to user's collection
   */
   const handleAddToMyLake = async (lakePulseId: number) => {
    try {
      const userDataStr = localStorage.getItem('idToken');
      
      if (!userDataStr) {
      
        return;
      }
      const userData = JSON.parse(userDataStr);
      const userId = userData.profile?.sub || userData.profile?.['cognito:username'];
      
      if (!userId) {
      
        return;
      }
      
       // Get the state abbreviation from the states list
      
      
     
       await addToMyLake(userId, lakePulseId.toString());
      navigate(APP_STRINGS.ROUTE_MY_LAKES);
    } catch (err: unknown) {
      console.error(APP_STRINGS.SEARCH_BY_MAP.ERROR_ADDING_LAKE, err);
   
    }
  };
  const onMapCreated = useCallback((map: L.Map) => {
    mapRef.current = map;
    setMapInitialized(true);
  }, []);
  
   /**
   * Handles search with immediate filter value
   */
   const handleSearchWithFilter = async (sort: number, filterValue: string) => {
    setLoading(true);
    try {
     
      setFilterOption(filterValue);

      // Get lake IDs from selectedLakeDetails
      const lakeIdsToFilter = selectedLakeDetails
        .filter(lake => lake && lake.lakePulseId) // Ensure valid lakes
        .map(lake => lake.lakePulseId);

      if (lakeIdsToFilter.length === 0) {
        console.warn('No lake IDs available to filter');
        setSelectedLakeDetails([]);
        return;
      } 
    
      // Call getLakeDetailsByIds with proper parameters
      const response = await getLakeDetailsByIds(
        lakeIdsToFilter,
        filterValue,
        sortDirection
      );

      if (response) {
        setSelectedLakeDetails(response);
      } else {
        setSelectedLakeDetails([]);
      }

    } catch (err) {
      console.error(APP_STRINGS.ERROR_SEARCHING_LAKES, err);
      setError(APP_STRINGS.ERROR_SEARCHING_LAKES);
      setSelectedLakeDetails([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles search with immediate sort value
   */
  const handleSearchWithSort = async (immediateSort: string, sort: string, ) => {
   
   
    setLoading(true);
    try {
    
// Get lake IDs from selectedLakeDetails
const lakeIdsToFilter = selectedLakeDetails
.filter(lake => lake && lake.lakePulseId) // Ensure valid lakes
.map(lake => lake.lakePulseId);

if (lakeIdsToFilter.length === 0) {
console.warn('No lake IDs available to filter');
setSelectedLakeDetails([]);
return;
} 

     const response = await getLakeDetailsByIds(
        lakeIdsToFilter,
        immediateSort,
        sort
      );

      
   

      if (response) {
        // Sort the lakes based on community members if sorting is selected
        
        
        setSelectedLakeDetails(response);
       

      } else {
        setSelectedLakeDetails([]);
        setTotalCount(0);
      }
    } catch (err) {
      setError(APP_STRINGS.ERROR_SEARCHING_LAKES);
      console.error(APP_STRINGS.ERROR_SEARCHING_LAKES, err);
      setLakes([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }

  };
  const LoadingOverlay = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-white/75 z-[1000]">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-blue-500 font-semibold">
          {APP_STRINGS.SEARCH_BY_MAP.LOADING_LAKES_DATA}
        </p>
      </div>
    </div>
  );
  // Update the pagination calculation function
  const paginateSelectedLakes = useCallback(() => {
    
    
    const indexOfLastLake = currentPage * lakesPerPage;
    const indexOfFirstLake = indexOfLastLake - lakesPerPage;
    return selectedLakeDetails.slice(indexOfFirstLake, indexOfLastLake);
  }, [currentPage, selectedLakeDetails, lakesPerPage]);
  // Add pagination controls component
  const PaginationControls = () => {
    const totalPages = Math.ceil(selectedLakeDetails.length / lakesPerPage);
    
    return (
      <div className="flex justify-center items-center gap-2 mt-4">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          {APP_STRINGS.PREVIOUS}
        </button>
        <span className="mx-2">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          {APP_STRINGS.NEXT}
        </button>
      </div>
    );
  };
  // Reset page when visible lakes change
  useEffect(() => {
    setCurrentPage(1);
  }, [visibleLakes]);
  useEffect(() => {
    if (!mapRef.current || !supercluster || !bounds) return;

    const handleMapMove = () => {
      const mapBounds = mapRef.current?.getBounds();
      if (!mapBounds) return;

      // Get visible lakes based on current bounds
      const visibleLakes = lakes.filter(lake => 
        lake && lake.latitude && lake.longitude && 
        mapBounds.contains(L.latLng(lake.latitude, lake.longitude))
      );

      // Update visible lakes and fetch their details
      setVisibleLakes(visibleLakes);
    };

    // Add event listeners
    mapRef.current.on('moveend', handleMapMove);
    mapRef.current.on('dragend', handleMapMove);
    mapRef.current.on('zoomend', handleMapMove);

    // Initial call
    handleMapMove();

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.off('moveend', handleMapMove);
        mapRef.current.off('dragend', handleMapMove);
        mapRef.current.off('zoomend', handleMapMove);
      }
    };
  }, [lakes, supercluster, bounds]);
  // Add this function to create numbered circle markers
  const createNumberedIcon = (index: number) => L.divIcon({
    className: 'map-numbered-icon',
    html: `<div class="map-marker-circle">${index + 1}</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
  const handleLakeClick = (lake: LakeDetails) => {
    if (mapRef.current && lake.latitude && lake.longitude) {
      mapRef.current.flyTo(
        [lake.latitude, lake.longitude],
        16, // Zoom level
        {
          animate: true,
          duration: 0.8
        }
      );
      setSelectedLakeId(lake.lakePulseId);
    }
  };
  return (
    <div>
      <Header />
      <main>
         
        <div className="map-and-list-container">
        {(userRole === 'User' || userRole === 'Admin') && (
                  <h1 className="map-title">
                    {APP_STRINGS.FIND_MY_LAKE}
                      <span className="ml-2">{APP_STRINGS.MAP} / </span>
                    <span
                      style={{ color: 'grey', cursor: 'pointer'}}
                      onClick={() => window.location.href = '/search/name'}
                    >
                      {APP_STRINGS.NAME_LABEL}
                    </span> 
                  </h1>
                )}
                {(userRole === 'Super Admin') && (
                  <h1 className="map-title">
                    {APP_STRINGS.FIND_MY_LAKE}
        
                  </h1>
                )}
          <div className="map-section relative">
            {(!dataLoaded || isLoading) && <LoadingOverlay />}
          <MapContainer
                center={[37.7749, -122.4194]} // Default map center
                zoom={10}
                style={{ height: "100vh", width: "80%" }}
              attributionControl={false}
                zoomControl={false} // Disable default zoom control
                ref={(map) => {
                if (map) {
                  onMapCreated(map);
                }
              }}
          >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
                subdomains="abcd"
                crossOrigin=""
              />
              <ZoomControl position="bottomleft" /> {/* Add zoom control at bottom left */}
              {clusters.map((cluster, index) => {
                const [longitude, latitude] = cluster.geometry.coordinates;

                if (!latitude || !longitude) return null;

                if (cluster.properties.cluster) {
                  return (
                    <Marker
                      key={`cluster-${cluster.id}`}
                      position={[latitude, longitude]}
                      icon={L.divIcon({
                        html: `<div style="background-color:rgba(0,123,255,0.6); border-radius:50%; padding:10px 0; color:white; text-align:center;">${cluster.properties.point_count}</div>`,
                        className: "cluster-marker",
                        iconSize: L.point(40, 40),
                      })}
                      eventHandlers={{
                        click: () => {
                          const expansionZoom = Math.min(
                            supercluster.getClusterExpansionZoom(
                              Number(cluster.id)
                            ),
                            12
                          );
                          mapRef.current.flyTo(
                            [latitude, longitude],
                            expansionZoom,
                            {
                              animate: true,
                              duration: 0.5, // duration of the flight in seconds
                            }
                          );
                        },
                      }}
                    />
                  );
                }
                
                const lake = cluster.properties;
                if (!lake || !lake.lakeId) return null;

                // Find the exact matching lake in selectedLakeDetails
                const sidebarIndex = paginateSelectedLakes().findIndex(
                  detail => detail.lakePulseId === lake.lakeId || 
                            detail.lakePulseId.toString() === lake.lakeId.toString()
                );
                
                // Skip if lake is not in current page of sidebar
                if (sidebarIndex === -1) return null;


                return (
                  <Marker
                    key={`marker-${sidebarIndex}`}
                    position={[latitude, longitude]}
                    icon={createNumberedIcon(sidebarIndex)} // This will use the same index as paginated sidebar
                    eventHandlers={{
                      click: () => {
                        setSelectedLakeId(lake.lakeId);
                      },
                      mouseover: (e) => {
                        const lakeName = paginateSelectedLakes()[sidebarIndex].lakeName;
                        e.target.bindTooltip(lakeName, {
                          permanent: false,
                          direction: 'top',
                          className: 'lake-tooltip'
                        }).openTooltip();
                      }
                    }}
                  />
                );
              })}
              <MapEventsHandler />
          </MapContainer>
        </div>

        <div className="right-sidebar">
            <h2>
              {APP_STRINGS.SEARCH_BY_MAP.LAKEINVIEW}
            </h2>
              {/* Note:For now removed count for the confusion on count */}
          <p className="sidebar-description">
                {APP_STRINGS.SHOWING_LABEL} 
            </p>
            <div className="flex-1 search-filters mb-2 search_filter_wrap">
                  <label htmlFor="filterOption" className="block mb-1">
                    {APP_STRINGS.FILTER_BUTTON_LABEL}
                  </label>
                  <select
                    id="filterOption"
                    value={filterOption}
                    onChange={(e) => {
                      const selectedValue = e.target.value;
                      
                      handleSearchWithFilter(1, selectedValue); // Pass page number and filter value
                    }}
                    className="block custom-select w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select Filter</option>
                    <option value="members">Only include lakes with members</option>
                    <option value="admins">Only include lakes with admin</option>
                    <option value="updates">Recent last updated activity</option>
                  </select>
                </div>
                <div className="flex-1 search-filters mb-5 search_sort_wrap">
                  <label htmlFor="communityMemberSize" className="block mb-1">
                    {APP_STRINGS.SORT}
                  </label>
                  <select
                    id="communityMemberSize"
                    value={sortDirection}
                    onChange={(e) => {
                      const selectedSort = e.target.value;
                   
                      setSortDirection(selectedSort);
                      // Immediately trigger search with the new sort value
                      handleSearchWithSort(currentPage.toString(), selectedSort);
                    }}
                    className="block custom-select w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Community Member Size</option>
                    <option value={SORT_OPTIONS.ASC}>Smallest to Largest</option>
                    <option value={SORT_OPTIONS.DESC}>Largest to Smallest</option>
                  </select>
                </div>
          <div className="lakes-list">
            {loading ? (
              <div>{APP_STRINGS.SEARCH_BY_MAP.LOADINGLAKES}</div>
            ) : (
              <>
                    {paginateSelectedLakes().map((lake, index) => (
                    <div key={lake.lakePulseId} className="lake-item">
                      <div className="lake-header">
                          <h3 onClick={() => handleLakeClick(lake)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>{index + 1}</span> {lake.lakeName}, {lake.lakeStateCode || lake.lakeState}
                          </h3>
                        <button 
                            className="mt-4 flex mylakes-link"
                            onClick={() => handleAddToMyLake(lake.lakePulseId)}
                        >
                            {APP_STRINGS.ADD_LAKE_BUTTON_LABEL} 
                        </button>
                      </div>
                      <div className="lake-stats">
                        <div className="stat-row">
                          <div className="stat-group">
                            <div className="stat-item">
                                <span className="stat-value">
                                  {lake.communityUsers}
                                </span>
                                <span className="stat-label">
                                  {APP_STRINGS.COMMUNITY_MEMBERS}
                                </span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">
                                  {lake.communitySubscriber}
                                </span>
                                <span className="stat-label">
                                  {APP_STRINGS.SUBSCRIBERS}
                                </span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">
                                  {lake.communityAdmin}
                                </span>
                                <span className="stat-label">
                                  {APP_STRINGS.COMMUNITY_ADMINS}
                                </span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">
                                {formatDate(lake.recentDataCollection)}
                                </span>
                                <span className="stat-label">
                                  {APP_STRINGS.RECENT_DATA}
                                </span>
                              </div>
                          </div>
                          <div className="stat-group">
                            <div className="stat-item">
                                <span className="stat-value">
                                  {lake.spanYears}
                                </span>
                                <span className="stat-label">
                                  {APP_STRINGS.SPAN_YEARS}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {selectedLakeDetails.length > lakesPerPage && <PaginationControls />}
              </>
            )}
          </div>

            {/*
            <h2>
              {APP_STRINGS.ACCESS_SECTION_TITLE}
            </h2>
            
            <div className=" mb-4 bg-white rounded-lg shadow p-4">
            <p className="mb-4">{APP_STRINGS.ACCESS_DESCRIPTION}</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <img src={pulseIcon} alt="Pulse Icon" className="w-5 h-5" />
                </div>
                <p>{APP_STRINGS.ACCESS_FEATURES.ANALYSIS}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <img src={pulseIcon} alt="Pulse Icon" className="w-5 h-5" />
                </div>
                <p>{APP_STRINGS.ACCESS_FEATURES.COMMUNITY}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <img src={pulseIcon} alt="Pulse Icon" className="w-5 h-5" />
                </div>
                <p>{APP_STRINGS.ACCESS_FEATURES.TOOLBOX}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <img src={pulseIcon} alt="Pulse Icon" className="w-5 h-5" />
                </div>
                <p>{APP_STRINGS.ACCESS_FEATURES.EDUCATION}</p>
              </div>
            </div>
            <div className="text-center mt-6">
              <a 
                href="#" 
                className="inline-block text-[#02A4DC] hover:text-[#0288b7] transition-colors"
              >
                {APP_STRINGS.REGISTER_CTA}
              </a>
            </div>
          </div>
            */}

          </div>

        </div>
      </main>
    </div>
  );
};
export default SearchByMap;

