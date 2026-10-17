import styles from './page.module.css'

export function HomePage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Lugares</h1>
      </header>
    </main>
  )
}
