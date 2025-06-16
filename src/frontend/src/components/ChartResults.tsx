import React, { useState, useEffect, useRef } from 'react';
import { ResponsiveLine } from '@nivo/line';
import { ChartResultsProps, FormattedChartData } from '../types/api.types';
import { getCharacteristicChart } from '../services/api/lake.service';
import { APP_STRINGS } from '../constants/strings';

// Time range options
const timeRangeOptions = Object.values(APP_STRINGS.CHART_CONSTANTS.TIME_RANGES);
const rand = (min,max) => {
  return min + Math.random() * (max - min);
}

const colors = [
  '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
];

const colorMapping: { [key: string]: string } = {};

export const getColorForLocation = (locationIdentifier: string): string => {
  if (!colorMapping[locationIdentifier]) {
    const colorIndex = Object.keys(colorMapping).length % colors.length;
    colorMapping[locationIdentifier] = colors[colorIndex];
  }
  return colorMapping[locationIdentifier];
};



// Time range options


const ChartResults: React.FC<ChartResultsProps> = ({ 
  chartData = [], 
  characteristicsMap, 
  lakePulseId,
  onTimeRangeChange
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTimeRanges, setSelectedTimeRanges] = useState<Record<string, string>>({});
  const [modifiedChartData, setModifiedChartData] = useState<FormattedChartData[]>([]);
  
  // UseRef to persist colors across re-renders and charts
  const colorMapRef = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!chartData.length) {
      console.warn(APP_STRINGS.NO_DATA_AVAILABLE);
      return;
    }

    // Ensure colors are assigned consistently across charts
    chartData.forEach(item => {
      if (!colorMapRef.current[item.locationIdentifier]) {
        colorMapRef.current[item.locationIdentifier] = getColorForLocation(item.locationIdentifier);
      }
    });

    // Transform data for chart display
    const locationObj: Record<string, FormattedChartData> = {};
    chartData.forEach(item => {
      const locationKey = item.locationIdentifier;
      
      if (!locationObj[locationKey]) {
        locationObj[locationKey] = {
          id: locationKey,
          metricId: item.metricId,
          color: colorMapRef.current[locationKey],
          data: []
        };
      }
      
      locationObj[locationKey].data.push({ x: item.activityStartDate, y: item.resultMeasure });
    });

    setModifiedChartData(Object.values(locationObj));
  }, [chartData, lakePulseId]);

  const handleTimeRangeChange = async (chartId: string, years: string) => {
    if (isLoading || years === selectedTimeRanges[chartId]) return;

    try {
      setIsLoading(true);
      setSelectedTimeRanges(prev => ({ ...prev, [chartId]: years }));

      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(endDate.getFullYear() - parseInt(years));

      // Fetch data for the selected time range
      const response = await getCharacteristicChart(
        lakePulseId,
        chartId,
        parseInt(years) * APP_STRINGS.CHART_CONSTANTS.DAYS_IN_YEAR
      );

      // Filter and format data
      const filteredData = response.map(point => ({
        x: point.activityStartDate,
        y: point.resultMeasure,
        locationIdentifier: point.locationIdentifier
      }));

      // Ensure persistent colors for new data
      const updatedChartData = filteredData.reduce((acc, point) => {
        if (!colorMapRef.current[point.locationIdentifier]) {
          colorMapRef.current[point.locationIdentifier] = getColorForLocation(point.locationIdentifier);
        }
        
        const locationKey = point.locationIdentifier;
        if (!acc[locationKey]) {
          acc[locationKey] = {
            id: locationKey,
            metricId: chartId,
            color: colorMapRef.current[locationKey], // Preserve color
            data: []
          };
        }
        
        acc[locationKey].data.push({ x: point.x, y: point.y });
        return acc;
      }, {} as Record<string, FormattedChartData>);

      setModifiedChartData(Object.values(updatedChartData));
      onTimeRangeChange?.(startDate, endDate);
    } catch (error) {
      console.error(APP_STRINGS.ERROR_UPDATING_CHARTS, error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="sparkline-charts-grid">
      <div className="sparkline-chart">
        <div className="chart-header">
          <div className="chart-title-container">
            <h3>{characteristicsMap[modifiedChartData[0]?.metricId]?.characteristicName || 'Unknown Characteristic'}</h3>
            <div className="chart-subtitle">
             {APP_STRINGS.UNIT_OF_MEASURE} <strong>{characteristicsMap[modifiedChartData[0]?.metricId]?.characteristicUnits || ''}</strong>
            </div>
          </div>
          <select
            value={selectedTimeRanges[modifiedChartData[0]?.metricId] || '4'}
            onChange={(e) => handleTimeRangeChange(modifiedChartData[0]?.metricId, e.target.value)}
            className="time-range-select"
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div className="chart-container">
          {modifiedChartData.length > 0 ? (
            <ResponsiveLine
              data={modifiedChartData}
              margin={{ top: 10, right: 10, bottom: 50, left: 30 }}
              xScale={{ type: 'time', format: '%Y-%m-%d', useUTC: false, precision: 'day' }}
              xFormat="time:%Y-%m-%d"
              yScale={{ type: 'linear', stacked: false, min: 'auto', max: 'auto' }}
              enableSlices="x"
              useMesh={true}
              enableArea={false}
              curve="monotoneX"
              animate={false}
              isInteractive={true}
              enableGridX={false}
              enableGridY={true}
              gridYValues={5}
              axisBottom={{
                format: '%b %y',
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                tickValues: 'every 1 month',
               
                legendOffset: -12,
                legendPosition: 'middle',
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Linear Scale',
                legendOffset: -40,
                legendPosition: 'middle',
              }}
              colors={({ id }) => colorMapRef.current[id] || 'gray'} // Use stored colors
              pointSize={6}
              pointColor={{ theme: 'background' }}
              pointBorderWidth={2}
              pointBorderColor={{ from: 'serieColor' }}
              pointLabelYOffset={-12}
            />
          ) : (
            <div className="no-data-message">
              <p>{APP_STRINGS.NO_DATA_AVAILABLE}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartResults;
