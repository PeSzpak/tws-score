import type { GoogleInfo, PlaceKind, Scores } from './types'

export type VisitDraft = {
  placeId: string | null
  wishId: string | null
  place: {
    nome: string
    tipo: PlaceKind | null
    endereco: string | null
    lat: number | null
    lng: number | null
    visitadoEm: string
    google: GoogleInfo | null
  }
  scores: Partial<Scores>
  comentario: string
}

export const NEW_VISIT_DRAFT = 'tws:draft:new'
export const placeDraftKey = (placeId: string) => `tws:draft:place:${placeId}`

export function emptyDraft(today: string): VisitDraft {
  return {
    placeId: null,
    wishId: null,
    place: { nome: '', tipo: null, endereco: null, lat: null, lng: null, visitadoEm: today, google: null },
    scores: {},
    comentario: '',
  }
}

export function loadDraft(key: string): VisitDraft | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const draft = JSON.parse(raw) as VisitDraft
    return { ...draft, place: { ...draft.place, google: draft.place.google ?? null } }
  } catch {
    return null
  }
}

export function saveDraft(key: string, draft: VisitDraft): void {
  try {
    localStorage.setItem(key, JSON.stringify(draft))
  } catch {
    // A draft is a convenience; losing it must not block the review.
  }
}

export function clearDraft(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // Same as saveDraft.
  }
}

export function forgetNewVisitDraftFor(placeId: string): void {
  if (loadDraft(NEW_VISIT_DRAFT)?.placeId === placeId) clearDraft(NEW_VISIT_DRAFT)
}
