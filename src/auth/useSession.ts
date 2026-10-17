import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export type SessionState =
  { status: 'loading' } | { status: 'signed_out' } | { status: 'signed_in'; userId: string; email: string }

function toState(session: Session | null): SessionState {
  if (!session) return { status: 'signed_out' }
  return { status: 'signed_in', userId: session.user.id, email: session.user.email ?? '' }
}

export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({ status: 'loading' })

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setState(toState(session)))
    return () => data.subscription.unsubscribe()
  }, [])

  return state
}
