export function tileUrl(): string {
  return 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
}

export const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

export const TILE_CLASS = 'tws-tiles'

export const TILE_OPTIONS = {
  url: tileUrl(),
  attribution: TILE_ATTRIBUTION,
  className: TILE_CLASS,
  updateWhenIdle: false,
  keepBuffer: 4,
}
