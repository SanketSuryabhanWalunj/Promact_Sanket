/**
 * @file SearchByName.tsx
 * @description A page component that allows users to search for lakes by name and state,
 * with pagination and filtering capabilities.
 */

import React, { useState, useEffect } from 'react';
import { getLakeStateList, searchLakesByState, StateOption } from '../services/api/lake.service';
import LakeCard from '../components/LakeCard';
import Pagination from '../components/Pagination';
import { Lake } from '../types/api.types';
import { APP_STRINGS } from "../constants/strings";
import Header from "../components/Header";
import "../styles/common.css";
import { useSearchParams } from 'react-router-dom';


// Constants
const LAKES_PER_PAGE = 10;
const SORT_OPTIONS = {
  ASC: 'ASC',
  DESC: 'DESC'
} as const;


/**
 * SearchByName Component
 * @component
 * @returns {JSX.Element} Rendered search page with filters and results
 */
const SearchByName: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State management
  const [states, setStates] = useState<StateOption[]>([]);
  const [selectedState, setSelectedState] = useState<string>(searchParams.get('state') || '');
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('search') || '');
  const [lakes, setLakes] = useState<Lake[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [totalCount, setTotalCount] = useState(0);
  const [filterOption, setFilterOption] = useState<string>('');

  const [sortDirection, setSortDirection] = useState<string>('');
  const [userRole, setUserRole] = useState<string | null>(null);



  useEffect(() => {
       const userProfileStr = localStorage.getItem("currentUserProfile");
       const userProfileRole = localStorage.getItem("idToken");
       if (userProfileStr && userProfileRole) {
         const userProfile = JSON.parse(userProfileRole);
       
         setUserRole(userProfile.profile.role);
       }
     }, []);
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
    if (selectedState) {
      handleSearch(currentPage);
    }
  }
    , []);



  /**
   * Update URL parameters when search state changes
   */
  const updateSearchParams = (state: string, search: string, page: number) => {
    const params = new URLSearchParams();
    if (state) params.set('state', state);
    if (search) params.set('search', search);
    if (page > 1) params.set('page', page.toString());
    setSearchParams(params);
  };


  /**
  * Handles the search action when user clicks search or changes state
  */
  const handleSearch = async (page: number) => {
    if (!selectedState) return;

    setLoading(true);
    try {
      const response = await searchLakesByState(
        selectedState,
        searchTerm || '',
        page,
        LAKES_PER_PAGE,
        filterOption,
        sortDirection
      );

      if (response && Array.isArray(response.lakes)) {
        const sortedLakes = [...response.lakes];
        if (sortDirection === SORT_OPTIONS.ASC) {
          sortedLakes.sort((a, b) => (a.communityUsers || 0) - (b.communityUsers || 0));
        } else if (sortDirection === SORT_OPTIONS.DESC) {
          sortedLakes.sort((a, b) => (b.communityUsers || 0) - (a.communityUsers || 0));
        }

        setLakes(sortedLakes);

        setTotalCount(response.totalCount || sortedLakes.length);
        setCurrentPage(page);
        updateSearchParams(selectedState, searchTerm, page);
      } else {
        setLakes([]);
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

  /**
   * Handles state selection change
   */
  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setSearchTerm('');
    setCurrentPage(currentPage);
    if (state) {
      handleSearch(currentPage);
    } else {
      setLakes([]);
      setSearchParams(new URLSearchParams());
    }
  };

  /**
   * Handles search input change
   */
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  /**
   * Handle search button click
   */
  const handleSearchClick = () => {
    if (selectedState) {
      handleSearch(currentPage);
    }
  };

  /**
   * Handle enter key press in search input
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && selectedState) {
      handleSearch(1);
    }
  };

  /**
   * Handles page change in pagination
   * @param {number} page - New page number
   */
  const handlePageChange = (page: number) => {
    handleSearch(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Note: this is commented for future use
  // /**
  //  * Handle clear button click
  //  */
  // const handleClear = () => {
  //   setSelectedState('');
  //   setSearchTerm('');
  //   setLakes([]);
  //   setCurrentPage(1);
  //   setTotalCount(0);
  //   setSearchParams(new URLSearchParams());
  // };

  /**
   * Calculates total pages based on total count and lakes per page
   */
  const totalPages = Math.ceil(totalCount / LAKES_PER_PAGE);

  /**
   * Handles search with immediate filter value
   */
  const handleSearchWithFilter = async (page: number, immediateFilter: string) => {
    if (!selectedState) return;

    setLoading(true);
    try {


      const response = await searchLakesByState(
        selectedState,
        searchTerm || '',
        page,
        LAKES_PER_PAGE,
        immediateFilter, // Use the immediate filter value
        sortDirection
      );

      if (response && Array.isArray(response.lakes)) {
        setLakes(response.lakes);
        setTotalCount(response.totalCount || response.lakes.length);
        setCurrentPage(page);
        updateSearchParams(selectedState, searchTerm, page);
      } else {
        setLakes([]);
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

  /**
   * Handles search with immediate sort value
   */
  const handleSearchWithSort = async (page: number, immediateSort: string) => {
    if (!selectedState) return;

    setLoading(true);
    try {


      const response = await searchLakesByState(
        selectedState,
        searchTerm || '',
        page,
        LAKES_PER_PAGE,
        filterOption,
        immediateSort // Pass the sort direction to the API
      );

      if (response && Array.isArray(response.lakes)) {
        // Sort the lakes based on community members if sorting is selected
        const sortedLakes = [...response.lakes];
        if (immediateSort === SORT_OPTIONS.ASC) {
          sortedLakes.sort((a, b) => (a.communityUsers || 0) - (b.communityUsers || 0));
        } else if (immediateSort === SORT_OPTIONS.DESC) {
          sortedLakes.sort((a, b) => (b.communityUsers || 0) - (a.communityUsers || 0));
        }

        setLakes(sortedLakes);
        setTotalCount(response.totalCount || sortedLakes.length);
        setCurrentPage(page);
        updateSearchParams(selectedState, searchTerm, page);
      } else {
        setLakes([]);
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

  return (
    <div>
      
      <main>
        {(userRole === 'User' || userRole === 'Admin') && (
          <h1>
            {APP_STRINGS.FIND_MY_LAKE}
            <span
              style={{ color: 'grey', cursor: 'pointer', marginLeft: '10px' }}
              onClick={() => window.location.href = '/search/map'}
            >
              {APP_STRINGS.MAP}
            </span> / {APP_STRINGS.NAME_LABEL}
          </h1>
        )}
        {(userRole === 'Super Admin') && (
          <h1>
            {APP_STRINGS.FIND_MY_LAKE}

          </h1>
        )}

        {error && (
          <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg" role="alert">
            {error}
          </div>
        )}
        <div className="sm:px-0">
          <div className=" bg-white rounded-lg shadow p-2">
            {/* Search Controls */}
            <div className="grid gap-2 pb-2 border-b">
              <div className="flex items-center space-x-4 search-filters">
                {/* State Selection */}
                <div className="flex-1 select-container search_select_wrap">
                  <label htmlFor="state" className="block mb-1">
                    {APP_STRINGS.SELECT_STATE_LABEL}
                  </label>
                  <select
                    id="state"
                    value={selectedState}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="block custom-select w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">{APP_STRINGS.ALL_STATES_OPTION}</option>
                    {states.map((state) => (
                      <option key={state.value} value={state.value}>
                        {state.key}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Lake Name Search */}
                <div className="flex-1 search_search_wrap">
                  <label htmlFor="lakeName" className="block mb-1">
                    {APP_STRINGS.LAKE_NAME_LABEL}
                  </label>
                  <div className="relative">
                    <input
                      id="lakeName"
                      type="text"
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={APP_STRINGS.SEARCH_PLACEHOLDER}
                      className="block w-full px-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 search-input"
                    />
                    <button
                      className='absolute left-3 top-0 search-icon'
                      disabled={!selectedState || loading}
                      onClick={handleSearchClick}
                      style={{ display: 'inline-block', alignItems: 'center', height: '50px', cursor: 'pointer' }}
                    >
                      <i className="fa-thin fa-magnifying-glass"></i>
                    </button>
                  </div>
                </div>
                <div className="flex-1 search_filter_wrap">
                  <label htmlFor="filterOption" className="block mb-1">
                    {APP_STRINGS.FILTER_BUTTON_LABEL}
                  </label>
                  <select
                    id="filterOption"
                    value={filterOption}
                    onChange={(e) => {
                      const selectedValue = e.target.value;

                      setFilterOption(selectedValue);
                      // Pass the selected value directly to handleSearch instead of using the state
                      handleSearchWithFilter(currentPage, selectedValue);
                    }}
                    className="block custom-select w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select Filter</option>
                    <option value="Members">Only include lakes with members</option>
                    <option value="Admins">Only include lakes with admin</option>
                    <option value="Updates">Recent last updated activity</option>
                  </select>
                </div>
                <div className="flex-1 search_sort_wrap">
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
                      handleSearchWithSort(currentPage, selectedSort);
                    }}
                    className="block custom-select w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Community Member Size</option>
                    <option value={SORT_OPTIONS.ASC}>Smallest to Largest</option>
                    <option value={SORT_OPTIONS.DESC}>Largest to Smallest</option>
                  </select>
                </div>

              </div>

              <div className='search_help'>
  {!loading && (!lakes || lakes.length === 0) && (
    <div className="text-center py-44">
      <div className='search_text'>Start by selecting a State above, then search for a lake name and click enter </div>
      <div className='search_icon'><i className='fa fa-arrow-turn-left-up'></i></div>
      <p className="search_initial_text">
        {APP_STRINGS.NO_LAKES_FOUND}
      </p>
      {selectedState && (
        <p className=" text-gray-400 mt-2">
          {APP_STRINGS.TRY_DIFFERENT_SEARCH}
        </p>
      )}
    </div>
  )}
</div>

            </div>

            {/* Results Section */}
            <div className="">
              {loading && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                </div>
              )}
              {!loading && lakes && lakes.length > 0 && (
                <>
                  <div className="space-y-4">
                    {lakes.map((lake) => (
                      <LakeCard
                        key={lake.lakePulseId}
                        {...lake}
                        lakeState={lake.lakeState ?? ''}
                        onStateClick={handleStateChange}
                        states={states}
                      />
                    ))}
                  </div>

                  {totalCount > 0 && (
                    <div className="mt-4">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={Math.max(1, totalPages)}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </>
              )}

            </div>

          </div>

        </div>
      </main>
    </div>
  );
};

export default SearchByName;