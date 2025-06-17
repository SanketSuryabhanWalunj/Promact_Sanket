import { APP_STRINGS } from "../constants/strings";
import Header from "../components/Header";
import { getMyLakes, getUserOrdersByEmail, syncUserOrders, getLakeMeasurementLocations, saveLakeMeasurementLocation, registerProduct, deregisterProduct, getToolboxLabels, getToolboxLabelBySku } from "../services/api/lake.service";
import { useEffect, useState } from "react";
import { mylakes } from "../types/api.types";
import "../styles/orders.css";

import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from "react-leaflet";
import L, { LatLngExpression, Icon, Map } from "leaflet";
import type { MapContainer as MapContainerType } from 'react-leaflet';
import { Dialog, Button, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { getCurrentUser, getStoredUserProfile } from "../services/api/user.service";

const Orders = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [lakeData, setLakeData] = useState<mylakes[]>([]); // Replace `any` with the actual type if available
  const [selectedLake, setSelectedLake] = useState<mylakes | null>(null);

  const [markerPosition, setMarkerPosition] = useState<L.LatLng | null>(null);
  const [locationName, setLocationName] = useState("");
  const [savedLocations, setSavedLocations] = useState<
    { name: string; latlng: L.LatLng }[]
  >([]);
  const [showDialog, setShowDialog] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPro, setUserPro] = useState(getStoredUserProfile());
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [showNewLocationInput, setShowNewLocationInput] = useState(false);
  const [newLocationName, setNewLocationName] = useState("");
  const [selectedMarker, setSelectedMarker] = useState<L.LatLng | null>(null);
  const [measurementLocations, setMeasurementLocations] = useState<{
    id: string;
    locationIdentifier: string;
    locationName: string;
    locationLatitude: number;
    locationLongitude: number;
  }[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [kId, setKId] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [registeredLocation, setRegisteredLocation] = useState<{
    locationIdentifier: string;
    locationName: string;
    kId: string;
  } | null>(null);
  const [registeredOrders, setRegisteredOrders] = useState<{
    [orderId: string]: {
      kId: string;
      locationIdentifier: string;
      locationName: string;
    }
  }>(() => {
    // Load registered orders from localStorage on initial state
    const savedRegisteredOrders = localStorage.getItem('registeredOrders');
    return savedRegisteredOrders ? JSON.parse(savedRegisteredOrders) : {};
  });
  const [isDeregistering, setIsDeregistering] = useState(false);
  const [map, setMap] = useState<Map | null>(null);
  const [toolboxLabels, setToolboxLabels] = useState<{ [key: string]: string }>({});
  const [locationError, setLocationError] = useState<string>("");
  const [lakeMap, setLakeMap] = useState({});
  const [helpLabel, setHelpLabel] = useState('');
  const [helpOpen, setHelpOpen] = useState(false);
  const [noLabelSkus, setNoLabelSkus] = useState<Set<string>>(new Set());
  const [checkedLabelSkus, setCheckedLabelSkus] = useState<Set<string>>(new Set());
  const [openHelpSku, setOpenHelpSku] = useState<string | null>(null);
  const [openFieldHelp, setOpenFieldHelp] = useState<string | null>(null);

  useEffect(() => {
    const userProfileRole = localStorage.getItem("idToken");
    let userProfile = null;

    if (userProfileRole) {
      userProfile = JSON.parse(userProfileRole);
      setUserRole(userProfile.profile.role);
    }

    // Get last viewed lake for super admin
    const lastViewedLake = localStorage.getItem("lastViewedLake");
    if (lastViewedLake) {
      const parsedLake = JSON.parse(lastViewedLake);
      setSelectedLake(parsedLake);
    }

    const fetchMyLakes = async () => {
      try {
        const lakes = await getMyLakes();
        setLakeData(lakes);

        // Create a lookup map for lakePulseId -> lakeName
        const map = {};
        lakes.forEach(lake => {
          map[lake.lakePulseId] = lake.lakeName;
        });
        setLakeMap(map);

        // For super admin, if there's a last viewed lake, find it in the lakes list
        if (userProfile?.profile?.role === "Super Admin" && lastViewedLake) {
          const parsedLake = JSON.parse(lastViewedLake);
          const foundLake = lakes.find(lake => lake.lakePulseId === parsedLake);
          if (foundLake) {
            setSelectedLake(foundLake);
          }
        } else {
          // For regular users, use their assigned lake
          if (lakes.length > 0) {
            setSelectedLake(lakes[0]);
          }
        }
      } catch (error) {
        console.error(APP_STRINGS.ERROR_FETCHING_LAKES, error);
      }
    };

    fetchMyLakes();
  }, []);
  // Add useEffect to load fresh data on mount
  useEffect(() => {
    const loadFreshData = async () => {
      const freshProfile = await getCurrentUser();
      if (freshProfile) {
        setUserPro(freshProfile);
      }
     
    };
    loadFreshData();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userOrders = await getUserOrdersByEmail(userPro.email);
        setOrders(userOrders);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    const fetchMeasurementLocations = async () => {
      if (selectedLake?.lakePulseId) {
        setLoadingLocations(true);
        try {
          const locations = await getLakeMeasurementLocations(String(selectedLake.lakePulseId));
         
          if (Array.isArray(locations)) {
            setMeasurementLocations(locations);
          } else {
            console.error(APP_STRINGS.INVALID_LOCATION, locations);
            setMeasurementLocations([]);
          }
        } catch (error) {
          console.error(APP_STRINGS.INVALID_LOCATION, error);
          setMeasurementLocations([]);
        } finally {
          setLoadingLocations(false);
        }
      }
    };

    fetchMeasurementLocations();
  }, [selectedLake]);

  const defaultCenter: LatLngExpression = selectedLake?.latitude && selectedLake?.longitude 
    ? [selectedLake.latitude, selectedLake.longitude]
    : [0, 0]; // Default to 0,0 if no lake is selected

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        if (showNewLocationInput) {
          setMarkerPosition(e.latlng);
        }
      },
    });
    return null;
  };

  // Load saved locations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("savedLocations");
    if (saved) {
      setSavedLocations(JSON.parse(saved));
    }
  }, []);

  const centerMapToLocation = (lat: number, lng: number) => {
    if (map) {
      map.setView([lat, lng], 15); // Zoom level 15 for closer view
    }
  };

  const handleLocationSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const locationName = e.target.value;
    setSelectedLocation(locationName);

    // Find the location coordinates and update marker
    const location = measurementLocations.find(loc => loc.locationName === locationName);
    if (location) {
      const markerPosition = L.latLng(
        location.locationLatitude,
        location.locationLongitude
      );
      setSelectedMarker(markerPosition);
      // Center and zoom to the selected location
      centerMapToLocation(location.locationLatitude, location.locationLongitude);
    }
  };

  const generateUniqueIdentifier = (existingIdentifiers: string[] = []): string => {
    const chars = APP_STRINGS.FileFormat;
    const length = 12;
    let identifier: string;
    
    do {
      identifier = Array.from({ length }, () => 
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join('');
    } while (existingIdentifiers.includes(identifier));
    
    return identifier;
  };

  const handleSaveLocation = async () => {
    if (!locationName.trim() || !markerPosition || !selectedLake) return;

    try {
      // Check for duplicate location names
      const isDuplicate = measurementLocations.some(
        loc => loc.locationName.toLowerCase() === locationName.trim().toLowerCase()
      );

      if (isDuplicate) {
        setLocationError(toolboxLabels[APP_STRINGS.DUPLICATE] || '');
        return;
      }

      // Clear any existing error
      setLocationError("");

      // Get existing location identifiers
      const existingLocations = await getLakeMeasurementLocations(String(selectedLake.lakePulseId));
      const existingIdentifiers = existingLocations.map((loc: any) => loc.locationIdentifier);
      
      // Generate a unique identifier
      const locationIdentifier = generateUniqueIdentifier(existingIdentifiers);
      
      const saveResult = await saveLakeMeasurementLocation(
        selectedLake.lakePulseId,
        locationIdentifier,
        markerPosition.lat,
        markerPosition.lng,
        locationName.trim(),
        selectedLake.lakeState || ''
      );

      if (!saveResult.success) {
        throw new Error(APP_STRINGS.FAILED_TO_FETCH);
      }

      // Refresh the measurement locations list
      const updatedLocations = await getLakeMeasurementLocations(String(selectedLake.lakePulseId));
      setMeasurementLocations(updatedLocations);

      // Reset the form
      setLocationName("");
      setShowNewLocationInput(false);
      setMarkerPosition(null);
      setSelectedLocation(locationName.trim());
    } catch (error) {
      console.error('Error saving location:', error);
      setLocationError(toolboxLabels[APP_STRINGS.INVALID_LOCATION] || '');
    }
  };

  const handleOpenRegistration = async (order: any) => {
    setSelectedOrder(order);
    setShowDialog(true);
    
    // Check if order is registered for the selected lake
    const isRegisteredForLake = order.status === "Registered" && 
      registeredOrders[order.orderId]?.locationIdentifier && 
      measurementLocations.some(loc => 
        loc.locationIdentifier === registeredOrders[order.orderId].locationIdentifier
      );
    
    if (isRegisteredForLake) {
      try {
        // Check if we have stored registration details
        const storedRegistration = registeredOrders[order.orderId];
        
        if (storedRegistration) {
          // Use stored registration details
          setSelectedLocation(storedRegistration.locationName);
          setKId(storedRegistration.kId);
          
          // Find the location coordinates
          const location = measurementLocations.find(
            loc => loc.locationIdentifier === storedRegistration.locationIdentifier
          );
          
          if (location) {
            const markerPosition = L.latLng(
              location.locationLatitude,
              location.locationLongitude
            );
            setSelectedMarker(markerPosition);
            // Center and zoom to the registered location
            centerMapToLocation(location.locationLatitude, location.locationLongitude);
          }
          
          setRegisteredLocation({
            locationIdentifier: storedRegistration.locationIdentifier,
            locationName: storedRegistration.locationName,
            kId: storedRegistration.kId
          });
        }
      } catch (error) {
        console.error(APP_STRINGS.INVALID_LOCATION, error);
      }
    } else {
      // Reset values for new registration
      setSelectedLocation("");
      setKId("");
      setSelectedMarker(null);
      setRegisteredLocation(null);
    }
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setSelectedOrder(null);
    setSelectedLocation("");
    setShowNewLocationInput(false);
    setNewLocationName("");
    setKId("");
    setRegisteredLocation(null);
  };

  const handleAddNewLocation = () => {
    setShowNewLocationInput(true);
  };

  const handleSaveNewLocation = () => {
    if (newLocationName.trim()) {
      setSavedLocations([...savedLocations, { name: newLocationName.trim(), latlng: null }]);
      setSelectedLocation(newLocationName.trim());
      setShowNewLocationInput(false);
      setNewLocationName("");
    }
  };

  const handleRegister = async () => {
    if (!selectedOrder || !selectedLake || !selectedLocation || !kId.trim()) return;

    try {
      setIsRegistering(true);
      
      // Find the selected location's identifier
      const selectedLocationData = measurementLocations.find(
        loc => loc.locationName === selectedLocation
      );

      if (!selectedLocationData) {
        throw new Error(APP_STRINGS.SELECT_LOCATION);
      }

      const result = await registerProduct(
        selectedLake.lakePulseId,
        selectedLocationData.locationIdentifier,
        selectedOrder.orderId,
        kId.trim(),
        userPro.email
      );

      if (!result.success) {
        throw new Error(APP_STRINGS.FAILED_TO_FETCH);
      }

      // Store the registration details
      const newRegisteredOrder = {
        kId: kId.trim(),
        locationIdentifier: selectedLocationData.locationIdentifier,
        locationName: selectedLocation
      };
      
      setRegisteredOrders(prev => ({
        ...prev,
        [selectedOrder.orderId]: newRegisteredOrder
      }));

      // Close the dialog and reset form
      handleCloseDialog();
      
      // Refresh orders to update the status
      const updatedOrders = await getUserOrdersByEmail(userPro.email);
      setOrders(updatedOrders);
    } catch (error) {
      console.error('Error registering product:', error);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleSyncOrders = async () => {
    if (!userPro?.email) return;

    setIsSyncing(true);
    try {
      await syncUserOrders(userPro.email, selectedLake?.lakePulseId ? Number(selectedLake.lakePulseId) : undefined);
      // Refresh orders after sync
      const updatedOrders = await getUserOrdersByEmail(userPro.email);
      setOrders(updatedOrders);
    } catch (error) {
      console.error('Error syncing orders:', error);
      setError(error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeregister = async (order: any) => {
    if (!order || !userPro?.email) return;

    try {
      setIsDeregistering(true);
      const result = await deregisterProduct(order.orderId, userPro.email);

      if (!result.success) {
        throw new Error('Failed to deregister product');
      }

      // Refresh orders to update the status
      const updatedOrders = await getUserOrdersByEmail(userPro.email);
      setOrders(updatedOrders);

      // Remove from registered orders state and localStorage
      setRegisteredOrders(prev => {
        const newState = { ...prev };
        delete newState[order.orderId];
        return newState;
      });
    } catch (error) {
      console.error('Error deregistering product:', error);
    } finally {
      setIsDeregistering(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
    }
  };

  const createBlueMarkerIcon = () => {
    return new Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  };

  const createRedMarkerIcon = () => {
    return new Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  };

  // Add validation function for coordinates
  const isValidCoordinates = (lat: number | undefined, lng: number | undefined): boolean => {
    return lat !== undefined && lng !== undefined && 
           !isNaN(lat) && !isNaN(lng) &&
           lat >= -90 && lat <= 90 &&
           lng >= -180 && lng <= 180;
  };

  // Save registered orders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('registeredOrders', JSON.stringify(registeredOrders));
  }, [registeredOrders]);

  // Add useEffect to update map center when selected lake changes
  useEffect(() => {
    if (map && selectedLake?.latitude && selectedLake?.longitude) {
      map.setView([selectedLake.latitude, selectedLake.longitude], 11);
    }
  }, [map, selectedLake]);

 

  useEffect(() => {
    if (orders && orders.length > 0) {
      setCheckedLabelSkus(new Set(orders.map(order => order.productSKU)));
      (async () => {
        const noLabelSet = new Set<string>();
        let firstValidLabel = null;
        for (const order of orders) {
          const { status, data } = await getToolboxLabelBySku(order.productSKU);
          if (status === 200 && !firstValidLabel) {
            firstValidLabel = data;
          }
          if (status !== 200) {
            noLabelSet.add(order.productSKU);
          }
        }
        setNoLabelSkus(noLabelSet);
        if (firstValidLabel) {
          setToolboxLabels(firstValidLabel);
        }
      })();
    }
  }, [orders]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return (
    <div>
     

      <main>
        <div>
          <div className="orders-header-page">
            <h1>{APP_STRINGS.ACCT_ORDERS}</h1>
            <div className="orders-header-sub">
              <p className="sub-line mb-1">
                {APP_STRINGS.ORDERS_SUBLINE}
              </p>
              <button
                className="button sync-button proceed-button"
                onClick={handleSyncOrders}
                disabled={isSyncing}
              >
                <i className={`fas fa-sync ${isSyncing ? 'fa-spin' : ''}`}></i>
                {isSyncing ? 'Syncing...' : 'Sync Orders'}
              </button>

            </div>
          </div>
          <div className="toolbox-orders checkout-dialog">
            <table className="table-auto toolbox-orders-table">
              <thead>
                <tr>
                  <th>
                    {APP_STRINGS.PURCHASED_AT}
                  </th>
                  <th>{APP_STRINGS.ORDER_ID}</th>
                  <th>{APP_STRINGS.DEVICE}</th>
                  <th>{APP_STRINGS.STATUS}</th>
                  {userRole === 'Super Admin' && (
                  <th>Lake Name</th>)}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>{formatDate(order.purchaseDateTime)}</td>
                    <td>{order.orderId}</td>
                    <td>{order.product}</td>
                    <td>{order.status}</td>
                    {userRole === 'Super Admin' && (<td>{lakeMap[order.lakePulseId] || order.lakePulseId}</td>)}
                    
                    <td>
                     
                      {/* Only show buttons if this SKU has been checked and is NOT in noLabelSkus */}
                      {!noLabelSkus.has(order.productSKU)  && (
                        <>
                          {(order.status === "Purchased" || order.status === "Inactive") && (
                            <button
                              className="register-button"
                              onClick={() => handleOpenRegistration(order)}
                            >
                              {APP_STRINGS.REGISTER}
                            </button>
                          )}
                          {order.status === "Registered" && (
                            <>
                              <button
                                className="register-button"
                                onClick={() => handleOpenRegistration(order)}
                              >
                                {APP_STRINGS.MODIFY}
                              </button>
                              <button
                                className="register-button"
                                onClick={() => handleDeregister(order)}
                                disabled={isDeregistering}
                              >
                                {isDeregistering ? 'DEREGISTERING...' : APP_STRINGS.DEREGISTER}
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>


        </div>
      </main>
      <Dialog
        open={showDialog}
        onClose={handleCloseDialog}
        PaperProps={{
          style: {
            borderRadius: '12px',
            maxWidth: '650px',
            width: '90%'
          }
        }}
      >
        <div className="register-dialog">
          <div className="dialog-headers">
            <h2>{selectedOrder?.status === "Registered" ? "Modify Registration" : `Register Your ${toolboxLabels['registration_title_text'] || ''}`}</h2>
           
          </div>
          <div className="dialog-content">
            <div className="form-field">
              <label>{toolboxLabels['registration_id_label']}
                <span className="label-icon" style={{ cursor: 'pointer' }} onClick={() => setOpenFieldHelp('registration_id_label_help')}>
                  <i className="fa-regular fa-circle-question"></i>
                </span>
                {openFieldHelp === 'registration_id_label_help' && (
                  <div className="help-tooltip" style={{ position: 'absolute', background: '#fff', border: '1px solid #ccc', padding: 8, borderRadius: 4, zIndex: 1000 }}>
                    {toolboxLabels['registration_id_help_text'] || 'No help available'}
                    <span style={{ marginLeft: 8, cursor: 'pointer', color: '#224681' }} onClick={() => setOpenFieldHelp(null)}>&times;</span>
                  </div>
                )}
              </label>
              <input
                type="text"
                value={kId}
                onChange={(e) => setKId(e.target.value)}
                className="disabled-input"
                placeholder={toolboxLabels['registration_id_placeholder']}
              />
            </div>
            <div className="form-field">
              <label>LAKE</label>
              {userRole === "Super Admin" ? (
                <input
                  type="text"
                  value={selectedLake?.lakeName || ""}
                  disabled
                  className="disabled-input"
                  title={`Lake Pulse ID: ${selectedLake?.lakePulseId || ''}`}
                />
              ) : (
                <input
                  type="text"
                  value={lakeData[0]?.lakeName || ""}
                  disabled
                  className="disabled-input"
                />
              )}
            </div>
            <div className="form-field">
              <div className="location-field">
                <label>LOCATION
                  <span className="label-icon" style={{ cursor: 'pointer' }} onClick={() => setOpenFieldHelp('registration_location_label_help')}>
                    <i className="fa-regular fa-circle-question"></i>
                  </span>
                  {openFieldHelp === 'registration_location_label_help' && (
                    <div className="help-tooltip" style={{ position: 'absolute', background: '#fff', border: '1px solid #ccc', padding: 8, borderRadius: 4, zIndex: 1000 }}>
                      {toolboxLabels['registration_location_help_text'] || 'No help available'}
                      <span style={{ marginLeft: 8, cursor: 'pointer', color: '#224681' }} onClick={() => setOpenFieldHelp(null)}>&times;</span>
                    </div>
                  )}
                </label>
                <select
                  className="disabled-input"
                  value={selectedLocation}
                  onChange={handleLocationSelect}
                >
                  <option value="" disabled>Select a location</option>
                  {measurementLocations.length > 0 ? (
                    measurementLocations.map((loc) => (
                      <option key={loc.locationIdentifier} value={loc.locationName}>
                        {loc.locationName}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>{APP_STRINGS.NO_LOCATION_AVAILABALE}</option>
                  )}
                </select>
                <button
                  className="button sync-button"
                  onClick={() => {
                    setShowNewLocationInput(true);
                    setSelectedMarker(null);
                    setSelectedLocation("");
                  }}
                >
                  {APP_STRINGS.ADD_NEW_LOCATION}
                </button>
              </div>
            </div>

            {(selectedLocation || showNewLocationInput) && (
              <><label>Select a New Location on <b>{selectedLake?.lakeName || ""}</b>
                <span className="label-icon" style={{ cursor: 'pointer' }} onClick={() => setOpenFieldHelp('registration_location_map_help')}>
                  <i className="fa-regular fa-circle-question"></i>
                </span>
                {openFieldHelp === 'registration_location_map_help' && (
                  <div className="help-tooltip" style={{ position: 'absolute', background: '#fff', border: '1px solid #ccc', padding: 8, borderRadius: 4, zIndex: 1000 }}>
                    {toolboxLabels['registration_location_help_text'] || 'No help available'}
                    <span style={{ marginLeft: 8, cursor: 'pointer', color: '#224681' }} onClick={() => setOpenFieldHelp(null)}>&times;</span>
                  </div>
                )}
              </label><div className="map-container">
                <MapContainer
                  center={selectedMarker || [selectedLake?.latitude || 0, selectedLake?.longitude || 0]}
                  zoom={13}
                  style={{ height: "300px !important", width: "100% !important" }}
                  attributionControl={false}
                  ref={setMap}
                >
                  <MapClickHandler />
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
                    subdomains="abcd"
                    crossOrigin="" />
                  
                  {/* Show all measurement locations */}
                  {!selectedLocation && measurementLocations.map((location) => (
                    isValidCoordinates(location.locationLatitude, location.locationLongitude) && (
                      <Marker
                        key={location.locationIdentifier}
                        position={[location.locationLatitude, location.locationLongitude]}
                        icon={createBlueMarkerIcon()}
                      >
                        <Popup>{location.locationName}</Popup>
                      </Marker>
                    )
                  ))}

                  {/* Show the new location marker in red */}
                  {showNewLocationInput && markerPosition && isValidCoordinates(markerPosition.lat, markerPosition.lng) && (
                    <Marker position={[markerPosition.lat, markerPosition.lng]} icon={createRedMarkerIcon()}>
                      <Popup>New Location</Popup>
                    </Marker>
                  )}

                  {/* Show selected location marker */}
                  {selectedLocation && selectedMarker && isValidCoordinates(selectedMarker.lat, selectedMarker.lng) && (
                    <Marker position={[selectedMarker.lat, selectedMarker.lng]} icon={createBlueMarkerIcon()}>
                      <Popup>{selectedLocation}</Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div></>
            )}
            {showNewLocationInput && (
              <><div className="new-location-input">
                <input
                  type="text"
                  placeholder="Name this location"
                  value={locationName}
                  onChange={(e) => {
                    setLocationName(e.target.value);
                    setLocationError(""); // Clear error when user types
                  } }
                  className={locationError ? "error-input" : ""} />

                <button
                  className="button sync-button"
                  onClick={handleSaveLocation}
                  disabled={!markerPosition || !locationName.trim()}
                >
                  {APP_STRINGS.SUBMIT}
                </button>
              </div><div>
                  {locationError && (
                    <div className="error-message">
                      <i className="fas fa-exclamation-circle"></i>
                      {locationError}
                    </div>
                  )}
                </div></>
            )}
          </div>
          <div className="dialog-actions">
            <Button onClick={handleCloseDialog} className="cancel-button">
              {APP_STRINGS.CANCEL}
            </Button>
            <Button
              onClick={handleRegister}
              className="register-button rester-toolbox"
              disabled={!selectedLocation || !kId.trim() || isRegistering}
            >
              {isRegistering ? 'REGISTERING...' : (selectedOrder?.status === "Registered" ? 'UPDATE' : 'REGISTER')}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>

  );
};

export default Orders;
