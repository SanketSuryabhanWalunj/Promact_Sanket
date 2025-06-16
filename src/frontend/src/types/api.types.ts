// Common API Response type
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
}
export interface LakeDetails {
  // Other properties...
  geometry?: {
    type: string; // e.g., Point
    coordinates: [number, number]; // [longitude, latitude]
  };
lakePulseId: number;
lakeName: string;
lakeState: string;
lakeStateCode: string;
recentDataCollection: string;
totalSamples: number;
totalStations: number;
spanYears: number;
communityAdmin: number;
communityUsers: number;
communitySubscriber: number;
latitude: number | null;
longitude: number | null;
area: number | null;
depth: number | null;
elevation: number | null;
}

// Basic lake information type
export interface BasicLake {
    lakePulseId: number;
    lakeName: string;
    lakeState: string;
    recentDataCollection: string;
    totalSamples: number;
    totalStations: number;
    spanYears: number;
    latitude: number;
    longitude: number;
  lakeCounty: string;
  lakeAreaSqMi: number;
    communityAdmin: number;
    communityMembers: number;
    metrics: LakeMetric[];
}

// Full lake details type
export interface Lake {
  id: number;
  lakePulseId: number;
    lakeName: string;
  lakeState?: string;
  lakeCounty: string;
    recentDataCollection: string;
    totalSamples: number;
    totalStations: number;
    spanYears: number;
  latitude: number | null;
  longitude: number | null;
    communityAdmin: number;
    communityUsers: number;
    communitySubscriber: number;
  lakeCharacteristics: LakeCharacteristic[];
  
}

export interface mylakes {
   id: number;
    lakeCharacteristics: any;
    lakePulseId: number;
    lakeName: string;
    lakeCounty: string;
    lakeState?: string;
    recentDataCollection: string;
    totalSamples: number;
    totalStations: number;
    spanYears: number;
    latitude: number;
    longitude: number;
    communityAdmin: number;
    communityUsers: number;
    communitySubscriber: number;
}

export interface LakeMetric {
    name: string;
    status: 'good' | 'warning' | 'critical';
    value?: number;
    date?: string;
}

// Lake list response type
export interface LakeListResponse {
    lakes: Lake[];
    totalCount: number;
    page: number;
    pageSize: number;
}

// Lake details request type
export interface LakeDetailsRequest {
  lakeIds: string; // Comma-separated lake IDs
  pageNumber?: number;
  pageSize?: number;
}

// Lake details response type
export interface LakeDetailsResponse {
  lakes: LakeDetails[];
  totalCount: number;
}

export interface LakeCharacteristic {
resultCharacteristic: string;
resultMeasure: number;
resultMeasureUnit: string | null;
activityStartDate: string;
characteristicName?: string;
locationIdentifier?: string;
}

export interface Characteristic {
characteristicId: string;
characteristicName: string;
characteristicDescription: string;
characteristicUnits: string;
boundType: string;
lowerBound: number;
upperBound: number;
}

export interface ChartData {
metricId: string;
locationIdentifier: string;
activityStartDate: string;
resultMeasure: number;
}

export interface SensorLocation {
sensorLatitude: number;
sensorLongitude: number;
locationName: string;
}
export interface CommunityMembersDto {
  lakePulseId: string;
  userCount: number;
  subscriberCount: number;
  adminCount: number;
  userNames: string[];
  subscriberNames: string[];
  adminNames: string[];
}
export interface LakeOverview {
lakePulseId: number;
lakeName: string;
lakeState: string;
lakeLatitude: number;
lakeLongitude: number;
lakeCounty: string;
lakeAreaAcres: number;
sensorLocations?: SensorLocation[];
comunityMembersDto: CommunityMembersDto;
}

export interface WeatherData {
forecast?: any;
observations?: {
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
  timestamp: string;
  zipCode?: string;
};
error?: string;
}

export interface ChartDataPoint {
resultMeasure: number;
activityStartDate: string;
resultMeasureUnit: string;
location_identifier?: string;
}

export interface FieldNote {
id: string;
title: string;
content: string;
author: string;
timestamp: string;
}

export interface FieldNoteDto {
id: number;
userId: string;
userName: string;
lakeId: string;
note: string;
createdTime: string;
isReplay: boolean;
likeCount: number;
fieldNoteId?: string;  // Parent note ID if this is a reply
isAlert: boolean,
alertLevelId: number,
alertCategorieId: number,
createdBy: string,
isCurrentUserLike: boolean,
}

export interface FieldNoteResponse {
fieldNotes: FieldNoteDto[];
totalCount: number;
pageNumber: number;
pageSize: number;
}

export interface LakeOverviewResponse {
lakeOverview: LakeOverview;
lakeCharacteristicList: LakeCharacteristic[];
sensorLocations: SensorLocation[];
}
// Add interface for sensor location
export interface SensorLocation {
sensorLatitude: number;
sensorLongitude: number;
locationName: string;
locationIdentifier: string;
maxActivityStartDate: string;
}

// Add interface for chart data with metadata
export interface ChartDataWithMetadata {
id: string;
data: {
  x: string;
  y: number;
}[];
characteristicName?: string;
}

export interface FormattedChartData {
id: string;
metricId: string;
color: string;
data: Array<{ x: string; y: number}>;
}

export interface LakeMapProps {
coordinates: [number, number];
showPopup?: boolean;
lakeName?: string;
interactive?: boolean;
}

export interface CharacteristicChart {
characteristicId: string;
characteristicName: string;
characteristicDescription: string;
characteristicUnits: string;
boundType: string;
lowerBound: number;
upperBound: number;
}
// Add this interface for chart data
export interface ChartDataPoint {
resultMeasure: number;
activityStartDate: string;
resultMeasureUnit: string;
locationIdentifier: string;
}

export interface ChartResultsProps {
chartData: ChartData[];
characteristicsMap: Record<string, Characteristic>;
showLimit?: number;
lakePulseId: string;
limit?: number;
onTimeRangeChange?: (startDate: Date, endDate: Date) => void;
}

export interface LakeSearchResult {
  lakePulseId: number;
  lakeName: string;
  lakeState: string;
lakeCounty: string;
  recentDataCollection: string;
  totalSamples: number;
  totalStations: number;
  spanYears: number;
latitude: number;
longitude: number;
  communityAdmin: number;
  communityMembers: number;
}

export interface LakeSearchResponse {
lakeDetailsList: LakeSearchResult[];
totalCount: number;
}

export interface MeasurementResult {
activity_depth_height_measure: number | null;
activity_depth_height_measure_unit: string;
activity_start_date: string;
activity_start_time: string;
lake_county: string;
lake_name: string;
lake_state: string;
lake_pulse_id: number;
location_identifier: string;
location_latitude: number;
location_longitude: number;
location_name: string;
location_state: string;
result_characteristic: string;
result_measure: number;
result_month: string;
result_month_year: string;
result_year: string;
result_measure_unit: string | null;
lake_waterarea_acres: number;
lake_totalarea_acres: number;
}
// Alert Category DTO
export interface AlertCategoryDto {
  id: number;
  categoryLabel: string;
  categoryDescription: string;
  defaultLevelId: number;
}

// Alert Level DTO
export interface AlertLevelDto {
  id: number;
  levelLabel: string;
  levelColor: string;
}


export interface CreateAlertRequest {
  alertLevelId: number;
  alertCategorieId: number;
  isFieldNoteSelected: boolean;
  alertText: string;
  userId: string;
  lakeId: string;
  userName: string;
}












