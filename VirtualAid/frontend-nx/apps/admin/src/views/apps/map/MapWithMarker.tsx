// ** react imports
import { useEffect } from 'react'

// ** react leaflet imports
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'

// ** leaflet imports
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import { LatLngLiteral, LatLngExpression } from 'leaflet'

interface MapWithMarkerPropsType {
  position: LatLngExpression | null
}

const PutMarker = (props: MapWithMarkerPropsType) => {
  const { position } = props
  const map = useMap()

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom())
    }
  }, [map, position])

  return position === null ? null : (
    <Marker position={position}>
      <Popup>You are here</Popup>
    </Marker>
  )
}

const MapWithMarker = (props: MapWithMarkerPropsType) => {
  const { position } = props

  return (
    <>
      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <PutMarker position={position} />
      </MapContainer>
    </>
  )
}

export default MapWithMarker
