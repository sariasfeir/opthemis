import { useState } from 'react'

const STAGES = [
  { key: 'procurement', label: 'Raw materials', owner: 'Procurement', icon: '🌱', color: '#5DCAA5', angle: -90 },
  { key: 'manufacturing', label: 'Manufacturing', owner: 'Operations', icon: '🏭', color: '#1D9E75', angle: -18 },
  { key: 'logistics', label: 'Distribution', owner: 'Logistics', icon: '🚚', color: '#0F6E56', angle: 54 },
  { key: 'usage', label: 'Usage phase', owner: 'End customer', icon: '🏢', color: '#085041', angle: 126 },
  { key: 'endoflife', label: 'End of life', owner: 'Recycling', icon: '♻️', color: '#B4B2A9', angle: 198 },
]

function polar(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

export default function Overview({ nav, projectData, user }) {
  const [hovered, setHovered] = useState(null)
  const filled = ['procurement','manufacturing','logistics'].filter(k => projectData[k])
  const allFilled = filled.length === 3
  const cx = 200, cy = 200, r = 130

  return (
    <div>
      <div className="page-header">
        <h1>Product lifecycle footprint</h1>
        <p>Each team enters data → OpThemis closes the optimization loop</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* SVG Loop */}
        <div className="card" style={{ padding: '12px' }}>
          <svg viewBox="0 0 400 400" width="100%">
            {/* Outer ring */}
            <circle cx={cx} cy={cy} r={r+18} fill="none" stroke="#E1F5EE" strokeWidth="36" strokeDasharray="6 3"/>
            {/* Center label */}
            <text x={cx} y={cy-10} textAnchor="middle" style={{ fontSize: '13px', fontWeight: '700', fill: '#1D9E75', fontFamily: 'Syne, sans-serif' }}>OpThemis</text>
            <text x={cx} y={cy+8} textAnchor="middle" style={{ fontSize: '10px', fill: '#888780', fontFamily: 'DM Mono, monospace' }}>lifecycle</text>
            <text x={cx} y={cy+22} textAnchor="middle" style={{ fontSize: '10px', fill: '#888780', fontFamily: 'DM Mono, monospace' }}>optimizer</text>

            {/* Connecting arcs between stages */}
            {STAGES.map((s, i) => {
              const next = STAGES[(i + 1) % STAGES.length]
              const p1 = polar(cx, cy, r, s.angle + 28)
              const p2 = polar(cx, cy, r, next.angle - 28)
              return (
                <path key={s.key+'-arc'}
                  d={`M ${p1.x} ${p1.y} A ${r} ${r} 0 0 1 ${p2.x} ${p2.y}`}
                  fill="none" stroke={s.color} strokeWidth="2.5" strokeLinecap="round"
                  markerEnd={`url(#arr-${s.key})`} opacity="0.7"
                />
              )
            })}

            {/* Arrow markers */}
            <defs>
              {STAGES.map(s => (
                <marker key={s.key} id={`arr-${s.key}`} viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
                  <path d="M1 1L7 4L1 7" fill="none" stroke={s.color} strokeWidth="1.5" strokeLinecap="round"/>
                </marker>
              ))}
            </defs>

            {/* Stage nodes */}
            {STAGES.map(s => {
              const pos = polar(cx, cy, r, s.angle)
              const isActive = ['procurement','manufacturing','logistics'].includes(s.key)
              const isDone = filled.includes(s.key)
              const isHov = hovered === s.key
              return (
                <g key={s.key}
                  style={{ cursor: isActive ? 'pointer' : 'default' }}
                  onClick={() => isActive && nav(s.key)}
                  onMouseEnter={() => setHovered(s.key)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <circle cx={pos.x} cy={pos.y} r={isHov ? 33 : 30}
                    fill={isDone ? s.color : isActive ? '#fff' : '#F1EFE8'}
                    stroke={s.color} strokeWidth={isHov ? 2.5 : 1.5}
                    style={{ transition: 'all 0.2s' }}
                  />
                  {isDone && <text x={pos.x} y={pos.y+1} textAnchor="middle" dominantBaseline="central" style={{ fontSize: '14px' }}>✓</text>}
                  {!isDone && <text x={pos.x} y={pos.y+1} textAnchor="central" textAnchor="middle" dominantBaseline="central" style={{ fontSize: '16px' }}>{s.icon}</text>}
                  {/* Label */}
                  <text x={pos.x} y={pos.y + 42} textAnchor="middle"
                    style={{ fontSize: '11px', fontWeight: '600', fill: isActive ? '#1a1a18' : '#888780', fontFamily: 'Syne, sans-serif' }}>
                    {s.label}
                  </text>
                  <text x={pos.x} y={pos.y + 55} textAnchor="middle"
                    style={{ fontSize: '9px', fill: '#888780', fontFamily: 'DM Mono, monospace' }}>
                    {s.owner}
                  </text>
                </g>
              )
            })}

            {/* Progress arc overlay */}
            {filled.length > 0 && (
              <circle cx={cx} cy={cy} r={r+18}
                fill="none" stroke="#1D9E75" strokeWidth="4"
                strokeDasharray={`${(filled.length / 3) * 2 * Math.PI * (r+18) * 0.6} 9999`}
                strokeLinecap="round" opacity="0.4"
                transform={`rotate(-90 ${cx} ${cy})`}
              />
            )}
          </svg>
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Progress */}
          <div className="card">
            <div style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Data collection
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ flex: 1, height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'var(--g3)', borderRadius: '3px', width: `${(filled.length/3)*100}%`, transition: 'width 0.6s ease' }}/>
              </div>
              <span style={{ fontSize: '12px', fontFamily: 'var(--mono)', color: 'var(--g2)', whiteSpace: 'nowrap' }}>{filled.length}/3</span>
            </div>
            {['procurement','manufacturing','logistics'].map(k => {
              const s = STAGES.find(x => x.key === k)
              const done = filled.includes(k)
              return (
                <div key={k} onClick={() => nav(k)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '8px', cursor: 'pointer', marginBottom: '4px', background: done ? '#E1F5EE' : 'var(--bg)', transition: 'background 0.15s' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: done ? s.color : 'var(--border2)', flexShrink: 0 }}/>
                  <span style={{ fontSize: '12px', fontWeight: '500', flex: 1 }}>{s.label}</span>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--mono)', color: done ? 'var(--g2)' : 'var(--muted)' }}>{done ? '✓ done' : 'pending →'}</span>
                </div>
              )
            })}
          </div>

          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { label: 'Lifecycle CO₂', val: allFilled ? '3,140 t/y' : '—', color: 'var(--coral)' },
              { label: 'Saving potential', val: allFilled ? '−42%' : '—', color: 'var(--g3)' },
              { label: 'Cost savings', val: allFilled ? '~68 kCHF/y' : '—', color: 'var(--g3)' },
              { label: 'Best CAPEX', val: allFilled ? '14.2 kCHF' : '—', color: 'var(--amber)' },
            ].map(k => (
              <div key={k.label} style={{ background: 'var(--bg)', borderRadius: '8px', padding: '12px', border: '0.5px solid var(--border)' }}>
                <div style={{ fontSize: '18px', fontWeight: '700', color: k.color }}>{k.val}</div>
                <div style={{ fontSize: '10px', fontFamily: 'var(--mono)', color: 'var(--muted)', marginTop: '2px' }}>{k.label}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          {!allFilled ? (
            <button className="btn-primary" onClick={() => nav('procurement')} style={{ padding: '11px' }}>
              Start with procurement →
            </button>
          ) : (
            <button className="btn-primary" onClick={() => nav('results')} style={{ padding: '11px' }}>
              View optimization results →
            </button>
          )}

          <div style={{ fontSize: '10px', fontFamily: 'var(--mono)', color: 'var(--muted)', textAlign: 'center', lineHeight: 1.6 }}>
            Demo data: Molkerei Alpenfrisch dairy factory<br/>
            Bavaria, Germany · public energy dataset
          </div>
        </div>
      </div>
    </div>
  )
}
