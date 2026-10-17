export type Score = 1 | 2 | 3 | 4 | 5

export type PlaceKind = 'cafe' | 'restaurante'

export type Scores = {
  notaGeral: Score
  comida: Score
  ambiente: Score
  atendimento: Score
  preco: Score
}

export type Member = {
  email: string
  nome: string
  avatarEmoji: string
  userId: string | null
}

export type Place = {
  id: string
  nome: string
  tipo: PlaceKind
  endereco: string | null
  lat: number | null
  lng: number | null
  visitadoEm: string
  criadoPor: string
}

export type Review = {
  id: string
  placeId: string
  autorId: string
  scores: Scores
  comentario: string | null
  criadoEm: string
}

export type WishItem = {
  id: string
  nome: string
  tipo: PlaceKind
  observacao: string | null
}

export type ReviewState =
  | { kind: 'none' }
  | { kind: 'waiting_me' }
  | { kind: 'waiting_partner'; mine: Review }
  | { kind: 'revealed'; mine: Review; theirs: Review; average: number }
