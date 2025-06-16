import React from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIconUrl from '../assets/marker-icon.png';
import { LakeMapProps } from '@/types/api.types';

// Create custom icon with corrected anchor points
const customIcon = new L.Icon({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIconUrl,
  iconSize: [35, 35],
  iconAnchor: [17.5, 17.5],  // Center of the icon (half of iconSize)
  popupAnchor: [0, -17.5],   // Position popup above the icon
});

// LakeMap component
const LakeMap: React.FC<LakeMapProps> = ({ 
  coordinates, 
  showPopup = false, 
  lakeName = '', 
  interactive = false 
}) => {
  return (
    <MapContainer
      center={coordinates}
      zoom={13}
      scrollWheelZoom={false}
      dragging={interactive}
      zoomControl={interactive}
      touchZoom={interactive}
      doubleClickZoom={interactive}
      style={{ height: '100%', width: '100%', borderRadius: '8px' }}
      attributionControl={false}
    >
      <MapEvents />
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <Marker 
        position={coordinates} 
        icon={customIcon}
      />
    </MapContainer>
  );
};

const MapEvents = () => {
  const map = useMap();
  map.on('click', (e) => {
    e.originalEvent.stopPropagation();
  });
  return null;
};

export default LakeMap;
