import { useState, type FormEvent } from 'react'
import { Heart } from 'lucide-react'
import { supabase } from '../lib/supabase'
import styles from './auth.module.css'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function submit(event: FormEvent) {
    event.preventDefault()
    setState('sending')
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    })
    setState(error ? 'error' : 'sent')
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.mark} aria-hidden>
          <Heart size={26} fill="currentColor" strokeWidth={0} />
        </div>
        <div>
          <h1 className={styles.title}>TWS Score</h1>
          <p className={`${styles.subtitle} muted`}>Nossos cafés e restaurantes favoritos.</p>
        </div>

        {state === 'sent' ? (
          <p className={styles.sent}>Te mandamos um link. É só abrir no celular. 💌</p>
        ) : (
          <form className={styles.form} onSubmit={submit}>
            <label className="field">
              Seu e-mail
              <input
                className="input"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <button className="btn btn-primary" disabled={state === 'sending'}>
              Receber link
            </button>
            {state === 'error' && <p className="error">Não deu pra enviar agora. Tenta de novo?</p>}
          </form>
        )}
      </div>
    </main>
  )
}
