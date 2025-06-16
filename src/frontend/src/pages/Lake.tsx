/**
 * Lake Component
 *
 * This component displays detailed information about a specific lake.
 * It includes:
 * - Lake overview (name, location, type, etc.)
 * - Water quality metrics and trends
 * - Interactive map visualization
 * - Add to My Lakes functionality
 */
import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import { Dialog } from "@mui/material";
import {
  getShopifyCheckoutUrl,
  checkUserSubscriptionStatus,
} from "../services/api/user.service";

import "../styles/common.css";
import Header from "../components/Header";
import {
  getLakeOverviewById,
  getCharacteristics,
  addFavoriteCharacteristic,
  removeFavoriteCharacteristic,
  getCharacteristicChart,
  getFavoriteCharacteristics,
  getFieldNotesByLakeId,
  getMyLakes,
  getRecentToolboxPurchases,
  getAlertLevels,
  getCriticalAlerts,
  CriticalAlert,
} from "../services/api/lake.service";

import { getWeatherForLocation } from "../services/api/weather.service";
import styled from "styled-components";
import {
  LakeCharacteristic,
  Characteristic,
  LakeOverview,
  WeatherData,
  FieldNoteDto,
  SensorLocation,
  ChartDataWithMetadata,
  ChartData,
  mylakes,
} from "../types/api.types";
import { APP_STRINGS } from "../constants/strings";
import ChartResults from "../components/ChartResults";

import { uniq } from "lodash";
import { useAuth } from "react-oidc-context";

import {
  MapContainer,
  Marker,
  Popup,
  useMap,
  TileLayer,
  ZoomControl,
} from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

import "leaflet-providers"
import { getLocalMidnight } from "../utils/dateUtils";
import { info } from "console";
import { useLakePulse } from "../context/LakePulseContext";

/**
 * Lake component
 */
const WeatherSection = styled.div`
  background: white;
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 20px;
`;
const FieldNotes = styled.div`
  background: white;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
`;
const allProviders = [
  "USGS.USImageryTopo",
  "CartoDB.Voyager",
];
const providerLabels: Record<string, string> = {

  "USGS.USImageryTopo": "Satellite",
  "CartoDB.Voyager": "Terrain",

};
declare module "leaflet" {
  namespace tileLayer {
    function provider(name: string, options?: any): TileLayer;
  }
}

const TileLayerControl = ({ selectedProvider }) => {
  const map = useMap();

  React.useEffect(() => {
    let currentTileLayer;

    try {
      currentTileLayer = L.tileLayer.provider(selectedProvider);
      currentTileLayer.addTo(map);
    } catch (error) {
      console.error(`Error loading tile layer: ${selectedProvider}`, error);
      // Fallback to a default tile layer
      currentTileLayer = L.tileLayer.provider("CartoDB.Voyager");
      currentTileLayer.addTo(map);
    }

    return () => {
      map.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          map.removeLayer(layer);
        }
      });
    };
  }, [selectedProvider, map]);

  return null;
};
const formatDateTime = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Use local timezone
    }).format(date);
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Invalid date";
  }
};

// Update the formatDate function to show "DD MMM YYYY" format (e.g., "16 APR 2025")
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);

    // Get day of month (DD)
    const day = date.getDate().toString().padStart(2, "0");

    // Get weekday (MON, TUE, etc.)
    const weekday = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
      .format(date)
      .toUpperCase();

    // Return formatted date (e.g., "24 MON")
    return `${day} ${weekday}`;
  } catch (error) {
    console.error("Date parsing error:", error, dateString);
    return "Invalid date";
  }
};
// Weather icon class
const getWeatherIconClass = (description: string) => {
  const lowerDesc = description.toLowerCase();

  // Clear/Sunny Conditions
  if (lowerDesc.includes("sunny") || lowerDesc.includes("clear"))
    return "fa-thin fa-sun";
  if (lowerDesc.includes("mostly sunny") || lowerDesc.includes("mostly clear"))
    return "fa-thin fa-cloud-sun";
  if (lowerDesc.includes("partly sunny") || lowerDesc.includes("partly clear"))
    return "fa-thin fa-cloud-sun";

  // Cloudy Conditions
  if (lowerDesc.includes("partly cloudy")) return "fa-thin fa-cloud-sun";
  if (lowerDesc.includes("mostly cloudy")) return "fa-thin fa-cloud-sun";
  if (lowerDesc.includes("overcast")) return "fa-thin fa-clouds";
  if (lowerDesc.includes("cloudy")) return "fa-thin fa-cloud";

  // Rain Conditions
  if (
    lowerDesc.includes("rain showers") ||
    lowerDesc.includes("chance of rain")
  )
    return "fa-thin fa-cloud-rain";
  if (
    lowerDesc.includes("light rain") ||
    lowerDesc.includes("scattered showers")
  )
    return "fa-thin fa-cloud-showers";
  if (
    lowerDesc.includes("heavy rain") ||
    lowerDesc.includes("showers and thunderstorms")
  )
    return "fa-thin fa-cloud-showers-heavy";
  if (lowerDesc.includes("rain")) return "fa-thin fa-cloud-rain";

  // Snow Conditions
  if (lowerDesc.includes("snow showers") || lowerDesc.includes("heavy snow"))
    return "fa-thin fa-snowflakes";
  if (lowerDesc.includes("light snow") || lowerDesc.includes("flurries"))
    return "fa-thin fa-snowflake";
  if (lowerDesc.includes("snow")) return "fa-thin fa-snowflake";
  if (lowerDesc.includes("blowing snow")) return "fa-thin fa-snow-blowing";

  // Mixed Precipitation
  if (lowerDesc.includes("rain and snow") || lowerDesc.includes("wintry mix"))
    return "fa-thin fa-snowflake-droplets";
  if (lowerDesc.includes("sleet") || lowerDesc.includes("freezing rain"))
    return "fa-thin fa-cloud-sleet";

  // Thunderstorm Conditions
  if (
    lowerDesc.includes("thunderstorms") ||
    lowerDesc.includes("isolated thunderstorms") ||
    lowerDesc.includes("scattered thunderstorms")
  )
    return "fa-thin fa-cloud-showers-heavy";
  if (lowerDesc.includes("severe thunderstorms")) return "fa-thin fa-poo-storm";

  // Fog and Mist
  if (lowerDesc.includes("fog") || lowerDesc.includes("mist"))
    return "fa-thin fa-cloud-fog";

  // Wind Conditions
  if (lowerDesc.includes("breezy") || lowerDesc.includes("windy"))
    return "fa-thin fa-wind";
  if (lowerDesc.includes("gusty winds")) return "fa-thin fa-wind-warning";

  // Special Weather
  if (lowerDesc.includes("haze")) return "fa-thin fa-sun-haze";
  if (lowerDesc.includes("dust")) return "fa-thin fa-sun-dust";
  if (lowerDesc.includes("smoke")) return "fa-thin fa-smoke";
  if (lowerDesc.includes("sandstorm")) return "fa-thin fa-wind-warning";

  // Extreme Weather
  if (lowerDesc.includes("hurricane conditions")) return "fa-thin fa-hurricane";
  if (lowerDesc.includes("tropical storm conditions"))
    return "fa-thin fa-cloud-showers-heavy";
  if (lowerDesc.includes("tornado conditions")) return "fa-thin fa-tornado";
  if (lowerDesc.includes("blizzard")) return "fa-thin fa-snowflakes";
  if (lowerDesc.includes("heat wave")) return "fa-thin fa-temperature-arrow-up";
  if (lowerDesc.includes("cold wave"))
    return "fa-thin fa-temperature-arrow-down";

  return "fa-thin fa-cloud"; // Default icon
};

const formatNumberLake = (num: number): string => {
  // For US number format (e.g., 123,456,789)
  return num.toLocaleString("en-US");
};
const formatLatLong = (latlong, decimalRounding) => {
  return Math.round(latlong * Math.pow(10, decimalRounding)) / Math.pow(10, decimalRounding);


}

