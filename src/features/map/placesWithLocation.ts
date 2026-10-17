import type { Place } from '../../lib/types'

export type LocatedPlace = Place & { lat: number; lng: number }

export function placesWithLocation(places: Place[]): LocatedPlace[] {
  return places.filter((p): p is LocatedPlace => p.lat !== null && p.lng !== null)
}
