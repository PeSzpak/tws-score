import { useEffect, useRef, useState } from 'react'

export type Loaded<T> = { status: 'loading' } | { status: 'error' } | { status: 'ready'; data: T }

export function useLoad<T>(load: () => Promise<T>, key: string): Loaded<T> & { reload: () => void } {
  const [state, setState] = useState<Loaded<T>>({ status: 'loading' })
  const [version, setVersion] = useState(0)
  const latest = useRef(load)

  useEffect(() => {
    latest.current = load
  })

  useEffect(() => {
    let cancelled = false
    latest.current().then(
      (data) => !cancelled && setState({ status: 'ready', data }),
      () => !cancelled && setState({ status: 'error' }),
    )
    return () => {
      cancelled = true
    }
  }, [key, version])

  return { ...state, reload: () => setVersion((v) => v + 1) }
}
