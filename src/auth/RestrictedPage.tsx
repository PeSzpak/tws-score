import { supabase } from '../lib/supabase'
import styles from './auth.module.css'

export function RestrictedPage() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Esse cantinho é só nosso 💌</h1>
        <p className="muted">Esse e-mail não tem acesso ao TWS Score.</p>
        <button className="btn" onClick={() => supabase.auth.signOut()}>
          Sair
        </button>
      </div>
    </main>
  )
}
