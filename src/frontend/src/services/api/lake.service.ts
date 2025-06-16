import { Lake, LakeDetails, LakeCharacteristic, Characteristic, FieldNoteResponse, LakeOverview, SensorLocation, ChartDataPoint, LakeSearchResponse, MeasurementResult, CreateAlertRequest } from '../../types/api.types';
import { APP_STRINGS } from '../../constants/strings';
import * as pako from 'pako';
import axios from 'axios';
import { AlertCategoryDto, AlertLevelDto } from '../../types/api.types';

// Common function to get authentication token
const getAuthToken = (): { userId: string; idToken: string } => {
  const userDataStr = localStorage.getItem("idToken");
  if (!userDataStr) {
    console.error("No authentication token found. Redirecting to login...");
    window.location.href = "/login"; // Redirect to login page
    throw new Error(APP_STRINGS.NO_AUTH_TOKEN);
  }

  const userData = JSON.parse(userDataStr);
  const idToken = userData.id_token;
  const userId = userData.profile?.sub || userData.profile?.["cognito:username"];

  if (!idToken || !userId) {
    console.error("Invalid authentication token. Redirecting to login...");
    window.location.href = "/login"; // Redirect to login page
    throw new Error(APP_STRINGS.NO_AUTH_TOKEN);
  }

  return { userId, idToken };
};



/**
 * Add a lake to user's my lakes collection
 * @param userId User ID
 * @param lakeId Lake ID to add
 * @returns Promise with the response from the API
 * @throws Error if authentication fails or API request fails
 */
export const addToMyLake = async (userId: string, lakePulseId: string, lakeState?: string) => {
  const { idToken } = getAuthToken();
  
  const response = await fetch(
    `${import.meta.env.VITE_BASE_URL}/api/user/my-lake?userId=${userId}&lakeId=${lakePulseId}`, 
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
        'Accept': 'application/json'
      },
      credentials: 'include'
    }
  );
  
  if (!response.ok) {
    if (response.status === 409) {
        throw new Error(APP_STRINGS.LAKE_ALREADY_ADDED);
      }
    throw new Error(`${APP_STRINGS.LAKE_ADD_ERROR}: ${response.status} ${response.statusText}`);
    }
  
  return response.json();
};

export interface StateOption {
  key: string;    // State name (e.g., "Alabama")
  value: string;  // State code (e.g., "AL")
}

/**
 * Get list of all states that have lakes
 * @returns Promise with array of state options
 */
export const getLakeStateList = async (): Promise<StateOption[]> => {
  try {
    const { idToken } = getAuthToken();

    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/lake/states-list`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Accept': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(APP_STRINGS.ERROR_FETCHING_LAKE_STATE_LIST, {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`ERROR_FETCHING_LAKE_STATE_LIST: ${response.status} ${response.statusText}`);
    }

    const data: StateOption[] = await response.json();
    return data;
  } catch (error) {
    console.error(APP_STRINGS.ERROR_FETCHING_LAKE_STATE_LIST, error);
    throw error;
  }
};

export const getMyLakes = async () => {
  const { userId, idToken } = getAuthToken();
  try {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/user/my-lakes-by-id?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`,
         'Content-Type': 'application/json'
      }, 
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(APP_STRINGS.API_ERROR, {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`${APP_STRINGS.ERROR_FETCHING_MY_LAKES}: ${response.status} ${response.statusText}`);
    }
  
    const data = await response.json();
  
    // Ensure we're returning the raw data without transformation
    return data.map((lake: Lake) => ({
      ...lake,
      lakeCharacteristics: lake.lakeCharacteristics || [] // Ensure characteristics array exists
    }));

  } catch (error) {
    console.error(APP_STRINGS.ERROR_FETCHING_LAKES, error);
    throw error;
  }
};

