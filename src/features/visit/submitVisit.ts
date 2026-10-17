import type { NewPlace } from '../../data/places'
import type { VisitDraft } from '../../lib/draft'
import { completeScores } from '../../lib/rating'
import type { Scores } from '../../lib/types'

export type SubmitDeps = {
  newId: () => string
  createPlace: (input: NewPlace) => Promise<void>
  submitReview: (placeId: string, scores: Scores, comentario: string | null) => Promise<'created' | 'already_sent'>
  uploadPhoto: (placeId: string, file: Blob) => Promise<void>
  compressImage: (file: File) => Promise<Blob>
  removeWish: (id: string) => Promise<void>
  saveDraft: (draft: VisitDraft) => void
}

export type SubmitResult = { placeId: string; photoErrors: number }

export async function uploadPhotos(
  placeId: string,
  photos: File[],
  deps: Pick<SubmitDeps, 'uploadPhoto' | 'compressImage'>,
): Promise<number> {
  const results = await Promise.allSettled(
    photos.map(async (file) => deps.uploadPhoto(placeId, await deps.compressImage(file))),
  )
  return results.filter((r) => r.status === 'rejected').length
}

export async function submitVisit(draft: VisitDraft, photos: File[], deps: SubmitDeps): Promise<SubmitResult> {
  const scores = completeScores(draft.scores)
  const { nome, tipo, endereco, lat, lng, visitadoEm } = draft.place
  if (!scores || !tipo || !nome.trim()) throw new Error('Rascunho incompleto')

  let placeId = draft.placeId
  if (!placeId) {
    placeId = deps.newId()
    deps.saveDraft({ ...draft, placeId })
  }
  await deps.createPlace({ id: placeId, nome: nome.trim(), tipo, endereco, lat, lng, visitadoEm })

  await deps.submitReview(placeId, scores, draft.comentario.trim() || null)
  const photoErrors = await uploadPhotos(placeId, photos, deps)
  if (draft.wishId) await deps.removeWish(draft.wishId).catch(() => undefined)

  return { placeId, photoErrors }
}
