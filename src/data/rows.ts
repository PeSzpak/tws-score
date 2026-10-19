import type { GoogleInfo, Member, Place, PlaceKind, PriceLevel, Review, Score, WishItem } from '../lib/types'

type Row = Record<string, unknown>

function asRow(value: unknown): Row {
  if (typeof value !== 'object' || value === null) throw new Error('Linha inválida')
  return value as Row
}

function str(row: Row, key: string): string {
  const v = row[key]
  if (typeof v !== 'string') throw new Error(`Campo ${key} inválido`)
  return v
}

function optStr(row: Row, key: string): string | null {
  const v = row[key]
  if (v === null || v === undefined) return null
  if (typeof v !== 'string') throw new Error(`Campo ${key} inválido`)
  return v
}

function optNum(row: Row, key: string): number | null {
  const v = row[key]
  if (v === null || v === undefined) return null
  if (typeof v !== 'number') throw new Error(`Campo ${key} inválido`)
  return v
}

function score(row: Row, key: string): Score {
  const v = row[key]
  if (v !== 1 && v !== 2 && v !== 3 && v !== 4 && v !== 5) throw new Error(`Nota ${key} inválida`)
  return v
}

function kind(row: Row): PlaceKind {
  const v = row.tipo
  if (v !== 'cafe' && v !== 'restaurante') throw new Error('Tipo inválido')
  return v
}

function priceLevel(row: Row): PriceLevel | null {
  const v = row.nivelPreco
  if (v === null || v === undefined) return null
  if (v !== 1 && v !== 2 && v !== 3 && v !== 4) throw new Error('Nível de preço inválido')
  return v
}

function googleInfo(value: unknown): GoogleInfo | null {
  if (value === null || value === undefined) return null
  const row = asRow(value)
  const horarios = row.horarios
  if (!Array.isArray(horarios) || !horarios.every((h) => typeof h === 'string')) throw new Error('Horários inválidos')
  return {
    placeId: str(row, 'placeId'),
    mapsUrl: optStr(row, 'mapsUrl'),
    site: optStr(row, 'site'),
    telefone: optStr(row, 'telefone'),
    horarios,
    nivelPreco: priceLevel(row),
    nota: optNum(row, 'nota'),
    totalAvaliacoes: optNum(row, 'totalAvaliacoes'),
  }
}

export function parsePlace(value: unknown): Place {
  const row = asRow(value)
  return {
    id: str(row, 'id'),
    nome: str(row, 'nome'),
    tipo: kind(row),
    endereco: optStr(row, 'endereco'),
    lat: optNum(row, 'lat'),
    lng: optNum(row, 'lng'),
    visitadoEm: str(row, 'visitado_em'),
    criadoPor: str(row, 'criado_por'),
    google: googleInfo(row.google),
  }
}

export function parseReview(value: unknown): Review {
  const row = asRow(value)
  return {
    id: str(row, 'id'),
    placeId: str(row, 'place_id'),
    autorId: str(row, 'autor_id'),
    scores: {
      notaGeral: score(row, 'nota_geral'),
      comida: score(row, 'comida'),
      ambiente: score(row, 'ambiente'),
      atendimento: score(row, 'atendimento'),
      preco: score(row, 'preco'),
    },
    comentario: optStr(row, 'comentario'),
    criadoEm: str(row, 'criado_em'),
  }
}

export function parseMember(value: unknown): Member {
  const row = asRow(value)
  return {
    email: str(row, 'email'),
    nome: str(row, 'nome'),
    avatarEmoji: str(row, 'avatar_emoji'),
    userId: optStr(row, 'user_id'),
  }
}

export function parseWish(value: unknown): WishItem {
  const row = asRow(value)
  return {
    id: str(row, 'id'),
    nome: str(row, 'nome'),
    tipo: kind(row),
    observacao: optStr(row, 'observacao'),
  }
}
