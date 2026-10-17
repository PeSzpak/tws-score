import { useEffect, useState, type ReactNode } from 'react'
import { claimMembership, listMembers } from '../data/members'
import { LoginPage } from './LoginPage'
import { MembersContext, type Couple } from './members-context'
import { RestrictedPage } from './RestrictedPage'
import { useSession } from './useSession'

type Access = { forUser: string } & ({ status: 'restricted' } | { status: 'member'; couple: Couple })

export function AuthGate({ children }: { children: ReactNode }) {
  const session = useSession()
  const [access, setAccess] = useState<Access | null>(null)
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
            ? { forUser: userId, status: 'member', couple: { me, partner: members.find((m) => m !== me) ?? null, userId } }
            : { forUser: userId, status: 'restricted' },
        )
      })
      .catch(() => !cancelled && setAccess({ forUser: userId, status: 'restricted' }))
    return () => {
      cancelled = true
    }
  }, [userId, email])

  if (session.status === 'loading') return null
  if (session.status === 'signed_out') return <LoginPage />
  if (access?.forUser !== session.userId) return null
  if (access.status === 'restricted') return <RestrictedPage />
  return <MembersContext.Provider value={access.couple}>{children}</MembersContext.Provider>
}
