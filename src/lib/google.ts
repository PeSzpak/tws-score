import type { GoogleInfo, PlaceKind, PriceLevel } from './types'

export type Suggestion = { placeId: string; nome: string; detalhe: string }

export type GooglePlace = {
  nome: string
  tipo: PlaceKind | null
  endereco: string | null
  lat: number | null
  lng: number | null
  google: GoogleInfo
}

const API = 'https://places.googleapis.com/v1'
const KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY as string | undefined

const DETAILS_FIELDS = [
  'id',
  'displayName',
  'formattedAddress',
  'location',
  'primaryType',
  'types',
  'googleMapsUri',
  'websiteUri',
  'nationalPhoneNumber',
  'regularOpeningHours.weekdayDescriptions',
  'priceLevel',
  'rating',
  'userRatingCount',
].join(',')

const CAFE_TYPES = new Set(['cafe', 'coffee_shop', 'bakery', 'cafeteria', 'tea_house', 'dessert_shop', 'confectionery'])
const RESTAURANT_TYPES = new Set(['restaurant', 'bar', 'pub', 'meal_takeaway', 'food_court', 'diner', 'steak_house'])

const PRICE_LEVELS: Record<string, PriceLevel> = {
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
}

export const googleEnabled = Boolean(KEY)

type Json = Record<string, any>

export function kindFromTypes(primaryType: string | null, types: string[]): PlaceKind | null {
  const ordered = primaryType ? [primaryType, ...types] : types
  for (const t of ordered) {
    if (CAFE_TYPES.has(t)) return 'cafe'
    if (RESTAURANT_TYPES.has(t) || t.endsWith('_restaurant')) return 'restaurante'
  }
  return null
}

export function parseSuggestions(json: Json): Suggestion[] {
  const suggestions: Json[] = json.suggestions ?? []
  return suggestions.flatMap(({ placePrediction: p }) =>
    p
      ? [
          {
            placeId: String(p.placeId),
            nome: p.structuredFormat?.mainText?.text ?? p.text?.text ?? '',
            detalhe: p.structuredFormat?.secondaryText?.text ?? '',
          },
        ]
      : [],
  )
}

export function parseDetails(json: Json): GooglePlace {
  return {
    nome: json.displayName?.text ?? '',
    tipo: kindFromTypes(json.primaryType ?? null, json.types ?? []),
    endereco: json.formattedAddress ?? null,
    lat: json.location?.latitude ?? null,
    lng: json.location?.longitude ?? null,
    google: {
      placeId: String(json.id),
      mapsUrl: json.googleMapsUri ?? null,
      site: json.websiteUri ?? null,
      telefone: json.nationalPhoneNumber ?? null,
      horarios: json.regularOpeningHours?.weekdayDescriptions ?? [],
      nivelPreco: PRICE_LEVELS[json.priceLevel] ?? null,
      nota: json.rating ?? null,
      totalAvaliacoes: json.userRatingCount ?? null,
    },
  }
}

export async function searchPlaces(input: string, sessionToken: string, signal?: AbortSignal): Promise<Suggestion[]> {
  const res = await fetch(`${API}/places:autocomplete`, {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': KEY ?? '' },
    body: JSON.stringify({ input, sessionToken, languageCode: 'pt-BR', includedRegionCodes: ['br'] }),
  })
  if (!res.ok) throw new Error('Busca do Google indisponível')
  return parseSuggestions(await res.json())
}

export async function placeDetails(placeId: string, sessionToken: string): Promise<GooglePlace> {
  const params = new URLSearchParams({ languageCode: 'pt-BR', regionCode: 'br', sessionToken })
  const res = await fetch(`${API}/places/${encodeURIComponent(placeId)}?${params}`, {
    headers: { 'X-Goog-Api-Key': KEY ?? '', 'X-Goog-FieldMask': DETAILS_FIELDS },
  })
  if (!res.ok) throw new Error('Detalhes do Google indisponíveis')
  return parseDetails(await res.json())
}
