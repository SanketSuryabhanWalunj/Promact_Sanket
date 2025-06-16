import React, { useEffect, useState } from "react";
import { CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js";
import { userPool } from "../config/cognito";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Auth.css";
import "../styles/UserLogin.css";
import { APP_STRINGS } from "../constants/strings";
import { Lake } from "../types/api.types";
import { getMyLakes } from "../services/api/lake.service";
import { checkUserSubscriptionStatus } from '../services/api/user.service';

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
 
  const [emailError, setEmailError] = useState('');
  const [showPasswordField, setShowPasswordField] = useState(false);
 
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
   // Replace `any` with the actual type if available
 


  //handle next button
  const handleNext = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError('');
    setShowPasswordField(true);
  };

  //handle back button
  const handleBack = () => {
    setShowPasswordField(false);
    setPassword('');
  };

  //handle login button
  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    const user = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    user.authenticateUser(authDetails, {
      onSuccess: async(result) => {
        try {
          setIsRedirecting(true); // Keep button disabled during redirection
          
          const idToken = result.getIdToken().getJwtToken();
          const refreshToken = result.getRefreshToken().getToken();
          const userProfile = result.getIdToken().decodePayload();
          
          // Store token and profile
          localStorage.setItem(
            "idToken",
            JSON.stringify({ id_token: idToken, refresh_token: refreshToken, profile: userProfile })
          );
          
          // Store user profile separately
          const profileData = {
            email: userProfile.email,
            role: userProfile['custom:role'] || 'User',
            given_name: userProfile.given_name,
            family_name: userProfile.family_name,
            sub: userProfile.sub
          };
          localStorage.setItem("currentUserProfile", JSON.stringify(profileData));
          
          // Check subscription status
          try {
            const isSubscribed = await checkUserSubscriptionStatus(userProfile.sub);
            localStorage.setItem('userSubscribed', isSubscribed ? 'true' : 'false');
          } catch (error) {
            console.error('Error checking subscription status:', error);
            localStorage.setItem('userSubscribed', 'false');
          }

          const lakes = await getMyLakes();
           
          if (userProfile['role'] === 'User' && lakes.length > 0) {
            const savedLake = lakes[0];
            navigate(`/lake/${savedLake?.lakePulseId}`, { replace: true });
          } else {
            navigate("/search/name", { replace: true });
          }
         window.location.reload();
        } catch (error) {
          console.error('Error during login process:', error);
          setError('An error occurred during login');
        } finally {
          setLoading(false);
          setIsRedirecting(false);
        }
         localStorage.removeItem('lastViewedLake');
         
      },
      onFailure: (err) => {
        console.error(APP_STRINGS.AUTH_ERROR, err);
        setError(err.message || APP_STRINGS.AUTH_ERROR);
        setLoading(false);
        setIsRedirecting(false);
      },
    });
  };
  

  return (
    <><div className="back-overlay"></div>
    <div className="login-container">
      <div className="login-content">
        <div className="login-left">
          <h2>{APP_STRINGS.WELCOME_BACK}</h2>
          <p>{APP_STRINGS.LAKEPULSE_MISSION}</p>
          <p>{APP_STRINGS.REGISTER_WITH_EMAIL}</p>
        </div>

        <div className="login-right">

          {error && <div className="auth-error">{error}</div>}
          <div className="auth-form">

            {!showPasswordField ? (

              <><>
                <h2>{APP_STRINGS.SIGN_IN}</h2>
                <div className="form-group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={APP_STRINGS.EMAIL_ADDRESS}
                    className={`form-input ${emailError ? 'error' : ''}`} />
                  {emailError && <span className="error-message">{emailError}</span>}
                </div>
                <button
                  type="button"
                  onClick={handleNext}
                  className="button next-button"
                >
                  {APP_STRINGS.NEXT}
                </button>
              </><div className="create-account">
                  <span>New user? </span>
                  <a href="/signup" className="create-account-link">
                    {APP_STRINGS.CREATE_AN_ACCOUNT}
                  </a>
                </div></>
            ) : (
              <>
                <h2>{APP_STRINGS.ENTER_YOUR_PASSWORD}</h2>
                <div className="form-group">
                  <input
                    type={showPasswordText ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={APP_STRINGS.PASSWORD}
                    className="form-input"
                    autoFocus />
                </div>
                <div className="password-options">
                  <label className="show-password">
                    <input
                      type="checkbox"
                      checked={showPasswordText}
                      onChange={() => setShowPasswordText(!showPasswordText)} />
                    <span>{APP_STRINGS.SHOW_PASSWORD}</span>
                  </label>
                  <a href="/forgot-password" className="forgot-password">
                    {APP_STRINGS.FORGOT_PASSWORD}
                  </a>
                </div>
                <div className="button-group">
                  <button
                    type="submit"
                    onClick={handleLogin}
                    className="button continue-button mb-2"
                    disabled={loading || isRedirecting}
                  >
                    {loading || isRedirecting ? 'Signing you in...' : APP_STRINGS.CONTINUE}
                  </button>
                  <button type="button" onClick={handleBack} className="back-button">
                    {APP_STRINGS.BACK}
                  </button>

                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div></>
  );
};

export default Login;
