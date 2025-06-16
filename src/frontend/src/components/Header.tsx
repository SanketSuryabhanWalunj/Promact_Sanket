import React, { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { APP_STRINGS } from '../constants/strings';
import { getMyLakes, getAlertCategories, getAlertLevels, createAlert } from '../services/api/lake.service';
import { AlertCategoryDto, AlertLevelDto } from '../types/api.types';
import { getCurrentUser, getShopifyCheckoutUrl, getStoredUserProfile, getUserRole } from '../services/api/user.service';
import { mylakes } from '../types/api.types';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Checkbox, ListItemText, Select, InputLabel, FormControl } from '@mui/material';

import '../styles/common.css';

import { UserProfileDropdown } from './UserProfileDropdown';
import styled from 'styled-components';


interface NavItem {
  path: string;
  label: string;
  submenu?: { label: string; href: string }[];
  icon?: string;
  openInNewTab?: boolean;
}

interface SavedLake {
  lakeName: string;
  lakePulseId: string;
}

const ProfileSection = styled.div`
  display: inline-flex;
  vertical-align: top;
  align-items: center;
  justify-content: space-between;
  margin-left: 10px;
  width: calc(100% - 60px);
`;

const navItems: NavItem[] = [
{
  path: '/lake/:lakePulseId',
  label: APP_STRINGS.NAV_PORTAL,
  icon: 'fa-thin fa-house',
  submenu: [
   
    { label: APP_STRINGS.NAV_MYLAKES, href: '/Home' },
    { label: APP_STRINGS.SEARCH_BY_NAME, href: '/search/name' },
    { label: APP_STRINGS.SEARCH_BY_Map_NAV, href: '/search/map' },
    
  ],
},
  { path: APP_STRINGS.ROUTE_TOOLBOX, label: APP_STRINGS.NAV_TOOLBOX, icon: 'fa-thin fa-wrench', openInNewTab: true },
  {
    path: APP_STRINGS.ROUTE_LIBRARY, label: APP_STRINGS.NAV_LIBRARY, icon: 'fa-thin fa-books',
    submenu: [
      { label: APP_STRINGS.LIBRARY_OVERVIEW, href: '/library_overview' },
      { label: APP_STRINGS.LIBRARY_PHYSICAL, href: '/library_physical' },
      { label: APP_STRINGS.LIBRARY_CHEMICAL, href: '/library_chemical' },
      { label: APP_STRINGS.LIBRARY_BIOLOGICAL, href: '/library_biological' },
      { label: APP_STRINGS.LIBRARY_HYDROLOGICAL, href: '/library_hydrological' },
      { label: APP_STRINGS.LIBRARY_WATERSHED, href: '/library_watershed' },
      // { label: APP_STRINGS.LIBRARY_WEATHER, href: '/library_weather' },
      { label: APP_STRINGS.LIBRARY_ACCESS, href: '/library_access' },
    ],
  },
  {
    path: APP_STRINGS.ROUTE_SOURCES, label: APP_STRINGS.NAV_SOURCES, icon: 'fa-thin fa-database',
    submenu: [

      { label: APP_STRINGS.SOURCES_PHOTOGRAPHY, href: '/photography' },
      { label: APP_STRINGS.SOURCES_LABRESULTS, href: '/lab_results' },
      { label: APP_STRINGS.SOURCES_DRONE, href: '/drone' },
      { label: APP_STRINGS.SOURCES_SATELLITE, href: '/satelite' },
      { label: APP_STRINGS.SOURCES_FIELDTESTING, href: '/sources_fieldtesting' },
      { label: APP_STRINGS.SOURCES_INSITUMONITORING, href: '/sources_insitumonitoring' },
      { label: APP_STRINGS.SOURCES_HISTORICREPORTS, href: '/sources_historicreports' }
    ],
  },
  { path: APP_STRINGS.ROUTE_ANALYTICS, label: APP_STRINGS.Analytics, icon: 'fa-thin fa-chart-line-up' },
  { path: APP_STRINGS.ROUTE_BOATHOUSE, label: APP_STRINGS.NAV_BOATHOUSE, icon: 'fa-thin fa-circle-question' },
  { path: APP_STRINGS.ROUTE_COMMUNITY, label: APP_STRINGS.NAV_COMMUNITY, icon: 'fa-thin fa-people-group' },
  { path: '/support', label: APP_STRINGS.Support, icon: 'fa-thin fa-comments-question' },
  {
    path: '/settings', label: APP_STRINGS.SETTINGS, icon: 'fa-thin fa-cog',
    submenu: [
      { label: APP_STRINGS.GENERAL, href: '/settings' },
      { label: APP_STRINGS.CHANGE_PASSWORD, href: '/change-password' },
      { label: APP_STRINGS.ACCT_ALERTS, href: '/alerts' },
      { label: APP_STRINGS.ACCT_ORDERS, href: '/orders' },
    ],
  },
];

