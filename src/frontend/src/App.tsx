/**
 * Main Application Component
 * 
 * This is the root component of the LakePulse application. It handles:
 * - Authentication state management
 * - Routing configuration
 * - Main layout structure
 */

import { useAuth } from "react-oidc-context";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

import MyLakes from './pages/MyLakes';
import SearchByName from './pages/SearchByName';

import Analytics from './pages/Analytics';
import Boathouse from './pages/Boathouse';
import { APP_STRINGS } from './constants/strings';
import waveIcon from './assets/wave-icon.svg';
import PulseLoader from './components/PulseLoader';
import Lake from "./pages/Lake";
import SearchByMapNew from "./pages/SearchByMap";
import { getMyLakesCount, getMyLakes } from './services/api/lake.service';
import ChartResultsPage from './pages/ChartResultsPage';
import { initGA } from './services/analytics.service';
import FieldNotesResults from './pages/FieldNotesResults';
import { Settings } from './pages/Settings';

import UserLogin from './pages/Login'; // Assuming you have a separate user login page
import Community from "./pages/Community";
import { Dialog } from '@mui/material';
import Support from "./pages/Support";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ConfirmUser from "./pages/ConfirmUser";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import ResetNewPassword from "./pages/ResetNewPassword";
import ChangePassword from "./pages/ChangePassword";
import Alerts from "./pages/Alerts";
import Orders from "./pages/Orders";
import Library from "./pages/Library";
import Sources from "./pages/Sources";
import { refreshTokenIfNeeded } from "./services/api/user.service";
import LibraryPhysical from './pages/LibraryPhysical';
import LibraryChemical from './pages/LibraryChemical';
import LibraryBiological from './pages/LibraryBiological';
import LibraryHydrological from './pages/LibraryHydrological';
import LibraryWatershed from './pages/LibraryWatershed';
import LibraryWeather from './pages/LibraryWeather';
import LibraryAccess from './pages/LibraryAccess';
import LibraryIndex from './pages/LibraryIndex';
import LibraryOverview from "./pages/LibraryOverview";
import Historic from "./pages/Historic";
import LabResults from "./pages/LabResults";
import Drone from "./pages/Drone";
import Satellite  from "./pages/Satelite";
import Photography from "./pages/Photography";
import FieldTesting from "./pages/FieldTesting";
import InSituMonitoring from "./pages/InSituMonitoring"; // Correct casing
import { Source } from "@mui/icons-material";
import { LakePulseProvider } from './context/LakePulseContext';
import Layout from "./pages/Layout";

