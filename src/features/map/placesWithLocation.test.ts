import type { Place } from '../../lib/types'
import { placesWithLocation } from './placesWithLocation'

const base: Place = {
  id: 'p1',
  nome: 'Café Lumi',
  tipo: 'cafe',
  endereco: null,
  lat: -23.5,
  lng: -46.6,
  visitadoEm: '2026-10-16',
  criadoPor: 'u1',
}

test('lugar sem localização fica fora do mapa', () => {
  const result = placesWithLocation([base, { ...base, id: 'p2', lat: null, lng: null }])
  expect(result.map((p) => p.id)).toEqual(['p1'])
})
