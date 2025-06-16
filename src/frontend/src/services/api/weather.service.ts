import { APP_STRINGS } from "../../constants/strings";

const NWS_API_BASE = 'https://api.weather.gov';

// Utility functions for unit conversions
const celsiusToFahrenheit = (celsius: number): number => {
  return (celsius * 9/5) + 32;
};

const metersToMiles = (meters: number): number => {
  return meters * 0.000621371;
};

const pascalsToInHg = (pascals: number): number => {
  return pascals * 0.0002953;
};

const millimetersToInches = (mm: number): number => {
  return mm * 0.0393701;
};



// Helper function to extract cloud cover from forecast
const getCloudCover = (forecast: string): string => {
  const cloudTerms = {
    'clear': 'Clear Sky (0%)',
    'sunny': 'Clear Sky (0%)',
    'mostly clear': 'Mostly Clear (10-30%)',
    'partly cloudy': 'Partly Cloudy (30-70%)',
    'mostly cloudy': 'Mostly Cloudy (70-90%)',
    'cloudy': 'Cloudy (90-100%)',
    'overcast': 'Overcast (100%)'
  };

  const lowerForecast = forecast.toLowerCase();
  for (const [term, description] of Object.entries(cloudTerms)) {
    if (lowerForecast.includes(term)) {
      return description;
    }
  }
  
  // If no specific cloud terms found, try to infer from other conditions
  if (lowerForecast.includes('rain') || lowerForecast.includes('storm')) {
    return 'Cloudy (90-100%)';
  } else if (lowerForecast.includes('fog') || lowerForecast.includes('mist')) {
    return 'Overcast (100%)';
  }
  
  return 'Not Available';
};

// Helper function to estimate humidity from conditions
const estimateHumidity = (forecast: string): number => {
  const conditions = forecast.toLowerCase();
  if (conditions.includes('rain') || conditions.includes('storm')) {
    return 90;
  } else if (conditions.includes('fog') || conditions.includes('mist')) {
    return 85;
  } else if (conditions.includes('cloudy')) {
    return 70;
  } else if (conditions.includes('partly')) {
    return 60;
  } else if (conditions.includes('clear') || conditions.includes('sunny')) {
    return 50;
  }
  return 65; // default value
};

interface WeatherData {
  forecast: {
    properties: {
      periods: Array<{
        endTime: string;
        temperature: number;
        temperatureUnit: string;
        shortForecast: string;
        detailedForecast: string;
      }>;
    };
  };
  observations: {
    temperature: number;
    temperatureF: number;
    conditions: string;
    pressure: number;
    pressureInHg: number;
    visibility: number;
    visibilityMiles: number;
    cloudCover: string;
    dewPoint: number;
    dewPointF: number;
    humidity: number;
    recentRainfall: number;
    windSpeed: number;
    windDirection: string;
    zipCode: string;
    timestamp: string;
  };
  fiveDayForecast: Array<{
    day: string;
    date: string;
    icon: string;
    temperature: number;
  }>;
}

const getZipCodeFromCoordinates = async (latitude: number, longitude: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    const data = await response.json();
    return data.postcode || 'N/A';
  } catch (error) {
    console.error(APP_STRINGS.ERROR_FETCHING_ZIP_CODE, error);
    return 'N/A';
  }
};

export const getWeatherForLocation = async (latitude: number, longitude: number): Promise<WeatherData | null> => {
  try {
    // Get zip code first
    const zipCode = await getZipCodeFromCoordinates(latitude, longitude);

    // Step 1: Get grid data for the location
    const pointResponse = await fetch(
      `${NWS_API_BASE}/points/${latitude},${longitude}`,
      {
        headers: {
          'User-Agent': '(lakepulse.com, support@lakepulse.com)',
          'Accept': 'application/geo+json'
        }
      }
    );
    
    if (!pointResponse.ok) {
      throw new Error(APP_STRINGS.ERROR_FETCHING_WEATHER_DATA);
    }
    
    const pointData = await pointResponse.json();
    
    // Step 2: Get forecast using gridpoint data
    const { gridId, gridX, gridY } = pointData.properties;
    const forecastUrl = `${NWS_API_BASE}/gridpoints/${gridId}/${gridX},${gridY}/forecast`;
    
    const forecastResponse = await fetch(forecastUrl, {
      headers: {
        'User-Agent': '(lakepulse.com, support@lakepulse.com)',
        'Accept': 'application/geo+json'
      }
    });

    if (!forecastResponse.ok) {
      throw new Error(APP_STRINGS.ERROR_FETCHING_WEATHER_DATA);
    }

    const forecastData = await forecastResponse.json();
    const currentPeriod = forecastData.properties.periods[0];

    // Get cloud cover from forecast description
    const cloudCover = getCloudCover(currentPeriod.shortForecast);
    
    // Estimate humidity from conditions if not provided
    const humidity = currentPeriod.relativeHumidity?.value || 
                    estimateHumidity(currentPeriod.shortForecast);

    // Estimate rainfall from forecast description
    const hasRain = currentPeriod.shortForecast.toLowerCase().includes('rain') || 
                   currentPeriod.detailedForecast.toLowerCase().includes('rain');
    const recentRainfall = hasRain ? 0.01 : 0; // Set a minimal value if rain is mentioned

    // Process current forecast data for observations
    const processedObservations = {
      temperature: currentPeriod.temperature || 0,
      temperatureF: currentPeriod.temperature || 32,
      conditions: currentPeriod.shortForecast || 'N/A',
      pressure: currentPeriod.barometricPressure?.value || 101325, // Default to 1 atm in Pa
      pressureInHg: pascalsToInHg(currentPeriod.barometricPressure?.value || 101325),
      visibility: currentPeriod.visibility?.value || 16093.4, // Default to 10 miles in meters
      visibilityMiles: metersToMiles(currentPeriod.visibility?.value || 16093.4),
      cloudCover: cloudCover,
      dewPoint: currentPeriod.dewpoint?.value || 0,
      dewPointF: celsiusToFahrenheit(currentPeriod.dewpoint?.value || 0),
      humidity: humidity,
      recentRainfall: recentRainfall,
      windSpeed: currentPeriod.windSpeed || 0,
      windDirection: currentPeriod.windDirection || 'N/A',
      zipCode: zipCode,
      timestamp: new Date().toISOString()
    };

    // Process five-day forecast
    const fiveDayForecast = forecastData.properties.periods.slice(0, 5).map(period => {
      const date = new Date(period.endTime);
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });
      const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        day,
        date: formattedDate,
        icon: '',
        temperature: period.temperature
      };
    });

    return {
      forecast: forecastData,
      observations: processedObservations,
      fiveDayForecast
    };

  } catch (error) {
    console.error(APP_STRINGS.ERROR_FETCHING_WEATHER_DATA, error);
    return null;
  }
};

const formatValue = (value: number | null | undefined, unit: string): string => {
  if (value === null || value === undefined) return 'N/A';
  return `${Math.round(value * 10) / 10}${unit}`;
};