export const getMyLakesCount = async (userId: string): Promise<number> => {
  const { idToken } = getAuthToken();
  try {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/user/my-lakes-count-by-user-id?userId=${userId}`, {
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(APP_STRINGS.ERROR_FETCHING_MY_LAKES_COUNT);
    }
    const count = await response.json();
    return count;
  } catch (error) {
    console.error(APP_STRINGS.ERROR_FETCHING_MY_LAKES_COUNT, error);
    return 0;
  }
};

/**
 * Search lakes by state and search term
 * @param state State abbreviation (e.g., 'LA')
 * @param search Search term for lake name
 * @param page Page number for pagination
 * @param pageSize Number of results per page
 * @returns Promise with array of matching lakes and total count
 */
export const searchLakesByState = async (
  state: string, 
  search: string,
  pageNumber: number,
  pageSize: number,
  filter: string,
  sort: string
): Promise<SearchResponse> => {
  try {
    const { idToken } = getAuthToken();

    const url = new URL(`${import.meta.env.VITE_BASE_URL}/api/lake/search-state`);
    url.searchParams.append('state', state);
    url.searchParams.append('search', search);
    url.searchParams.append('sort', sort);  
    url.searchParams.append('pageNumber', pageNumber.toString());
    url.searchParams.append('pageSize', pageSize.toString());
    url.searchParams.append('filter', filter.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Accept': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(APP_STRINGS.ERROR_SEARCHING_LAKES);
    }
    
    const data = await response.json();
    
    // Transform the response data to match the Lake interface
    const lakes = (data.lakeDetailsList || data.lakes || []).map((lake: Lake) => ({
      lakePulseId: lake.lakePulseId,
      lakeName: lake.lakeName,
      lakeState: lake.lakeState,
      lakeCounty: lake.lakeCounty,
      recentDataCollection: lake.recentDataCollection,
      totalSamples: lake.totalSamples,
      totalStations: lake.totalStations,
      spanYears: lake.spanYears,
      latitude: lake.latitude,
      longitude: lake.longitude,
      communityAdmin: lake.communityAdmin,
      communityUsers: lake.communityUsers,
      communitySubscriber: lake.communitySubscriber,
    }));
    const totalCount = data.totalCount || lakes.length;
    
    return { lakes, totalCount };
  } catch (error) {
    console.error(APP_STRINGS.ERROR_SEARCHING_LAKES, error);
    throw error;
  }
};

// Add cache for lakes data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let lakesCache: any[] | null = null;

export const getAllLakesWithLocation = async (): Promise<Lake[]> => {
  // Return cached data if available
  if (lakesCache) {
    return lakesCache;
  }

  try {
    const { idToken } = getAuthToken();

    
     
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/lake/all-lakes-lat-long`, {
        method: 'GET',
        headers: {
        'Authorization': `Bearer ${idToken}`,

        'Accept-Encoding': 'gzip'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`${APP_STRINGS.ERROR_FETCHING_LAKES}: ${response.status} ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    
    let decompressedData;
    try {
      decompressedData = pako.inflate(uint8Array, { to: 'string' });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (inflateError) {
      decompressedData = new TextDecoder().decode(uint8Array);
    }
    
    const parsedData = JSON.parse(decompressedData);

    // Transform the data to match our Lake interface
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformedData = parsedData.LakeDetailsList ? parsedData.LakeDetailsList.map((item: any) => ({
      lakePulseId: item.A,
      lakeName: item.D || `Lake ${item.A}`,
      lakeState: item.E || 'N/A',
      latitude: item.B,
      longitude: item.C,
      recentDataCollection: item.F || 'No data',
      totalSamples: item.G || 0,
      totalStations: item.H || 0,
      spanYears: item.I || 0,
      communityAdmin: item.J || 0,
      communityUsers: item.K || 0, 
      communityMembers: item.K || 0
    })) : [];

    // Cache the transformed data
    lakesCache = transformedData;
   
      return lakesCache;
  } catch (error) {
    console.error(APP_STRINGS.ERROR_FETCHING_LAKES, error);
    throw error;
  }
};

export const getLakeDetailsByIds = async (lakeIds: number[], filter: string, sort: string): Promise<LakeDetails[]> => {
  try {
    const { idToken } = getAuthToken();

    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/lake/lake-details-by-ids?filter=${filter}&sort=${sort}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      
      body: JSON.stringify(lakeIds),
      
    });

    if (!response.ok) {
      throw new Error(APP_STRINGS.ERROR_FETCHING_LAKES);
    }

    const data = await response.json();
    
    // Map the backend response to match our frontend LakeDetails type
    if (Array.isArray(data)) {
      return data?.map(lake => ({
        lakePulseId: lake.lakePulseId,
        lakeName: lake.lakeName,
        lakeState: lake.lakeState,
        recentDataCollection: lake.recentDataCollection,
        lakeStateCode: lake.lakeStateCode,
        totalSamples: lake.totalSamples,
        totalStations: lake.totalStations,
        spanYears: lake.spanYears,
        communityAdmin: lake.communityAdmin || 0,
        communityUsers: lake.communityUsers || 0,
        communitySubscriber: lake.communitySubscriber || 0,
        latitude: lake.latitude,
        longitude: lake.longitude,
        area: lake.area,
        depth: lake.depth,
        elevation: lake.elevation,
      }));
       
    }

  } catch (error) {
    console.error(APP_STRINGS.ERROR_FETCHING_LAKES, error);
    throw error;
  }
};

interface SearchResponse {
  lakes: Lake[];
  totalCount: number;
}

export const removeLake = async (userId: string, lakeId: number) => {
  try {
    const { idToken } = getAuthToken();
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/user/my-lake?userId=${userId}&lakeId=${lakeId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
    });

    if (!response.ok) {
      throw new Error(APP_STRINGS.ERROR_REMOVING_LAKE);
    }

    return true;
  } catch (error) {
    console.error(APP_STRINGS.ERROR_REMOVING_LAKE, error);
    throw error;
  }
};



// Add this new API call function
export const getLakeOverviewById = async (lakeId: number): Promise<{
  lakeOverview: LakeOverview;
  lakeCharacteristicList: LakeCharacteristic[];
  sensorLocations: SensorLocation[];
   comunityMembersDto: {
    lakePulseId: string;
    userCount: number;
    subscriberCount: number;
    adminCount: number;
    userNames: string[];
    subscriberNames: string[];
    adminNames: string[];
  };
}> => {
  try {
    const { idToken } = getAuthToken();

    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/lake/lake-all-details-by-id?lakeId=${lakeId}`, {
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    });

    if (!response.ok) throw new Error(APP_STRINGS.ERROR_FETCHING_LAKES);

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(APP_STRINGS.ERROR_FETCHING_LAKES, error);
    throw error;
  }
};

// Add new function to fetch characteristics
export const getCharacteristics = async (): Promise<Characteristic[]> => {
  try {
    const { idToken } = getAuthToken();

    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/characteristic/characteristics`, {
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    });

    if (!response.ok) throw new Error(APP_STRINGS.ERROR_FETCHING_CHARACTERISTICS);

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching characteristics:', error);
    throw error;
  }
};

export const addFavoriteCharacteristic = async (userId: string, lakeId: string, characteristicId: string) => {
  try {
    const { idToken } = getAuthToken();

    const response = await fetch(
      `${import.meta.env.VITE_BASE_URL}/api/characteristic/user-favourite?userId=${userId}&lakeId=${lakeId}&characteristicId=${characteristicId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      }
    );

    if (!response.ok) throw new Error(APP_STRINGS.ERROR_ADDING_FAVORITE);
    
    // Don't try to parse response if it's not JSON
    if (response.headers.get('content-type')?.includes('application/json')) {
      return await response.json();
    }
    
    // Just return success if not JSON
    return true;
  } catch (error) {
    console.error('Error adding favorite:', error);
    throw error;
  }
};

