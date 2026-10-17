import { createContext, useContext } from 'react'
import type { Member } from '../lib/types'

export type Couple = { me: Member; partner: Member | null; userId: string }

export const MembersContext = createContext<Couple | null>(null)

export function useMembers(): Couple {
  const couple = useContext(MembersContext)
  if (!couple) throw new Error('useMembers fora do AuthGate')
  return couple
}
