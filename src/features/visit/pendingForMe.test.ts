import type { Place } from '../../lib/types'
import { pendingForMe } from './pendingForMe'

const place = (id: string, criadoPor: string, visitadoEm: string): Place => ({
  id,
  nome: id,
  tipo: 'cafe',
  endereco: null,
  lat: null,
  lng: null,
  visitadoEm,
  criadoPor,
})

const today = '2026-10-16'

test('mostra o que o outro registrou há pouco e eu ainda não avaliei', () => {
  const places = [
    place('dela-hoje', 'b', '2026-10-16'),
    place('dela-anteontem', 'b', '2026-10-14'),
    place('dela-antigo', 'b', '2026-10-01'),
    place('meu', 'a', '2026-10-16'),
    place('ja-avaliei', 'b', '2026-10-16'),
  ]
  const authors = new Map([['ja-avaliei', ['b', 'a']]])
  expect(pendingForMe(places, authors, 'a', today).map((p) => p.id)).toEqual(['dela-hoje', 'dela-anteontem'])
})
