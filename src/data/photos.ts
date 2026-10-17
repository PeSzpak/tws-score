import { currentUserId, supabase } from '../lib/supabase'

const BUCKET = 'photos'
const SIGNED_URL_SECONDS = 60 * 60

export async function uploadPhoto(placeId: string, file: Blob): Promise<void> {
  const path = `${placeId}/${crypto.randomUUID()}.jpg`
  const upload = await supabase.storage.from(BUCKET).upload(path, file, { contentType: 'image/jpeg' })
  if (upload.error) throw upload.error
  const { error } = await supabase
    .from('photos')
    .insert({ place_id: placeId, autor_id: await currentUserId(), storage_path: path })
  if (error) throw error
}

export async function listPhotoUrls(placeId?: string): Promise<{ placeId: string; url: string }[]> {
  let query = supabase.from('photos').select('place_id, storage_path').order('criado_em')
  if (placeId) query = query.eq('place_id', placeId)
  const { data, error } = await query
  if (error) throw error
  if (data.length === 0) return []
  const paths = data.map((p) => p.storage_path as string)
  const signed = await supabase.storage.from(BUCKET).createSignedUrls(paths, SIGNED_URL_SECONDS)
  if (signed.error) throw signed.error
  return data.flatMap((p, i) => {
    const url = signed.data[i]?.signedUrl
    return url ? [{ placeId: p.place_id as string, url }] : []
  })
}
