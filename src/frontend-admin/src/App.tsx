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
import { useState } from 'react';

import AdminSignup from "./pages/AdminSignup";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";


function AppContent() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [hasLakes, setHasLakes] = useState<boolean | null>(null);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  


  // Conditional rendering based on the path

    return (
      <Routes>
        <Route path="/admin/signup" element={<AdminSignup />} />
       
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
       
        <Route path="*" element={<AdminLogin onLogin={(userData) => console.log(userData)} />} /> 
      </Routes>
    );
    
}

 



function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;