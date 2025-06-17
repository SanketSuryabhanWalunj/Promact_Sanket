import { APP_STRINGS } from '../constants/strings';
import Header from '../components/Header';
import { useEffect, useState } from 'react';
import { AlertCategoryDto, AlertLevelDto, mylakes } from '../types/api.types';
import { getCriticalAlerts, deleteCriticalAlert, getAlertCategories, getAlertLevels, saveAlertPreferences, getAlertPreferences } from '../services/api/lake.service';
import { Checkbox, CheckboxProps, FormControlLabel, Snackbar, styled } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { useLakePulse } from "../context/LakePulseContext";

const Alerts = () => {

  const [criticalAlerts, setCriticalAlerts] = useState<any[]>([]);
  const [lakePulseId, setLakePulseId] = useState<string | undefined>(undefined);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [alertToDelete, setAlertToDelete] = useState<string | null>(null);
  // Preferences state
  const [categoryOptions, setCategoryOptions] = useState<AlertCategoryDto[]>([]);
  const [levelOptions, setLevelOptions] = useState<AlertLevelDto[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedMethods, setSelectedMethods] = useState<string[]>(['Email']);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loadingLakeId, setLoadingLakeId] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [initialPrefs, setInitialPrefs] = useState({
    levels: [],
    categories: [],
    methods: []
  });

    const { userRole } = useLakePulse();

  useEffect(() => {
    const userProfileStr = localStorage.getItem("currentUserProfile");
    const userProfileRole = localStorage.getItem("idToken");
    if (userProfileStr && userProfileRole) {
     
      const userProfileData = JSON.parse(userProfileStr);
    
      setUserProfile(userProfileData);
    }
    // Fetch lakes and set lakePulseId

const fetchMyLakes = async () => {
      try {
       
        let id: string | undefined;
        const lastViewedLakeStr = localStorage.getItem("lastViewedLake");
        setLakePulseId(lastViewedLakeStr);
      } catch (error) {
       
        setLakePulseId(undefined);
      } finally {
        setLoadingLakeId(false);
      }
    };
    fetchMyLakes();

  }, []);
  // Fetch critical alerts only after lakePulseId is set
  useEffect(() => {
    if (!lakePulseId) return;
    const fetchCritical = async () => {
      try {
        const alerts = await getCriticalAlerts(lakePulseId, 1, 10);
        setCriticalAlerts(alerts);
      } catch (error) {
        setCriticalAlerts([]);
      }
    };

    fetchCritical();
  }, [lakePulseId]);
  const [optionsLoaded, setOptionsLoaded] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await getAlertCategories();
        setCategoryOptions(cats);
      } catch {
        setCategoryOptions([]);
      }
    };

    const fetchLevels = async () => {
      try {
        const lvls = await getAlertLevels();
        setLevelOptions(lvls);
      } catch {
        setLevelOptions([]);
      }
    };

    Promise.all([fetchCategories(), fetchLevels()]).then(() => setOptionsLoaded(true));
  }, []);
  useEffect(() => {

    if (!userProfile || !optionsLoaded) return;
    const fetchPreferences = async () => {
      const userId = userProfile?.sub || userProfile?.["cognito:username"];
      if (!userId) return;
      try {
        const prefs = await getAlertPreferences(userId);
        if (prefs.levelPreferences) {
          setSelectedLevels(prefs.levelPreferences.filter(l => l.isSelected).map(l => l.id));
        } else {
          setSelectedLevels([]); // fallback
        }
        if (prefs.categoriePreferences) {
          setSelectedCategories(prefs.categoriePreferences.filter(c => c.isSelected).map(c => c.id));
        } else {
          setSelectedCategories([]); // fallback
        }
        if (prefs.isSMSSelected !== undefined || prefs.isEmailSelected !== undefined) {
          const methods: string[] = [];
          if (prefs.isEmailSelected) methods.push('Email');
          if (prefs.isSMSSelected) methods.push('SMS');
          setSelectedMethods(methods);
        } else {
          setSelectedMethods([]); // fallback
        }
        // After loading preferences from API:
        setInitialPrefs({
          levels: prefs.levelPreferences.filter(l => l.isSelected).map(l => l.id),
          categories: prefs.categoriePreferences.filter(c => c.isSelected).map(c => c.id),
          methods: [
            ...(prefs.isEmailSelected ? ['Email'] : []),
            ...(prefs.isSMSSelected ? ['SMS'] : [])
          ]
        });


      } catch {
        setSelectedLevels([]);
        setSelectedCategories([]);
        setSelectedMethods([]);
      }
    };

    fetchPreferences();
  }, [optionsLoaded]);
  const handleLevelChange = (id: number) => {
    setSelectedLevels(prev =>
      prev.includes(id) ? prev.filter(lvl => lvl !== id) : [...prev, id]
    );
  };
  const handleCategoryChange = (id: number) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(cat => cat !== id) : [...prev, id]
    );
  };
  const handleMethodChange = (method: string) => {
    setSelectedMethods(prev =>
      prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]
    );
  };


  // Then, for the Save button:
  const isSaveDisabled =
    selectedLevels.length === 0 &&
    selectedCategories.length === 0 &&
    selectedMethods.length === 0 ||
    (
      JSON.stringify(selectedLevels) === JSON.stringify(initialPrefs.levels) &&
      JSON.stringify(selectedCategories) === JSON.stringify(initialPrefs.categories) &&
      JSON.stringify(selectedMethods) === JSON.stringify(initialPrefs.methods)
    );

  const handleDeleteClick = (alertId: string) => {
    setAlertToDelete(alertId);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!alertToDelete) return;
    try {
      await deleteCriticalAlert(alertToDelete);
      setCriticalAlerts(prev => prev.filter(a => a.id !== alertToDelete));
    } catch (e) {
      alert('Failed to delete alert.');
    }
    setShowDeleteDialog(false);
    setAlertToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setAlertToDelete(null);
  };

  // Save preferences handler
  const handleSavePreferences = async () => {
    if (!userProfile) {
      alert('User data missing');
      return;
    }
    try {
      await saveAlertPreferences({
        userId: userProfile?.sub || userProfile?.["cognito:username"] || "",
        levelPreferences: levelOptions.map(lvl => ({
          id: lvl.id,
          isSelected: selectedLevels.includes(lvl.id)
        })),
        categoriePreferences: categoryOptions.map(cat => ({
          id: cat.id,
          isSelected: selectedCategories.includes(cat.id)
        })),
        isSMSSelected: selectedMethods.includes('SMS'),
        isEmailSelected: selectedMethods.includes('Email')
      });
      setSnackbarOpen(true);

    } catch (error) {
      alert('Failed to save preferences');
    }
  };