// Update the formatActivityDate function to handle different date formats and edge cases
const formatActivityDate = (dateString: string | null | undefined) => {
  try {
    // Debug log to see what we're receiving

    // Return dash if date is null/undefined/empty
    if (!dateString) {
      return "-";
    }

    let dateToFormat: Date;

    // First try parsing as a regular date
    dateToFormat = new Date(dateString);

    // If invalid, try different formats
    if (isNaN(dateToFormat.getTime())) {
      if (dateString.includes("-")) {
        const [day, month, year] = dateString.split("-");
        dateToFormat = new Date(Number(year), Number(month) - 1, Number(day));
      } else if (dateString.includes("/")) {
        const [month, day, year] = dateString.split("/");
        dateToFormat = new Date(Number(year), Number(month) - 1, Number(day));
      }
    }

    // Check if we have a valid date
    if (isNaN(dateToFormat.getTime())) {
      console.warn(`Could not parse date: ${dateString}`);
      return "-";
    }

    // Format the valid date
    return dateToFormat.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch (error) {
    console.error("Date formatting error:", error, "Date string:", dateString);
    return "-";
  }
};

// Add a new function for purchase date formatting
const formatPurchaseDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = new Intl.DateTimeFormat("en-US", {
      month: "short",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
      .format(date)
      .toUpperCase();
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  } catch (error) {
    console.error("Date parsing error:", error, dateString);
    return "Invalid date";
  }
};

const Lake = () => {
  const { lakePulseId } = useParams<{ lakePulseId: string }>();
  const userDataStr = localStorage.getItem("idToken");
  const userId = userDataStr ? JSON.parse(userDataStr).profile?.sub : "";

  const [lakeData, setLakeData] = useState<LakeOverview | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [characteristics, setCharacteristics] = useState<LakeCharacteristic[]>(
    []
  );
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [chartData, setChartData] = useState<ChartDataWithMetadata[]>([]);
  const [chartLakeData, setChartLakeData] = useState<ChartData[][]>([]);
  const [characteristicsMap, setCharacteristicsMap] = useState<
    Record<string, Characteristic>
  >({});

  const [sensorLocations, setSensorLocations] = useState<SensorLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [locationIdentifiers, setLocationIdentifiers] = useState<string[]>([]);

  // Update the notes state
  const [notes, setNotes] = useState<FieldNoteDto[]>([]);
 

  // Update the state to include units
  const [characteristicUnits, setCharacteristicUnits] = useState<
    Record<string, string>
  >({});

  // Add this state declaration
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [chartDurations, setChartDurations] = useState<Record<string, number>>(
    {}
  );

  // Add this CSS class for the loading star
  const [loadingStars, setLoadingStars] = useState<Set<string>>(new Set());
  const [criticalAlerts, setCriticalAlerts] = useState<CriticalAlert[]>([]);
  const { lakes, userRole } = useLakePulse();
  useEffect(() => {
    const fetchCritical = async () => {
      try {
        const alerts = await getCriticalAlerts(lakePulseId, 1, 5);
        setCriticalAlerts(alerts);
      } catch (e) {
        setCriticalAlerts([]);
      }
    };
    fetchCritical();
  }, []);
  const location = useLocation();

  // Add this class name logic
  const mainClassName = location.pathname.includes("result")
    ? "main-lake-page"
    : "main-lake-page lakes-main";

  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  // Add these state variables
  const [userSubscribed, setUserSubscribed] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);

  const navigate = useNavigate();

  // Add state for selected lake
  const [selectedLake, setSelectedLake] = useState<mylakes | null>(null);

  const [recentPurchases, setRecentPurchases] = useState([]);
  const [recentPurchasesLoading, setRecentPurchasesLoading] = useState(false);
  const [recentPurchasesError, setRecentPurchasesError] = useState(null);
  const [selectedLayer, setSelectedLayer] = useState("CartoDB.Voyager");
  const tileLayers = {
    carto: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    osm: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    esri: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  };// ...existing code...

  // Add this state to track which tooltip is open
  const [openTooltip, setOpenTooltip] = useState<string | null>(null);

  // Helper to get names as comma-separated string
  const getNamesString = (type: "user" | "admin" | "subscriber") => {
    if (!lakeData?.comunityMembersDto) return "";
    if (type === "user") return (lakeData.comunityMembersDto.userNames || []).join(", ");
    if (type === "admin") return (lakeData.comunityMembersDto.adminNames || []).join(", ");
    if (type === "subscriber") return (lakeData.comunityMembersDto.subscriberNames || []).join(", ");
    return "";
  };

  // In your state, add:
  const [communityMembers, setCommunityMembers] = useState<{
    userCount: number;
    adminCount: number;
    subscriberCount: number;
  }>({ userCount: 0, adminCount: 0, subscriberCount: 0 });


  // Fetch lake overview and alert levels
  useEffect(() => {
    const fetchLakeOverview = async () => {
      if (!lakePulseId) return;

      try {
        setLoading(true);
        const data = await getLakeOverviewById(parseInt(lakePulseId));

        // Keep existing data setting
        setLakeData({
          lakePulseId: data.lakeOverview.lakePulseId,
          lakeName: data.lakeOverview.lakeName,
          lakeState: data.lakeOverview.lakeState,
          lakeLatitude: data.lakeOverview.lakeLatitude,
          lakeLongitude: data.lakeOverview.lakeLongitude,
          lakeCounty: data.lakeOverview.lakeCounty,
          lakeAreaAcres: data.lakeOverview.lakeAreaAcres,
          sensorLocations: data.sensorLocations || [],
          comunityMembersDto: data.comunityMembersDto,
        });

        // Add sensor locations
        setSensorLocations(data.sensorLocations || []);

        // Keep existing location identifier extraction
        const locations = uniq(
          data.lakeCharacteristicList
            .map((char) => char.locationIdentifier)
            .filter(Boolean)
        );
        setLocationIdentifiers(locations);

        if (locations.length > 0) {
          setSelectedLocation(locations[0]);
        }

        setCharacteristics(data.lakeCharacteristicList);
        // Set community member counts from API response
        if (data.comunityMembersDto) {
          setCommunityMembers({
            userCount: data.comunityMembersDto.userCount || 0,
            adminCount: data.comunityMembersDto.adminCount || 0,
            subscriberCount: data.comunityMembersDto.subscriberCount || 0,
          });
        }
      } catch (error) {
        console.error(
          APP_STRINGS.OVERVIEW_LABELS.ERROR_FETCHING_LAKE_OVERVIEW,
          error
        );
        setError(APP_STRINGS.SEARCH_BY_MAP.ERROR_FETCH);
      } finally {
        setLoading(false);
      }
    };
    const fetchAndStoreLevels = async () => {
      try {
        const levels = await getAlertLevels();
        localStorage.setItem("alertLevels", JSON.stringify(levels));
      } catch (error) {
        console.error("Failed to fetch alert levels", error);
      }
    };
    fetchAndStoreLevels();

    fetchLakeOverview();
  }, [lakePulseId]);
  // get level info
  const getLevelInfo = (levelId: number) => {
    try {
      const levels = JSON.parse(localStorage.getItem("alertLevels") || "[]");
      return levels.find((lvl: any) => lvl.id === levelId);
    } catch {
      return null;
    }
  };
  // Fetch weather data
  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!lakeData?.lakeLatitude || !lakeData?.lakeLongitude) return;

      setWeatherLoading(true);
      try {
        const data = await getWeatherForLocation(
          lakeData.lakeLatitude,
          lakeData.lakeLongitude
        );

        // Ensure periods are in local timezone and start from today
        if (data.forecast?.properties?.periods) {
          const localTimezone =
            Intl.DateTimeFormat().resolvedOptions().timeZone;
          const today = getLocalMidnight(new Date());

          // Filter and sort periods to start from today
          data.forecast.properties.periods = data.forecast.properties.periods
            .filter((period) => {
              const periodDate = new Date(period.endTime);
              return getLocalMidnight(periodDate) >= today;
            })
            .map((period) => ({
              ...period,
              startTime: new Date(period.endTime).toLocaleString("en-US", {
                timeZone: localTimezone,
              }),
            }));
        }

        setWeatherData(data);
      } catch (error) {
        console.error(
          APP_STRINGS.OVERVIEW_LABELS.ERROR_FETCHING_WEATHER_DATA,
          error
        );
      } finally {
        setWeatherLoading(false);
      }
    };

    if (lakeData) {
      fetchWeatherData();
    }
  }, [lakeData]);

  // Fetch characteristics
  useEffect(() => {
    const fetchCharacteristics = async () => {
      try {
        const characteristics = await getCharacteristics();
        const mappedCharacteristics = characteristics.reduce(
          (acc, char) => ({
            ...acc,
            [char.characteristicId]: char,
          }),
          {}
        );
        setCharacteristicsMap(mappedCharacteristics);
      } catch (error) {
        console.error(
          APP_STRINGS.OVERVIEW_LABELS.ERROR_FETCHING_CHARACTERISTICS,
          error
        );
      }
    };

    fetchCharacteristics();
  }, []);

  // Fetch favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!lakePulseId) return;
      const userDataStr = localStorage.getItem("idToken");
      if (!userDataStr) return;
      const userData = JSON.parse(userDataStr);
      const userId =
        userData.profile?.sub || userData.profile?.["cognito:username"];

      try {
        const favorites = await getFavoriteCharacteristics(userId, lakePulseId);
        setSelectedMetrics(favorites.map((f) => f.resultCharacteristic));
        localStorage.setItem(
          "selectedMetrics",
          JSON.stringify(favorites.map((f) => f.resultCharacteristic))
        );

        // Create chart entries for all favorites, even if no data
        const chartPromises = favorites.map(async (metricId) => {
          const chartPoints = await getCharacteristicChart(
            lakePulseId,
            metricId.resultCharacteristic,
            7
          );

          return {
            id: metricId.resultCharacteristic,
            data: chartPoints.map((point) => ({
              x: new Date(point.activityStartDate).toLocaleDateString(),
              y: point.resultMeasure,
            })),
            characteristicName:
              characteristicsMap[metricId.resultCharacteristic]
                ?.characteristicName,
          };
        });
        const chartPromisesLake = favorites.map(async (metricId) => {
          const chartPoints = await getCharacteristicChart(
            lakePulseId!,
            metricId.resultCharacteristic,
            1460
          );
          return chartPoints.map((point) => ({
            ...point,
            metricId: metricId.resultCharacteristic,
          }));
        });

        const allChartData = await Promise.all(chartPromises);
        setChartData(allChartData);
        const allChartDataLake = await Promise.all(chartPromisesLake);
        setChartLakeData(allChartDataLake);

        // Keep all chart entries, even empty ones
        localStorage.setItem(
          `chartData_${lakePulseId}`,
          JSON.stringify(allChartData)
        );
      } catch (error) {
        console.error(
          APP_STRINGS.OVERVIEW_LABELS.ERROR_FETCHING_FAVORITES,
          error
        );
      }
    };

    // Load stored chart data first
    const storedChartData = localStorage.getItem(`chartData_${lakePulseId}`);
    if (storedChartData) {
      setChartData(JSON.parse(storedChartData));
    }

    fetchFavorites();
  }, [lakePulseId, characteristicsMap]);

  // Update localStorage when chart data changes
  useEffect(() => {
    if (lakePulseId && chartData.length > 0) {
      localStorage.setItem(
        `chartData_${lakePulseId}`,
        JSON.stringify(chartData)
      );
    }
  }, [chartData, lakePulseId]);

  useEffect(() => {
    const storedMetrics = localStorage.getItem("selectedMetrics");
    if (storedMetrics) {
      setSelectedMetrics(JSON.parse(storedMetrics));
    }
  }, []);

  // Add useEffect for fetching characteristic units
  useEffect(() => {
    const fetchCharacteristicUnits = async () => {
      try {
        const response = await getCharacteristics();
        if (Array.isArray(response)) {
          const unitMap = response.reduce(
            (acc, char) => ({
              ...acc,
              [char.characteristicId]: char.characteristicUnits || "",
            }),
            {}
          );
          setCharacteristicUnits(unitMap);
        }
      } catch (error) {
        console.error(
          APP_STRINGS.OVERVIEW_LABELS.ERROR_FETCHING_CHARACTERISTICS,
          error
        );
      }
    };

    fetchCharacteristicUnits();
  }, []);

 

  useEffect(() => {
    const fetchMyLakes = async () => {
      try {
      

        // For Super Admin, find the lake that matches the current lakeId or lastViewedLake
        if (userRole === "Super Admin") {
          const lastViewedLakeId = localStorage.getItem("lastViewedLake");
          // Convert both IDs to strings for comparison
          const targetLakeId = String(lakePulseId || lastViewedLakeId);
          const currentLake = lakes.find(lake => {
            const lakeId = String(lake.lakePulseId);
            return lakeId === targetLakeId;
          });

          if (currentLake) {
            setSelectedLake(currentLake);
          }
        }
      } catch (error) {
        console.error("Error fetching my lakes:", error);
      }
    };

    fetchMyLakes();
  }, [lakePulseId, userRole]);

  useEffect(() => {
    if ((userRole === 'Super Admin' || userSubscribed) && lakeData?.lakePulseId) {
      setRecentPurchasesLoading(true);
      setRecentPurchasesError(null);
      getRecentToolboxPurchases(lakeData.lakePulseId)
        .then((data) => setRecentPurchases(data))
        .catch((err) => setRecentPurchasesError(err.message || 'Error loading purchases'))
        .finally(() => setRecentPurchasesLoading(false));
    }
  }, [userRole, userSubscribed, lakeData?.lakePulseId]);

  const getStatusColor = (
    characteristic: LakeCharacteristic,
    characteristicsMap: Record<string, Characteristic>
  ) => {
    const charMapping = characteristicsMap[characteristic.resultCharacteristic];
    if (!charMapping) return "status-gray";

    const value = characteristic.resultMeasure;
    const boundType = charMapping.boundType;

    // If no bound type or N type, return gray
    if (!boundType || boundType === "N") {
      return "status-gray";
    }

    switch (boundType) {
      case "L": // Lower is better
        if (value < charMapping.lowerBound) return "status-green";
        if (value > charMapping.upperBound) return "status-red";
        return "status-yellow";

      case "H": // Higher is better
        if (value < charMapping.lowerBound) return "status-red";
        if (value > charMapping.upperBound) return "status-green";
        return "status-yellow";

      case "M": // Middle is better
        if (value < charMapping.lowerBound || value > charMapping.upperBound)
          return "status-red";
        return "status-green";

      default:
        return "status-gray";
    }
  };

  // Update the filtered characteristics to include units
  const filteredCharacteristics = useMemo(() => {
    if (!selectedLocation) return characteristics;

    return characteristics
      .filter((char) => char.locationIdentifier === selectedLocation)
      .map((char) => ({
        ...char,
        resultMeasureUnit:
          characteristicUnits[char.resultCharacteristic] ||
          char.resultMeasureUnit ||
          "",
      }));
  }, [characteristics, selectedLocation, characteristicUnits]);

  // Add this function after the other state declarations
  const refreshNotes = async () => {
    if (!lakePulseId) return;

    try {
      const response = await getFieldNotesByLakeId(lakePulseId, 1, 100, userId);
      console.log("API notes response:", response); // <-- Add this
      if (Array.isArray(response)) {
        const sortedNotes = response.sort(
          (a, b) =>
            new Date(b.createdTime).getTime() -
            new Date(a.createdTime).getTime()
        );
        setNotes(sortedNotes.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
      setNotes([]);
    }
  };

  // Update the useEffect to use the refreshNotes function
  useEffect(() => {
    refreshNotes();
  }, [lakePulseId]);

  // Add event listener for custom event
  useEffect(() => {
    const handleNoteAdded = () => {
      refreshNotes();
    };

    window.addEventListener("noteAdded", handleNoteAdded);

    return () => {
      window.removeEventListener("noteAdded", handleNoteAdded);
    };
  }, []);

  // Add this function to check if user has selected lakes
  const checkForSelectedLakes = async () => {
    try {
      const lakes = await getMyLakes();
      return lakes && lakes.length > 0;
    } catch (error) {
      console.error("Error checking selected lakes:", error);
      return false;
    }
  };

  // Update the handleProceedToCheckout function
  const handleProceedToCheckout = async () => {
    if (!checkoutUrl) {
      console.error("No checkout URL available");
      return;
    }

    try {
      // Check if user has selected lakes
      const hasSelectedLakes = await checkForSelectedLakes();

      // Store the current lake ID for post-subscription redirect
      if (lakePulseId) {
        localStorage.setItem("lastViewedLake", lakePulseId);
      }

      // Store the subscription return path
      localStorage.setItem(
        "subscriptionReturnPath",
        hasSelectedLakes
          ? lakePulseId
            ? `/lake/${lakePulseId}`
            : "/search/name"
          : "/search/name"
      );

      // Validate URL before redirecting
      new URL(checkoutUrl);
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Invalid checkout URL:", checkoutUrl);
    }
  };

  // Update the handleCheckoutClick function
  const handleCheckoutClick = async () => {
    try {
      const userProfileStr = localStorage.getItem("currentUserProfile");
      if (!userProfileStr) {
        console.error("User profile not found");
        return;
      }

      const userProfile = JSON.parse(userProfileStr);
      const email = userProfile.email;

      const url = await getShopifyCheckoutUrl(email, "57197622198621");

      if (url && url.startsWith("http")) {
        setCheckoutUrl(url);
        setShowCheckoutDialog(true);
      } else {
        console.error("Invalid checkout URL received:", url);
      }
    } catch (error) {
      console.error("Error getting checkout URL:", error);
    }
  };

  // Add this function to handle subscription check
  const handleCheckSubscription = async () => {
    try {
      setIsCheckingSubscription(true);
      const userProfileStr = localStorage.getItem("currentUserProfile");

      if (!userProfileStr) {
        console.error("User profile not found");
        return;
      }

      const userProfile = JSON.parse(userProfileStr);
      const subscriptionStatus = await checkUserSubscriptionStatus(
        userProfile.sub
      );

      if (subscriptionStatus === true) {
        setUserSubscribed(true);
        localStorage.setItem("userSubscribed", "true");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    } finally {
      setIsCheckingSubscription(false);
    }
  };

  // Add this useEffect to check for saved subscription status
  useEffect(() => {
    const savedSubscriptionStatus = localStorage.getItem("userSubscribed");
    if (savedSubscriptionStatus === "true") {
      setUserSubscribed(true);
    }
  }, []);

  // When changing lakes or loading a lake
  useEffect(() => {
    if (lakePulseId) {
      localStorage.setItem('lastViewedLake', lakePulseId);
      // Dispatch event to notify header
      window.dispatchEvent(new Event('lakeChanged'));
    }
  }, [lakePulseId]);

  if (loading) return <div>{APP_STRINGS.LOADING}</div>;
  if (error)
    return (
      <div>
        {APP_STRINGS.ERROR_PREFIX} {error}
      </div>
    );
  if (!lakeData) return <div>{APP_STRINGS.SEARCH_BY_MAP.ERROR_FETCH}</div>;
  /**
   * Toggles favorite status for a metric
   */
  const toggleFavorite = async (characteristic: LakeCharacteristic) => {
    const metricName = characteristic.resultCharacteristic;

    if (loadingStars.has(metricName)) return;

    const userDataStr = localStorage.getItem("idToken");
    if (!userDataStr) {
      setError(APP_STRINGS.LOGIN_REQUIRED);
      return;
    }

    const userData = JSON.parse(userDataStr);
    const userId =
      userData.profile?.sub || userData.profile?.["cognito:username"];

    try {
      // Set loading state for this specific star
      setLoadingStars((prev) => new Set([...prev, metricName]));

      if (selectedMetrics.includes(metricName)) {
        // Remove from favorites
        setSelectedMetrics((prev) =>
          prev.filter((name) => name !== metricName)
        );
        setChartData((prev) => prev.filter((d) => d.id !== metricName));
        setChartLakeData((prev) =>
          prev.filter((chart) =>
            chart.every((point) => point.metricId !== metricName)
          )
        );
        localStorage.setItem(
          "selectedMetrics",
          JSON.stringify(selectedMetrics.filter((m) => m !== metricName))
        );

        await removeFavoriteCharacteristic(userId, lakePulseId!, metricName);
      } else {
        // Add to favorites
        setSelectedMetrics((prev) => [...prev, metricName]);
        localStorage.setItem(
          "selectedMetrics",
          JSON.stringify([...selectedMetrics, metricName])
        );

        // Make API calls in parallel
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, chartPoints] = await Promise.all([
          addFavoriteCharacteristic(userId, lakePulseId!, metricName),
          getCharacteristicChart(lakePulseId!, metricName, 4 * 365),
        ]);

        // Update chart data
        const newChartData: ChartDataWithMetadata = {
          id: metricName,
          data: chartPoints.map((point) => ({
            x: new Date(point.activityStartDate).toLocaleDateString(),
            y: point.resultMeasure,
          })),
          characteristicName:
            characteristicsMap[metricName]?.characteristicName,
        };
        setChartData((prev) => [...prev, newChartData]);

        // Update chartLakeData
        const newChartLakeData = chartPoints.map((point) => ({
          ...point,
          metricId: metricName,
        }));
        setChartLakeData((prev) => [...prev, newChartLakeData]);

        // Update chart durations
        setChartDurations((prev) => ({
          ...prev,
          [metricName]: 4,
        }));
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Revert changes on error
      if (selectedMetrics.includes(metricName)) {
        setSelectedMetrics((prev) => prev.filter((m) => m !== metricName));
        setChartData((prev) => prev.filter((d) => d.id !== metricName));
        setChartLakeData((prev) =>
          prev.filter((chart) =>
            chart.every((point) => point.metricId !== metricName)
          )
        );
      } else {
        setSelectedMetrics((prev) => [...prev, metricName]);
      }
      localStorage.setItem("selectedMetrics", JSON.stringify(selectedMetrics));
    } finally {
      // Remove loading state
      setLoadingStars((prev) => {
        const next = new Set(prev);
        next.delete(metricName);
        return next;
      });
    }
  };

  if (!lakeData) {
    return <div>{APP_STRINGS.SEARCH_BY_MAP.ERROR_FETCH}</div>;
  }
  // Update the weather data section
  const formatTemperature = (temp: number, unit: string) => {
    // Convert to Fahrenheit if needed
    if (unit.toLowerCase() === "f") {
      return `${temp}°F`;
    }
    // Convert Fahrenheit to Celsius
    const celsius = Math.round(((temp - 32) * 5) / 9);
    return `${celsius}°C`;
  };

  const formatNumber = (num: number): string => {
    // For US number format (e.g., 123,456,789)
    return num.toLocaleString("en-US");
  };





  // Add null checks and default values for numeric fields
  const handleLakeData = (lakeData: any) => {
    return {
      ...lakeData,
      // Add default values (0) for any numeric fields that could be null
      latitude: lakeData.lakeLatitude ?? 0,
      longitude: lakeData.lakeLongitude ?? 0,
      area: lakeData.lakeAreaAcres ?? 0,
      depth: 0, // Assuming depth is not available in the provided data
      elevation: 0, // Assuming elevation is not available in the provided data
      // Add any other numeric fields that could be null
    };
  };

  return (
    <div className={mainClassName}>
     
      <main className="lake-page-container">
        <div className="lake-page-content">
          <div className="map-container-large">
            <div className="map-container" style={{ position: "relative" }}>
              {/* Layer Dropdown Overlay */}
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  zIndex: 1000,
                  backgroundColor: "white",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                  maxHeight: "300px",
                  overflowY: "auto",
                }}
              >
                <label htmlFor="layer-select">Map Layer:</label>
                <select
                  id="layer-select"
                  value={selectedLayer}
                  onChange={(e) => setSelectedLayer(e.target.value)}
                >
                  {allProviders.map((provider) => (
                    <option key={provider} value={provider}>
                      {providerLabels[provider] || provider} {/* Use the label mapping */}
                    </option>
                  ))}
                </select>
              </div>

              <MapContainer
                center={[lakeData.lakeLatitude, lakeData.lakeLongitude]}
                zoom={13}
                {...(selectedLayer !== "CartoDB.Voyager" && { minZoom: 3, maxZoom: 16 })}
                style={{ width: "100%", height: "100%" }}
                zoomControl={false}
              >
                <TileLayerControl selectedProvider={selectedLayer} />
                <ZoomControl position="bottomleft" />

                {((userRole === "User" && userSubscribed) || userRole === "Super Admin") &&
                  sensorLocations.map((location, index) => (
                    <Marker
                      key={`${location.locationIdentifier}-${index}`}
                      position={[location.sensorLatitude, location.sensorLongitude]}
                      icon={L.divIcon({
                        html: `<i class="fa-thin fa-sensor sensor-icon"></i>`,
                        className: "sensor-marker",
                        iconSize: [24, 24],
                      })}
                    >
                      <Popup className="sensor-popup">
                        <div>
                          <label>Lake Name</label>
                          <strong>{lakeData.lakeName}</strong>
                          <label>Sensor Name</label>
                          <strong>{location.locationIdentifier}</strong>
                          <label>Location</label>
                          <strong>{location.locationName}</strong>
                          <label>Latest Activity</label>
                          <strong>{location.maxActivityStartDate}</strong>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
              </MapContainer>

              <div className="lake-name">
                {lakeData.lakeName}, {lakeData.lakeState}
              </div>
            </div>

            {userRole === "User" && userSubscribed && (
              <div className="lake-sections-container">
                <div className="lake-section overview">
                  <h2>{APP_STRINGS.LAKE_OVERVIEW}</h2>
                  <div className="lake-overview-grid">
                    <div className="lake-overview-item">
                      <span className="lake-overview-label">
                        {APP_STRINGS.OVERVIEW_LABELS.NAME}
                      </span>
                      <span className="lake-overview-value">
                        {lakeData.lakeName}
                      </span>
                    </div>
                    <div className="lake-overview-item">
                      <span className="lake-overview-label">
                        {APP_STRINGS.OVERVIEW_LABELS.COUNTY}
                      </span>
                      <span className="lake-overview-value">
                        {lakeData.lakeCounty || APP_STRINGS.N_A}
                      </span>
                    </div>
                    <div className="lake-overview-item">
                      <span className="lake-overview-label">
                        {APP_STRINGS.OVERVIEW_LABELS.STATE}
                      </span>
                      <span className="lake-overview-value">
                        {lakeData.lakeState}
                      </span>
                    </div>
                    <div className="lake-overview-item">
                      <span className="lake-overview-label">
                        {APP_STRINGS.OVERVIEW_LABELS.ACREAGE}
                      </span>
                      <span className="lake-overview-value">
                        {lakeData.lakeAreaAcres
                          ? Number(lakeData.lakeAreaAcres).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
                          : APP_STRINGS.N_A}
                      </span>
                    </div>
                    <div className="lake-overview-item">
                      <span className="lake-overview-label">
                        {APP_STRINGS.OVERVIEW_LABELS.LAT_LONG}
                      </span>
                      <span className="lake-overview-value">{`${lakeData.lakeLatitude}, ${lakeData.lakeLongitude}`}</span>
                    </div>
                    <div className="lake-overview-item">
                      <span className="lake-overview-label">
                        {APP_STRINGS.LATEST_DATA_COLLECTION}
                      </span>
                      <span className="lake-overview-value">
                        {lakes[0]?.recentDataCollection || 0}
                      </span>
                    </div>
                    <div className="lake-overview-item">
                      <span className="lake-overview-label">
                        {APP_STRINGS.SAMPLING_LOCATIONS}
                      </span>
                      <span className="lake-overview-value">
                        {lakes[0]?.totalStations || 0}
                      </span>
                    </div>
                    <div className="lake-overview-item">
                      <span className="lake-overview-label">
                        {APP_STRINGS.TOTAL_SAMPLES}
                      </span>
                      <span className="lake-overview-value">
                        {formatNumberLake(lakes[0]?.totalSamples || 0)}
                      </span>
                    </div>
                    <div className="lake-overview-item">
                      <span className="lake-overview-label">
                        {APP_STRINGS.SPAN_YEARS}
                      </span>
                      <span className="lake-overview-value">
                        {lakes[0]?.spanYears || 0}
                      </span>
                    </div>
                    {/* Hide Lake Type
                  <div>
                    <div className="lake-overview-item">
                      <span className="lake-overview-label">{APP_STRINGS.LAKE_TYPE}</span>
                      <span className="lake-overview-value"></span>
                    </div>
                  </div>
                  */}
                  </div>
                  <div className="community-info">
                    <h2>{APP_STRINGS.COMMUNITY_INFORMATION}</h2>

                    <div className="lake-overview-grid">


                      <div className="lake-overview-item"

                      >
                        <span className="lake-overview-label">
                          {APP_STRINGS.COMMUNITY_MEMBERS}
                        </span>
                        <span className="lake-overview-value" onMouseEnter={() => setOpenTooltip("user")}
                          onMouseLeave={() => setOpenTooltip(null)}
                          style={{ position: "relative" }}>
                          {communityMembers.userCount || 0}
                          {openTooltip === "user" && (
                            <div className="info-tooltip" style={{
                              position: "absolute",
                              left: '100%',
                              top: 20,
                              minWidth: 120,
                              width: 200,
                              display: 'block',
                              textTransform: 'capitalize',
                            }}>
                              {getNamesString("user") || "No Members"}
                            </div>
                          )}
                        </span>

                      </div>
                      <div className="lake-overview-item"

                      >
                        <span className="lake-overview-label">
                          {APP_STRINGS.SUBSCRIBERS}
                        </span>
                        <span className="lake-overview-value" onMouseEnter={() => setOpenTooltip("subscriber")}
                          onMouseLeave={() => setOpenTooltip(null)}
                          style={{ position: "relative" }}>
                          {communityMembers.subscriberCount || 0}
                          {openTooltip === "subscriber" && (
                            <div className="info-tooltip" style={{
                              position: "absolute",
                              left: '100%',
                              top: 20,
                              minWidth: 120,
                              width: 200,
                              display: 'block',
                              textTransform: 'capitalize',
                            }}>
                              {getNamesString("subscriber") || "No Subscribers"}
                            </div>
                          )}
                        </span>

                      </div>
                      <div className="lake-overview-item"

                      >
                        <span className="lake-overview-label">
                          {APP_STRINGS.COMMUNITY_ADMINS}
                        </span>
                        <span className="lake-overview-value" onMouseEnter={() => setOpenTooltip("admin")}
                          onMouseLeave={() => setOpenTooltip(null)}
                          style={{ position: "relative" }}>
                          {communityMembers.adminCount || 0}
                          {openTooltip === "admin" && (
                            <div className="info-tooltip" style={{
                              position: "absolute",
                              left: '100%',
                              top: 20,
                              minWidth: 120,
                              width: 200,
                              display: 'block',
                              textTransform: 'capitalize',
                            }}>
                              {getNamesString("admin") || "No Admins"}
                            </div>
                          )}
                        </span>

                      </div>



                    </div>
                  </div>
                  {/* Hide other sections
                <h2>{APP_STRINGS.HYDROLOGY}</h2>
                <div>
                  <div className="lake-overview-item">
                    <span className="lake-overview-label">{APP_STRINGS.PRECIPITATION}</span>
                    <span className="lake-overview-value"></span>
                  </div>
                  <div className="lake-overview-item">
                    <span className="lake-overview-label">{APP_STRINGS.EVAPORATION}</span>
                    <span className="lake-overview-value"></span>
                  </div>
                  <div className="lake-overview-item">
                    <span className="lake-overview-label"> {APP_STRINGS.SURFACE_INFLOW} </span>
                    <span className="lake-overview-value"></span>
                  </div>
                  <div className="lake-overview-item">
                    <span className="lake-overview-label"> {APP_STRINGS.SURFACE_OUTFLOW} </span>
                    <span className="lake-overview-value"></span>
                  </div>
                  <div className="lake-overview-item">
                    <span className="lake-overview-label"> {APP_STRINGS.GROUNDWATER_INSEEPAGE} </span>
                    <span className="lake-overview-value"></span>
                  </div>
                  <div className="lake-overview-item">
                    <span className="lake-overview-label"> {APP_STRINGS.GROUNDWATER_OUTSEEPAGE} </span>
                    <span className="lake-overview-value"></span>
                  </div>
                  <div className="lake-overview-item">
                    <span className="lake-overview-label"> {APP_STRINGS.DETENTION_TIME} </span>
                    <span className="lake-overview-value"></span>
                </div>
                <div className="lake-overview-item">
                    <span className="lake-overview-label"> {APP_STRINGS.WATER_LEVEL_AGE_RANGE} </span>
                    <span className="lake-overview-value"></span>
                  </div>
                </div>

                <h2>{APP_STRINGS.WATERSHED}</h2>
                <div>
                  <div className="lake-overview-item">
                    <span className="lake-overview-label"> {APP_STRINGS.WATERSHED_AREA} </span>
                    <span className="lake-overview-value"></span>
                  </div>
                  <div className="lake-overview-item">
                    <span className="lake-overview-label"> {APP_STRINGS.NATURAL_LAND_USE} </span>
                    <span className="lake-overview-value"></span>
                  </div>
                  <div className="lake-overview-item">
                    <span className="lake-overview-label"> {APP_STRINGS.URBANIZED_LAND_USE} </span>
                    <span className="lake-overview-value"></span>
                  </div>
                  <div className="lake-overview-item">
                    <span className="lake-overview-label"> {APP_STRINGS.AGRICULTURAL_LAND_USE} </span>
                    <span className="lake-overview-value"></span>
                  </div>
                  <div className="lake-overview-item">
                    <span className="lake-overview-label"> {APP_STRINGS.SOIL_CLASS} </span>
                    <span className="lake-overview-value"></span>
                  </div>
                  <div className="lake-overview-item">
                    <span className="lake-overview-label"> {APP_STRINGS.VEGETATIVE_COVER} </span>
                    <span className="lake-overview-value"></span>
                  </div>
                  <div className="lake-overview-item">
                    <span className="lake-overview-label"> {APP_STRINGS.IMPERVIOUS_SURFACE_COVER} </span>
                    <span className="lake-overview-value"></span>
                </div>
                <div className="lake-overview-item">
                    <span className="lake-overview-label"> {APP_STRINGS.RUNOFF_GENERATION} </span>
                    <span className="lake-overview-value"></span>
                  </div>
                </div>

                <h2>{APP_STRINGS.ACCESS}</h2>
                <div>
                  <div className="lake-overview-item">
                    <span className="lake-overview-label">{APP_STRINGS.BOAT_LANDINGS}</span>
                    <span className="lake-overview-value"></span>
                  </div>
                  <div className="lake-overview-item">
                    <span className="lake-overview-label">{APP_STRINGS.SWIMMING_BEACHES}</span>
                    <span className="lake-overview-value"></span>
                  </div>
                  <div className="lake-overview-item">
                    <span className="lake-overview-label">{APP_STRINGS.MARINAS}</span>
                    <span className="lake-overview-value"></span>
                </div>
                <div className="lake-overview-item">
                    <span className="lake-overview-label">{APP_STRINGS.UNDEVELOPED_ACCESS_POINTS}</span>
                    <span className="lake-overview-value"></span>
                  </div>
                </div>

                <h2>{APP_STRINGS.CONTAINTMENT_LOADING}</h2>
                <div>
                  <div className="lake-overview-item">
                    <span className="lake-overview-label">{APP_STRINGS.PHOSPHORUS_LOAD}</span>
                    <span className="lake-overview-value"></span>
                  </div>
                  <div className="lake-overview-item">
                    <span className="lake-overview-label">{APP_STRINGS.NITROGEN_LOAD}</span>
                    <span className="lake-overview-value"></span>
                  </div>
                  <div className="lake-overview-item">
                    <span className="lake-overview-label">{APP_STRINGS.SEDIMENT_LOAD}</span>
                    <span className="lake-overview-value"></span>
                </div>
                <div className="lake-overview-item">
                    <span className="lake-overview-label">{APP_STRINGS.OTHER}</span>
                    <span className="lake-overview-value"></span>
                  </div>
                </div>
                */}
                </div>

                <div className="lake-section">
                  <div className="lake-header">
                    <h2>{APP_STRINGS.HOW_IS_MY_LAKE}</h2>
                    <div className="info-icon-wrapper">
                      <i className="fa-light fa-circle-info"></i>
                      <div className="info-tooltip">
                        {APP_STRINGS.CHARACTERISTICS.INFO_TOOLTIP}
                      </div>
                    </div>
                  </div>
                  <div className="lake-subtitle-container">
                    <div className="characteristic-subtitle">
                      {APP_STRINGS.OVERVIEW_LABELS.CHARACTERISTIC_SUBTITLE}
                    </div>
                    <div className="location-menu">
                      {APP_STRINGS.SELECT_LOCATION}
                    </div>
                    {locationIdentifiers.length > 0 && (
                      <select
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
                      >
                        {locationIdentifiers.map((location) => (
                          <option key={location} value={location}>
                            {location}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="lake-metrics">
                    {filteredCharacteristics.map((char, index) => (
                      <div key={index} className="metric-row">
                        {loadingStars.has(char.resultCharacteristic) ? (
                          <i className="fa-thin fa-spinner fa-spin metric-star"></i>
                        ) : selectedMetrics.includes(
                          char.resultCharacteristic
                        ) ? (
                          <i
                            className="fa fa-star metric-star blue"
                            onClick={() => toggleFavorite(char)}
                          ></i>
                        ) : (
                          <i
                            className="fa-light fa-star metric-star"
                            onClick={() => toggleFavorite(char)}
                          ></i>
                        )}
                        <div
                          className={`metric-status ${getStatusColor(
                            char,
                            characteristicsMap
                          )}`}
                          title={
                            characteristicsMap[char.resultCharacteristic]
                              ?.characteristicDescription
                          }
                        />
                        <div
                          className="metric-name"
                          title={
                            characteristicsMap[char.resultCharacteristic]
                              ?.characteristicDescription ||
                            char.resultCharacteristic
                          }
                        >
                          {characteristicsMap[char.resultCharacteristic]
                            ?.characteristicName || char.resultCharacteristic}
                        </div>
                        <div className="metric-value">
                          {Number(char.resultMeasure).toFixed(2)}
                          {char.resultMeasureUnit &&
                            ` ${char.resultMeasureUnit}`}
                        </div>
                        <div className="metric-date">
                          (
                          {(() => {
                            const formattedDate = formatActivityDate(
                              char.activityStartDate
                            );

                            return formattedDate;
                          })()}
                          )
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lake-section">
                  <h2>
                    {APP_STRINGS.RECENT_TRENDS}
                    <Link
                      to={`/lake/${lakePulseId}/results`}
                      state={{ selectedMetrics }}
                      className="go-to-results"
                    >
                      {APP_STRINGS.GO_TO_RESULTS} <span>{">"}</span>
                    </Link>
                  </h2>
                  {chartLakeData.slice(0, 2).map((chart, index) => (
                    <ChartResults
                      key={index}
                      chartData={chart}
                      characteristicsMap={characteristicsMap}
                      lakePulseId={lakePulseId!}
                      onTimeRangeChange={() => { }}
                    />
                  ))}
                </div>
              </div>
            )}
            {(userRole === "Super Admin" || userRole === "Admin") && (
              <div className="lake-sections-container">
                <div className="lake-section overview">
                  <h2>{APP_STRINGS.LAKE_OVERVIEW}</h2>
                  <div className="lake-overview-grid">
                    <div className="lake-overview-item">
                      <span className="lake-overview-label">
                        {APP_STRINGS.OVERVIEW_LABELS.NAME}
                      </span>
                      <span className="lake-overview-value">
                        {lakeData.lakeName}
                      </span>
                    </div>
                    <div className="lake-overview-item">
                      <span className="lake-overview-label">
                        {APP_STRINGS.OVERVIEW_LABELS.COUNTY}
                      </span>
                      <span className="lake-overview-value">
                        {lakeData.lakeCounty || APP_STRINGS.N_A}
                      </span>
                    </div>
                    <div className="lake-overview-item">
                      <span className="lake-overview-label">
                        {APP_STRINGS.OVERVIEW_LABELS.STATE}
                      </span>
                      <span className="lake-overview-value">
                        {lakeData.lakeState}
                      </span>
                    </div>
                    <div className="lake-overview-item">
                      <span className="lake-overview-label">
                        {APP_STRINGS.OVERVIEW_LABELS.ACREAGE}
                      </span>
                      <span className="lake-overview-value">
                        {lakeData.lakeAreaAcres
                          ? Number(lakeData.lakeAreaAcres).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
                          : APP_STRINGS.N_A}
                      </span>
                    </div>
                    <div className="lake-overview-item">
                      <span className="lake-overview-label">
                        {APP_STRINGS.OVERVIEW_LABELS.LAT_LONG}
                      </span>
                      <span className="lake-overview-value">
                        {lakeData.lakeAreaAcres
                          ? Number(lakeData.lakeAreaAcres).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
                          : APP_STRINGS.N_A}
                      </span>
                    </div>
                    <div>
                      <div className="lake-overview-item">
                        <span className="lake-overview-label">
                          {APP_STRINGS.LATEST_DATA_COLLECTION}
                        </span>
                        <span className="lake-overview-value">
                          {userRole === "Super Admin"
                            ? selectedLake?.recentDataCollection || 0
                            : lakes[0]?.recentDataCollection || 0}
                        </span>
                      </div>
                      <div className="lake-overview-item">
                        <span className="lake-overview-label">
                          {APP_STRINGS.SAMPLING_LOCATIONS}
                        </span>
                        <span className="lake-overview-value">
                          {userRole === "Super Admin"
                            ? selectedLake?.totalStations || 0
                            : lakes[0]?.totalStations || 0}
                        </span>
                      </div>

                      <div className="lake-overview-item">
                        <span className="lake-overview-label">
                          {APP_STRINGS.TOTAL_SAMPLES}
                        </span>
                        <span className="lake-overview-value">
                          {formatNumberLake(userRole === "Super Admin"
                            ? selectedLake?.totalSamples || 0
                            : lakes[0]?.totalSamples || 0)}
                        </span>
                      </div>
                      <div className="lake-overview-item">
                        <span className="lake-overview-label">
                          {APP_STRINGS.SPAN_YEARS}
                        </span>
                        <span className="lake-overview-value">
                          {userRole === "Super Admin"
                            ? selectedLake?.spanYears || 0
                            : lakes[0]?.spanYears || 0}
                        </span>
                      </div>
                      <div className="community-info">
                        <h2>{APP_STRINGS.COMMUNITY_INFORMATION}</h2>
                        <div className="lake-overview-grid">


                          <div className="lake-overview-item"

                          >
                            <span className="lake-overview-label">
                              {APP_STRINGS.COMMUNITY_MEMBERS}
                            </span>
                            <span className="lake-overview-value" onMouseEnter={() => setOpenTooltip("user")}
                              onMouseLeave={() => setOpenTooltip(null)}
                              style={{ position: "relative" }}>
                              {communityMembers.userCount || 0}
                              {openTooltip === "user" && (
                                <div className="info-tooltip" style={{
                                  position: "absolute",
                                  left: '100%',
                                  top: 20,
                                  minWidth: 120,
                                  width: 200,
                                  display: 'block',
                                  textTransform: 'capitalize',
                                }}>
                                  {getNamesString("user") || "No Members"}
                                </div>
                              )}
                            </span>

                          </div>
                          <div className="lake-overview-item"

                          >
                            <span className="lake-overview-label">
                              {APP_STRINGS.SUBSCRIBERS}
                            </span>
                            <span className="lake-overview-value" onMouseEnter={() => setOpenTooltip("subscriber")}
                              onMouseLeave={() => setOpenTooltip(null)}
                              style={{ position: "relative" }}>
                              {communityMembers.subscriberCount || 0}
                              {openTooltip === "subscriber" && (
                                <div className="info-tooltip" style={{
                                  position: "absolute",
                                  left: '100%',
                                  top: 20,
                                  minWidth: 120,
                                  width: 200,
                                  display: 'block',
                                  textTransform: 'capitalize',
                                }}>
                                  {getNamesString("subscriber") || "No Subscribers"}
                                </div>
                              )}
                            </span>

                          </div>
                          <div className="lake-overview-item"

                          >
                            <span className="lake-overview-label">
                              {APP_STRINGS.COMMUNITY_ADMINS}
                            </span>
                            <span className="lake-overview-value" onMouseEnter={() => setOpenTooltip("admin")}
                              onMouseLeave={() => setOpenTooltip(null)}
                              style={{ position: "relative" }}>
                              {communityMembers.adminCount || 0}
                              {openTooltip === "admin" && (
                                <div className="info-tooltip" style={{
                                  position: "absolute",
                                  left: '100%',
                                  top: 20,
                                  minWidth: 120,
                                  width: 200,
                                  display: 'block',
                                  textTransform: 'capitalize',
                                }}>
                                  {getNamesString("admin") || "No Admins"}
                                </div>
                              )}
                            </span>

                          </div>



                        </div>
                      </div>
                    </div>
                    {/* Hide Lake Type
                  <div>
                    <div className="lake-overview-item">
                      <span className="lake-overview-label">{APP_STRINGS.LAKE_TYPE}</span>
                      <span className="lake-overview-value"></span>
                    </div>
                  </div>
                  */}
                  </div>

                  {/* Hide other sections
                <h2>{APP_STRINGS.HYDROLOGY}</h2>
                <div>
                  <div className="lake-overview-item">
                    <span className="lake-overview-label">{APP_STRINGS.PRECIPITATION}</span>
                    <span className="lake-overview-value"></span>
                  </div>
                  <div className="lake-overview-item">
                    <span className="lake-overview-label">{APP_STRINGS.EVAPORATION}</span>
                    <span className="lake-overview-value"></span>
                  </div>
                  <div className="lake-overview-item">
                    <span className="lake-overview-label"> {APP_STRINGS.SURFACE_INFLOW} </span>
                    <span className="lake-overview-value"></span>
                  </div>
                  <div className="lake-overview-item">
                    <span className="lake-overview-label"> {APP_STRINGS.SURFACE_OUTFLOW} </span>
                    <span className="lake-overview-value"></span>
                  </div>
                  <div className="lake-overview-item">
                    <span className="lake-overview-label"> {APP_STRINGS.GROUNDWATER_INSEEPAGE} </span>
                    <span className="lake-overview-value"></span>
                  </div>
                  <div className="lake-overview-item">
                    <span className="lake-overview-label"> {APP_STRINGS.GROUNDWATER_OUTSEEPAGE} </span>
                    <span className="lake-overview-value"></span>
                  </div>
                  <div className="lake-overview-item">
                    <span className="lake-overview-label"> {APP_STRINGS.DETENTION_TIME} </span>
                    <span className="lake-overview-value"></span>
                </div>
                <div className="lake-overview-item">
                    <span className="lake-overview-label"> {APP_STRINGS.WATER_LEVEL_AGE_RANGE} </span>
                    <span className="lake-overview-value"></span>
                  </div>
                </div>

                <h2>{APP_STRINGS.WATERSHED}</h2>
                <div>
                  <div className="lake-overview-item">
                    <span className="lake-overview-label"> {APP_STRINGS.WATERSHED_AREA} </span>
                    <span className="lake-overview-value"></span>
                  </div>
                  <div className="lake-overview-item">
                    <span className="lake-overview-label"> {APP_STRINGS.NATURAL_LAND_USE} </span>
                    <span className="lake-overview-value"></span>
                  </div>
                  <div className="lake-overview-item">
                    <span className="lake-overview-label"> {APP_STRINGS.URBANIZED_LAND_USE} </span>
                    <span className="lake-overview-value"></span>
                  </div>
                  <div className="lake-overview-item">
                    <span className="lake-overview-label"> {APP_STRINGS.AGRICULTURAL_LAND_USE} </span>
                    <span className="lake-overview-value"></span>
                  </div>
                  <div className="lake-overview-item">
                    <span className="lake-overview-label"> {APP_STRINGS.SOIL_CLASS} </span>
                    <span className="lake-overview-value"></span>
                  </div>
                  <div className="lake-overview-item">
                    <span className="lake-overview-label"> {APP_STRINGS.VEGETATIVE_COVER} </span>
                    <span className="lake-overview-value"></span>
                  </div>
                  <div className="lake-overview-item">
                    <span className="lake-overview-label"> {APP_STRINGS.IMPERVIOUS_SURFACE_COVER} </span>
                    <span className="lake-overview-value"></span>
                </div>
                <div className="lake-overview-item">
                    <span className="lake-overview-label"> {APP_STRINGS.RUNOFF_GENERATION} </span>
                    <span className="lake-overview-value"></span>
                  </div>
                </div>

                <h2>{APP_STRINGS.ACCESS}</h2>
                <div>
                  <div className="lake-overview-item">
                    <span className="lake-overview-label">{APP_STRINGS.BOAT_LANDINGS}</span>
                    <span className="lake-overview-value"></span>
                  </div>
                  <div className="lake-overview-item">
                    <span className="lake-overview-label">{APP_STRINGS.SWIMMING_BEACHES}</span>
                    <span className="lake-overview-value"></span>
                  </div>
                  <div className="lake-overview-item">
                    <span className="lake-overview-label">{APP_STRINGS.MARINAS}</span>
                    <span className="lake-overview-value"></span>
                </div>
                <div className="lake-overview-item">
                    <span className="lake-overview-label">{APP_STRINGS.UNDEVELOPED_ACCESS_POINTS}</span>
                    <span className="lake-overview-value"></span>
                  </div>
                </div>

                <h2>{APP_STRINGS.CONTAINTMENT_LOADING}</h2>
                <div>
                  <div className="lake-overview-item">
                    <span className="lake-overview-label">{APP_STRINGS.PHOSPHORUS_LOAD}</span>
                    <span className="lake-overview-value"></span>
                  </div>
                  <div className="lake-overview-item">
                    <span className="lake-overview-label">{APP_STRINGS.NITROGEN_LOAD}</span>
                    <span className="lake-overview-value"></span>
                  </div>
                  <div className="lake-overview-item">
                    <span className="lake-overview-label">{APP_STRINGS.SEDIMENT_LOAD}</span>
                    <span className="lake-overview-value"></span>
                </div>
                <div className="lake-overview-item">
                    <span className="lake-overview-label">{APP_STRINGS.OTHER}</span>
                    <span className="lake-overview-value"></span>
                  </div>
                </div>
                */}

                </div>
                <div className="lake-section">
                  <div className="lake-header">
                    <h2>{APP_STRINGS.HOW_IS_MY_LAKE}</h2>
                    <div className="info-icon-wrapper">
                      <i className="fa-light fa-circle-info"></i>
                      <div className="info-tooltip">
                        {APP_STRINGS.CHARACTERISTICS.INFO_TOOLTIP}
                      </div>
                    </div>
                  </div>
                  <div className="lake-subtitle-container">
                    <div className="characteristic-subtitle">
                      {APP_STRINGS.OVERVIEW_LABELS.CHARACTERISTIC_SUBTITLE}
                    </div>
                    <div className="location-menu">
                      {APP_STRINGS.SELECT_LOCATION}
                    </div>
                    {locationIdentifiers.length > 0 && (
                      <select
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
                      >
                        {locationIdentifiers.map((location) => (
                          <option key={location} value={location}>
                            {location}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="lake-metrics">
                    {filteredCharacteristics.map((char, index) => (
                      <div key={index} className="metric-row">
                        {loadingStars.has(char.resultCharacteristic) ? (
                          <i className="fa-thin fa-spinner fa-spin metric-star"></i>
                        ) : selectedMetrics.includes(
                          char.resultCharacteristic
                        ) ? (
                          <i
                            className="fa fa-star metric-star blue"
                            onClick={() => toggleFavorite(char)}
                          ></i>
                        ) : (
                          <i
                            className="fa-light fa-star metric-star"
                            onClick={() => toggleFavorite(char)}
                          ></i>
                        )}
                        <div
                          className={`metric-status ${getStatusColor(
                            char,
                            characteristicsMap
                          )}`}
                          title={
                            characteristicsMap[char.resultCharacteristic]
                              ?.characteristicDescription
                          }
                        />
                        <div
                          className="metric-name"
                          title={
                            characteristicsMap[char.resultCharacteristic]
                              ?.characteristicDescription ||
                            char.resultCharacteristic
                          }
                        >
                          {characteristicsMap[char.resultCharacteristic]
                            ?.characteristicName || char.resultCharacteristic}
                        </div>
                        <div className="metric-value">
                          {Number(char.resultMeasure).toFixed(2)}
                          {char.resultMeasureUnit &&
                            ` ${char.resultMeasureUnit}`}
                        </div>
                        <div className="metric-date">
                          (
                          {(() => {
                            const formattedDate = formatActivityDate(
                              char.activityStartDate
                            );

                            return formattedDate;
                          })()}
                          )
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lake-section">
                  <h2>
                    {APP_STRINGS.RECENT_TRENDS}
                    <Link
                      to={`/lake/${lakePulseId}/results`}
                      state={{ selectedMetrics }}
                      className="go-to-results"
                    >
                      {APP_STRINGS.GO_TO_RESULTS} <span>{">"}</span>
                    </Link>
                  </h2>
                  {chartLakeData.slice(0, 2).map((chart, index) => (
                    <ChartResults
                      key={index}
                      chartData={chart}
                      characteristicsMap={characteristicsMap}
                      lakePulseId={lakePulseId!}
                      onTimeRangeChange={() => { }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="weather-section">
           
            {criticalAlerts.length > 0 && (
               <><h2>Critical Alerts</h2><div className="mb-5 alerts-box" style={{
                background:
                  // If all alerts have the same level, use its color; otherwise, use the first one's color or fallback
                  getLevelInfo(criticalAlerts[0]?.alertLevelId)?.levelColor || "#ffdddd"
              }}>
                {criticalAlerts.map(alert => {
                  // Get level info and color for this alert
                  const levelInfo = getLevelInfo(alert.alertLevelId);
                  const bgColor = levelInfo?.levelColor || "#ffdddd";
                  return (
                    <div
                      key={alert.id}

                    >
                      <div className="alert-message">
                        <span className="critical-alert-icon">
                          <i className="fa-solid fa-triangle-exclamation"></i>
                        </span>
                        <span className="critical-alert-text">{alert.note}</span>
                        {levelInfo && (
                          <span
                            className="critical-alert-label"
                            style={{
                              color: levelInfo.levelColor,
                              fontWeight: 600,
                              marginLeft: 8,
                            }}
                          >
                            {levelInfo.levelLabel}
                          </span>
                        )}
                        <span className="critical-alert-meta">
                          Posted by <b>{alert.userName}</b> on {new Date(alert.createdTime).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div></>
            )}
            <h2>{APP_STRINGS.CURRENT_WEATHER}</h2>
            {weatherLoading ? (
              <div>{APP_STRINGS.LOADING_WEATHER_DATA}</div>
            ) : weatherData ? (
              <WeatherSection>
                <div className="weather-container">
                  <div className="weather-header">
                    <div className="date-time">
                      <div>
                        {weatherData.forecast.properties.periods[0].startTime
                          ? `${formatDateTime(
                            weatherData.forecast.properties.periods[0]
                              .startTime
                          )} EDT | Zip Code ${weatherData.observations.zipCode
                          }`
                          : APP_STRINGS.CURRENT_WEATHER}
                      </div>
                    </div>
                  </div>

                  <div className="weather-content"></div>
                </div>
                <div className="weather-forecast">
                  <div className="forecast-grid">
                    {weatherData.forecast.properties.periods
                      .filter((period) => {
                        // Get today's date at midnight in local timezone
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        // Get period's date at midnight in local timezone
                        const periodDate = new Date(period.endTime);
                        periodDate.setHours(0, 0, 0, 0);

                        // Only include periods starting from today
                        return periodDate >= today;
                      })
                      .filter((period, index) => index % 2 === 0) // Filter out night periods
                      .slice(0, 5) // Show next 5 days
                      .map((period, index) => (
                        <div key={index} className="forecast-item">
                          <div className="forecast-date">
                            {formatDate(period.endTime)}
                          </div>
                          <div className="forecast-icon">
                            <i
                              className={getWeatherIconClass(
                                period.shortForecast
                              )}
                            ></i>
                          </div>
                          <div className="forecast-temp">
                            {formatTemperature(
                              period.temperature,
                              period.temperatureUnit
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </WeatherSection>
            ) : (
              <div>
                {APP_STRINGS.OVERVIEW_LABELS.ERROR_FETCHING_WEATHER_DATA}
              </div>
            )}
            {(userRole === 'Super Admin' || userSubscribed) && (
              <div className="recent-toolbox-purchases-section mb-5">
                <h2>Recent Toolbox Purchases</h2>
                {recentPurchasesLoading ? (
                  <div>Loading...</div>
                ) : recentPurchasesError ? (
                  <div style={{ color: 'red' }}>{recentPurchasesError}</div>
                ) : recentPurchases.length === 0 ? (
                  <div>No recent purchases found.</div>
                ) : (
                  <div style={{ background: '#fff', borderRadius: 16, padding: 10 }}>
                    {recentPurchases.map((purchase, idx) => {
                      let statusColor = '#fff';
                      let statusBg = '#F0F0F0';
                      if (purchase.status === 'PURCHASED' || purchase.status === 'Purchased') {
                        statusBg = '#5C76A2';
                      } else if (purchase.status === 'REGISTERED' || purchase.status === 'Registered') {
                        statusBg = '#608339';
                      } else if (purchase.status === 'INACTIVE' || purchase.status === 'Inactive') {
                        statusBg = '#8A8A8A';
                      }
                      return (
                        <div key={purchase.id || idx} className="recent-result-section" style={{ borderBottom: idx !== recentPurchases.length - 1 ? '1px solid #eee' : 'none' }}>
                          <div className="date-status">
                            <div className="purchase-date">{formatPurchaseDate(purchase.purchaseDateTime)}</div>
                            <div className="purchase-status" style={{ color: statusColor, background: statusBg }}>
                              {purchase.status}
                            </div>
                          </div>
                          <div className="purchase-user-detail">
                            <div className="purchase-product">{purchase.itemLabel}</div>
                            <div className="purchase-by-name">Purchase by <span style={{ textTransform: 'capitalize' }}>{purchase.userName}</span></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            {userRole === "User" && !userSubscribed && (
              <><div className="lake-sections-container user-lake-overview">
                <div className="lake-section overview">
                  <h2>{APP_STRINGS.LAKE_OVERVIEW}</h2>
                  <div className="lake-overview-grid">
                    <div className="lake-overview-item">
                      <span className="lake-overview-label">
                        {APP_STRINGS.OVERVIEW_LABELS.NAME}
                      </span>
                      <span className="lake-overview-value">
                        {lakeData.lakeName}
                      </span>
                    </div>
                    <div className="lake-overview-item">
                      <span className="lake-overview-label">
                        {APP_STRINGS.OVERVIEW_LABELS.COUNTY}
                      </span>
                      <span className="lake-overview-value">
                        {lakeData.lakeCounty || APP_STRINGS.N_A}
                      </span>
                    </div>
                    <div className="lake-overview-item">
                      <span className="lake-overview-label">
                        {APP_STRINGS.OVERVIEW_LABELS.STATE}
                      </span>
                      <span className="lake-overview-value">
                        {lakeData.lakeState}
                      </span>
                    </div>
                    <div className="lake-overview-item">
                      <span className="lake-overview-label">
                        {APP_STRINGS.OVERVIEW_LABELS.ACREAGE}
                      </span>
                      <span className="lake-overview-value">
                        {lakeData.lakeAreaAcres
                          ? Number(lakeData.lakeAreaAcres).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
                          : APP_STRINGS.N_A}
                      </span>
                    </div>
                    <div className="lake-overview-item">
                      <span className="lake-overview-label">
                        {APP_STRINGS.OVERVIEW_LABELS.LAT_LONG}
                      </span>
                      <span className="lake-overview-value">{`${lakeData.lakeLatitude}, ${lakeData.lakeLongitude}`}</span>
                    </div>
                    <div>
                      <div className="lake-overview-item">
                        <span className="lake-overview-label">
                          {APP_STRINGS.LAKE_TYPE}
                        </span>
                        <span className="lake-overview-value"></span>
                      </div>
                    </div>
                    <div className="lake-overview-item">
                      <span className="lake-overview-label">
                        {APP_STRINGS.LATEST_DATA_COLLECTION}
                      </span>
                      <span className="lake-overview-value">
                        {lakes[0]?.recentDataCollection || 0}
                      </span>
                    </div>
                    <div className="lake-overview-item">
                      <span className="lake-overview-label">
                        {APP_STRINGS.SAMPLING_LOCATIONS}
                      </span>
                      <span className="lake-overview-value">
                        {lakes[0]?.totalStations || 0}
                      </span>
                    </div>
                    <div className="lake-overview-item">
                      <span className="lake-overview-label">
                        {APP_STRINGS.SUBSCRIBERS}
                      </span>
                      <span className="lake-overview-value">
                        {formatNumberLake(lakes[0]?.totalSamples || 0)}
                      </span>
                    </div>
                    <div className="lake-overview-item">
                      <span className="lake-overview-label">
                        {APP_STRINGS.SPAN_YEARS}
                      </span>
                      <span className="lake-overview-value">
                        {lakes[0]?.spanYears || 0}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="lake-section community-info">
                  <h2>{APP_STRINGS.COMMUNITY_INFORMATION}</h2>
                  <div className="lake-overview-grid">
                    <div className="lake-overview-item"

                    >
                      <span className="lake-overview-label">
                        {APP_STRINGS.COMMUNITY_MEMBERS}
                      </span>
                      <span className="lake-overview-value" onMouseEnter={() => setOpenTooltip("user")}
                        onMouseLeave={() => setOpenTooltip(null)}
                        style={{ position: "relative" }}>
                        {communityMembers.userCount || 0}
                        {openTooltip === "user" && (
                          <div className="info-tooltip" style={{
                            position: "absolute",
                            left: '100%',
                            top: 20,
                            minWidth: 120,
                            width: 200,
                            display: 'block',
                            textTransform: 'capitalize',
                          }}>
                            {getNamesString("user") || "No Members"}
                          </div>
                        )}
                      </span>

                    </div>
                    <div className="lake-overview-item"

                    >
                      <span className="lake-overview-label">
                        {APP_STRINGS.SUBSCRIBERS}
                      </span>
                      <span className="lake-overview-value" onMouseEnter={() => setOpenTooltip("subscriber")}
                        onMouseLeave={() => setOpenTooltip(null)}
                        style={{ position: "relative" }}>
                        {communityMembers.subscriberCount || 0}
                        {openTooltip === "subscriber" && (
                          <div className="info-tooltip" style={{
                            position: "absolute",
                            left: '100%',
                            top: 20,
                            minWidth: 120,
                            width: 200,
                            display: 'block',
                            textTransform: 'capitalize',
                          }}>
                            {getNamesString("subscriber") || "No Subscribers"}
                          </div>
                        )}
                      </span>

                    </div>
                    <div className="lake-overview-item">
                      <span className="lake-overview-label">
                        {APP_STRINGS.COMMUNITY_ADMINS}
                      </span>
                      <span className="lake-overview-value" onMouseEnter={() => setOpenTooltip("admin")}
                        onMouseLeave={() => setOpenTooltip(null)}
                        style={{ position: "relative" }}>
                        {communityMembers.adminCount || 0}
                        {openTooltip === "admin" && (
                          <div className="info-tooltip" style={{
                            position: "absolute",
                            left: '100%',
                            top: 20,
                            minWidth: 120,
                            width: 200,
                            display: 'block',
                            textTransform: 'capitalize',
                          }}>
                            {getNamesString("admin") || "No Admins"}
                          </div>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="lake-section community-info">
                  <h2>{APP_STRINGS.BECOME_A_MEMBER}</h2>
                  <div className="lake-subscription-box">
                    <div className="lake-subscription-price-box">
                      <p>{APP_STRINGS.ONLY_TEXT}</p>
                      <span>$1</span>
                      <p>{APP_STRINGS.PER_MONTH}</p>
                      <p>{APP_STRINGS.TAG}</p>
                      <a
                        onClick={handleCheckoutClick}
                        className="subscribe-button"
                      >
                        Click Here
                      </a>
                    </div>
                    <div className="lake-subscription-features">
                      <p className="subscription-title">
                        {APP_STRINGS.AND_YOU}
                      </p>
                      <ul>
                        <li>
                          {APP_STRINGS.ACCESS_TO}{" "}
                          <strong> {APP_STRINGS.ALL_LAKE_DATA} </strong>
                        </li>
                        <li>
                          {APP_STRINGS.ACCESS_TO}{" "}
                          <strong> {APP_STRINGS.ANALYTIC_TOOLS} </strong>
                        </li>
                        <li>
                          {APP_STRINGS.ACCESS_TO}{" "}
                          <strong> {APP_STRINGS.THE_TOOLBOX} </strong>
                        </li>
                        <li>
                          {APP_STRINGS.ACCESS_TO}{" "}
                          <strong> {APP_STRINGS.THE_BOATHOUSE} </strong>
                        </li>
                      </ul>
                      <p>{APP_STRINGS.WITH_MORE_FEATURES_ON_THE_WAY}</p>
                    </div>
                  </div>
                </div>
              </div><button
                className="glow-button mb-2"
                onClick={handleCheckSubscription}
              >
                  Check Subscription
                </button>
              </>

            )}
            {(userRole === "Super Admin" || userRole === "Admin" ||
              (userRole === "User" && userSubscribed)) && (
                <>
                  {/*}
                <div className="toolbox-header">
                  <h2>{APP_STRINGS.MY_TOOLBOX}</h2>
                  <div className="toolbox-links">
                    <div className="tool lab-field">
                      <i className="fa-thin fa-flask"></i>
                      {APP_STRINGS.LAB_FIELD_TESTING}
                    </div>
                    <div className="tool monitoring">
                      <i className="fa-thin fa-satellite-dish"></i>
                      {APP_STRINGS.IN_SITU_MONITORING}
                    </div>
                    <div className="tool biodiversity">
                      <i className="fa-thin fa-dna"></i>
                      {APP_STRINGS.BIO_DIVERSITY}
                    </div>
                    <div className="tool surveys">
                      <i className="fa-thin fa-drone-front"></i>
                      {APP_STRINGS.SURVEYS}
                    </div>
                  </div>
                </div>
                */}
                  <div className="field-notes-header">
                    <h2>{APP_STRINGS.FIELD_NOTES}</h2>
                    <Link
                      to={`/lake/${lakeData.lakePulseId}/field-notes`}
                      className="go-to-field-notes"
                    >
                      {APP_STRINGS.GO_TO_FIELD_NOTES} <span>{">"}</span>
                    </Link>
                  </div>


                  <FieldNotes>
                    <div className="field-notes-page">
                      {notes.length === 0 ? (
                        <div className="no-notes-message">
                          {APP_STRINGS.NO_FIELD_NOTES_AVAILABLE}
                        </div>
                      ) : (
                        notes
                          .filter(note => note.isReplay !== true)
                          .map((note) => {
                            const levelInfo = getLevelInfo(note.alertLevelId);
                            const iconColor = levelInfo?.levelColor || "#ccc";
                            const replyCount = notes.filter(
                              reply => reply.isReplay && reply.fieldNoteId === note.id.toString()
                            ).length;

                            return (
                              <div key={note.id} className="field-notes-item">
                                <span className="field-notes-timings">
                                  {formatDate(note.createdTime)}
                                </span>
                                <div>
                                  {note.isAlert && (
  <>
 
    <i className={"fa-solid fa-triangle-exclamation inline-block" +  ((note.alertLevelId == null && note.alertCategorieId == null) ? " automated-icon" : "")}/>
    <span
      className={
        "inline-block alert-label" +
        ((note.alertLevelId == null && note.alertCategorieId == null) ? " automated-label" : "")
      }
      style={{ background: iconColor }}>
      {levelInfo?.levelLabel}
    </span>
  </>
)}
                                  <p className="field-notes-title inline" style={{ margin: 0 }}>
                                    {note.note}
                                  </p>
                                </div>
                                <div className="note-interactions">
                                  <span className="interaction-count">
                                    {note.likeCount} likes
                                  </span>
                                  {replyCount > 0 && (
                                    <span className="view-replies-link">
                                      {replyCount} replies
                                    </span>
                                  )}
                                </div>
                                <span className="field-notes-author">
                                  {APP_STRINGS.POSTED_BY} {note.userName}
                                </span>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </FieldNotes>





                </>
              )}
          </div>
        </div>
      </main>

      <Dialog
        open={showCheckoutDialog}
        onClose={() => setShowCheckoutDialog(false)}
        PaperProps={{
          style: {
            borderRadius: "12px",
            padding: "24px",
            maxWidth: "400px",
            width: "90%",
          },
        }}
      >
        <div className="checkout-dialog">
          <h2>Membership Subscription</h2>
          <p>You will be redirected to complete your purchase.</p>
          <div className="dialog-buttons">
            <button
              onClick={handleProceedToCheckout}
              className="proceed-button"
            >
              Proceed to Checkout
            </button>
            <button
              onClick={() => setShowCheckoutDialog(false)}
              className="cancel-button"
            >
              Cancel
            </button>
          </div>
        </div>
      </Dialog>

    </div>
  );
};
export default Lake;
