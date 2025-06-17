/**

 * Application String Constants

 * 

 * This file contains all the static strings used throughout the application.

 * Centralizing strings here makes it easier to:

 * - Maintain consistent terminology

 * - Support internationalization

 * - Update text content across the application

 * - Ensure type safety with TypeScript

 */

import { User } from "lucide-react";



export const APP_STRINGS = {

  // Application name and branding

  APP_NAME: 'LakePulse',



  // Authentication related constants

  OIDC_KEY: 'oidc.user:https://cognito-idp.us-east-1.amazonaws.com/us-east-1_REyYhcNxj:7s46iffist40rfam9dldpkv033',

  AUTH_ERROR: {

    NO_TOKEN: 'No authentication token found',

    NO_ID_TOKEN: 'No ID token found in user data'

  },



  // Loading and error state messages

  LOADING: 'Loading...',

  ERROR_PREFIX: 'Encountering error...',

  LOGIN_REQUIRED: 'Please login to view your lakes',

  USER_INFO_NOT_FOUND: 'User information not found',

  LOAD_ERROR: 'Failed to load your lakes',

  LOADING_LAKES: 'Loading your lakes...',

  ERROR_FETCHING_LAKES: 'Error fetching my lakes:',

  LAKE_ADD_SUCCESS: 'Lake added successfully!',

  LAKE_ADD_ERROR: 'Failed to add lake',

  LAKE_ALREADY_ADDED: 'This lake is already in your collection',



  // Application routes

  ROUTE_DASHBOARD: '/dashboard',
  ROUTE_MY_LAKES: '/Home',
  ROUTE_SEARCH: '/search',
  ROUTE_TOOLBOX: 'https://toolbox.lakepulse.co',
  ROUTE_BOATHOUSE: '/boathouse',

  ROUTE_ROOT: '/',



  // API endpoints and configurations

  API_BASE_URL: 'https://localhost:44359',

  API_ENDPOINTS: {

    MY_LAKE: '/api/user/my-lake'

  },



  // Page titles

  DASHBOARD_TITLE: 'Dashboard',

  MY_LAKES_TITLE: 'My Lakes',

  SEARCH_TITLE: 'Search',

  TOOLBOX_TITLE: 'Toolbox',

  BOATHOUSE_TITLE: 'Boathouse',

  WELCOME_TITLE: 'Welcome to LakePulse',



  // Navigation labels

  NAV_DASHBOARD: 'Dashboard',

  NAV_MY_LAKES: 'Home',

  NAV_SEARCH: 'Search',

  NAV_TOOLBOX: 'Toolbox',

  NAV_BOATHOUSE: 'Boathouse',



  // Authentication related messages

  SIGN_IN: 'Sign in',

  SIGN_OUT: 'Sign out',

  // Error and status messages

  SESSION_EXPIRED: 'Your session has expired. Please sign in again.',

  UNAUTHORIZED: 'You are not authorized to view this page.',

  // Landing page content
  APP_TAGLINE: 'Discover • Monitor • Protect',
  WAVE_ICON_ALT: 'LakePulse Wave',

  // Boathouse page content

  BOATHOUSE_PROFILE_TITLE: 'Profile',

  BOATHOUSE_SETTINGS_TITLE: 'Settings',

  BOATHOUSE_NAME_LABEL: 'given_name',

  BOATHOUSE_ROLE_LABEL: 'Role',

  BOATHOUSE_EMAIL_NOTIFICATIONS: 'Email Notifications',

  BOATHOUSE_MANAGE_NOTIFICATIONS: 'Manage Notifications',

  BOATHOUSE_DEFAULT_NAME: 'John Doe',

  BOATHOUSE_DEFAULT_ROLE: 'Researcher',



  // Boathouse page specific strings

  PROFILE_SECTION_TITLE: 'Profile',

  SETTINGS_SECTION_TITLE: 'Settings',

  NAME_LABEL: 'Name',

  ROLE_LABEL: 'Role',

  EMAIL_NOTIFICATIONS_LABEL: 'Email Notifications',

  MANAGE_NOTIFICATIONS_BUTTON: 'Manage Notifications',



  // My Lakes page content

  MY_LAKES_EXAMPLE_TITLE: 'Elkhart Lake',

  MY_LAKES_SUB: 'Wisconsin',

  NO_LAKES_MESSAGE: 'You have not added any lakes to your collection yet.',

  // Lake page specific strings

  ADD_TO_MY_LAKES: '+ ADD THIS TO MY LAKES',

  HOW_IS_MY_LAKE: 'Health & Safety Dashboard',

  RECENT_TRENDS: 'Key Parameters',
  LAKE_ANALYTICS: 'Lake Analytics',

  GO_TO_RESULTS: 'GO TO ANALYTICS',

  LAKE_OVERVIEW: 'Lake Overview',

  WATER_TEMP_TITLE: 'Average Water Temperature',

  CHLOROPHYLL_TITLE: 'Average Chlorophyll Readings',

  Go_TO_LAKE: 'Add to Subscription',
  REMOVE_LAKE: 'REMOVE LAKE',



  // Search by Name page content

  SEARCH_BY_NAME_TITLE: 'Search for Lake by Name',

  SELECT_STATE_LABEL: 'Select State',

  ALL_STATES_OPTION: 'All States',

  LAKE_NAME_LABEL: 'Lake Name',

  NO_LAKES_FOUND: 'Start looking for your lake!',

  TRY_DIFFERENT_SEARCH: 'Try adjusting your search criteria or selecting a different state',

  SEARCH_PLACEHOLDER: 'Enter lake name...',

  FILTER_BUTTON_LABEL: 'Filter',

  SHOWING_LABEL: 'Drag the map to update the list below. Red marker represent individual lakes. Blue circles represent a lake group.',

  OF_LABEL: 'of',

  LAKES_LABEL: 'Lakes',

  CLEAR_BUTTON_LABEL: 'Clear',
  ADD_LAKE_BUTTON_LABEL: 'Become a member',
  ERROR_SEARCHING_LAKES: 'Failed to search lakes',


  // Lake card labels
  COMMUNITY_MEMBERS: 'Members',
  COMMUNITY_ADMINS: 'Admins',
  RECENT_DATA: 'Latest Update',
  WATER_QUALITY_STATUS: 'Water Quality Status',
  DEEP_WATER_OXYGEN: 'Deep Water Oxygen',
  SURFACE_WATER_TEMP: 'Surface Water Temperature',
  ALGAL_BLOOMS: 'Algal Blooms',
  TOTAL_SAMPLES: 'Data Points',
  TOTAL_STATIONS: 'Sampling Locations',
  SPAN_YEARS: 'Span (Years)',
  LATEST_FIELD_NOTE: 'LATEST FIELD NOTE',
  DRONE_REQUEST: 'Is someone able to add some drone flyover data?',
 



  // Lake Pulse Access section

  ACCESS_SECTION_TITLE: 'What does Lake Pulse access provide you with?',

  ACCESS_DESCRIPTION: 'Lake Pulse is a telehealth company offering a menu of affordable testing & monitoring solutions, called \'The Toolbox\', that our subscribers can utilize to produce lake health & safety data and basic insights, which they can easily share with the lake\'s stakeholders. A Lake Pulse subscription includes a \'Portal\', and 24/7 help desk called \'The Boathouse\', where answers can be found for any lake health & safety question.',

  ACCESS_FEATURES: {

    ANALYSIS: 'Detailed, ongoing analysis of up to 5 lakes, including water clarity, algae bloom, bacterial issues, ecological issues, and more!',

    COMMUNITY: 'Connect with you lake community to discuss issues, plan solutions and meet in person.',

    TOOLBOX: 'Purchase data-gathering devices from the Toolbox to help enrich lake information further.',

    EDUCATION: 'Access to research and educational information, including live discussions with lake experts, in our Boathouse zone.'

  },

  REGISTER_CTA: 'Register for Lake Pulse Access today!',



  // Lake metrics

  METRICS: {

    DEEP_WATER_OXYGEN: 'Deep Water Oxygen'

  },



  // Lake overview labels

  OVERVIEW_LABELS: {

    NAME: 'NAME',

    COUNTY: 'COUNTY',

    STATE: 'STATE',

    ACREAGE: 'ACREAGE',

    DEPTH: 'DEPTH',

    LAT_LONG: 'LAT/LONG',

    LAKE_TYPE: 'LAKE TYPE',

    PUBLIC_ACCESS: 'PUBLIC ACCESS',

    PARTNER: 'PARTNER',
    ERROR_FETCHING_LAKE_OVERVIEW: 'error fetching lake overview',
    ERROR_FETCHING_WEATHER_DATA: 'error fetching weather data',
    ERROR_FETCHING_CHARACTERISTICS: 'error fetching characteristics',
    ERROR_FETCHING_FAVORITES: 'error fetching favorites',
    PRESSURE: 'Pressure',
    VISIBILITY: 'Visibility',
    CLOUD: 'Cloud',
    DEW_POINT: 'Dew Point',
    HUMIDITY: 'Humidity',
    WIND_SPEED: 'Wind Speed',
    WIND_DIRECTION: 'Wind Direction',
    WIND_GUST: 'Wind Gust',
    WIND_CHILL: 'Wind Chill',
    RAINFALL: 'Rainfall',
    CHARACTERISTIC_SUBTITLE: 'Results averaged across lake depths for the latest date captured by the selected location. Hover over the characteristic name to find more information.',
  },
 

  // Pagination

  LAKES_PER_PAGE: 10,



  // Error messages

  STATES_LOAD_ERROR: 'Failed to load states',

  LAKES_SEARCH_ERROR: 'Failed to search lakes',



  // Search parameters

  DEFAULT_PAGE: '1',

  URL_PARAMS: {

      STATE: 'state',

      SEARCH: 'search',

      PAGE: 'page'

  },



  // DOM element IDs

  STATE_SELECT_ID: 'state',



  // CSS Classes

  CONTAINER_CLASS: 'min-h-screen bg-gray-100',

  MAIN_CONTENT_CLASS: 'max-w-8xl mx-auto py-6 sm:px-6 lg:px-8',

  ERROR_ALERT_CLASS: 'mb-4 p-4 text-red-700 bg-red-100 rounded-lg',

  SEARCH_GRID_CLASS: 'sm:px-0 grid grid-cols-10 gap-6',

  SEARCH_PANEL_CLASS: 'col-span-7 bg-white rounded-lg shadow p-2',

  STATE_SELECT_CLASS: 'block custom-select w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500',

  SEARCH_BY_MAP: {

    TITLE: 'Search for Lake by Map',

    ERROR_FETCH: 'Failed to load lakes data',

    LOG_MESSAGES: {

      MAP_CORNERS: 'Map Corners',

      MAP_CORNERS_ZOOM: 'Map Corners after zoom',

      API_PARAMS: 'API Request Parameters',

      API_PARAMS_ZOOM: 'API Request Parameters after zoom'

    },

    LAKEINVIEW: 'Lakes Available',

    LAKECURRENTVISIBLE:'lakes currently visible on the map',

    LOADINGLAKES: 'Loading lakes...',
    LOADING_LAKES_DATA: 'Loading lakes data...',
    ERROR_ADDING_LAKE: 'Error adding lake:',
  },

  NAV_ITEMS: {
    SEARCH_BY_NAME: 'SEARCH BY NAME',
    SEARCH_BY_MAP: 'SEARCH BY MAP',
    MAP_VIEW: 'MAP VIEW',
  },
  ACTIVE_CLASS: 'active',
// chart results page
ERROR_LOADING_CHART_DATA: 'Failed to load chart data',
ONE_YEAR: '1 Year',
TWO_YEARS: '2 Years',
THREE_YEARS: '3 Years',
FOUR_YEARS: '4 Years',
WEEK: 'Week',
NO_DATA_AVAILABLE_FOR_THIS_CHART: 'No data available for this chart',
LATITUDE: 'Latitude',
LONGITUDE: 'Longitude',
PREVIOUS: 'Previous',
NO_AUTH_TOKEN: 'No authentication token found',
ERROR_FETCHING_LAKE_STATE_LIST: 'Error fetching lake state list',
API_ERROR: 'API Error',
ERROR_FETCHING_MY_LAKES: 'Failed to get my lakes',
ERROR_FETCHING_MY_LAKES_COUNT: 'Failed to get my lakes count',
ERROR_REMOVING_LAKE: 'Failed to remove lake',
ERROR_FETCHING_CHARACTERISTICS: 'Failed to fetch characteristics',
ERROR_ADDING_FAVORITE: 'Failed to add favorite',
ERROR_REMOVING_FAVORITE: 'Failed to remove favorite',
ERROR_FETCHING_FAVORITES: 'Failed to fetch favorites',
ERROR_FETCHING_ZIP_CODE: 'Error fetching zip code',

  CHARACTERISTICS: {
    INFO_TOOLTIP: `The characteristics shown here are collected from various sensors and lake depths across time. 
    The colored indicators represent:
    
    • Green: Value is within optimal range
    • Yellow: Value requires attention
    • Red: Value is outside acceptable range
    • Gray: No range data available
    
    Click the star icon to add a characteristic to your favorites and view its trends to the right.`,
    SECTION_TITLE: 'Characteristics',
  },
    // ... existing strings
  
  // Auth related strings
  
  AUTH_EXPIRED_KEY: 'auth_expired',
  LOGIN_PATH: '/login',
  
  // Messages
  TOKEN_EXPIRING: 'Token is about to expire',
  TOKEN_EXPIRED: 'Token has expired',
  SILENT_RENEWAL_FAILED: 'Silent token renewal failed:',
  
  // Routes
  HOME_PATH: '/',
  CALLBACK_PATH: '/callback',
  NO_FAVORITES_ADDED: 'No favorites added yet',
  YES: 'Yes',
  NO: 'No',
  INVALID_DATE: 'Invalid date',
  DATE_PARSING_ERROR: 'Date parsing error:',
  NO_DATE_AVAILABLE: 'No date available',
  CURRENT_WEATHER: 'Current Weather',
  N_A: 'N/A',

  // Field notes
  FIELD_NOTES: 'Field Notes',
  GO_TO_FIELD_NOTES: 'Go to Field Notes',

  FIELD_NOTES_PAGE: {
    TITLE: "Field Notes",
    ADD_NOTE: "Add New Note",
    EDIT_NOTE: "Edit Note",
    DELETE_NOTE: "Delete Note",
    CONFIRM_DELETE: "Are you sure you want to delete this note?",
    NO_NOTES: "No field notes available for this lake",
    PLACEHOLDER: {
      TITLE: "Enter note title...",
      CONTENT: "Enter your note here...",
    },
    BUTTONS: {
      SAVE: "Save Note",
      CANCEL: "Cancel",
      CONFIRM: "Confirm",
    },
    SORT: {
      LABEL: "Sort by:",
      NEWEST: "Newest First",
      OLDEST: "Oldest First",
    }
  },

  CHART_CONSTANTS: {
    TIME_RANGES: {
      LAST_YEAR: { label: 'Last Year', value: '1' },
      LAST_TWO_YEARS: { label: 'Last 2 Years', value: '2' },
      LAST_THREE_YEARS: { label: 'Last 3 Years', value: '3' },
      LAST_FOUR_YEARS: { label: 'Last 4 Years', value: '4' }
    },
    COLORS: {
      DEFAULT: 'hsl(0, 0%, 50%)',
      SERIES: [
        'hsl(115, 70%, 50%)',
        'hsl(154, 70%, 50%)',
        'hsl(254, 70%, 50%)',
        'hsl(101, 70%, 50%)',
        'hsl(358, 70%, 50%)'
      ]
    },
    DATE_FORMAT: {
      INVALID: 'N/A',
      OPTIONS: { month: 'numeric', day: 'numeric', year: '2-digit' }
    },
    DAYS_IN_YEAR: 365,
    NO_DATA_MESSAGE: 'No data available for this chart',
    UNIT_OF_MEASURE: 'Unit of measure:',
  },
  SKIPPING_INVALID_DATA_POINT: 'Skipping invalid data point:',
  ERROR_UPDATING_CHARTS: 'Error updating charts:',
  ERROR_FETCHING_CURRENT_USER: 'Error fetching current user:',
  ERROR_UPDATING_NOTE: 'Failed to update note. Please try again.',
  ERROR_SAVING_NOTE: 'Failed to save note. Please try again.',
  ERROR_DELETING_NOTE: 'Failed to delete note. Please try again.',
  DELETE_BUTTON: 'Delete',
  CANCEL_BUTTON: 'Cancel',
  DELETE_CONFIRM_DIALOG: 'Are you sure you want to delete this note?',
  // String constants for all static text used in the component
LAKE_CARD_STRINGS:  {
    COMMUNITY_MEMBERS: "Members",
    COMMUNITY_ADMINS: "Admins",
    TOTAL_STATIONS: "Total Stations",
    TOTAL_SAMPLES: "Data Samples",
    YEARS_OF_DATA: "Years of Data",
    RECENT_DATA: "Recent Data Collection",
    SPAN_YEARS: "Years of Data",
},
SETTINGS: "Settings",
GENERAL: "General",
SETTINGS_DESCRIPTION: "Manage your personal information",
CHANGE_PROFILE_PICTURE: "Change Profile Picture",
UPLOADING: "Uploading...",
SAVE_CHANGES: "Save Changes", 
SAVING: "Saving...",
NAME: "First Name",
FAMILY_NAME: "Last Name",
ADDRESS: "Home Address",
NO_METRICS_SELECTED: 'No metrics selected',
ERROR_FETCHING_NOTES: 'Error fetching notes:',
PLEASE_ENTER_A_NOTE: 'Please enter a note',
ERROR_TOGGLE_LIKE: 'Error toggling like:',
NO_FIELD_NOTES_AVAILABLE: 'No field notes available',
VIEW_REPLIES: 'view',
REPLIES: 'replies',
REPLY: 'Reply',
CANCEL: 'Cancel',
POST: 'Post',
LAKE_NAME: 'Lake Name',
SENSOR_NAME: 'Sensor Name',
LOCATION: 'Location',
LATEST_ACTIVITY: 'Latest Activity',
LAKE_TYPE: 'Lake Type',
POSTED_BY: 'Posted by',
PRECIPITATION: 'Precipitation',
EVAPORATION: 'Evaporation',
SURFACE_INFLOW: 'Surface Inflow',
HYDROLOGY: 'Hydrology',
SOIL_CLASS: 'Soil Class',
IMPERVIOUS_SURFACE_COVER: 'Impervious Surface Cover',
VEGETATIVE_COVER: 'Vegetative Cover',
RUNOFF_GENERATION: 'Runoff Generation',
BOAT_LANDINGS: 'Boat Landings',
SWIMMING_BEACHES: 'Swimming Beaches',
MARINAS: 'Marinas',
UNDEVELOPED_ACCESS_POINTS: 'Undeveloped Access Points',
PHOSPHORUS_LOAD: 'Phosphorus Load',
NITROGEN_LOAD: 'Nitrogen Load',
SEDIMENT_LOAD: 'Sediment Load',
OTHER: 'Other',
SELECT_LOCATION: 'Select Location',
SURFACE_OUTFLOW: 'Surface Outflow',
GROUNDWATER_INSEEPAGE: 'Groundwater Inseepage',
GROUNDWATER_OUTSEEPAGE: 'Groundwater Outseepage',
DETENTION_TIME: 'Detention Time',
WATER_LEVEL_AGE_RANGE: 'Water Level Age/Range',
WATERSHED_AREA: 'Watershed Area',
NATURAL_LAND_USE: '% Natural Land Use',
URBANIZED_LAND_USE: '% Urbanized Land Use',
AGRICULTURAL_LAND_USE: '% Agricultural Land Use',
LOADING_WEATHER_DATA: 'Loading weather data...',
MY_TOOLBOX: 'My Toolbox',
IN_SITU_MONITORING: 'In-Situ Monitoring',
LAB_FIELD_TESTING: 'Lab & Field Testing',
SURVEYS: 'Surveys',
BIO_DIVERSITY: 'Biodiversity Tools',
NEXT: 'Next',
ERROR_FETCHING_LAKE_DETAILS: 'Failed to load lake details',
MAP_NOT_FULLY_INITIALIZED: 'Map not fully initialized',
ERROR_INITIALIZING_CLUSTER: 'Error initializing cluster:',
ERROR_LOADING_POINTS: 'Error loading points:',
PROFILE_UPDATED_SUCCESSFULLY: 'Profile updated successfully!',
FAILED_TO_UPDATE_PROFILE: 'Failed to update profile. Please try again.',
PROFILE_PICTURE_REMOVED_SUCCESSFULLY: 'Profile picture removed successfully!',
FAILED_TO_REMOVE_PROFILE_PICTURE: 'Failed to remove profile picture. Please try again.',
DELETE: 'Delete',
ERROR_UPDATING_FIELD_NOTE: 'Error updating field note:',
ERROR_RESPONSE: 'Response error:',
ERROR_ADDING_FIELD_NOTE: 'Error adding field note:',
ERROR_FETCHING_USER_ATTRIBUTES: 'Failed to fetch user attributes',
ERROR_FETCHING_COGNITO_USERS: 'Failed to fetch cognito users',

ERROR_FETCHING_LAKE_OVERVIEW: 'Failed to fetch lake overview',
ERROR_FETCHING_WEATHER_DATA: 'Failed to fetch weather data',
NO_DATA_AVAILABLE: 'No data available',
ERROR_UPDATING_USER_PROFILE: 'Error updating user profile:',
IMAGE_TOO_LARGE: 'Image too large. Please try a smaller image.',
ERROR_UPDATING_PROFILE_PICTURE: 'Error updating profile picture:',
ERROR_DELETING_PROFILE_PICTURE: 'Error deleting profile picture:',
ERROR_INITIALIZING_GA: 'Failed to initialize Google Analytics:',
ERROR_LOADING_MEASUREMENT_RESULTS: 'Failed to load measurement results',
MONTH_YEAR: 'Month Year',
MEASUREMENT: 'Measurement',
MEASURE_UNIT: 'Measure Unit',
YEAR: 'Year',
MONTH: 'Month',
ACTIVITY_DATE: 'Activity Date',
ACTIVITY_TIME: 'Activity Time',
DEPTH: 'Depth',
DEPTH_UNIT: 'Depth Unit',
CHARACTERISTIC: 'Characteristic',
ALT_NAME_1: 'Alt Name 1',
ALT_NAME_2: 'Alt Name 2',
ALT_NAME_3: 'Alt Name 3',
ALT_NAME_4: 'Alt Name 4',
LAKE_STATE: 'Lake State',
MULTIPLE_STATES: 'Multiple States',
TOTAL_AREA_ACRES: 'Total Area (acres)',
WATER_AREA_ACRES: 'Water Area (acres)',
LAKE_LATITUDE: 'Lake Latitude',
LAKE_LONGITUDE: 'Lake Longitude',
LOCATION_NAME: 'Location Name',
LOCATION_ID: 'Location ID',
LOCATION_STATE: 'Location State',
LOCATION_LATITUDE: 'Location Latitude',
LOCATION_LONGITUDE: 'Location Longitude',
LAKE_COUNTRY: 'Country',
MEASUREMENT_RESULTS: 'Measurement Results',
TOTAL_RECORDS: 'Total Records',
VISIBLE_COLUMNS: 'Visible Columns',
UNIT_OF_MEASURE: 'Unit of measure',
USERS: 'Users',
STATISTICS: 'Statistics',
ERROR_FETCHING_USERS: 'Failed to fetch users',
LOGOUT: 'Logout',
SUB_LABEL: 'Sub',
EMAIL_LABEL: 'Email',
MEMBER: 'Member',
LAKEADMIN: 'Admin',
SUPER_ADMIN: 'Super Admin',
LAKE_LABEL: 'Lake',
LAST_LOGIN: 'Last Login',
ADMINISTRATION: 'Administration',
USER_ADMINISTRATION: 'User Administration',
SEARCH_USERS: 'Search Users',
ADMIN_LOGIN: 'Admin Login',
PASSWORD: 'Password',
HIDE: 'Hide',
SHOW: 'Show',
LOGIN_IN: 'Logging in...',
LOGIN: 'Login',
ACCESS_DENIED: 'Access denied. Only Super Admins can log in.',
AUTHENTICATION_FAILED: 'Authentication failed:',
NO_ID_TOKEN: 'No idToken found in local storage',
NO_USER_ID: 'No user id found',
ERROE_DELETING_USER: 'Error deleting user:',
TOTAL_MEMBERS: 'Total Members',
SUPER_ADMINS: 'Super Admins',
LAKE_ADMINS: 'Lake Admins',
SUBSCRIBERS: 'Subscribers',
ARE_YOU_SURE_CHANGE_ROLE: 'Are you sure you want to change the role of this user?',
ARE_YOU_SURE_DELETE_USER: 'Are you sure you want to delete this user?', 
} as const;