export const removeFavoriteCharacteristic = async (userId: string, lakeId: string, characteristicId: string) => {
  try {
    const { idToken } = getAuthToken();

    const response = await fetch(
      `${import.meta.env.VITE_BASE_URL}/api/characteristic/user-favourite?userId=${userId}&lakeId=${lakeId}&characteristicId=${characteristicId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      }
    );

    if (!response.ok) throw new Error(APP_STRINGS.ERROR_REMOVING_FAVORITE);
    return true;
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
};



export const getCharacteristicChart = async (
  lakeId: string, 
  characteristicId: string, 
  durationDays: number
): Promise<ChartDataPoint[]> => {
  try {
    const { idToken } = getAuthToken();

    const response = await fetch(
      `${import.meta.env.VITE_BASE_URL}/api/characteristic/chart?lakeId=${lakeId}&characteristicId=${characteristicId}&duraionDays=${durationDays}`,
      {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      }
    );
    if (!response.ok) throw new Error(APP_STRINGS.ERROR_FETCHING_CHARACTERISTICS);
    return await response.json();
  } catch (error) {
    console.error(APP_STRINGS.ERROR_FETCHING_CHARACTERISTICS, error);
    throw error;
  }
};

export const getFavoriteCharacteristics = async (userId: string, lakeId: string): Promise<LakeCharacteristic[]> => {
  try {
    const { idToken } = getAuthToken();

    const response = await fetch(
      `${import.meta.env.VITE_BASE_URL}/api/characteristic/user-favourite?userId=${userId}&lakeId=${lakeId}`,
      {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      }
    );

    if (!response.ok) throw new Error(APP_STRINGS.ERROR_FETCHING_FAVORITES);
    return await response.json();
  } catch (error) {
    console.error(APP_STRINGS.ERROR_FETCHING_FAVORITES, error);
    return [];
  }
};

/**
 * Add a field note to a lake
 * @param userId User ID
 * @param userName User's name
 * @param lakeId Lake ID
 * @param note Note content
 * @returns Promise with the response from the API
 */
export const addFieldNote = async (
  userId: string,
  userName: string,
  lakeId: string,
  note: string,
  isReplay?: boolean,
  fieldNoteId?: string
) => {
  const { idToken } = getAuthToken();
  const requestBody = {
    userId,
    userName,
    lakeId,
    note,
    isReplay: isReplay || false,
    fieldNoteId: fieldNoteId || undefined
  };

  const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/fieldNote/field-note`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify(requestBody),
    credentials: 'include'
  });

  const contentType = response.headers.get('content-type');
  const text = await response.text();

  if (!response.ok) {
    // Try to parse error as JSON, else show text
    try {
      const errorJson = JSON.parse(text);
      throw new Error(errorJson.message || text);
    } catch {
      throw new Error(text);
    }
  }

  // Try to parse as JSON if possible
  if (contentType && contentType.includes('application/json')) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
  return text;
};

