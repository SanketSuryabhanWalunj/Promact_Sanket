import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { APP_STRINGS } from "../constants/strings";
import "../styles/common.css";
import LakeMap from "../components/LakeMap";
import { useNavigate, useLocation } from "react-router-dom";
import { getMyLakes, removeLake, getCharacteristics } from '../services/api/lake.service';
import Pagination from "../components/Pagination";
import { LakeCharacteristic, Characteristic, Lake } from '../types/api.types';
import { useLakePulse } from "../context/LakePulseContext";


/**
 * MyLakes Component
 * 
 * This component displays a list of lakes that the user has added to their collection.
 * Features:
 * - Shows lake details and metrics
 * - Displays community information
 * - Shows recent data collection
 * - Provides interactive map visualization
 * - Handles authentication and error states
 */




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



const getStatusColor = (characteristic: LakeCharacteristic, characteristicsMap: Record<string, Characteristic>) => {
  const charMapping = characteristicsMap[characteristic.resultCharacteristic];
  if (!charMapping) return "status-gray";
  
  const value = characteristic.resultMeasure;
  const boundType = charMapping.boundType;

  // If no bound type or N type, return gray
  if (!boundType || boundType === 'N') {
    return "status-gray";
  }

  switch (boundType) {
    case 'L': // Lower is better
      if (value < charMapping.lowerBound) return "status-green";
      if (value > charMapping.upperBound) return "status-red";
      return "status-yellow";
      
    case 'H': // Higher is better
      if (value < charMapping.lowerBound) return "status-red";
      if (value > charMapping.upperBound) return "status-green";
      return "status-yellow";
      
    case 'M': // Middle is better
      if (value < charMapping.lowerBound || value > charMapping.upperBound) return "status-red";
      return "status-green";
      
    default:
      return "status-gray";
  }
};

const formatNumber = (num: number | undefined | null): string => {
  if (num === undefined || num === null || isNaN(num)) {
    return "N/A"; // Return a fallback value if the input is invalid
  }
  return num.toLocaleString("en-US");
};

