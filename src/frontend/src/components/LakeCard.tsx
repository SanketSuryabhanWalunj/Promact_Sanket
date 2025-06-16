/**
 * @file LakeCard.tsx
 * @description A reusable card component that displays detailed information about a lake
 * including its location, community statistics, and sampling data.
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { APP_STRINGS } from "../constants/strings";
import LakeMap from "./LakeMap";

import { addToMyLake, getLakeStateList, StateOption } from "../services/api/lake.service";

import { Lake } from '../types/api.types';
import { Dialog } from "@mui/material";


interface LakeCardProps {
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
  communityUsers: number;
  communitySubscriber: number;
  onStateClick?: (state: string) => void;
  states: StateOption[];
}

/**
 * LakeCard Component
 * @component
 * @param {LakeCardProps} props - Component props including lake data and click handlers
 * @returns {JSX.Element} Rendered lake card with detailed information
 */
const LakeCard: React.FC<LakeCardProps> = ({
  lakeName,
  lakeState,

  lakePulseId,
  totalSamples,
  totalStations,
  spanYears,
  recentDataCollection,
  latitude,
  longitude,
  lakeCounty,
  communityAdmin,
  communityUsers,
  communitySubscriber,
  onStateClick,
  states
}: LakeCardProps): JSX.Element => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedLake, setSelectedLake] = useState<Lake | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
 

 

  useEffect(() => {
  
    const userProfileStr = localStorage.getItem("currentUserProfile");
    if (userProfileStr) {
      const userProfile = JSON.parse(userProfileStr);
      setUserRole(userProfile.role);
    }
  }, []);

  /**
   * Formats the date string to remove time component
   */
  const formatDate = (dateString: string) => {
    if (!dateString) return APP_STRINGS.NO_DATE_AVAILABLE;
    
    try {
      // Handle ISO format dates
      if (dateString.includes('T')) {
        return dateString.split('T')[0];
      }
      
      // Handle dates with space-separated time
      if (dateString.includes(' ')) {
        return dateString.split(' ')[0];
      }
      
      return dateString;
    } catch (error) {
      console.error(APP_STRINGS.DATE_PARSING_ERROR, error);
      return APP_STRINGS.NO_DATE_AVAILABLE;
    }
  };

  // Add a function to get state abbreviation
  const getStateAbbreviation = (fullStateName: string): string => {
    const stateMatch = states.find(
      state => state.key.toLowerCase() === fullStateName.toLowerCase()
    );
    return stateMatch?.value || fullStateName;
  };

  /**
   * Handles adding the current lake to user's collection
   */
  const handleAddToMyLake = async () => {
    setIsAdding(true);
    setError(null);
    
    try {
      const userDataStr = localStorage.getItem('idToken');
      if (!userDataStr) {
        alert(APP_STRINGS.LOGIN_REQUIRED);
        return;
      }

      const userData = JSON.parse(userDataStr);
      const userId = userData.profile?.sub || userData.profile?.['cognito:username'];
      
      if (!userId) {
        alert(APP_STRINGS.USER_INFO_NOT_FOUND);
        return;
      }
      
      // Get the state abbreviation from the states list
      const stateAbbreviation = getStateAbbreviation(lakeState);
      
      await addToMyLake(userId, lakePulseId.toString());
      navigate(APP_STRINGS.ROUTE_MY_LAKES);
    } catch (err: unknown) {
      console.error(APP_STRINGS.SEARCH_BY_MAP.ERROR_ADDING_LAKE, err);
      alert(APP_STRINGS.LAKE_ADD_ERROR);
    } finally {
      setIsAdding(false);
    }
  };

  //method to go lake overview page
 const handleAddToLakes = (lakeId) => {
     setSelectedLake(lakeId);
     navigate(`/lake/${lakeId}`);
   };
  
  const handleGoToLake = () => {
    if (selectedLake) {
      navigate(`/lake/${lakePulseId}`);
    }
    setShowDialog(false);
  };

  const handleAddLakeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirmDialog(true);
  };

  const handleBecomeMember = async () => {
    setIsAdding(true);
    setError(null);
    
    try {
      const userProfileStr = localStorage.getItem("currentUserProfile");
      if (!userProfileStr) {
        throw new Error('User profile not found');
      }
      
      const userProfile = JSON.parse(userProfileStr);
      await addToMyLake(userProfile.sub, lakePulseId.toString());
      
      // Close dialog and navigate to lake page
      setShowConfirmDialog(false);
      navigate(`/lake/${lakePulseId}`);
    } catch (error) {
      console.error('Error adding lake:', error);
      setError(error instanceof Error ? error.message : 'Failed to add lake');
    } finally {
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
    navigate('/search/name');
  };

  return (
    <div className="relative">
      <div className="search-result border-b p-4 hover:shadow-md transition-shadow">
        {/* Lake basic information section */}
        <div className="mylakes-box item">
          <div className="mylakes-box-name">
            <h2>
              {lakeName}
            </h2>
            <p
              className="text-gray-600 mt-1 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onStateClick?.(lakeState);
              }}
            >
              {lakeCounty}, {lakeState}
            </p>
            {userRole === 'Super Admin' ? (
              <>
                <button
                  className="mt-4 flex mylakes-link"
                  onClick={() => handleAddToLakes(lakePulseId)} 
                >
                  {APP_STRINGS.GOTO_LAKE}
                </button>
                <button
                  className="mt-4 flex mylakes-link"
                  onClick={handleAddToMyLake}
                  disabled={isAdding}
                >
                  {isAdding ? 'Adding...' : APP_STRINGS.ADD_LAKE_BUTTON_LABEL}
                </button>
              </>
            ):(<button
              className="mt-4 flex mylakes-link search-result-button"
              onClick={handleAddLakeClick}
              disabled={isAdding}
            >
              {isAdding ? 'Adding...' : APP_STRINGS.ADD_LAKE_BUTTON_LABEL}
            </button>)}
            
          </div>
          {/* Mini map display */}
          <div style={{ width: "120px", height: "120px" }}>
            <LakeMap 
              coordinates={[latitude, longitude]} 
              interactive={false}
            />
          </div>
        </div>

        {/* Community statistics section */}
        <div className="mylakes-box community">
          <div className="text-left flex">
            <p className="community-num">{communityUsers}</p>
            <p className="community-text">
              {APP_STRINGS.LAKE_CARD_STRINGS.COMMUNITY_MEMBERS}
            </p>
          </div>
          <div className="text-left flex">
            <p className="community-num">{communitySubscriber}</p>
            <p className="community-text">
              {APP_STRINGS.SUBSCRIBERS}
            </p>
          </div>
          <div className="text-left flex">
            <p className="community-num">{communityAdmin}</p>
            <p className="community-text">
              {APP_STRINGS.LAKE_CARD_STRINGS.COMMUNITY_ADMINS}
            </p>
          </div>
          <div className="text-left flex">
            <p className="community-num">{formatDate(recentDataCollection)}</p>
            <p className="community-text">
              {APP_STRINGS.LAKE_CARD_STRINGS.RECENT_DATA}
            </p>
          </div>
        </div>

        {/* Sampling data section */}
        <div className="mylakes-box data">
          <div className="text-left flex">
            <p className="data-num">{totalSamples}</p>
            <p className="data-text">
              {APP_STRINGS.LAKE_CARD_STRINGS.TOTAL_SAMPLES}
            </p>
          </div>
          <div className="text-left flex">
            <p className="data-num">{totalStations}</p>
            <p className="data-text">
              {APP_STRINGS.LAKE_CARD_STRINGS.TOTAL_STATIONS}
            </p>
          </div>
          <div className="text-left flex">
            <p className="data-num">{spanYears}</p>
            <p className="data-text">
              {APP_STRINGS.LAKE_CARD_STRINGS.SPAN_YEARS}
            </p>
          </div>
        </div>
      </div>
     {/* Add subscription dialog */}
           <Dialog 
             open={showDialog} 
             onClose={() => setShowDialog(false)}
             PaperProps={{
               style: {
                 borderRadius: '12px',
                 padding: '24px',
                 maxWidth: '400px',
                 width: '90%'
               }
             }}
           >
             <div className="add-sub">
               <div>
                 <span className="add-sub-lakename">{lakeName}</span> has been added to your subscription.
               </div>
               <button
                 onClick={handleGoToLake}
                 className="goto-lake-button text-white px-6 py-2 rounded-lg  transition-colors"
               >
                {APP_STRINGS.GOTO_LAKE}
               </button>
             </div>
           </Dialog>

      <Dialog 
        open={showConfirmDialog} 
        onClose={handleCancel}
        PaperProps={{
          style: {
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%'
          }
        }}
      >
        <div className="confirmation-dialog checkout-dialog">
          <h2>Confirm Membership</h2>
          <p>
            You can only belong to one lake. If you are sure this is the lake you want to become a member of, 
            please click Become a Member below. Otherwise click Cancel.
          </p>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="dialog-buttons">
            <button 
              onClick={handleBecomeMember}
              className="proceed-button"
              disabled={isAdding}
            >
              {isAdding ? 'Processing...' : 'Become a Member'}
            </button>
            <button 
              onClick={handleCancel}
              className="cancel-button"
              disabled={isAdding}
            >
              Cancel
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default LakeCard;
