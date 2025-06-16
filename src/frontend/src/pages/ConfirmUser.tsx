import React, { useState } from "react";
import { CognitoUser } from "amazon-cognito-identity-js";
import { userPool } from "../config/cognito";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Auth.css";
import { APP_STRINGS } from "../constants/strings";

const ConfirmUser: React.FC = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const user = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    user.confirmRegistration(otp, true, (err, result) => {
      setLoading(false);
      if (err) {
        console.error("Confirmation failed:", err);
        setError(err.message || "An error occurred during confirmation.");
        return;
      }
  
      navigate("/login"); // Redirect to login page
    });
  };

  return (
    <><div className="back-overlay"></div><div className="signup-container login-container">
      <div className="login-content">
        <div className="login-left">
          <h2>{APP_STRINGS.FIND_YOUR_LAKE}</h2>
          <p>{APP_STRINGS.NO_COST}</p>
          <p>{APP_STRINGS.REGISTER_WITH_EMAIL}</p>
        </div>
        <div className="login-right">
          <h2>{APP_STRINGS.CONFIRM_ACCOUNT}</h2>
          {error && <div className="auth-error">{error}</div>}


          <form onSubmit={handleConfirm} className="auth-form">
            <label htmlFor="otp" className="auth-label">{APP_STRINGS.TO_CONFIRM_YOUR_ACCOUNT_ENTER_YOUR_CODE}</label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter the OTP sent to your email"
              className="form-input"
              required />
            <button
              type="submit"
              className="button continue-button"
              disabled={loading}
            >
              {loading ? "Confirming..." : "Confirm"}
            </button>
          </form>
        </div>
      </div>
    </div></>
  );
};

export default ConfirmUser;
