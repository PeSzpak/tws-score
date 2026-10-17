import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import { Link } from 'react-router'
import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { pinIcon } from '../components/pin'
import { listPlaces } from '../data/places'
import styles from '../features/map/map.module.css'
import { placesWithLocation, type LocatedPlace } from '../features/map/placesWithLocation'
import { TILE_ATTRIBUTION, TILE_CLASS, tileUrl } from '../lib/tiles'
import { useLoad } from '../lib/useLoad'

const BRAZIL: [number, number] = [-14.2, -51.9]

function FitBounds({ places }: { places: LocatedPlace[] }) {
  const map = useMap()
  useEffect(() => {
    if (places.length === 0) return
    map.fitBounds(L.latLngBounds(places.map((p) => [p.lat, p.lng])), { padding: [48, 48], maxZoom: 15 })
  }, [map, places])
  return null
}

async function loadLocated() {
  return placesWithLocation(await listPlaces())
}

export function MapPage() {
  const data = useLoad(loadLocated, 'map')
  const places = data.status === 'ready' ? data.data : []

  return (
    <main>
      <h1 className={styles.title}>Mapa</h1>
      <MapContainer center={BRAZIL} zoom={4} className={styles.map} zoomControl={false}>
        <TileLayer url={tileUrl()} attribution={TILE_ATTRIBUTION} className={TILE_CLASS} />
        <FitBounds places={places} />
        {places.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={pinIcon}>
            <Popup>
              <span className={styles.popupName}>{p.nome}</span>
              <Link to={`/lugar/${p.id}`} className={styles.popupLink}>
                Ver lugar
              </Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {data.status === 'ready' && places.length === 0 && (
        <p className={styles.empty}>Os lugares com localização aparecem aqui.</p>
      )}
      {data.status === 'error' && (
        <button className={`${styles.empty} btn`} onClick={data.reload}>
          Não deu pra carregar. Tentar de novo
        </button>
      )}
    </main>
  )
}
