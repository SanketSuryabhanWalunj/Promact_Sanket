import React, { useState, useEffect } from 'react';
import { CognitoUser } from 'amazon-cognito-identity-js';
import { userPool } from '../config/cognito';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import '../styles/Auth.css';
import { APP_STRINGS } from '../constants/strings';

const ResetPassword: React.FC = () => {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { email, source } = location.state || {};
  
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check authentication status
  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      // If user is already authenticated, redirect to home
      navigate('/Home');
    }
  }, [auth.isAuthenticated, auth.user, navigate]);

  useEffect(() => {
    // If no email in state, redirect to forgot password
    if (!email) {
      navigate('/forgot-password');
      return;
    }
    // Show header if coming from settings
  }, [email, source, navigate]);

  // Mask email address for display
  const maskEmail = (email: string) => {
    if (!email) return '';
    const [username, domain] = email.split('@');
    const maskedUsername = `${username[0]}***${username[username.length - 1]}`;
    const maskedDomain = `${domain[0]}***${domain[domain.length - 1]}`;
    return `${maskedUsername}@${maskedDomain}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool
      });

      await new Promise((resolve, reject) => {
        cognitoUser.confirmPassword(code, newPassword, {
          onSuccess: () => {
            resolve(true);
          },
          onFailure: (err) => {
            reject(err);
          }
        });
      });

      // After successful password reset, trigger sign-in
    // Redirect to login page after successful password reset
    navigate('/login', { 
      state: { message: 'Password reset successful. Please login with your new password.' } 
    });

    } catch (err) {
      console.error('Reset password error:', err);
      setError('Failed to reset password. Please check your code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/forgot-password');
  };

  return (
    <>
     
      <div className="login-container confirm-page">
        <div className="login-content">
          <div className="login-right">
           
            
            <h2> <i className="fa-solid fa-envelope"></i> {APP_STRINGS.RESET_PASSWORD}</h2>
            
                      <div className="reset-info">
                          {APP_STRINGS.RESET_PASSWORD_INFO} {maskEmail(email)}.
                          {APP_STRINGS.RESET_PASSWORD_INFO_2}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  className={`form-input ${error ? 'error' : ''}`}
                  placeholder="Code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group password-group">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group password-group">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>

              {error && <div className="error-message">{error}</div>}

              <button
                type="submit"
                className="button continue-button"
                disabled={loading}
              >
                {loading ? 'Changing password...' : 'Change password'}
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

export default ResetPassword; 