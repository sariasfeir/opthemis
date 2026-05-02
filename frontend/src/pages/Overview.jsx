const stages = [
  {
    key: 'procurement', icon: '🌱', title: 'Raw materials',
    owner: 'Procurement team', color: '#5DCAA5', bgColor: '#E1F5EE',
    pills: ['supplier CO₂ certs', 'transport origin', 'bio-alt options'],
    desc: 'Enter supplier data, material volumes, and transport emissions factors.'
  },
  {
    key: 'manufacturing', icon: '🏭', title: 'Manufacturing',
    owner: 'Operations team', color: '#1D9E75', bgColor: '#E1F5EE',
    pills: ['energy flows', 'steam / cooling', 'waste streams'],
    desc: 'Upload process energy data, utility consumption, and waste generation.'
  },
  {
    key: 'logistics', icon: '🚚', title: 'Distribution',
    owner: 'Logistics team', color: '#0F6E56', bgColor: '#E1F5EE',
    pills: ['routes & modes', 'fleet emissions', 'AnyLogic model'],
    desc: 'Define distribution network, fleet type, and downstream CO₂ factors.'
  },
]

export default function Overview({ nav, projectData, user }) {
  const filled = [
    projectData.procurement ? 'procurement' : null,
    projectData.manufacturing ? 'manufacturing' : null,
    projectData.logistics ? 'logistics' : null,
  ].filter(Boolean)

  const allFilled = filled.length === 3

  return (
    <div>
      <div className="page-header">
        <h1>Product lifecycle footprint</h1>
        <p>Each team enters their stage data → OpThemis sequences optimization across the full loop</p>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '12px', fontFamily: 'var(--mono)', color: 'var(--muted)' }}>
            Data collection progress
          </span>
          <span style={{ fontSize: '12px', fontFamily: 'var(--mono)', color: 'var(--g2)' }}>
            {filled.length}/3 stages complete
          </span>
        </div>
        <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: '2px', background: 'var(--g3)',
            width: `${(filled.length / 3) * 100}%`,
            transition: 'width 0.5s ease'
          }} />
        </div>
      </div>

      {/* Stage cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        {stages.map(s => {
          const done = filled.includes(s.key)
          return (
            <div key={s.key} className="card" style={{ cursor: 'pointer', transition: 'transform 0.15s' }}
              onClick={() => nav(s.key)}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: s.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '500' }}>{s.title}</div>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--mono)', color: 'var(--muted)' }}>{s.owner}</div>
                </div>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--mono)', marginBottom: '10px', lineHeight: 1.5 }}>
                {s.desc}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {s.pills.map(p => (
                  <span key={p} style={{ fontSize: '10px', fontFamily: 'var(--mono)', padding: '2px 7px', borderRadius: '10px', background: 'var(--bg)', border: '0.5px solid var(--border)' }}>
                    {p}
                  </span>
                ))}
              </div>
              {done && (
                <div style={{ marginTop: '10px', fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--g2)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ✓ Data submitted
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Flow note */}
      <div style={{ textAlign: 'center', fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--muted)', marginBottom: '20px', opacity: 0.7 }}>
        procurement data → manufacturing model → logistics simulation → loop closed ↺
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        {[
          { label: 'Total lifecycle CO₂', val: allFilled ? '~890 tCO₂/y' : '—', color: allFilled ? 'var(--coral)' : 'var(--muted)' },
          { label: 'Optimization potential', val: allFilled ? '−38%' : '—', color: allFilled ? 'var(--g3)' : 'var(--muted)' },
          { label: 'Estimated savings', val: allFilled ? '~52 kCHF/y' : '—', color: allFilled ? 'var(--g3)' : 'var(--muted)' },
        ].map(k => (
          <div key={k.label} style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', padding: '14px', border: '0.5px solid var(--border)' }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: k.color }}>{k.val}</div>
            <div style={{ fontSize: '10px', fontFamily: 'var(--mono)', color: 'var(--muted)', marginTop: '3px' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      {!allFilled ? (
        <div style={{ padding: '14px 18px', borderRadius: 'var(--radius)', border: '0.5px dashed var(--border2)', background: 'var(--bg)', fontSize: '12px', fontFamily: 'var(--mono)', color: 'var(--muted)' }}>
          Results available after all 3 teams complete their inputs and the consultant runs the MILP + AnyLogic optimization.
        </div>
      ) : (
        <button className="btn-primary" onClick={() => nav('results')} style={{ width: '100%', padding: '12px' }}>
          View full optimization results →
        </button>
      )}
    </div>
  )
}
