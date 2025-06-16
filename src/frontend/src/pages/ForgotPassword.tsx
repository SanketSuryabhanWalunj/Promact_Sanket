import React, { useState, useEffect } from 'react';
import { CognitoUser } from 'amazon-cognito-identity-js';
import { userPool } from '../config/cognito';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import '../styles/Auth.css';
import { APP_STRINGS } from '../constants/strings';

interface ForgotPasswordProps {
  source?: 'settings' | 'login';
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ source = 'login' }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showHeader, setShowHeader] = useState(false);
  const navigate = useNavigate();

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
            console.error('Failed to send reset code:', err);
            reject(err);
          }
        });
      });

      setSuccess(true);
    
      // Use navigate with state
      navigate('/reset-password', { 
        state: { 
          email,
          source // Pass the source to maintain context
        },
        replace: true // Use replace to prevent going back to forgot password
      });

    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (source === 'settings') {
      navigate('/settings');
    } else {
      navigate('/login');
    }
  };

  return (
    <>
      <div className="back-overlay"></div>
      <div className="login-container confirm-page">
        <div className="login-content">
          <div className="login-right">
           
            
            <h2> <i className="fa-thin fa-lock"></i> {APP_STRINGS.FORGOT_PASSWORD}</h2>
            
            <div className="forgot-info">
              {APP_STRINGS.FORGOT_PASSWORD_INFO}
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

              <button
                type="button"
                className="back-button mt-3"
                onClick={handleBack}
              >
                Back
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword; 