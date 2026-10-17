const dark = () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false

export function tileUrl(): string {
  const style = dark() ? 'dark_all' : 'light_all'
  return `https://{s}.basemaps.cartocdn.com/${style}/{z}/{x}/{y}{r}.png`
}

export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
