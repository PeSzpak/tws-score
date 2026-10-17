import { currentUserId, supabase } from '../lib/supabase'
import type { Review, Scores } from '../lib/types'
import { parseReview } from './rows'

const UNIQUE_VIOLATION = '23505'

export async function listVisibleReviews(placeId?: string): Promise<Review[]> {
  let query = supabase.from('tws_reviews').select('*')
  if (placeId) query = query.eq('place_id', placeId)
  const { data, error } = await query
  if (error) throw error
  return data.map(parseReview)
}

export async function listReviewAuthors(): Promise<Map<string, string[]>> {
  const { data, error } = await supabase.rpc('tws_review_authors')
  if (error) throw error
  const byPlace = new Map<string, string[]>()
  for (const { place_id, autor_id } of data as { place_id: string; autor_id: string }[]) {
    byPlace.set(place_id, [...(byPlace.get(place_id) ?? []), autor_id])
  }
  return byPlace
}

export async function submitReview(
  placeId: string,
  scores: Scores,
  comentario: string | null,
): Promise<'created' | 'already_sent'> {
  const { error } = await supabase.from('tws_reviews').insert({
    place_id: placeId,
    autor_id: await currentUserId(),
    nota_geral: scores.notaGeral,
    comida: scores.comida,
    ambiente: scores.ambiente,
    atendimento: scores.atendimento,
    preco: scores.preco,
    comentario,
  })
  if (error?.code === UNIQUE_VIOLATION) return 'already_sent'
  if (error) throw error
  return 'created'
}
