import { currentUserId, supabase } from '../lib/supabase'
import type { WishItem } from '../lib/types'
import { parseWish } from './rows'

export async function listWishes(): Promise<WishItem[]> {
  const { data, error } = await supabase.from('wishlist').select('*').order('criado_em', { ascending: false })
  if (error) throw error
  return data.map(parseWish)
}

export async function getWish(id: string): Promise<WishItem | null> {
  const { data, error } = await supabase.from('wishlist').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data ? parseWish(data) : null
}

export async function addWish(input: Omit<WishItem, 'id'>): Promise<WishItem> {
  const { data, error } = await supabase
    .from('wishlist')
    .insert({ ...input, criado_por: await currentUserId() })
    .select()
    .single()
  if (error) throw error
  return parseWish(data)
}

export async function removeWish(id: string): Promise<void> {
  const { error } = await supabase.from('wishlist').delete().eq('id', id)
  if (error) throw error
}