/**
 * Get field notes for a lake with pagination
 * @param lakeId Lake ID
 * @param pageNumber Page number
 * @param pageSize Number of items per page
 * @returns Promise with paginated field notes
 */
export const getFieldNotesByLakeId = async (
  lakeId: string,
  pageNumber: number = 1,
  pageSize: number,
  userId: string,
): Promise<FieldNoteResponse> => {
  const { idToken } = getAuthToken();

  try {
    const url = `${import.meta.env.VITE_BASE_URL}/api/fieldNote/field-note-by-lake-id?lakeId=${lakeId}&userId=${userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`;
    

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${idToken}`,
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(JSON.stringify(errorData));
    }

    const data = await response.json();
  
    return data;
  } catch (error) {
    console.error('Error fetching field notes:', error);
    throw error;
  }
};

export const updateFieldNote = async (
  userId: string,
  note: string,
  fieldNoteId: string
) => {
  const { idToken } = getAuthToken();

  try {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_URL}/api/fieldNote/field-note?userId=${userId}&note=${note}&fieldNoteId=${fieldNoteId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${idToken}`,
         
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error(APP_STRINGS.ERROR_RESPONSE, errorData);
      throw new Error(JSON.stringify(errorData));
    }

    return await response.json();
  } catch (error) {
    console.error(APP_STRINGS.ERROR_UPDATING_FIELD_NOTE, error);
    throw error;
  }
};

export const deleteFieldNote = async (userId: string, fieldNoteId: string) => {
  const { idToken } = getAuthToken();

  try {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_URL}/api/fieldNote/field-note?userId=${userId}&fieldNoteId=${fieldNoteId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          
        }
      }
    );

    if (!response.ok) {
      throw new Error(APP_STRINGS.ERROR_DELETING_NOTE);
    }
  } catch (error) {
    console.error(APP_STRINGS.ERROR_DELETING_NOTE, error);
    throw error;
  }
};

