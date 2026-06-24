export function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        border: '2px solid var(--t1)',
        borderTopColor: 'transparent',
        animation: 'spin 0.7s linear infinite',
      }} />
    </div>
  )
}
