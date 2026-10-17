import { useEffect, useState, type ReactNode } from 'react'
import { LoadError } from '../components/LoadError'
import { claimMembership, listMembers } from '../data/members'
import authStyles from './auth.module.css'
import { LoginPage } from './LoginPage'
import { MembersContext, type Couple } from './members-context'
import { RestrictedPage } from './RestrictedPage'
import { useSession } from './useSession'

type Access = { forUser: string; attempt: number } & (
  | { status: 'restricted' }
  | { status: 'error' }
  | { status: 'member'; couple: Couple }
)

export function AuthGate({ children }: { children: ReactNode }) {
  const session = useSession()
  const [access, setAccess] = useState<Access | null>(null)
  const [attempt, setAttempt] = useState(0)
  const userId = session.status === 'signed_in' ? session.userId : null
  const email = session.status === 'signed_in' ? session.email.toLowerCase() : null

  useEffect(() => {
    if (!userId || !email) return
    let cancelled = false
    claimMembership()
      .then(listMembers)
      .then((members) => {
        if (cancelled) return
        const me = members.find((m) => m.email === email)
        setAccess(
          me
            ? {
                forUser: userId,
                attempt,
                status: 'member',
                couple: { me, partner: members.find((m) => m !== me) ?? null, userId },
              }
            : { forUser: userId, attempt, status: 'restricted' },
        )
      })
      .catch(() => !cancelled && setAccess({ forUser: userId, attempt, status: 'error' }))
    return () => {
      cancelled = true
    }
  }, [userId, email, attempt])

  if (session.status === 'loading') return null
  if (session.status === 'signed_out') return <LoginPage />
  if (access?.forUser !== session.userId || access.attempt !== attempt) return null
  if (access.status === 'restricted') return <RestrictedPage />
  if (access.status === 'error') {
    return (
      <main className={authStyles.page}>
        <LoadError onRetry={() => setAttempt((n) => n + 1)} />
      </main>
    )
  }
  return <MembersContext.Provider value={access.couple}>{children}</MembersContext.Provider>
}
