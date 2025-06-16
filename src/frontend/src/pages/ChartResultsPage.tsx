import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { MaterialReactTable, type MRT_ColumnDef, MRT_SortingState, MRT_ColumnFiltersState } from 'material-react-table';
import ChartResults from '../components/ChartResults';
import Header from '../components/Header';
import { APP_STRINGS } from '../constants/strings';
import { ChartData, Characteristic, LakeOverview, MeasurementResult } from '../types/api.types';
import { 
  getCharacteristics, 
  getCharacteristicChart,
  getLakeOverviewById,
  getLakeMeasurementResults
} from '../services/api/lake.service';




const ChartResultsPage: React.FC = () => {
  const { lakePulseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const selectedMetrics = location.state?.selectedMetrics || [];
  const [chartData, setChartData] = useState<ChartData[][]>([]);
  const [characteristicsMap, setCharacteristicsMap] = useState<Record<string, Characteristic>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lakeData, setLakeData] = useState<LakeOverview[]>([]);
  const [measurementData, setMeasurementData] = useState<MeasurementResult[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([]);
 
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});
  const [lakeOverview, setLakeOverview] = useState<LakeOverview | null>(null);

  /**
   * useEffect to fetch data for the chart
   */
  useEffect(() => {
    if (!selectedMetrics.length) {
      navigate(`/lake/${lakePulseId}`);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

     

        // Fetch characteristics
        const characteristics = await getCharacteristics();
        const mappedCharacteristics = characteristics.reduce((acc, char) => ({
          ...acc,
          [char.characteristicId]: char
        }), {});
        setCharacteristicsMap(mappedCharacteristics);

        // Create chart entries for all selected metrics, even if no data
        const chartPromises = selectedMetrics.map(async (metricId) => {
          const chartPoints = await getCharacteristicChart(lakePulseId!, metricId, 1460);
        
          return chartPoints.map(point => ({ ...point, metricId }));
        });
        const allChartData = await Promise.all(chartPromises);
        setChartData(allChartData); // Keep all chart entries, even empty ones
      
        localStorage.setItem(`chartResults_${lakePulseId}`, JSON.stringify(allChartData));
      } catch (error) {
        console.error(APP_STRINGS.ERROR_LOADING_CHART_DATA, error);
        setError(APP_STRINGS.ERROR_LOADING_CHART_DATA);
      } finally {
        setLoading(false);
      }
    };
 // Try to load stored chart data first
 const storedChartData = localStorage.getItem(`chartResults_${lakePulseId}`);
 if (storedChartData) {
   setChartData(JSON.parse(storedChartData));
 }

    fetchData();
  }, [lakePulseId, selectedMetrics, navigate]);

  // Update localStorage when chart data changes
  useEffect(() => {
    if (lakePulseId && chartData.length > 0) {
      localStorage.setItem(`chartData_${lakePulseId}`, JSON.stringify(chartData));
    }
  }, [chartData, lakePulseId]);
  // Add this state if you want to keep track of the last viewed lake
const [lastViewLake, setLastViewLake] = useState<LakeOverview | null>(null);

