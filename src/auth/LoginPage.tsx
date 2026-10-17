import { useState, type FormEvent } from 'react'
import { Heart } from 'lucide-react'
import { supabase } from '../lib/supabase'
import styles from './auth.module.css'

type Step = 'email' | 'sending' | 'code' | 'verifying'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<Step>('email')
  const [error, setError] = useState<string | null>(null)

  async function sendLink(event: FormEvent) {
    event.preventDefault()
    setStep('sending')
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin, shouldCreateUser: false },
    })
    if (error) {
      setError('Não deu pra enviar. Confere o e-mail e tenta de novo?')
      setStep('email')
    } else {
      setStep('code')
    }
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault()
    setStep('verifying')
    setError(null)
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'email' })
    if (error) setError('Código não confere. Dá uma olhada no e-mail mais recente?')
    setStep('code')
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

        {step === 'code' || step === 'verifying' ? (
          <form className={styles.form} onSubmit={verifyCode}>
            <p className={styles.sent}>Te mandamos um e-mail. Abre o link ou digita o código aqui. 💌</p>
            <label className="field">
              Código do e-mail
              <input
                className="input"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={8}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              />
            </label>
            <button className="btn btn-primary" disabled={code.length < 6 || step === 'verifying'}>
              Entrar
            </button>
            {error && <p className="error">{error}</p>}
            <button type="button" className="btn btn-ghost" onClick={() => setStep('email')}>
              Usar outro e-mail
            </button>
          </form>
        ) : (
          <form className={styles.form} onSubmit={sendLink}>
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
            <button className="btn btn-primary" disabled={step === 'sending'}>
              Receber link
            </button>
            {error && <p className="error">{error}</p>}
          </form>
        )}
      </div>
    </main>
  )
}