export const toggleFieldNoteLike = async (
  fieldNoteId: string,
  userId: string
): Promise<number> => {
  const { idToken } = getAuthToken();

  try {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_URL}/api/fieldNote/like-dislike?fieldNoteId=${fieldNoteId}&userId=${userId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          
        }
      }
    );

    if (!response.ok) {
      throw new Error(APP_STRINGS.ERROR_TOGGLE_LIKE);
    }

    const result = await response.json();
    return result; // Will be 0 or 1
  } catch (error) {
    console.error(APP_STRINGS.ERROR_TOGGLE_LIKE, error);
    throw error;
  }
 };


export const getLakeMeasurementResults = async (
  lakeId: string,
  pageNumber: number = 1,
  pageSize: number = 10,
  filters?: Array<{ key: string; value: string }>,
  sortColumns?: Array<{ key: string; value: string }>
): Promise<{
  measurementResultList: Array<MeasurementResult>;
  totalCount: number;
}> => {
  try {
    const { idToken } = getAuthToken();
    
    const requestBody = {
      lakeId: parseInt(lakeId),
      pageNumber,
      pageSize,
      filters: filters || [],
      sortColumns: sortColumns || []
    };

    const response = await fetch(
      `${import.meta.env.VITE_BASE_URL}/api/lake/lake-measurement-results`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      throw new Error(APP_STRINGS.ERROR_LOADING_MEASUREMENT_RESULTS);
    }

    return await response.json();
  } catch (error) {
    console.error(APP_STRINGS.ERROR_LOADING_MEASUREMENT_RESULTS, error);
    throw error;
  }
};

export const searchLakesByName = async (
  searchTerm: string,
  pageNumber: number = 1,
  pageSize: number = 10
): Promise<LakeSearchResponse> => {
  const { idToken } = getAuthToken();

  try {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_URL}/api/lake/search-by-name?searchTerm=${searchTerm}&pageNumber=${pageNumber}&pageSize=${pageSize}`,
      {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        }
      }
    );
  

    if (!response.ok) {
      throw new Error(APP_STRINGS.ERROR_SEARCHING_LAKES);
    }

    return await response.json();
  } catch (error) {
    console.error(APP_STRINGS.ERROR_SEARCHING_LAKES, error);
    throw error;
  }
};

export const getUserActiveSubscription = async (userId: string) => {
  const { idToken } = getAuthToken();
  try {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/lakeSubscription/user-active-subscription?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`,
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch subscription data: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
 // Log the response text for debugging

    if (!text) {
      throw new Error('Response body is empty');
    }

    try {
      return JSON.parse(text);
    } catch (error) {
      throw new Error('Failed to parse JSON');
    }
  } catch (error) {
    console.error('Error fetching subscription data:', error);
    throw error;
  }
};

/**
 * Fetch user orders by email
 * @param email User's email address
 * @returns Promise with the user's orders
 * @throws Error if the API request fails
 */
export const getUserOrdersByEmail = async (email: string) => {
  const { idToken } = getAuthToken();
  try {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/toolbox/user-orders?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`,
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(APP_STRINGS.ERROR_RESPONSE, {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`ERROR_FETCHING_USER_ORDERS: ${response.status} ${response.statusText}`);
    }

    const orders = await response.json();
    return orders;
  } catch (error) {
    console.error(APP_STRINGS.ERROR_RESPONSE, error);
    throw error;
  }
};

export const syncUserOrders = async (email: string, lakePulseId?: number) => {
  const { idToken } = getAuthToken();
  // Add lakePulseId as a query param if provided
  const lakeParam = lakePulseId ? `&lakePulseId=${lakePulseId}` : '';
  try {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/toolbox/sync-user-orders?email=${encodeURIComponent(email)}${lakeParam}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to sync user orders:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Failed to sync user orders: ${response.status} ${response.statusText}`);
    }

    // Check if response has content
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // If no content or not JSON, return success
      return { success: true };
    }

    // Try to parse JSON only if content exists
    const text = await response.text();
    if (!text) {
      return { success: true };
    }

    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      return { success: true };
    }
  } catch (error) {
    console.error('Error syncing user orders:', error);
    throw error;
  }
};