// Example: Set lastViewLake when lakeOverview changes (or set it from props/context)
useEffect(() => {
  if (lakeOverview) {
    setLastViewLake(lakeOverview);
  }
}, [lakeOverview]);
  /**
   * useEffect to fetch data for the lake name and lakePulseId
   */
  useEffect(() => {
    const fetchLakeData = async () => {
      if (!lakePulseId) return;
      
      try {
        const data = await getLakeOverviewById(parseInt(lakePulseId));
        setLakeData([{
          lakePulseId: data.lakeOverview.lakePulseId,
          lakeName: data.lakeOverview.lakeName,
          lakeState: data.lakeOverview.lakeState || 'Unknown',
          lakeLatitude: data.lakeOverview.lakeLatitude || 0,
          lakeLongitude: data.lakeOverview.lakeLongitude || 0,
          lakeCounty: data.lakeOverview.lakeCounty || 'Unknown',
          lakeAreaAcres: data.lakeOverview.lakeAreaAcres || 0,
          comunityMembersDto: data.lakeOverview.comunityMembersDto // Add this line
        }]);
        setLakeOverview(data.lakeOverview);
      } catch (error) {
        console.error(APP_STRINGS.ERROR_LOADING_CHART_DATA, error);
      }
    };

    fetchLakeData();
  }, [lakePulseId]);

  // Add function to determine which columns have values
  const updateColumnVisibility = (data: MeasurementResult[]) => {
    if (!data.length) return;

    const hasValues: Record<string, boolean> = {};
    const allColumns = columns.map(col => col.accessorKey as string);

    allColumns.forEach(column => {
      const hasValue = data.some(row => {
        const value = row[column as keyof MeasurementResult];
        return value !== null && value !== undefined && value !== '';
      });
      hasValues[column] = hasValue;
    });

    setColumnVisibility(hasValues);
  };

  const fetchMeasurementResults = useCallback(async () => {
    if (!lakePulseId) return;
    
    try {
      setIsTableLoading(true);

      // Convert sorting to API format
      const sortColumns = sorting.map(sort => ({
        key: (sort.id),
        value: sort.desc ? 'desc' : 'asc'
      }));

      // Convert filters to API format
      const filters = columnFilters.map(filter => ({
        key: (filter.id),
        value: filter.value as string
      }));

      const response = await getLakeMeasurementResults(
        lakePulseId,
        pagination.pageIndex + 1,
        pagination.pageSize,
        filters,
        sortColumns
      );

      // Transform snake_case to camelCase
      setMeasurementData(response.measurementResultList);
      setTotalRows(response.totalCount);
      updateColumnVisibility(response.measurementResultList);
    
    } catch (error) {
      console.error(APP_STRINGS.ERROR_LOADING_MEASUREMENT_RESULTS, error);
    } finally {
      setIsTableLoading(false);
    }
  }, [lakePulseId, pagination, sorting, columnFilters]);

  useEffect(() => {
    fetchMeasurementResults();
  }, [fetchMeasurementResults]);
 // Update handleSort method to format decimal values
  const formatNumber = (num: number): string => {
    // For US number format (e.g., 123,456,789)
    return num.toLocaleString('en-US');
  };
  const columns = useMemo<MRT_ColumnDef<MeasurementResult>[]>(
    () => [
      {
        accessorKey: 'location_name',
        header: APP_STRINGS.LOCATION_NAME,
        size: 200,
        enableSorting: true,
        muiTableHeadCellProps: {
          sx: { cursor: 'pointer' }
        }
      },
      {
        accessorKey: 'location_latitude',
        header: APP_STRINGS.LOCATION_LATITUDE,
        size: 210,
        enableSorting: true,
        Cell: ({ cell }) => cell.getValue<number>()?.toFixed(6) || 'N/A',
        muiTableHeadCellProps: {
          sx: { cursor: 'pointer' }
        }
      },
      {
        accessorKey: 'location_longitude',
        header: APP_STRINGS.LOCATION_LONGITUDE,
        size: 220,
        enableSorting: true,
        Cell: ({ cell }) => cell.getValue<number>()?.toFixed(6) || 'N/A',
        muiTableHeadCellProps: {
          sx: { cursor: 'pointer' }
        }
      },
      {
        accessorKey: 'activity_start_time',
        header: APP_STRINGS.ACTIVITY_TIME,
        size: 180,
        enableSorting: true,
        muiTableHeadCellProps: {
          sx: { cursor: 'pointer' }
        }
      },
      {
        accessorKey: 'activity_depth_height_measure',
        header: APP_STRINGS.DEPTH,
        size: 180,
        Cell: ({ cell }) => cell.getValue<string>() || 'N/A',

        enableSorting: true,
        muiTableHeadCellProps: {
          sx: { cursor: 'pointer' }
        }
      },
      {
        accessorKey: 'activity_depth_height_measure_unit',
        header: APP_STRINGS.DEPTH_UNIT,
        size: 180,
        Cell: ({ cell }) => cell.getValue<string>() || 'N/A',

        enableSorting: true,
        muiTableHeadCellProps: {
          sx: { cursor: 'pointer' }
        }
      },
      {
        accessorKey: 'result_characteristic',
        header: APP_STRINGS.CHARACTERISTIC,
        size: 180,
        enableSorting: true,
        muiTableHeadCellProps: {
          sx: { cursor: 'pointer' }
        }
      },
      {
        accessorKey: 'result_measure',
        header: APP_STRINGS.MEASUREMENT,
        size: 180,
        Cell: ({ cell }) => cell.getValue<number>()?.toFixed(2) || 'N/A',
        enableSorting: true,
        muiTableHeadCellProps: {
          
          sx: { cursor: 'pointer' }
        }
      },
      {
        accessorKey: 'result_measure_unit',
        header: APP_STRINGS.MEASURE_UNIT,
        size: 180,
        Cell: ({ cell }) => cell.getValue<string>() || 'N/A',
        enableSorting: true,
        muiTableHeadCellProps: {
          
          sx: { cursor: 'pointer' }
        }
      },
      {
        accessorKey: 'result_month_year',
        header: APP_STRINGS.MONTH_YEAR,
        size: 170,
        enableSorting: true,
        muiTableHeadCellProps: {
          sx: { cursor: 'pointer' }
        }
      }
    ],
    []
  );



    // Result Information
  if (loading) return <div className="p-4">{APP_STRINGS.LOADING}</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!selectedMetrics.length) return <div className="p-4">{APP_STRINGS.NO_METRICS_SELECTED}</div>;

  return (
    <main className="main-lake-page">
      <Header 
        lakeName={measurementData[0]?.lake_name} 
        lakePulseId={lakePulseId!}
        showReturn={true}
      />
      <div className="lake-page-container">
        <div className="lake-chart-results">
         

          <div className="lake-section mb-0" style={{marginBottom: '0px', padding: '0px'}}>
            <div className="flex justify-between items-center">
              <h1 className="section-title mb-0">
                {APP_STRINGS.LAKE_ANALYTICS}
              </h1>
            </div>
          </div>
          <div className="chart-grid">
            {chartData.map((chart, index) => (
              <div className="chart-section" key={index}>
                <ChartResults 
                 
                  chartData={chart} 
                  characteristicsMap={characteristicsMap}
                  lakePulseId={lakePulseId!}
                  onTimeRangeChange={() => {
                    // Handle date range changes here
                  }}
                />
              </div>
            ))} 
          </div>
          
          {/* Analytics Table Section */}
          <div className="analytics-table-section">
            <div className="flex justify-between items-center">
              <h2 className="section-title">{APP_STRINGS.MEASUREMENT_RESULTS}</h2>
            </div>
             {/* Lake Overview Section */}
       





{/* Lake Overview Section */}
{(lakeOverview || lastViewLake) && (
  <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {/* Show lakeOverview data */}
      {lakeOverview && (
        <>
          <div className='mb-2'>
            <p className="text-label">{APP_STRINGS.LAKE_NAME}</p>
            <p className="text-value">{lakeOverview.lakeName || 'N/A'}</p>
          </div>
          <div className='mb-2'>
            <p className="text-label">{APP_STRINGS.LAKE_COUNTRY}</p>
            <p className="text-value">{lakeOverview.lakeCounty || 'N/A'}</p>
          </div>
          <div className='mb-2'>
            <p className="text-label">{APP_STRINGS.LAKE_STATE}</p>
            <p className="text-value">{lakeOverview.lakeState || 'N/A'}</p>
          </div>
          <div className='mb-2'>
            <p className="text-label">{APP_STRINGS.TOTAL_AREA_ACRES}</p>
            <p className="text-value">{formatNumber(lakeOverview.lakeAreaAcres || 0)}</p>
          </div>
          
          <div className='mb-2'>
            <p className="text-label">{APP_STRINGS.LAKE_LATITUDE}</p>
            <p className="text-value">{lakeOverview.lakeLatitude?.toFixed(6) || 'N/A'}</p>
          </div>
          <div className='mb-2'>
            <p className="text-label">{APP_STRINGS.LAKE_LONGITUDE}</p>
            <p className="text-value">{lakeOverview.lakeLongitude?.toFixed(6) || 'N/A'}</p>
          </div>
        </>
      )}


    </div>
  </div>
)}
            <MaterialReactTable
              columns={columns}
              data={measurementData}
              enableColumnFilters
              enableSorting
              enableColumnResizing
              enableColumnDragging
              enableFullScreenToggle
              enableHiding
              enableDensityToggle
              enableColumnOrdering
              manualPagination
              manualSorting
              
              rowCount={totalRows}
              onPaginationChange={setPagination}
              onSortingChange={setSorting}
              onColumnFiltersChange={setColumnFilters}
              onColumnVisibilityChange={setColumnVisibility}
              state={{
                pagination,
                sorting,
                columnFilters,
                isLoading: isTableLoading,
                columnVisibility,
              }}
             
              initialState={{
                density: 'compact',
                pagination: { pageSize: 10, pageIndex: 0 },
                columnVisibility: {
                  location_name: true,
                  location_latitude: true,
                  location_longitude: true,
                  activity_start_time: true,
                  activity_depth_height_measure: true,
                  result_characteristic: true,
                  result_measure: true,
                  result_measure_unit: true,
                  result_year: true,
                  result_month: true,
                  result_month_year: true
                },
              }}
              renderTopToolbarCustomActions={() => (
                <div className="px-4 py-2 flex items-center gap-4">
                  <div>
                    <strong>{APP_STRINGS.TOTAL_RECORDS}:</strong> {totalRows.toLocaleString()}
                  </div>
                  <div>
                    <strong>{APP_STRINGS.VISIBLE_COLUMNS}:</strong> {Object.values(columnVisibility).filter(Boolean).length}
                  </div>
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

// Utility functions


export default ChartResultsPage; 