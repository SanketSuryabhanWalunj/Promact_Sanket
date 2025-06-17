import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/Auth.css';
import { APP_STRINGS } from '../constants/strings';
import { mylakes } from '../types/api.types';
import { getMyLakes } from '../services/api/lake.service';
import { CognitoUser } from 'amazon-cognito-identity-js';
import { userPool } from '../config/cognito';

interface ChangePasswordProps {
  source?: 'settings';
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ source='settings' }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showHeader, setShowHeader] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [lakeData, setLakeData] = useState<mylakes[]>([]); // Replace `any` with the actual type if available
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication
    const userProfileStr = localStorage.getItem("currentUserProfile");
    const idToken = localStorage.getItem("idToken");

    if (!userProfileStr || !idToken) {
      navigate('/login');
      return;
    }

    // Set email from user profile
    try {
      const userProfile = JSON.parse(userProfileStr);
      if (userProfile.email) {
        setEmail(userProfile.email);
      }
    } catch (error) {
      console.error('Error parsing user profile:', error);
    }
  }, [navigate]);

  useEffect(() => {
    const userProfileStr = localStorage.getItem("currentUserProfile");
      const userProfileRole = localStorage.getItem("idToken");
      if (userProfileStr && userProfileRole) {
        const userProfile = JSON.parse(userProfileRole);
        setUserRole(userProfile.profile.role);
      }


    const fetchMyLakes = async () => {
         try {
           const lakes = await getMyLakes();
           setLakeData(lakes);
         } catch (error) {
           console.error(APP_STRINGS.ERROR_FETCHING_LAKES, error);
         }
       };
   
       fetchMyLakes();
  }, []);

  useEffect(() => {
    // Always show header if coming from settings
    if (source === 'settings') {
      setShowHeader(true);
    } else {
      // Check auth status for login source
      const userProfileStr = localStorage.getItem("currentUserProfile");
      const idToken = localStorage.getItem("idToken");
      setShowHeader(!!userProfileStr && !!idToken);
    }

    // Pre-fill email if user is logged in
    const userProfileStr = localStorage.getItem("currentUserProfile");
    if (userProfileStr) {
      try {
        const userProfile = JSON.parse(userProfileStr);
        if (userProfile.email) {
          setEmail(userProfile.email);
        }
      } catch (error) {
        console.error('Error parsing user profile:', error);
      }
    }
  }, [source]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool
      });

      await new Promise((resolve, reject) => {
        cognitoUser.forgotPassword({
          onSuccess: () => {
            resolve(true);
          },
          onFailure: (err) => {
            reject(err);
          }
        });
      });

      setSuccess(true);
      // Redirect to reset password page with email
      navigate('/reset-password-new', { state: { email } });

    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <>
      <main>
     
      <div className="settings-wrap">
      <div className="settings-container reset-inner-page">
     

        <div className="settings-content">
          <div className="settings-header">
            <h1>{APP_STRINGS.FORGOT_PASSWORD}</h1>
            <p className="settings-description">{APP_STRINGS.SETTINGS_DESCRIPTION}</p>
          </div>
      
      <div className="forgot-info">
            <div className="forgot-info">
              Enter your email address. We will send a message with a code to reset your password.
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="email"
                  className={`form-input ${error ? 'error' : ''}`}
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus={!email}
                  disabled={source === 'settings'} // Disable if coming from settings
                />
                {error && <div className="error-message">{error}</div>}
              </div>

              <button
                type="submit"
                className="button continue-button"
                disabled={loading || !email}
              >
                {loading ? 'Sending...' : 'Reset my password'}
              </button>

           
            </form>
          </div>
       </div>
       </div>
       </div>
       </main>
    </>
  );
};

export default ChangePassword; 