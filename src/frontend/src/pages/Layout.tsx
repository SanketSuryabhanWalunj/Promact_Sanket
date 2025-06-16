import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import { useLakePulse } from '../context/LakePulseContext';

const Layout = () => {
  const { lakes, userRole } = useLakePulse();

  // Wait for lakes to load
  if (!lakes) {
    return null; // Or a loader
  }

  // Determine if user is subscribed
  const isSubscribed = localStorage.getItem('userSubscribed') === 'true';

  let headerProps = {};

  if (userRole === 'Super Admin') {
    // Always simple header for Super Admin
    headerProps = {};
  } else if ((userRole === 'User' || userRole === 'Local Admin')) {
    if (isSubscribed && lakes.length > 0) {
      // Subscribed user or local admin with lakes
      headerProps = {
        lakeName: lakes[0].lakeName,
        lakePulseId: String(lakes[0].lakePulseId),
      };
    } else if (lakes.length > 0) {
      // Not subscribed but has lakes
      headerProps = {
        lakeName: lakes[0].lakeName,
        lakePulseId: String(lakes[0].lakePulseId),
      };
    } else {
      // Not subscribed and no lakes
      headerProps = {};
    }
  }

  return (
    <>
      <Header {...headerProps} />
      <Outlet />
    </>
  );
};

export default Layout;