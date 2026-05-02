const stages = [
  { key: 'procurement', label: 'Raw materials', sub: 'Procurement', color: '#5DCAA5' },
  { key: 'manufacturing', label: 'Manufacturing', sub: 'Operations', color: '#1D9E75' },
  { key: 'logistics', label: 'Distribution', sub: 'Logistics', color: '#0F6E56' },
  { key: 'results', label: 'Results', sub: 'Consultant / All', color: '#BA7517' },
]

export default function Layout({ children, page, nav, user, setUser }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'var(--head)' }}>
      {/* Sidebar */}
      <div style={{
        width: '220px', flexShrink: 0,
        background: 'var(--surface)', borderRight: '0.5px solid var(--border)',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Logo */}
        <div style={{
          padding: '16px', borderBottom: '0.5px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <div style={{
            width: '28px', height: '28px', background: 'var(--g3)',
            borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <polygon points="7,1 13,12 1,12" fill="white"/>
            </svg>
          </div>
          <span style={{ fontWeight: '700', fontSize: '16px' }}>OpThemis</span>
        </div>

        {/* Overview link */}
        <div style={{ padding: '8px 0 4px' }}>
          <button onClick={() => nav('overview')} style={{
            width: '100%', textAlign: 'left', border: 'none', background: 'transparent',
            padding: '9px 16px', fontSize: '13px', fontFamily: 'var(--head)',
            fontWeight: page === 'overview' ? '500' : '400',
            color: page === 'overview' ? 'var(--text)' : 'var(--muted)',
            borderLeft: `2px solid ${page === 'overview' ? 'var(--g3)' : 'transparent'}`,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <span style={{ fontSize: '14px' }}>◎</span> Overview
          </button>
        </div>

        {/* Stage section */}
        <div style={{ padding: '4px 16px 6px', fontSize: '10px', fontFamily: 'var(--mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Lifecycle stages
        </div>
        {stages.map(s => (
          <button key={s.key} onClick={() => nav(s.key)} style={{
            width: '100%', textAlign: 'left', border: 'none', background: page === s.key ? 'var(--bg)' : 'transparent',
            padding: '9px 16px', cursor: 'pointer', fontFamily: 'var(--head)',
            borderLeft: `2px solid ${page === s.key ? 'var(--g3)' : 'transparent'}`,
            display: 'flex', alignItems: 'center', gap: '10px'
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: page === s.key ? '500' : '400', color: page === s.key ? 'var(--text)' : 'var(--muted)' }}>{s.label}</div>
              <div style={{ fontSize: '10px', fontFamily: 'var(--mono)', color: 'var(--muted)' }}>{s.sub}</div>
            </div>
          </button>
        ))}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* User */}
        <div style={{ padding: '12px 16px', borderTop: '0.5px solid var(--border)' }}>
          <div style={{ fontSize: '12px', fontWeight: '500' }}>{user?.name}</div>
          <div style={{ fontSize: '10px', fontFamily: 'var(--mono)', color: 'var(--muted)', marginTop: '1px' }}>{user?.role}</div>
          <button onClick={() => setUser(null)} style={{
            marginTop: '8px', fontSize: '11px', fontFamily: 'var(--mono)',
            color: 'var(--muted)', background: 'none', border: 'none', padding: '0', cursor: 'pointer'
          }}>Sign out</button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
        <div style={{ maxWidth: '760px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