const BpIcon = styled('span')(({ theme }) => ({
  borderRadius: 3,
  width: 16,
  height: 16,
 


  backgroundColor: '#f5f8fa',
  backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.8),hsla(0,0%,100%,0))',
  border: '1px solid #ddd',
  '.Mui-focusVisible &': {
    outline: '2px auto #224681',
    outlineOffset: 2,
  },
  'input:hover ~ &': {
    backgroundColor: '#224681',
    ...theme.applyStyles('dark', {
      backgroundColor: '#30404d',
    }),
  },
  'input:disabled ~ &': {
    boxShadow: 'none',
    background: 'rgba(206,217,224,.5)',
    ...theme.applyStyles('dark', {
      background: 'rgba(57,75,89,.5)',
    }),
  },
  ...theme.applyStyles('dark', {
    boxShadow: '0 0 0 1px rgb(16 22 26 / 40%)',
    backgroundColor: '#224681',
    backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.05),hsla(0,0%,100%,0))',
  }),
}));

const BpCheckedIcon = styled(BpIcon)({
  backgroundColor: ' #224681',
  backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))',
  '&::before': {
    display: 'block',
    width: 16,
    height: 16,
    backgroundImage:
      "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath" +
      " fill-rule='evenodd' clip-rule='evenodd' d='M12 5c-.28 0-.53.11-.71.29L7 9.59l-2.29-2.3a1.003 " +
      "1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l5-5A1.003 1.003 0 0012 5z' fill='%23fff'/%3E%3C/svg%3E\")",
    content: '""',
    backgroundPositionY: '47px', 
    backgroundPositionX: '15px'
  },
  'input:hover ~ &': {
    backgroundColor: '#224681',
  },
});
  function BpCheckbox(props: CheckboxProps) {
  return (
   <Checkbox
      sx={{ '&:hover': { bgcolor: 'transparent' } }}
      disableRipple
      color="default"
      checkedIcon={<BpCheckedIcon />}
      icon={<BpIcon />}
      inputProps={{ 'aria-label': 'Checkbox demo' }}
      {...props}
    />
  );
}



  return (
    <div>
    

      <main>
        <div>
          <h1>{APP_STRINGS.ALERTS_TITLE}</h1>
          {(userRole === 'Super Admin' || userRole === 'Admin') && (
            <>
              <h2 className='mt-5'>Manage Critical Alerts</h2>
              <p className='settings-description'>Admin can disable active alerts for all users</p>
              <div className="critical-alerts-box">
                {loadingLakeId ? (
                  <div>Loading critical alerts...</div>
                ) : criticalAlerts.length === 0 ? (
                  <div>No critical alerts found.</div>
                ) : (
                  criticalAlerts.map(alert => (
                    <div key={alert.id} className="critical-alert-item">
                      <i
                        className="fa-solid fa-trash delete-alert-icon"
                        title="Delete"
                        onClick={() => handleDeleteClick(alert.id)}
                      ></i>
                      <span className="critical-alert-text">{alert.note}</span>
                      <span className="critical-alert-meta">
                        {alert.userName} - {new Date(alert.createdTime).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
              </>
                )}
              <h2 className='mt-5'>Notification & Alert Preferences</h2>
              <p className='settings-description'>Choose which categories you want to receive alerts on and how you would like to receive them.</p>

              <div className="critical-alerts-box">



                <div className='critical-alert-item' >
                  {/* Levels */}
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 8 }}>Levels</div>
                      {levelOptions.map(level => (
                        <div key={level.id}>
                          <FormControlLabel
                          
                            control={
                              <BpCheckbox
                                checked={selectedLevels.includes(level.id)}
                                onChange={() => handleLevelChange(level.id)}
                              />
                            }
                            label={level.levelLabel}
                          />
                        </div>
                      ))}
                    </div>
                    {/* Categories */}
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 8 }}>Categories</div>
                      {categoryOptions.map(category => (
                        <div key={category.id}>
                          <FormControlLabel
                            control={
                              <BpCheckbox
                                checked={selectedCategories.includes(category.id)}
                                onChange={() => handleCategoryChange(category.id)}
                              />
                            }
                            label={category.categoryLabel}
                          />
                        </div>
                      ))}
                    </div>
                    {/* Methods */}
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 8 }}>Methods</div>
                      <div>
                        <FormControlLabel
                          control={
                            <BpCheckbox
                              checked={selectedMethods.includes('Email')}
                              onChange={() => handleMethodChange('Email')}
                            />
                          }
                          label="Email"
                        />
                      </div>
                      <div>
                        <FormControlLabel
                          control={
                            <BpCheckbox
                              checked={selectedMethods.includes('SMS')}
                              onChange={() => handleMethodChange('SMS')}
                            />
                          }
                          label="SMS"
                        />
                      </div>
                    </div>
                  </div>
                  <div className='text-right'>
                    <button
                      className="button"
                      onClick={handleSavePreferences}
                      disabled={isSaveDisabled}
                    >
                      Save
                    </button>
                  </div>
                </div>

              </div>
              <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              >
                <MuiAlert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
                  Preferences saved!
                </MuiAlert>
              </Snackbar>
              {showDeleteDialog && (
                <div className="delete-confirm-overlay">
                  <div className="delete-confirm-dialog">
                    <p>Are you sure you want to delete this alert?</p>
                    <div className="delete-confirm-actions">
                      <button className="confirm-btn" onClick={handleConfirmDelete}>Delete</button>
                      <button className="cancel-btn" onClick={handleCancelDelete}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}
           
        

        </div>
      </main>
    </div>
  );
};

export default Alerts;