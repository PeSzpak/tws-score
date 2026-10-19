import { currentUserId, supabase } from '../lib/supabase'
import type { Place } from '../lib/types'
import { parsePlace } from './rows'

export type NewPlace = Omit<Place, 'criadoPor'>

export async function listPlaces(): Promise<Place[]> {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .order('visitado_em', { ascending: false })
    .order('criado_em', { ascending: false })
  if (error) throw error
  return data.map(parsePlace)
}

export async function getPlace(id: string): Promise<Place | null> {
  const { data, error } = await supabase.from('places').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data ? parsePlace(data) : null
}

export async function createPlace(input: NewPlace): Promise<void> {
  const { error } = await supabase.from('places').upsert(
    {
      id: input.id,
      nome: input.nome,
      tipo: input.tipo,
      endereco: input.endereco,
      lat: input.lat,
      lng: input.lng,
      visitado_em: input.visitadoEm,
      google: input.google,
      criado_por: await currentUserId(),
    },
    { onConflict: 'id', ignoreDuplicates: true },
  )
  if (error) throw error
}
