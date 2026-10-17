export function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'center', padding: '48px 0', textAlign: 'center' }}>
      <p className="muted">Não deu pra carregar agora.</p>
      <button className="btn" onClick={onRetry}>
        Tentar de novo
      </button>
    </div>
  )
}