function AppContent() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [hasLakes, setHasLakes] = useState<boolean | null>(null);
 
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);

  const handleSubscriptionClose = () => setShowSubscriptionDialog(false);
  useEffect(() => {
    // Run refresh check every 5 minutes
    const interval = setInterval(refreshTokenIfNeeded, 5 * 60 * 1000);
    
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  useEffect(() => {
    if (auth.error?.message === "No matching state found in storage") {
      auth.removeUser();
      auth.signinRedirect().catch(console.error);
      return;
    }
  }, [auth.error, auth]);

  useEffect(() => {
    const fetchUserRole = () => {
      const userProfileStr = localStorage.getItem("currentUserProfile");
      const userProfileRole = localStorage.getItem("idToken");
      if (userProfileStr && userProfileRole) {
        const userProfile = JSON.parse(userProfileRole);
        setUserRole(userProfile.profile.role);
        setUserToken(userProfile);
      }
    };

    fetchUserRole();
  }, [auth.isAuthenticated]);

  useEffect(() => {
    
    const userProfileStr = localStorage.getItem("currentUserProfile");
  
    const userSub = JSON.parse(userProfileStr)?.sub;
    const checkLakes = async () => {
      if (!userSub || !userRole) return;

      setLoading(true);
      try {
       
        const count = await getMyLakesCount(userSub);
        setHasLakes(count > 0);
  
       
        // Redirect User or Local Admin to their saved lake if they have one
        if ((userRole === 'User' || userRole === 'Admin') && count > 0) {
         
          const lakes = await getMyLakes();
         
          // Prevent navigation to the lake page if the user is trying to access another route (e.g., /settings)
          if (lakes.length > 0 && (location.pathname === '/search/name')) {
           
              
            const savedLake = lakes[0];
            navigate(`/lake/${savedLake.lakePulseId}`, { replace: true });
            
            return;
          
            }
        }
        if (location.pathname === '/') {
          if (count > 0) {
            navigate(APP_STRINGS.ROUTE_MY_LAKES, { replace: true });
          } else {
            navigate('/search/name', { replace: true });
          }
        }
       
      } catch (error) {
        console.error('Error checking lakes:', error);
      } finally {
        setLoading(false);
       
      }
    };

    if (userSub && userRole) {
      checkLakes();
    }
  }, [navigate, userRole]);

 
  useEffect(() => {
    // Initialize GA with measurement ID from env
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (measurementId && measurementId !== 'G-XXXXXXXXXX') {
      initGA(measurementId);
    } else {
      console.warn('Google Analytics Measurement ID not properly configured');
    }
  }, []);



  if (auth.isLoading || loading) {
    return <PulseLoader />;
  }

  if (auth.error && auth.error.message !== "No matching state found in storage") {
    return <div>{APP_STRINGS.ERROR_PREFIX} {auth.error.message}</div>;
  }

  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={
            userToken ? (
              <Navigate to={location.state?.from?.pathname || "/search/name"} replace />
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/signup"
          element={
            auth.isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Signup />
            )
          }
        />
         <Route path="/confirm-user" element={<ConfirmUser />} />
         <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
 <Route element={<Layout />}>
        <Route path="/Home" element={<MyLakes />} />
       
        <Route path="/search/name" element={<SearchByName />} />
        <Route path="/search/map" element={<SearchByMapNew />} />
        <Route path={APP_STRINGS.ROUTE_LIBRARY} element={<Library />} />
        <Route path={APP_STRINGS.ROUTE_SOURCES} element={<Sources />} />
      
        <Route path={APP_STRINGS.ROUTE_ANALYTICS} element={<Analytics />} />
        <Route path={APP_STRINGS.ROUTE_BOATHOUSE} element={<Boathouse />} />
        <Route path={APP_STRINGS.ROUTE_COMMUNITY} element={<Community />} />
        <Route path={APP_STRINGS.SUPPORT_TITLE} element={<Support />} />
        <Route path="/lake/:lakePulseId" element={<Lake />} />
        <Route path="/lake/:lakePulseId/results" element={<ChartResultsPage />} />
        <Route path="/lake/:lakePulseId/field-notes" element={<FieldNotesResults />} />
        <Route path="/settings" element={<Settings/>} /> {/* Ensure this route is accessible */}
       
        <Route path="/" element={loading ? <PulseLoader /> : <Navigate to={hasLakes ? "/Home" : "/search/name"} />} />
        <Route path="*" element={<Navigate to="/" />} />
       
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/change-password" element={<ChangePassword source="settings" />}/>
        <Route path="/alerts" element={<Alerts />}/>
        <Route path="/orders" element={<Orders />}/>
        <Route path="/reset-password-new" element={<ResetNewPassword />} />
        <Route path="/library" element={<LibraryIndex />} />
        <Route path="/library_overview" element={<LibraryOverview />} />
        <Route path="/library_physical" element={<LibraryPhysical />} />
        <Route path="/library_chemical" element={<LibraryChemical />} />
        <Route path="/library_biological" element={<LibraryBiological />} />
        <Route path="/library_hydrological" element={<LibraryHydrological />} />
        <Route path="/library_watershed" element={<LibraryWatershed />} />
        <Route path="/library_weather" element={<LibraryWeather />} />
        <Route path="/library_access" element={<LibraryAccess />} />
         <Route path="/sources" element={<Source />} />
        <Route path="/sources_historicreports" element={<Historic />} />
        <Route path="/lab_results" element={<LabResults />} />
        <Route path="/satelite" element={<Satellite />} />
        <Route path="/drone" element={<Drone />} />
         <Route path="/photography" element={<Photography />} />
         <Route path="/sources_fieldtesting" element={<FieldTesting />} />
          <Route path="/sources_insitumonitoring" element={<InSituMonitoring />} />
          </Route>
      </Routes>
      <Dialog 
        open={showSubscriptionDialog} 
        onClose={handleSubscriptionClose}
        PaperProps={{
          style: {
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%'
          }
        }}
      >
        
        <div className="add-sub">
          <div>
           {APP_STRINGS.PLEASE} <a href="https://your-shopify-link.com" className="text-blue-500 underline">{APP_STRINGS.SUBSCRIBE}</a> {APP_STRINGS.TO_ACCESS}
          </div>
        </div>
      </Dialog>
    </>
  );
}

 // Adjust the path as needed

function App() {
  return (
    <Router>
      <LakePulseProvider>
        <AppContent />
      </LakePulseProvider>
    </Router>
  );
}

export default App;