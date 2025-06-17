import React, { useState, useEffect, useMemo, useCallback } from 'react';
import adminLogo from '../../assets/LakePulse_Logo_White.png'; // Add your admin logo here
import { useNavigate } from 'react-router-dom';
import { APP_STRINGS } from '../../constants/strings';
import styled from 'styled-components';
import { UserProfileDropdown } from './UserProfileDropdown';
import { getCurrentUser, getStoredUserProfile, getUserRole } from '../../services/admin.service';

const ProfileSection = styled.div`
  display: inline-flex;
  vertical-align: top;
  align-items: center;
  justify-content: space-between;
  margin-left: 10px;
  width: calc(100% - 60px);
`;

const AdminHeader: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(getStoredUserProfile());
  const [userRole, setUserRole] = useState<string | null>(getUserRole());
 // Add immediate refresh on mount and profile updates
 useEffect(() => {
  const refreshUserProfile = async () => {
    const freshProfile = await getCurrentUser();
   
    if (freshProfile) {
      setUserProfile(freshProfile);
    }
  };
  const refreshUserRole = async () => {
    const freshRole = await getUserRole();
   
    if (freshRole) {
      setUserRole(freshRole);
    }
  };

  // Initial load
  refreshUserProfile();
  refreshUserRole();
  // Listen for updates
  const handleProfileUpdate = () => {
    
    const updatedProfile = getStoredUserProfile();
    const updatedRole = getUserRole();
    if (updatedProfile) {
      setUserProfile(updatedProfile); // Immediately update from localStorage
      refreshUserProfile(); // Also fetch fresh data
    }
    if (updatedRole) {
      setUserRole(updatedRole); // Immediately update from localStorage
      refreshUserRole(); // Also fetch fresh data
    }
  };

  window.addEventListener('userProfileUpdated', handleProfileUpdate);
  return () => window.removeEventListener('userProfileUpdated', handleProfileUpdate);
  
}, []);
  // function for handling logout
  const handleSignOut = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };


  return (
    <header>
      <div className='left-header'>
        <a className="lake-pulse-logo" href="#">Lake Pulse Admin</a>
      </div>

      <nav className="admin-nav">
        <ul>
          <li className="active">
            <a>Users</a>
          </li>
		   <li>
            <a>Data Update</a>
          </li>
          <li>
            <a>Statistics</a>
          </li>
        </ul>
      </nav>

      <div className="user-profile-wrap">
              <UserProfileDropdown />
              <ProfileSection>
                <div className='user-name-section'>
                  <div className="user-name">{userProfile?.given_name} {userProfile?.family_name}</div>
                  <div className="user-role">
                    {userRole === 'User' && (
                      <>

                        {isSubscribed ? <i className="fa-solid fa-certificate"></i>: <i className="fa-solid fa-user"></i>}
                        <span>{isSubscribed ? 'Subscriber' : 'Member'}</span>
                      </>
                    )}
                    {userRole === 'Super Admin' && <i className="fa-solid fa-crown"></i>}
                    {userRole === 'Local Admin' && <i className="fa-solid fa-user-shield"></i>}
                    {userRole !== 'User' && userRole}
                  </div>
                </div>
                <div className='sign-out-details'>
                  <button onClick={handleSignOut} className="dropdown-item">
                    <i className="fa-thin fa-arrow-right-from-bracket"></i>
                  </button>
                </div>
              </ProfileSection>
            </div>
    </header>
  );
};

export default AdminHeader;
