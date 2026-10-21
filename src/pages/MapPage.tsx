import { useEffect, useMemo } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { useMembers } from '../auth/members-context'
import { pinIcon } from '../components/pin'
import { loadOverview } from '../features/home/loadOverview'
import { MapCard } from '../features/map/MapCard'
import styles from '../features/map/map.module.css'
import { placesWithLocation, type LocatedPlace } from '../features/map/placesWithLocation'
import { reviewState } from '../lib/rating'
import { TILE_OPTIONS } from '../lib/tiles'
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

export function MapPage() {
  const { userId, partner } = useMembers()
  const data = useLoad(loadOverview, 'map')
  const overview = data.status === 'ready' ? data.data : null
  const places = useMemo(() => (overview ? placesWithLocation(overview.places) : []), [overview])

  return (
    <main>
      <h1 className={styles.title}>Mapa</h1>
      <MapContainer center={BRAZIL} zoom={4} className={styles.map} zoomControl={false}>
        <TileLayer {...TILE_OPTIONS} />
        <FitBounds places={places} />
        {places.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={pinIcon}>
            <Popup className="tws-popup" closeButton={false} minWidth={240} maxWidth={240}>
              {data.status === 'ready' && (
                <MapCard
                  place={p}
                  partnerName={partner?.nome ?? 'o outro'}
                  cover={data.data.covers.get(p.id) ?? null}
                  state={reviewState(
                    userId,
                    data.data.authors.get(p.id) ?? [],
                    data.data.reviews.filter((r) => r.placeId === p.id),
                  )}
                />
              )}
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
