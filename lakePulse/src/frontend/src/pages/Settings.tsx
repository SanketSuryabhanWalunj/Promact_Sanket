import React, { useState, useRef, useEffect } from 'react';
import { updateUserProfile, getStoredUserProfile, updateUserProfilePicture, deleteProfilePicture, getCurrentUser } from '../services/api/user.service';
import '../styles/UserProfile.css';
import Header from '../components/Header';
import { APP_STRINGS } from '../constants/strings';

import { mylakes } from '../types/api.types';
import { getMyLakes, getUserActiveSubscription } from '../services/api/lake.service';

export const Settings = () => {
  // Get fresh user data on component mount
  const [userProfile, setUserProfile] = useState(getStoredUserProfile());
  const [formData, setFormData] = useState({
    given_name: userProfile?.given_name || '',
    family_name: userProfile?.family_name || '',
    address: userProfile?.address || '',
    role: userProfile?.role || ''
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(userProfile?.profilePicture || '');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fileInputRef = useRef<HTMLInputElement>(null);
 
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);



  // Add validation helper functions at the top
  const isValidName = (name: string): boolean => {
    // Only allow letters, spaces, and hyphens
    const nameRegex = /^[A-Za-z\s-]+$/;
    return nameRegex.test(name) && name.trim().length > 0;
  };

  // Add validation state
  const [errors, setErrors] = useState({
    given_name: '',
    family_name: '',
    address: ''
  });

  // Add useEffect to load fresh data on mount
  useEffect(() => {
    const loadFreshData = async () => {
      const freshProfile = await getCurrentUser();
      if (freshProfile) {
        setUserProfile(freshProfile);
        setFormData({
          given_name: freshProfile.given_name || '',
          family_name: freshProfile.family_name || '',
          address: freshProfile.address || '',
          role: freshProfile.role || ''
        });
        setUserEmail(freshProfile.email || ''); // Set user email
      }
    };

    loadFreshData();
  }, []);

  // Fetch subscription data when the component mounts
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
  const userId = userProfile?.sub;
  const userRole = userProfile?.role;
        if (userRole === 'Super Admin') {
          setSubscriptionInfo(null); // No subscription for Super Admin
          return;
        }
        if (!userId) return;
        const response = await getUserActiveSubscription(userId);
        setSubscriptionInfo(response);
      } catch (error: any) {
        if (error?.response?.status === 404) {
          setSubscriptionInfo(null); // No subscription, not an error
        } else {
          console.error(APP_STRINGS.ERROR_FETCHING_USERS, error);
        }
      }
    };

    fetchSubscriptionData();
  }, [userProfile]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      // Clear previous message
      setMessage({ type: '', text: '' });
      
      try {
        // Update profile picture immediately when file is selected
        const pictureUrl = await updateUserProfilePicture(file);
        setProfilePicture(file);
        setPreviewUrl(pictureUrl);
        
        // Force refresh user data
        await getCurrentUser();
        
        // Set success message with timeout
        setMessage({ 
          type: 'success', 
          text: 'Profile picture updated successfully!' 
        });

        // Clear message after 3 seconds
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 3000);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setMessage({ 
          type: 'error', 
          text: 'Failed to update profile picture. Please try again.' 
        });
      } finally {
        setIsLoading(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ given_name: '', family_name: '', address: '' });
    
    // Validate fields
    let hasErrors = false;
    const newErrors = {
      given_name: '',
      family_name: '',
      address: ''
    };

    if (!formData.given_name.trim()) {
      newErrors.given_name = 'Name is required';
      hasErrors = true;
    } else if (!isValidName(formData.given_name)) {
      newErrors.given_name = 'Name can only contain letters, spaces, and hyphens';
      hasErrors = true;
    }

    if (!formData.family_name.trim()) {
      newErrors.family_name = 'Family name is required';
      hasErrors = true;
    } else if (!isValidName(formData.family_name)) {
      newErrors.family_name = 'Family name can only contain letters, spaces, and hyphens';
      hasErrors = true;
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      await updateUserProfile({
        ...formData,
        profilePicture: previewUrl
      });

      const updatedProfile = await getCurrentUser();
      if (updatedProfile) {
        localStorage.setItem('currentUserProfile', JSON.stringify(updatedProfile));
        window.dispatchEvent(new Event('userProfileUpdated'));
        
        setFormData({
          given_name: updatedProfile.given_name || '',
          family_name: updatedProfile.family_name || '',
          address: updatedProfile.address || '',
          role: updatedProfile.role || ''
        });

        setMessage({ 
          type: 'success', 
          text: APP_STRINGS.PROFILE_UPDATED_SUCCESSFULLY 
        });

        // Add short timeout before refresh to show success message
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: APP_STRINGS.FAILED_TO_UPDATE_PROFILE 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePicture = async () => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      await deleteProfilePicture();
      setPreviewUrl('');
      setProfilePicture(null);
      await getCurrentUser();
      
      setMessage({ 
        type: 'success', 
        text: APP_STRINGS.PROFILE_PICTURE_REMOVED_SUCCESSFULLY 
      });

      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: APP_STRINGS.FAILED_TO_REMOVE_PROFILE_PICTURE 
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
    }
  };

  return (
    <main>
      
     
      <div className="settings-wrap">
      <div className="settings-container">
     

        <div className="settings-content">
          <div className="settings-header">
            <h1>{APP_STRINGS.GENERAL}</h1>
            <p className="settings-description">{APP_STRINGS.SETTINGS_DESCRIPTION}</p>
          </div>

          {message.text && (
            <div className={`alert alert-${message.type}`}>
              {message.text}
            </div>
          )}

          <div className="profile-section">
            <div className="profile-picture-section">
              {previewUrl ? (
                <div className="profile-picture-container">
                  <img
                    src={previewUrl}
                    alt="Profile"
                    className="current-profile-picture"
                  />
                </div>
              ) : (
                <div className="profile-picture-placeholder">
                  {userProfile?.given_name?.charAt(0)}{userProfile?.family_name?.charAt(0)}
                </div>
              )}
              <div className="profile-picture-controls">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                />
                <button 
                  className="button upload-button"
                  onClick={handleFileSelect}
                  disabled={isLoading}
                >
                  {isLoading ? APP_STRINGS.UPLOADING : APP_STRINGS.CHANGE_PROFILE_PICTURE}
                </button>
                {previewUrl && (
                  <button 
                    className="button delete-picture-button"
                    onClick={handleDeletePicture}
                    disabled={isLoading}
                  >
                    <i className="fa-thin fa-trash"></i>
                    {APP_STRINGS.DELETE}
                  </button>
                )}
              </div>
             
            </div>
            <h6 className='user-name-accounts'>{userProfile?.given_name} {userProfile?.family_name}</h6>
              {subscriptionInfo ? (
                <div className="subscription-info">
                  <p className="form-field"><label>Role</label> {subscriptionInfo.subscriptionEndDate ? 'Subscriber' : 'User'}</p>
                  <p className="form-field"><label>Subscription Purchased</label> {formatDate(subscriptionInfo.createdTime)}</p>
                  <p className="form-field"><label>Subscription Ending On</label> {subscriptionInfo.subscriptionEndDate ? formatDate(subscriptionInfo.subscriptionEndDate) : 'N/A'}</p>
                  <p className="form-field"><label>Email</label> {subscriptionInfo.customerEmail}</p>
                </div>
              ): (
                <div className="subscription-info">
                  <p className="form-field"><label>Role</label> {userProfile?.role}</p>
                  <p className="form-field"><label>Email</label> {userProfile.email}</p>
                </div>
              )}

            <form onSubmit={handleSubmit} className="settings-form">
              <div className="form-field">
                <label>{APP_STRINGS.NAME_LABEL}</label>
                <input
                  type="text"
                  value={formData.given_name}
                  onChange={(e) => setFormData({ ...formData, given_name: e.target.value })}
                  placeholder="Enter your name"
                  className={errors.given_name ? 'error' : ''}
                />
                {errors.given_name && <span className="error-message">{errors.given_name}</span>}
              </div>

              <div className="form-field">
                <label>{APP_STRINGS.FAMILY_NAME}</label>
                <input
                  type="text"
                  value={formData.family_name}
                  onChange={(e) => setFormData({ ...formData, family_name: e.target.value })}
                  placeholder="Enter your family name"
                  className={errors.family_name ? 'error' : ''}
                />
                {errors.family_name && <span className="error-message">{errors.family_name}</span>}
              </div>

              <div className="form-field">
                <label>{APP_STRINGS.ADDRESS}</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter your address"
                  className={errors.address ? 'error' : ''}
                />
                {errors.address && <span className="error-message">{errors.address}</span>}
              </div>
              
              {/*
              <div className="form-field">
                <label>{APP_STRINGS.EMAIL_ADDRESS}</label>
                <input
                  type="email"
                  value={userEmail || ''}
                  disabled
                  className="disabled-field"
                />
              </div>
              */}
              
              <button
                type="submit"
                className="button save-changes-button"
                disabled={isLoading}
              >
                {isLoading ? APP_STRINGS.SAVING : APP_STRINGS.SAVE_CHANGES}
              </button>
            </form>
          </div>
        </div>
      </div>
      </div>
    </main>
  );
};