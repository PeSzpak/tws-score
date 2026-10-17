import { useCallback, useEffect, useState } from 'react'

export type Loaded<T> = { status: 'loading' } | { status: 'error' } | { status: 'ready'; data: T }

export function useLoad<T>(load: () => Promise<T>, deps: unknown[]): Loaded<T> & { reload: () => void } {
  const [state, setState] = useState<Loaded<T>>({ status: 'loading' })
  const [version, setVersion] = useState(0)
  const run = useCallback(load, deps)

  useEffect(() => {
    let cancelled = false
    run().then(
      (data) => !cancelled && setState({ status: 'ready', data }),
      () => !cancelled && setState({ status: 'error' }),
    )
    return () => {
      cancelled = true
    }
  }, [run, version])

  return { ...state, reload: () => setVersion((v) => v + 1) }
}
