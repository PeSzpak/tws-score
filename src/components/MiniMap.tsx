import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import { TILE_ATTRIBUTION, TILE_CLASS, tileUrl } from '../lib/tiles'
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
      <TileLayer url={tileUrl()} attribution={TILE_ATTRIBUTION} className={TILE_CLASS} />
      <Marker position={[lat, lng]} icon={pinIcon} />
    </MapContainer>
  )
}