export const getLakeMeasurementLocations = async (lakeId: string) => {
  const { idToken } = getAuthToken();
  try {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/toolbox/lake-measurement_locations?lakeId=${lakeId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`,
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch measurement locations');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching lake measurement locations:', error);
    throw error;
  }
};

export const saveLakeMeasurementLocation = async (
  lakePulseId: number,
  locationIdentifier: string,
  locationLatitude: number,
  locationLongitude: number,
  locationName: string,
  locationState: string
) => {
  const { idToken } = getAuthToken();
  try {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/toolbox/lake-measurement_location`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        lakePulseId,
        locationIdentifier,
        locationLatitude,
        locationLongitude,
        locationName,
        locationState
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to save measurement location: ${response.status} ${response.statusText} - ${errorText}`);
    }

    // Check if response has content
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // If no content or not JSON, return success
      return { success: true };
    }

    // Try to parse JSON only if content exists
    const text = await response.text();
    if (!text) {
      return { success: true };
    }

    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      return { success: true };
    }
  } catch (error) {
    console.error('Error saving lake measurement location:', error);
    throw error;
  }
};

export const registerProduct = async (
  lakePulseId: number,
  locationIdentifier: string,
  orderId: string,
  kId: string,
  userEmail: string
) => {
  const { idToken } = getAuthToken();
  try {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/toolbox/register`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        lakePulseId,
        locationIdentifier,
        orderId,
        kId,
        userEmail
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to register product: ${response.status} ${response.statusText} - ${errorText}`);
    }

    // Check if response has content
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return { success: true };
    }

    const text = await response.text();
    if (!text) {
      return { success: true };
    }

    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      return { success: true };
    }
  } catch (error) {
    console.error('Error registering product:', error);
    throw error;
  }
};

export const deregisterProduct = async (orderId: string, userEmail: string): Promise<{ success: boolean }> => {
  const { idToken } = getAuthToken();
  try {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/toolbox/deregister?orderId=${orderId}&userEmail=${encodeURIComponent(userEmail)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to deregister product: ${response.status} - ${errorText}`);
    }

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return { success: true, ...data };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deregistering product:', error);
    throw error;
  }
};

export const getToolboxLabels = async (): Promise<{ [key: string]: string }> => {
  const { idToken } = getAuthToken();
  try {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/toolbox/labels`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch toolbox labels: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching toolbox labels:', error);
    throw error;
  }
};

/**
 * Send a message to the boathouse email endpoint
 * @param subject Email subject
 * @param email Sender's email
 * @param name Sender's name
 * @param message Message body
 */
export const sendBoathouseEmail = async ({
  subject,
  email,
  name,
  message,
}: {
  subject: string;
  email: string;
  name: string;
  message: string;
}) => {
  const { idToken } = getAuthToken();
  const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/email/boathouse`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json-patch+json',
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify({ subject, email, name, message }),
  });

  if (!response.ok) {
    throw new Error('Failed to send boathouse email');
  }
  return response.json();
};

export const sendFeatureRecentResult = async (requestBody: {
  userEmail: string;
  lakeId: string;
  fieldId: string;
  dataType: string;
  dataSource: string;
  previousValue: string;
  updatedValue: string | number | Date;
}[]) => {
  const { idToken } = getAuthToken();
  
  try {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/features-data/feature-recent-result`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      credentials: 'include'
    });

  

if (!response.ok) {
  // Optionally, try to read error text for debugging
  const errorText = await response.text();
  throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`);
}

// Check for empty response (204 No Content or empty body)
const contentType = response.headers.get('content-type');
if (!contentType || !contentType.includes('application/json')) {
  // No JSON content, return a default value or handle gracefully
  return [];
}

const text = await response.text();
if (!text) {
  // Empty body, return a default value or handle gracefully
  return [];
}

try {
  return JSON.parse(text);
} catch (e) {
  throw new Error('Failed to parse JSON');
}
  } catch (error) {
    console.error(APP_STRINGS.FAILED_TO_FETCH, error);
    throw error;
  }
};

/**
 * Fetch a single toolbox label by skuId
 * @param skuId The SKU ID of the product
 * @returns Promise with the label string
 */
