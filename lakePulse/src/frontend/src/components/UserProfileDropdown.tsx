import React, { useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getStoredUserProfile, getCurrentUser } from '../services/api/user.service';
import { useAuth } from 'react-oidc-context';
import { APP_STRINGS } from '../constants/strings';
import '../styles/UserProfile.css';

export const UserProfileDropdown = () => {
  const [userProfile, setUserProfile] = useState(getStoredUserProfile());
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const auth = useAuth();


  // Add immediate refresh on mount and profile updates
  useEffect(() => {
    const refreshUserProfile = async () => {
      const freshProfile = await getCurrentUser();
     
      if (freshProfile) {
        setUserProfile(freshProfile);
      }
    };

    // Initial load
    refreshUserProfile();

    // Listen for updates
    const handleProfileUpdate = () => {
      const updatedProfile = getStoredUserProfile();
      if (updatedProfile) {
        setUserProfile(updatedProfile); // Immediately update from localStorage
        refreshUserProfile(); // Also fetch fresh data
      }
    };

    window.addEventListener('userProfileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('userProfileUpdated', handleProfileUpdate);
  }, []);

  
  /**
   * Handles user sign out process
   * Removes the user session and redirects to Cognito logout
   */
  const handleSignOut = () => {
    auth.removeUser();
    const logoutParams = new URLSearchParams({
      client_id: import.meta.env.VITE_CLIENT_ID,
      logout_uri: import.meta.env.VITE_POST_LOGOUT_REDIRECT_URI,
      response_type: import.meta.env.VITE_RESPONSE_TYPE
    });
    window.location.href = `/login`;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="user-profile-dropdown" ref={dropdownRef}>
      <button 
        className="profile-trigger"
        
      >
        <div className="profile-avatar-container">
          {userProfile?.profilePicture ? (
            <img 
              src={userProfile.profilePicture} 
              alt={userProfile.given_name}
              className="profile-avatar"
            />
          ) : (
            <div className="profile-avatar-placeholder">
              {userProfile?.given_name?.charAt(0)}{userProfile?.family_name?.charAt(0)}
            </div>
          )}
         
        </div>
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="user-info">
            <div className="user-header">
              {userProfile?.profilePicture ? (
                <img 
                  src={userProfile.profilePicture} 
                  alt={userProfile.given_name}
                  className="profile-avatar-large"
                />
              ) : (
                <div className="profile-avatar-placeholder-large">
                  {userProfile?.given_name?.charAt(0)} {userProfile?.family_name?.charAt(0)}
                </div>
              )}
              <h3>{userProfile?.given_name} {userProfile?.family_name}</h3>
              <p>{userProfile?.email}</p>
            </div>
          </div>
        
        </div>
      )}
    </div>
  );
}; 