const MyLakes = () => {
  // Navigation hook for routing
  const navigate = useNavigate();
  const location = useLocation();
  
  // State management
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [myLakes, setMyLakes] = useState<Lake[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [lakeFavorites, setLakeFavorites] = useState<Record<string, LakeCharacteristic[]>>({});
  const [characteristicsMap, setCharacteristicsMap] = useState<Record<string, Characteristic>>({});
  const [selectedLake, setSelectedLake] = useState<Lake | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showDialog, setShowDialog] = useState(false);

  const { lakes } = useLakePulse();

  // Add pagination function
  const paginatedLakes = () => {
    const indexOfLastLake = currentPage * 10;
    const indexOfFirstLake = indexOfLastLake - 10;
    return myLakes.slice(indexOfFirstLake, indexOfLastLake);
  };


  /**
   * Fetches user's lakes on component mount
   * Handles authentication and error states
   */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [lakes, allCharacteristics] = await Promise.all([
          getMyLakes(),
          getCharacteristics()
        ]);

        // Map characteristics to their display names
        const favorites: Record<string, LakeCharacteristic[]> = {};
        
        lakes.forEach(lake => {
          if (lake.lakeCharacteristics?.length) {
            favorites[lake.lakePulseId] = lake.lakeCharacteristics;
          }
        });

        // Create characteristics map
        const charMap = allCharacteristics.reduce((acc, char) => ({
          ...acc,
          [char.characteristicId]: char
        }), {});
        setCharacteristicsMap(charMap);
        
        setMyLakes(lakes);
        setTotalCount(lakes.length);
        setLakeFavorites(favorites);

      } catch (error) {
        console.error(APP_STRINGS.ERROR_FETCHING_LAKES, error);
        setError(error instanceof Error ? error.message : APP_STRINGS.LOAD_ERROR);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.key]); // Refetch when navigation occurs

  /**
   * Handles navigation to individual lake page
   */
  const handleGoToLakes = () => {
    navigate('/search/name');
  };

  /**
   * Add this new function to handle lake removal
   */
  const handleRemoveLake = async (lakeId: number) => {
    try {
      const userDataStr = localStorage.getItem('idToken');
      if (!userDataStr) {
        setError(APP_STRINGS.LOGIN_REQUIRED);
        return;
      }

      const userData = JSON.parse(userDataStr);
      const userId = userData.profile?.sub || userData.profile?.['cognito:username'];
      
      await removeLake(userId, lakeId);
      setMyLakes(prevLakes => prevLakes.filter(lake => lake.lakePulseId !== lakeId));
      setShowConfirmDialog(null);
    } catch (error) {
      console.error(APP_STRINGS.ERROR_REMOVING_LAKE, error);
      setError(APP_STRINGS.ERROR_REMOVING_LAKE);
    }
  };
    /**
   * Handles page change in pagination
   * @param {number} page - New page number
   */
    const handlePageChange = (page: number) => {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
 // Function to remove time


 

  const handleGoToLake = (lake: Lake) => {
    if (lake) {
      navigate(`/lake/${lake.lakePulseId}`);
    }
    setShowDialog(false);
  };

  /**
   * Loading state render
   */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 loading-container">
        <Header />
        <main className="max-w-8xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="loading text-center">{APP_STRINGS.LOADING_LAKES}</div>
        </main>
      </div>
    );
  }

  /**
   * Error state render
   */
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="max-w-8xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="error-message">{error}</div>
        </main>
      </div>
    );
  }

  /**
   * Main render with lakes data
   */
  return (
    <div>
      


      <main>
        <h1>
          {APP_STRINGS.MY_LAKES_TITLE}
        </h1>
        <div className="sm:px-0 mylakes">
            <div className="grid">
              {myLakes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xl text-gray-600">{APP_STRINGS.NO_LAKES_MESSAGE}</p>
                  <button onClick={handleGoToLakes} className="mt-4 inline-flex items-center px-4 py-2 border border-transparent  font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    {APP_STRINGS.Go_TO_LAKE}
                  </button>
                </div>
              ) : (
                <>
                  {paginatedLakes().map((lake: Lake) => (
                  <div key={lake.lakePulseId} className="mylake p-1 rounded-lg shadow hover:shadow-md transition-shadow grid grid-cols-4 gap-4 py-4">
                    <div className="mylakes-box item">
                      <div className="mylakes-box-name">
                        <h2>
                          {lake.lakeName}
                        </h2>
                        <p>
                         {lake.lakeCounty}, {lake.lakeState}
                        </p>
                      
                        <button 
                          onClick={() => handleGoToLake(lake)} 
                          className="mylakes-link"
                        >
                          {APP_STRINGS.Go_TO_LAKE}
                        </button>
                        <button 
                          onClick={() => setShowConfirmDialog(lake.lakePulseId)} 
                          className="mylakes-link remove">
                          {APP_STRINGS.REMOVE_LAKE}
                        </button>

                        {showConfirmDialog === lake.lakePulseId && (
                          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 1000 }}>
                            <div className="bg-white p-6 rounded-lg shadow-xl">
                              <h3 className="text-lg font-medium mb-4">Are you sure you want to remove this lake?</h3>
                              <div className="flex justify-end gap-4">
                                <button
                                  onClick={() => setShowConfirmDialog(null)}
                                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                                >
                                  {APP_STRINGS.NO}
                                </button>
                                <button
                                  onClick={() => handleRemoveLake(lake.lakePulseId)}
                                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                  {APP_STRINGS.YES}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="mylakes-box-map">
                        <LakeMap 
                          coordinates={[lake.latitude, lake.longitude]} 
                          showPopup={false}
                          lakeName={lake.lakeName}
                        />
                      </div>
                    </div>
                    <div className="mylakes-box">
                      <div className="flex justify-end items-center">
                      <p className="community-num">
                      {lake.communityUsers}
                        </p>
                        <p className="community-text">
                          {APP_STRINGS.COMMUNITY_MEMBERS}
                        </p>
                      </div>
                      <div className="flex justify-end items-center">
                        <p className="community-num">
                          {lake.communitySubscriber}
                        </p>
                        <p className="community-text">
                          {APP_STRINGS.SUBSCRIBERS}
                        </p>
                      </div>
                      <div className="flex justify-end items-center">
                      <p className="community-num">
                      {formatNumber(lake.communityAdmin)}
                        </p>
                        <p className="community-text">
                          {APP_STRINGS.COMMUNITY_ADMINS}
                        </p>
                      </div>
                      <div className="flex justify-end items-center">
                      <p className="community-num">
                      {formatDate(lake.recentDataCollection || "N/A")}
                        </p>
                        <p className="community-text">
                          {APP_STRINGS.RECENT_DATA}
                        </p>
                      </div>
                    </div>
                    <div className="mylakes-box">
                      <div className="flex justify-end items-center">
                        <p className="community-num">
                          {formatNumber(lake.totalStations)}
                        </p>
                        <p className="community-text">
                          {APP_STRINGS.TOTAL_STATIONS}
                        </p>
                      </div>
                      <div className="flex justify-end items-center">
                        <p className="community-num">
                          {formatNumber(lake.totalSamples)}
                        </p>
                        <p className="community-text">
                          {APP_STRINGS.TOTAL_SAMPLES}
                        </p>
                      </div>
                      <div className="flex justify-end items-center">
                        <p className="community-num">
                          {lake.spanYears}
                        </p>
                        <p className="community-text">
                          {APP_STRINGS.SPAN_YEARS}
                        </p>
                      </div>
                    </div>
                    {/* Favorites section */}
                    <div className="mylakes-box favorites">
                      {lakeFavorites[lake.lakePulseId]?.length > 0 ? (
                        lakeFavorites[lake.lakePulseId].map((favorite) => (
                          <div key={favorite.resultCharacteristic} className="mb-3">
                            <span className={`status-box ${getStatusColor(favorite, characteristicsMap)}`}></span>
                        <p className="text-sm text-gray-600 mt-1">
                              {characteristicsMap[favorite.resultCharacteristic]?.characteristicName || favorite.resultCharacteristic}
                        </p>
                      </div>
                        ))
                      ) : (
                        <p className=" text-gray-500">{APP_STRINGS.NO_FAVORITES_ADDED}</p>
                      )}
                    </div>
                  </div>
                  
                  ))}
                  {myLakes.length > 0 && (
                    <div>
                    
                <Pagination
                  currentPage={currentPage}
                        totalPages={Math.max(1, Math.ceil(totalCount / 10))}
                  onPageChange={handlePageChange}
                />
                    </div>
                  )}
                </>
              )}
          </div>
        </div>
      </main>

     
    </div>
  );
};

export default MyLakes;