export const getToolboxLabelBySku = async (skuId: string): Promise<{ status: number, data: any }> => {
  const { idToken } = getAuthToken();
  try {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/toolbox/labels?skuId=${encodeURIComponent(skuId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      credentials: 'include'
    });

    if (response.status === 204) {
      return { status: 204, data: null };
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch toolbox label: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error('Error fetching toolbox label by sku:', error);
    throw error;
  }
};

/**
 * Fetch recent toolbox purchases for a lake
 * @param lakePulseId Lake Pulse ID
 * @returns Promise with recent purchases
 */
export const getRecentToolboxPurchases = async (lakePulseId: number) => {
  const { idToken } = getAuthToken();
  try {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/toolbox/recent-purchases?lakePulseId=${lakePulseId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`,
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch recent toolbox purchases: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching recent toolbox purchases:', error);
    throw error;
  }
};
/**
 * Fetch alert categories
 * @returns Promise with categories
 */
export const getAlertCategories = async (): Promise<AlertCategoryDto[]> => {
  const { idToken } = getAuthToken();
  const response = await axios.get(
    `${import.meta.env.VITE_BASE_URL}/api/alert/categories`,
    {
      headers: { 'Authorization': `Bearer ${idToken}` }
    }
  );
  return response.data;
};
/**
 * Fetch alert levels
 * @returns Promise with levels
 */

export const getAlertLevels = async (): Promise<AlertLevelDto[]> => {
  const { idToken } = getAuthToken();
  const response = await axios.get(
    `${import.meta.env.VITE_BASE_URL}/api/alert/levels`,
    {
      headers: { 'Authorization': `Bearer ${idToken}` }
    }
  );
  return response.data;
};

/**
 * Fetch alert types
 * @returns Promise with types
 */
export const createAlert = async (requestBody: CreateAlertRequest) => {
  const { idToken } = getAuthToken();
  const response = await axios.post(
    `${import.meta.env.VITE_BASE_URL}/api/alert/alert`,
    requestBody,
    {
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json-patch+json'
      }
    }
  );
  return response.data;
};

export interface CriticalAlert {
  id: number;
  note: string;
  alertLevelId: number;
  alertCategorieId: number;
  isFieldNoteSelected: boolean;
  userId: string;
  lakeId: string;
  userName: string;
  createdTime: string;
  // Add other fields as needed
}

export const getCriticalAlerts = async (
  lakeId: string,
  pageNumber: number = 1,
  pageSize: number = 5
): Promise<CriticalAlert[]> => {
  const { idToken } = getAuthToken();
  const response = await fetch(
    `${import.meta.env.VITE_BASE_URL}/api/alert/critical-alerts?lakeId=${lakeId}&pageNumber=${pageNumber}&pageSize=${pageSize}`,
    {
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Accept': 'application/json'
      }
    }
  );
  if (!response.ok) {
    throw new Error('Failed to fetch critical alerts');
  }
  const data = await response.json();
  return data.alerts || [];
};

export const deleteCriticalAlert = async (alertId: string) => {
  const { idToken } = getAuthToken();
  const response = await fetch(
    `${import.meta.env.VITE_BASE_URL}/api/alert/critical-alerts/${alertId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Accept': 'application/json'
      }
    }
  );
  if (!response.ok) {
    throw new Error('Failed to delete critical alert');
  }
  return true;
};
export const saveAlertPreferences = async (body: {
  userId: string;
  levelPreferences: { id: number; isSelected: boolean }[];
  categoriePreferences: { id: number; isSelected: boolean }[];
  isSMSSelected: boolean;
  isEmailSelected: boolean;
}) => {
  const { idToken } = getAuthToken();
  const response = await fetch(
    `${import.meta.env.VITE_BASE_URL}/api/alert/preferences`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json-patch+json'
      },
      body: JSON.stringify(body)
    }
  );
  if (!response.ok) {
    throw new Error('Failed to save alert preferences');
  }
  return await response.json();
};

export const getAlertPreferences = async (userId: string) => {
  const { idToken } = getAuthToken();
  const response = await fetch(
    `${import.meta.env.VITE_BASE_URL}/api/alert/preferences/${userId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Accept': 'application/json'
      }
    }
  );
  if (!response.ok) throw new Error('Failed to fetch preferences');
  return await response.json();
};

