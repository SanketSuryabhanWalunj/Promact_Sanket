import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthenticationDetails, CognitoUser } from "amazon-cognito-identity-js";
import { userPool } from "../config/cognito";
import adminLogo from '../assets/logo-lakepulse.png'; // Add your admin logo here
import { APP_STRINGS } from "../constants/strings";

const AdminLogin = ({ onLogin = (userData: any) => {} }: { onLogin?: (userData: any) => void }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

//handle change function
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

//handle login function
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const authDetails = new AuthenticationDetails({ Username: form.email, Password: form.password });
    const user = new CognitoUser({ Username: form.email, Pool: userPool });
	   
    user.authenticateUser(authDetails, {
      onSuccess: (result) => {
        const userProfile = result.getIdToken().decodePayload();
        const userAttributes = result.getIdToken().decodePayload();
        if (userAttributes["custom:role"] === "Super Admin") {
          localStorage.setItem("adminToken", result.getIdToken().getJwtToken());
		  // Store user profile separately
          const profileData = {
            email: userProfile.email,
            role: userProfile['custom:role'] || 'User',
            given_name: userProfile.given_name,
            family_name: userProfile.family_name,
            sub: userProfile.sub
          };
          localStorage.setItem("currentUserProfile", JSON.stringify(profileData));
          onLogin(userAttributes);
          navigate("/admin/dashboard"); // Redirect to admin dashboard
        } else {
          setMessage(APP_STRINGS.ACCESS_DENIED);
        }
        setLoading(false);
      },
      onFailure: (err) => {
        console.error(APP_STRINGS.AUTHENTICATION_FAILED, err);
        setMessage(err.message);
        setLoading(false);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-6">
          <img src={adminLogo} alt="Admin Logo" className="lp_logo" />
          <h2 className="text-2xl font-bold">{APP_STRINGS.ADMIN_LOGIN}</h2>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">{APP_STRINGS.EMAIL_LABEL}</label>
            <input 
              type="email" 
              name="email" 
              id="email" 
              placeholder="Email" 
              onChange={handleChange} 
              required 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">{APP_STRINGS.PASSWORD}</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                id="password" 
                placeholder="Password" 
                onChange={handleChange} 
                required 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              >
                {showPassword ?  APP_STRINGS.HIDE : APP_STRINGS.SHOW}
              </button>
            </div>
          </div>
          <div>
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-2 px-4 submit-btn text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              {loading ? APP_STRINGS.LOGIN_IN : APP_STRINGS.LOGIN}
            </button>
          </div>
        </form>
        {message && <p className="mt-4 text-red-500 text-center">{message}</p>}
      </div>
    </div>
  );
};

export default AdminLogin;
