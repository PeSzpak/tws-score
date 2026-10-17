import type { Place, PlaceKind } from '../../lib/types'

export type KindFilter = PlaceKind | 'todos'

const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

export function filterPlaces(places: Place[], kind: KindFilter, query: string): Place[] {
  const q = fold(query.trim())
  return places.filter((p) => (kind === 'todos' || p.tipo === kind) && fold(p.nome).includes(q))
}
