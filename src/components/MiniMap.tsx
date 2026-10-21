import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import { TILE_OPTIONS } from '../lib/tiles'
import { pinIcon } from './pin'

export function MiniMap({ lat, lng }: { lat: number; lng: number }) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      dragging={false}
      zoomControl={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      touchZoom={false}
      keyboard={false}
      style={{ height: 160, borderRadius: 'var(--radius)' }}
    >
      <TileLayer {...TILE_OPTIONS} />
      <Marker position={[lat, lng]} icon={pinIcon} />
    </MapContainer>
  )
}