interface HeaderProps {
  lakeName?: string;
  lakePulseId?: string;
  showReturn?: boolean;
}

const Header: React.FC<HeaderProps> = ({ lakeName, lakePulseId, showReturn }) => {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate(); // Use React Router's navigate function
  const [activeMenu, setActiveMenu] = useState<string | null>(location.pathname);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const [submenuOpen, setSubmenuOpen] = useState<boolean>(false);

  const [userProfile, setUserProfile] = useState(getStoredUserProfile());
  const [userRole, setUserRole] = useState<string | null>(getUserRole());

  const [myLakesCount, setMyLakesCount] = useState<number>(0);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const [savedLakes, setSavedLakes] = useState<SavedLake[]>([]);
  const [selectedLake, setSelectedLake] = useState<string>('');
  const [selectedLakeName, setSelectedLakeName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const handleSubscriptionClose = () => setShowSubscriptionDialog(false);
  const handleSubscriptionShow = () => setShowSubscriptionDialog(true);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [fieldNotes, setFieldNotes] = useState('');

  const [categoryOptions, setCategoryOptions] = useState<AlertCategoryDto[]>([]);
  const [levelOptions, setLevelOptions] = useState<AlertLevelDto[]>([]);

  const [isFieldNoteSelected, setIsFieldNoteSelected] = useState(true); // default checked

const handleCreateAlert = async () => {
  if (!selectedCategory || !selectedLabels[0] || !alertMessage) {
    alert('Please fill all fields.');
    return;
  }
  try {
    await createAlert({
      alertLevelId: Number(selectedLabels[0]),
      alertCategorieId: Number(selectedCategory),
      isFieldNoteSelected,
      alertText: alertMessage,
      userId: userProfile?.sub || userProfile?.["cognito:username"] || "",
      lakeId: selectedLake || lakePulseId || "",
      userName: `${userProfile?.given_name || ''} ${userProfile?.family_name || ''}`.trim()
    });
    setShowCreateAlert(false);
    window.location.reload(); // Refresh the current page after adding an alert
   
    // Optionally show a success message here
  } catch (error) {
    alert('Failed to create alert');
  }
};


  
  // Fetch categories and levels when dialog opens
  useEffect(() => {
      const fetchMyLakesCount = async () => {
      try {
        const lakes = await getMyLakes();
        setMyLakesCount(lakes.length);
      } catch (error) {
        console.error(APP_STRINGS.ERROR_FETCHING_MY_LAKES, error);
      }
    };

    fetchMyLakesCount();
    // Fetch categories and levels when dialog opens
    if (showCreateAlert) {
      getAlertCategories().then(setCategoryOptions).catch(() => setCategoryOptions([]));
      getAlertLevels().then(setLevelOptions).catch(() => setLevelOptions([]));
    }
    
  }, [showCreateAlert]);
  useEffect(() => {
    if (categoryOptions.length || levelOptions.length) {
      console.log('Categories:', categoryOptions);
      console.log('Levels:', levelOptions);
    }
  }, [categoryOptions, levelOptions]);

useEffect(() => {
  const fetchSavedLakes = async () => {
    if (userRole === 'Super Admin') {
      setIsLoading(true);
      try {
        const lakes = await getMyLakes();
        const mappedLakes = lakes.map(lake => ({
          lakeName: lake.lakeName,
          lakePulseId: lake.lakePulseId.toString()
        }));
        // Set the selected lake from localStorage if it exists
        const lastViewedLake = localStorage.getItem('lastViewedLake');
        if (lastViewedLake) {
          setSelectedLake(lastViewedLake);
        }
        setSavedLakes(mappedLakes);
      } catch (error) {
        console.error('Error fetching saved lakes:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  fetchSavedLakes();
}, [userRole]);

  useEffect(() => {
    const updateSelectedLake = () => {
      let lakeToSelect = '';

      // First priority: Check URL for lake ID
      const urlLakeId = location.pathname.match(/\/lake\/(\d+)/)?.[1];
      if (urlLakeId) {
        lakeToSelect = urlLakeId;
      }
      // Second priority: Check props
      else if (lakePulseId) {
        lakeToSelect = lakePulseId;
      }
      // Third priority: Check localStorage
      else {
        const savedLake = localStorage.getItem('lastViewedLake');
        if (savedLake) {
          lakeToSelect = savedLake;
        }
      }

      // If we have a lake ID and saved lakes are loaded
      if (lakeToSelect && savedLakes.length > 0) {
        const lake = savedLakes.find(l => l.lakePulseId === lakeToSelect);
        if (lake) {
          setSelectedLake(lakeToSelect);
          setSelectedLakeName(lake.lakeName);
          localStorage.setItem('lastViewedLake', lakeToSelect);
        }
      }
    };

    updateSelectedLake();
  }, [location.pathname, lakePulseId, savedLakes]);

  useEffect(() => {
    const path = location.pathname;

    // Define a mapping of paths to their parent menu
    const menuMapping: Record<string, string> = {
      '/lake/:lakePulseId': '/lake/:lakePulseId',
      '/Home': '/lake/:lakePulseId',
      '/lake': '/lake/:lakePulseId',
      '/search/name': '/lake/:lakePulseId',
      '/search/map': '/lake/:lakePulseId',
      '/settings': '/settings',
      '/change-password': '/settings',
      '/alerts': '/settings',
      '/orders': '/settings',
      '/library': '/library',
      '/library_overview': '/library',
      '/library_physical': '/library',
      '/library_chemical': '/library',
      '/library_biological': '/library',
      '/library_hydrological': '/library',
      '/library_watershed': '/library',
      '/library_weather': '/library',
      '/library_access': '/library',
      '/sources': '/sources',
      '/sources_historicreports': '/sources',
      '/lab_results': '/sources',
      '/photography': '/sources',
      '/satelite': '/sources',
      '/drone': '/sources',
      '/sources_fieldtesting': '/sources',
      '/sources_insitumonitoring': '/sources',

    };

    // Determine the active menu based on the current path
    const activeMenuPath = Object.keys(menuMapping).find((key) =>
      path.startsWith(key)
    );

    if (activeMenuPath) {
      setActiveMenu(menuMapping[activeMenuPath]);
      setActiveSubMenu(path);
      setSubmenuOpen(true);
    } else {
      setActiveMenu(path);
      setActiveSubMenu(null);
      setSubmenuOpen(false);
    }
  }, [location.pathname]);

  // Add immediate refresh on mount and profile updates
  useEffect(() => {
    const refreshUserProfile = async () => {
      const freshProfile = await getCurrentUser();

      if (freshProfile) {
        setUserProfile(freshProfile);
      }
    };
    const refreshUserRole = async () => {
      const freshRole = await getUserRole();

      if (freshRole) {
        setUserRole(freshRole);
      }
    };

    // Initial load
    refreshUserProfile();
    refreshUserRole();
    // Listen for updates
    const handleProfileUpdate = () => {

      const updatedProfile = getStoredUserProfile();
      const updatedRole = getUserRole();
      if (updatedProfile) {
        setUserProfile(updatedProfile); // Immediately update from localStorage
        refreshUserProfile(); // Also fetch fresh data
      }
      if (updatedRole) {
        setUserRole(updatedRole); // Immediately update from localStorage
        refreshUserRole(); // Also fetch fresh data
      }
    };
    window.addEventListener('userProfileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('userProfileUpdated', handleProfileUpdate);

  }, []);

  useEffect(() => {
    const subscriptionStatus = localStorage.getItem('userSubscribed');
    setIsSubscribed(subscriptionStatus === 'true');
  }, []);

  const handleMenuClick = (menuItem: NavItem) => {
    const isPortalDisabled = menuItem.path === '/search/name' && myLakesCount > 0 && (userRole === 'User' || userRole === 'Admin');
    const isHomeDisabled = (userRole === 'User' || userRole === 'Admin') && myLakesCount > 0 && (menuItem.path === '/Home' || menuItem.path === '/search/name');
  // For Portal menu: always fetch lastViewedLake and navigate
  if (menuItem.path === '/lake/:lakePulseId') {
    const lastViewedLake = localStorage.getItem('lastViewedLake');
    if (lastViewedLake) {
      // Replace the route with the actual lake
      navigate(`/lake/${lastViewedLake}`, { replace: true });
    } else {
      // Fallback if no lake is selected
      navigate('/Home', { replace: true });
    }
    setActiveMenu(menuItem.path);
    setSubmenuOpen(true);
    return;
  }
    // Handle settings menu and its submenu
    if (menuItem.path === '/settings') {
      setActiveMenu('/settings');
      setSubmenuOpen(!submenuOpen);
      return;
    }

    // Ensure "Settings" page is accessible for all roles
    if (menuItem.path === '/settings') {
      navigate('/settings'); // Navigate to the settings page
      return;
    }

    // Restrict "Portal" submenu items for "User" and "Admin" roles
    if (isPortalDisabled || isHomeDisabled) {
      if (menuItem.path === '/search/name') {
        navigate('/search/name'); // Redirect to search if portal is disabled
      } else {
        handleSubscriptionShow(); // Show subscription dialog for restricted items
      }
      return; // Exit if the menu item is restricted
    }

    if (menuItem.submenu && menuItem.submenu.length > 0) {
      if (activeMenu === menuItem.path) {
        setSubmenuOpen(prev => !prev);
      } else {
        setActiveMenu(menuItem.path);
        setSubmenuOpen(true);
      }
    } else {
      setActiveMenu(menuItem.path);
      setSubmenuOpen(false);
      navigate(menuItem.path);
    }
  };

  // Ensure the main menu remains expanded if any submenu item is active
  useEffect(() => {
    navItems.forEach(menuItem => {
      const isActive = menuItem.submenu?.some(subItem => window.location.pathname.includes(subItem.href));
      if (isActive) {
        setSubmenuOpen(true);
        const menuElement = document.getElementById(menuItem.path);
        menuElement?.classList.add('has-open');
        const submenuElement = document.getElementById('sub');
        submenuElement?.style.setProperty('display', 'block');
      }
    });
  }, []);

  const handleSignOut = () => {
    navigate("/login");
    localStorage.removeItem('idToken')
  };

  const isActive = (path: string): string => {
    if (path === '/search/name' && (location.pathname.includes('search') || location.pathname.includes('search/map') || location.pathname.includes('/Home') || location.pathname.includes('lake') || location.pathname.includes('/settings'))) {
      return 'active';
    }
    return location.pathname === path || activeMenu === path ? 'active' : '';
  };

  const isSubMenuActive = (path: string): string => {
    return location.pathname === path ? 'active' : '';
  };

  const handleLakeChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLakePulseId = event.target.value;
    if (!newLakePulseId) return;

    setIsLoading(true);
    try {
      const lake = savedLakes.find(l => l.lakePulseId === newLakePulseId);
      if (lake) {
        setSelectedLake(newLakePulseId);
        setSelectedLakeName(lake.lakeName);
        localStorage.setItem('lastViewedLake', newLakePulseId);
        if (location.pathname.startsWith('/lake/')) {
          navigate(`/lake/${newLakePulseId}`);
        }
        // Only navigate if on a /lake/* page
        window.location.reload();

      }
    } catch (error) {
      console.error('Error changing lake');
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for lake changes from other components
  useEffect(() => {
    const handleLakeChange = () => {
      const newLakePulseId = localStorage.getItem('lastViewedLake');
      if (newLakePulseId && savedLakes.length > 0) {
        const lake = savedLakes.find(l => l.lakePulseId === newLakePulseId);
        if (lake) {
          setSelectedLake(newLakePulseId);
          setSelectedLakeName(lake.lakeName);
        }
      }
    };

    window.addEventListener('lakeChanged', handleLakeChange);
    return () => window.removeEventListener('lakeChanged', handleLakeChange);
  }, [savedLakes]);
// Before rendering navItems, build the Portal submenu dynamically:
const lastViewedLake = localStorage.getItem('lastViewedLake');
const selectedLakeObj = savedLakes.find(l => l.lakePulseId === lastViewedLake);

const portalSubmenu = [
  {
    label: selectedLakeObj
      ? selectedLakeObj.lakeName
      : isLoading
        ? 'Loading...'
        : APP_STRINGS.PLEASE_SELECT_LAKE,
    href: lastViewedLake ? `/lake/${lastViewedLake}` : '/search/name',
  },
  { label: APP_STRINGS.NAV_MYLAKES, href: '/Home' },
  { label: APP_STRINGS.SEARCH_BY_NAME, href: '/search/name' },
  { label: APP_STRINGS.SEARCH_BY_Map_NAV, href: '/search/map' },
];

const updatedNavItems = navItems.map(item =>
  item.path === '/search/name'
    ? { ...item, submenu: portalSubmenu }
    : item
);
  return (
    <>
      <header>
        <div>
          <div>
            <a className="lake-pulse-logo" href='/Home' title='Lake Pulse'></a>
            <div className="selected-lake-wrap">
              <label className='block my-lake-label'>{APP_STRINGS.MY_LAKE}</label>

              {showReturn && lakeName && lakePulseId && (
                <div className="return-lake-button">
                  <Link
                    to={`/lake/${lakePulseId}`}
                    className={`inline-block border-none mr-2`}
                    style={{ textDecoration: 'none' }}
                  >
                    <i className="fa-thin fa-arrow-left"></i>
                  </Link>
                </div>
              )}

              {userRole === 'Super Admin' ? (
                <div className="lake-select-container">
                  <div className={`select-wrapper ${isLoading ? 'loading' : ''}`}>
                    <select
                      value={selectedLake}
                      onChange={handleLakeChange}
                      className="lake-select"
                      disabled={isLoading}
                    >
                      <option value="">{isLoading ? 'Loading...' : APP_STRINGS.PLEASE_SELECT_LAKE}</option>
                      {!isLoading && savedLakes.map((lake) => (
                        <option
                          key={lake.lakePulseId}
                          value={lake.lakePulseId}
                        >
                          {lake.lakeName}
                        </option>
                      ))}
                    </select>
                    {isLoading && (
                      <div className="loader-container">
                        <div className="loader"></div>
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                <>
                  {!lakeName && (<label className='select-label'>{APP_STRINGS.PLEASE_SELECT_LAKE}</label>)}
                  {lakeName && (
                    <div className="selected-lake">
                      <Link to={`/lake/${lakePulseId}`} style={{ textDecoration: 'none' }}>
                        {lakeName}
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
            <nav className="main-nav">
              <ul className="main-menu" id='main-menu'>
                {updatedNavItems.map((item) => {
                  const isDisabled = userRole === 'User' && ['Analytics', 'Toolbox', 'Boathouse', 'Community', 'Data Library', 'Data Sources'].includes(item.label) && !isSubscribed;
                  const isPortalDisabled = item.path === 'search/name' && myLakesCount > 0 && (userRole === 'User');
                  const isHomeDisabled = (userRole === 'User') && myLakesCount > 0 && (item.path === '/Home' || item.path === 'search/name');
                  if (item?.submenu) {
                    return (
                   <li key={item.path} className={`${isActive(item.path)}`}>
  <i className={`${item.icon}`}></i>
<a
  href={isDisabled || isPortalDisabled || isHomeDisabled ? '#' : item.path}
  onClick={e => {
    e.preventDefault();
    if (isDisabled || isPortalDisabled || isHomeDisabled) {
      handleSubscriptionShow();
    } else {
      setActiveMenu(item.path);
      // Only open Portal submenu for Admin/Super Admin
      if (
        item.path === '/lake/:lakePulseId'
          ? (userRole === 'Admin' || userRole === 'Super Admin')
          : true // For all other menus, always open
      ) {
        setSubmenuOpen(true);
      } else {
        setSubmenuOpen(false);
      }
      if (item.path === '/lake/:lakePulseId') {
        const lastViewedLake = localStorage.getItem('lastViewedLake');
        if (lastViewedLake) {
          navigate(`/lake/${lastViewedLake}`);
        } else {
          navigate('/Home');
        }
      } else {
        navigate(item.path);
      }
    }
  }}
>
  {item.label}
</a>
{item.submenu &&
  activeMenu === item.path &&
  submenuOpen &&
  (
    // Only render Portal submenu for Admin/Super Admin
    item.path !== '/lake/:lakePulseId' ||
    userRole === 'Admin' ||
    userRole === 'Super Admin'
  ) && (
    <div className="sub-menus" id="sub">
      {item.submenu.map((subItem) => (
        <Link
          key={subItem.href}
          to={subItem.href}
          onClick={e => {
            e.preventDefault();
            navigate(subItem.href);
            setSubmenuOpen(false);
          }}
          className={`px-4 inline-block ${isSubMenuActive(subItem.href)}`}
        >
          {subItem.label}
        </Link>
      ))}
    </div>
)}
</li>
                    );
                  } else {
                    return (
                      <li key={item.path} className={`${isActive(item.path)}`}>
                        <i className={`${item.icon}`}></i>
                        <Link
                          to={isDisabled && !isSubscribed ? '#' : item.path}
                          className={isDisabled || isPortalDisabled || isHomeDisabled ? 'disabled-link' : ''}
                          onClick={(e) => {
                            if (isDisabled && !isSubscribed) {
                              e.preventDefault();
                              handleSubscriptionShow();
                            } else if (item.openInNewTab) {
                              e.preventDefault();
                              window.open(item.path, '_blank');
                            }
                          }}
                          target={item.openInNewTab ? '_blank' : '_self'}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  }
                })}
              </ul>

            </nav>
            {(userRole==='Super Admin' || userRole === 'Admin') && ( <div
              className='create-alert-button'
              onClick={() => setShowCreateAlert(true)}
            >
              CREATE NEW ALERT
            </div>)}
           
            <div className="user-profile-wrap">
              <UserProfileDropdown />
              <ProfileSection>
                <div className='user-name-section'>
                  <div className="user-name">{userProfile?.given_name} {userProfile?.family_name}</div>
                  <div className="user-role">
                    {userRole === 'User' && (
                      <>

                        {isSubscribed ? <i className="fa-solid fa-certificate"></i> : <i className="fa-solid fa-user"></i>}
                        <span>{isSubscribed ? 'Subscriber' : 'Member'}</span>
                      </>
                    )}
                    {userRole === 'Super Admin' && <i className="fa-solid fa-crown"></i>}
                    {userRole === 'Admin' && <i className="fa-solid fa-user-shield"></i>}
                    {userRole !== 'User' && userRole}
                  </div>
                </div>
                <div className='sign-out-details'>
                  <button onClick={handleSignOut} className="dropdown-item">
                    <i className="fa-thin fa-arrow-right-from-bracket"></i>
                  </button>
                </div>
              </ProfileSection>
            </div>
          </div>
        </div>
      </header>
      <Dialog
        open={showCreateAlert}
        onClose={() => setShowCreateAlert(false)}
        maxWidth="sm"
        fullWidth
        className='create-alert-dialog'
      >
        <DialogTitle>Create an Alert</DialogTitle>
        <DialogContent>
          <div className='form-field'>
         <label htmlFor="level-select">Enter alert text</label>
   <textarea
  className='alert-msg-textarea'
  value={alertMessage}
  onChange={e => setAlertMessage(e.target.value)}
/>
    </div>
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <div className='form-field' style={{ flex: 1 }}>
        <label htmlFor="category-select">Select Category</label>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #ccc' }}
        >
          <option value="">Select Category</option>
          {categoryOptions.map(category => (
            <option key={category.id} value={category.id}>
              {category.categoryLabel}
            </option>
          ))}
        </select>
      </div>
   <div className='form-field' style={{ flex: 2 }}>
  <label htmlFor="level-select">Select Level</label>
  <select
    id="level-select"
    value={selectedLabels[0] || ''} // single select, use first selected or empty
    onChange={e => setSelectedLabels([e.target.value])}
    style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #ccc' }}
  >
    <option value="">Select Level</option>
    {levelOptions.map(level => (
      <option key={level.id} value={level.id}>
        {level.levelLabel}
      </option>
    ))}
  </select>
</div>
    </div>
   <label>
  <Checkbox
    checked={isFieldNoteSelected}
    onChange={e => setIsFieldNoteSelected(e.target.checked)}
  />Add to Field Notes
</label>
  </DialogContent>
        <DialogActions>
          <Button className="theme-button" onClick={handleCreateAlert}>
  {APP_STRINGS.CREATE}
</Button>
<Button className="cancel-btn" onClick={() => setShowCreateAlert(false)}>
  {APP_STRINGS.CANCEL}
</Button>
        </DialogActions>
      </Dialog>
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
            {userRole === 'User' && myLakesCount > 0 && lakePulseId ? (<> {APP_STRINGS.PLEASE} <a href={`/lake/${lakePulseId}`} className='subscribe_text'>{APP_STRINGS.SUBSCRIBE}</a> {APP_STRINGS.TO_ACCESS}</>) : (<> {APP_STRINGS.PLEASE} <a href='/search/name' className='subscribe_text'>{APP_STRINGS.SUBSCRIBE}</a> {APP_STRINGS.TO_ACCESS}</>)}

          </div>
        </div>
      </Dialog>
    </>
  );
};

export default Header;