import React, { useState } from "react";
import { CognitoUserAttribute } from "amazon-cognito-identity-js";
import { userPool } from "../config/cognito";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";
import { APP_STRINGS } from "../constants/strings";

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    given_name: "",
    family_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone_number: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const isValidPhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\+\d{10,15}$/; // Matches phone numbers in the format +1234567890
    return phoneRegex.test(phone);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const {family_name, given_name, email, password, confirmPassword, phone_number } = formData;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!isValidPhoneNumber(phone_number)) {
      setError("Invalid phone number format. Please use the format +1234567890.");
      return;
    }

    setLoading(true);

    const attributes = [
      new CognitoUserAttribute({ Name: "given_name", Value: given_name }),
      new CognitoUserAttribute({ Name: "family_name", Value: family_name }),
      new CognitoUserAttribute({ Name: "email", Value: email }),
      new CognitoUserAttribute({ Name: "phone_number", Value: phone_number }),
    ];

    userPool.signUp(email, password, attributes, [], (err, result) => {
      setLoading(false);
      if (err) {
        console.error("Signup failed:", err);
        setError(err.message || "An error occurred during signup.");
        return;
      }
   
      navigate("/confirm-user", { state: { email } }); // Navigate to confirmation page with email
    });
  };

  return (
      <><div className="back-overlay"></div><div className="signup-container login-container">
      <div className="login-content">
        <div className="login-left">
          <h2>{APP_STRINGS.FIND_YOUR_LAKE}</h2>
          <p>{APP_STRINGS.COMPLETE_REGISTRATION}</p>
          <p>{APP_STRINGS.SEARCH_LAKE}</p>
          <p>{APP_STRINGS.BECOME_MEMBER_SIGNUP}</p>
          <p>{APP_STRINGS.SELECT_LEVEL_PARTICIPANT}</p>
          <p>{APP_STRINGS.REGISTER_WITH_EMAIL}</p>
        </div>
        <div className="login-right"> 
           <h2>{APP_STRINGS.SIGN_UP}</h2>
          {error && <div className="auth-error">{error}</div>}
 
          <form onSubmit={handleSignup} className="auth-form">
           <div className="grid grid-cols-2">
           <div className="form-group">
            <input
              id="given_name"
              name="given_name"
              type="text"
              value={formData.given_name}
              onChange={handleInputChange}
              placeholder="Enter first name"
              className="form-input"
              required />
            </div>
           <div className="form-group"> <input
              id="family_name"
              name="family_name"
              type="text"
              value={formData.family_name}
              onChange={handleInputChange}
              placeholder="Enter last name"
              className="form-input"
              required /></div>
           
          
            <div className="form-group">
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email"
              className="form-input"
              required />
            </div>
            <div className="form-group">
            <input
              id="phone_number"
              name="phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={handleInputChange}
              placeholder="Enter phone number"
              className="form-input"
              required />
            </div>
           </div>
            
            
          
           
            <div className="form-group">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className="form-input"
                required />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-sm text-blue-500"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <div className="form-group">
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                className="form-input"
                required />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-sm text-blue-500"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
              </div>
            </div>
            <button
              type="submit"
              className="button continue-button"
              disabled={loading}
            >
              {loading ? APP_STRINGS.SIGNING_UP : APP_STRINGS.SIGN_UP}
            </button>
          </form>
          <p className="auth-footer">
                      {APP_STRINGS.ALREADY_HAVE_AN_ACCOUNT} <a href="/login" className="auth-link">{APP_STRINGS.LOGIN}</a>
          </p></div>

      </div>
    </div></>
  );
};

export default Signup;
