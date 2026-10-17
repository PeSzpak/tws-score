export type Coords = { lat: number; lng: number }
export type AddressResult = Coords & { label: string }

export function currentPosition(): Promise<Coords | null> {
  if (!('geolocation' in navigator)) return Promise.resolve(null)
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ lat: coords.latitude, lng: coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 },
    )
  })
}

export async function searchAddress(query: string, signal?: AbortSignal): Promise<AddressResult[]> {
  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    countrycodes: 'br',
    limit: '5',
    'accept-language': 'pt-BR',
  })
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, { signal })
  if (!res.ok) throw new Error('Busca de endereço indisponível')
  const rows = (await res.json()) as { display_name: string; lat: string; lon: string }[]
  return rows.map((r) => ({ label: r.display_name, lat: Number(r.lat), lng: Number(r.lon) }))
}

export function todayIso(): string {
  return new Date().toLocaleDateString('sv-SE')
}
