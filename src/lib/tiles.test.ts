import { TILE_ATTRIBUTION, tileUrl } from './tiles'

test('o mapa usa tiles que não exigem chave de API', () => {
  expect(tileUrl()).toBe('https://tile.openstreetmap.org/{z}/{x}/{y}.png')
  expect(tileUrl()).not.toContain('cartocdn')
  expect(TILE_ATTRIBUTION).toContain('OpenStreetMap')
})
