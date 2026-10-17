import { supabase } from '../lib/supabase'
import type { Member } from '../lib/types'
import { parseMember } from './rows'

export async function claimMembership(): Promise<void> {
  const { error } = await supabase.rpc('tws_claim_membership')
  if (error) throw error
}

export async function listMembers(): Promise<Member[]> {
  const { data, error } = await supabase.from('tws_members').select('*')
  if (error) throw error
  return data.map(parseMember)
}
