import { useState } from 'react'
import Procurement from './site/Procurement'
import Manufacturing from './site/Manufacturing'
import Distribution from './site/Distribution'

const STAGES = [
  { id:'procurement', label:'Raw Materials', angle:-90, color:'#1A9060', desc:'Supplier list, CO₂/kg, cost/kg' },
  { id:'manufacturing', label:'Manufacturing', angle:-18, color:'#15784E', desc:'Energy per machine, waste streams' },
  { id:'distribution', label:'Distribution', angle:54, color:'#0F5C3E', desc:'Transport, cold chain, logistics CO₂' },
  { id:'usage', label:'Usage Phase', angle:126, color:'#9B9B96', desc:'End-user consumption' },
  { id:'endoflife', label:'Recycling / Waste', angle:198, color:'#9B9B96', desc:'End of life streams' },
]

function polar(cx, cy, r, deg) {
  const rad = deg * Math.PI / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

export default function SiteDetail({ nav, project, site }) {
  const [activeStage, setActiveStage] = useState(null)
  const [stageData, setStageData] = useState({})

  const total = (site.scope1||0) + (site.scope2||0) + (site.scope3||0)
  const done = Object.keys(stageData)

  if (activeStage === 'procurement') return <Procurement site={site} onBack={() => setActiveStage(null)} onSave={d => { setStageData(s => ({...s, procurement: d})); setActiveStage(null) }} saved={stageData.procurement}/>
  if (activeStage === 'manufacturing') return <Manufacturing site={site} onBack={() => setActiveStage(null)} onSave={d => { setStageData(s => ({...s, manufacturing: d})); setActiveStage(null) }} saved={stageData.manufacturing}/>
  if (activeStage === 'distribution') return <Distribution site={site} onBack={() => setActiveStage(null)} onSave={d => { setStageData(s => ({...s, distribution: d})); setActiveStage(null) }} saved={stageData.distribution}/>

  const cx = 160, cy = 160, r = 110

  return (
    <div>
      <div className="bc">
        <button onClick={() => nav('projects')}>Projects</button>
        <span>/</span>
        <button onClick={() => nav('portfolio', project)}>{project.name}</button>
        <span>/</span>
        <span>{site.name}</span>
      </div>

      <div className="ph">
        <div>
          <h1>{site.name}</h1>
          <p className="ph-sub">{site.country} · {site.industry} · {(site.production||0).toLocaleString()} t/y</p>
        </div>
        <div style={{ display:'flex', gap:'16px' }}>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:'15px', fontWeight:'600', color:'var(--red)', fontFamily:'var(--mono)' }}>{total.toLocaleString()} tCO₂/y</div>
            <div style={{ fontSize:'10px', fontFamily:'var(--mono)', color:'var(--ink-3)' }}>Total emissions</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:'15px', fontWeight:'600', color:'var(--amber)', fontFamily:'var(--mono)' }}>{site.co2_cost} CHF/t</div>
            <div style={{ fontSize:'10px', fontFamily:'var(--mono)', color:'var(--ink-3)' }}>CO₂ cost</div>
          </div>
        </div>
      </div>

      {/* Scope breakdown bar */}
      <div className="card" style={{ marginBottom:'16px', padding:'12px 16px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px', marginBottom:'8px' }}>
          {[
            { label:'Scope 1 — direct emissions', val:site.scope1||0, color:'#1A9060', pct:Math.round((site.scope1||0)/total*100) },
            { label:'Scope 2 — purchased energy', val:site.scope2||0, color:'#1A5A9C', pct:Math.round((site.scope2||0)/total*100) },
            { label:'Scope 3 — value chain', val:site.scope3||0, color:'#B07218', pct:Math.round((site.scope3||0)/total*100) },
          ].map(s => (
            <div key={s.label}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                <span style={{ fontSize:'11px', color:'var(--ink-3)' }}>{s.label}</span>
                <span style={{ fontSize:'11px', fontFamily:'var(--mono)', fontWeight:'600', color:s.color }}>{s.val.toLocaleString()} t · {s.pct}%</span>
              </div>
              <div style={{ height:'5px', background:'var(--border)', borderRadius:'2px', overflow:'hidden' }}>
                <div style={{ height:'100%', width:s.pct+'%', background:s.color, borderRadius:'2px' }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main layout: circle + stage list */}
      <div style={{ display:'grid', gridTemplateColumns:'340px 1fr', gap:'20px', alignItems:'start' }}>

        {/* Lifecycle circle */}
        <div className="card" style={{ padding:'12px' }}>
          <div style={{ fontSize:'11px', fontFamily:'var(--mono)', color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:'8px' }}>
            Product lifecycle
          </div>
          <svg viewBox="0 0 320 320" width="100%">
            <defs>
              {STAGES.map((s,i) => {
                const startAngle = s.angle - 62
                const endAngle = s.angle + 62
                const p1 = polar(cx, cy, r+22, startAngle)
                const p2 = polar(cx, cy, r+22, endAngle)
                const p3 = polar(cx, cy, r-2, endAngle)
                const p4 = polar(cx, cy, r-2, startAngle)
                return (
                  <clipPath key={s.id} id={`clip-${s.id}`}>
                    <path d={`M ${p1.x} ${p1.y} A ${r+22} ${r+22} 0 0 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${r-2} ${r-2} 0 0 0 ${p4.x} ${p4.y} Z`}/>
                  </clipPath>
                )
              })}
            </defs>

            {/* Track ring */}
            <circle cx={cx} cy={cy} r={r+10} fill="none" stroke="var(--border)" strokeWidth="28"/>

            {/* Stage arcs */}
            {STAGES.map((s,i) => {
              const startAngle = s.angle - 60
              const endAngle = s.angle + 60
              const r1 = r + 22, r2 = r - 2
              const p1 = polar(cx, cy, r1, startAngle)
              const p2 = polar(cx, cy, r1, endAngle)
              const p3 = polar(cx, cy, r2, endAngle)
              const p4 = polar(cx, cy, r2, startAngle)
              const isDone = done.includes(s.id)
              const isActive = activeStage === s.id
              const clickable = ['procurement','manufacturing','distribution'].includes(s.id)
              return (
                <g key={s.id} style={{ cursor: clickable ? 'pointer' : 'default' }}
                  onClick={() => clickable && setActiveStage(s.id)}>
                  <path d={`M ${p1.x} ${p1.y} A ${r1} ${r1} 0 0 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${r2} ${r2} 0 0 0 ${p4.x} ${p4.y} Z`}
                    fill={isDone ? s.color : clickable ? s.color : '#E2E2DF'}
                    opacity={isDone ? 1 : clickable ? 0.25 : 0.6}
                    stroke="white" strokeWidth="1.5"
                  />
                  {/* Arrow tip */}
                  {clickable && (() => {
                    const tip = polar(cx, cy, r+10, s.angle + 62)
                    const bl = polar(cx, cy, r+22, s.angle + 56)
                    const br = polar(cx, cy, r-2, s.angle + 56)
                    return <polygon points={`${tip.x},${tip.y} ${bl.x},${bl.y} ${br.x},${br.y}`} fill={isDone ? s.color : clickable ? s.color : '#E2E2DF'} opacity={isDone ? 1 : clickable ? 0.25 : 0.6}/>
                  })()}
                  {/* Label */}
                  {(() => {
                    const lp = polar(cx, cy, r+10, s.angle)
                    return (
                      <text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="central"
                        style={{ fontSize:'9px', fontWeight:'600', fill: isDone || (clickable && false) ? 'white' : clickable ? 'white' : '#9B9B96', fontFamily:'var(--sans)', pointerEvents:'none' }}
                        opacity={clickable ? 1 : 0.7}
                      >
                        {s.label}
                      </text>
                    )
                  })()}
                  {isDone && (() => {
                    const cp = polar(cx, cy, r+10, s.angle - 30)
                    return <text x={cp.x} y={cp.y} textAnchor="middle" dominantBaseline="central" style={{ fontSize:'9px', fill:'white', fontFamily:'var(--mono)' }}>✓</text>
                  })()}
                </g>
              )
            })}

            {/* Center */}
            <circle cx={cx} cy={cy} r={r-10} fill="white"/>
            <text x={cx} y={cy-8} textAnchor="middle" style={{ fontSize:'11px', fontWeight:'600', fill:'var(--green-700)', fontFamily:'var(--sans)' }}>Product</text>
            <text x={cx} y={cy+6} textAnchor="middle" style={{ fontSize:'10px', fill:'var(--ink-3)', fontFamily:'var(--sans)' }}>Footprint</text>
            <text x={cx} y={cy+20} textAnchor="middle" style={{ fontSize:'10px', fontFamily:'var(--mono)', fill:'var(--red)', fontWeight:'600' }}>{total.toLocaleString()} t</text>

            {/* Progress indicator */}
            <text x={cx} y={300} textAnchor="middle" style={{ fontSize:'10px', fontFamily:'var(--mono)', fill:'var(--ink-3)' }}>
              {done.length}/3 stages complete
            </text>
          </svg>
        </div>

        {/* Stage cards */}
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          {STAGES.filter(s => ['procurement','manufacturing','distribution'].includes(s.id)).map(s => {
            const isDone = done.includes(s.id)
            return (
              <div key={s.id} className="card-row" onClick={() => setActiveStage(s.id)}
                style={{ borderLeft:`3px solid ${isDone ? s.color : 'var(--border)'}` }}>
                <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                  <div style={{ width:32, height:32, borderRadius:'50%', background:isDone ? s.color : 'var(--bg)', border:`1px solid ${isDone ? s.color : 'var(--border-2)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontSize:'12px' }}>{isDone ? '✓' : {procurement:'🌱', manufacturing:'🏭', distribution:'🚚'}[s.id]}</span>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:'13px', fontWeight:'600', marginBottom:'1px' }}>{s.label}</div>
                    <div style={{ fontSize:'11px', fontFamily:'var(--mono)', color:'var(--ink-3)' }}>{s.desc}</div>
                  </div>
                  <div style={{ fontSize:'11px', fontFamily:'var(--mono)', color: isDone ? 'var(--green-700)' : 'var(--ink-4)' }}>
                    {isDone ? 'Complete ✓' : 'Click to fill →'}
                  </div>
                </div>
              </div>
            )
          })}

          {done.length > 0 && (
            <div style={{ marginTop:'8px', padding:'12px 14px', background:'var(--green-50)', border:'1px solid var(--green-100)', borderRadius:'var(--r-lg)' }}>
              <div style={{ fontSize:'12px', fontWeight:'600', color:'var(--green-700)', marginBottom:'4px' }}>
                Data collected — ready to optimise
              </div>
              <div style={{ fontSize:'11px', color:'var(--green-700)', marginFamily:'var(--mono)' }}>
                Once all 3 stages are complete, run the MILP optimisation to get your CO₂ reduction roadmap and ROI.
              </div>
              {done.length === 3 && (
                <button className="btn btn-primary btn-sm" style={{ marginTop:'10px' }}>Run optimisation →</button>
              )}
            </div>
          )}

          {/* Usage / EOL — greyed out */}
          {[{ id:'usage', label:'Usage Phase', desc:'End-user emissions — coming soon' }, { id:'endoflife', label:'Recycling / Waste', desc:'End of life — coming soon' }].map(s => (
            <div key={s.id} className="card-row" style={{ opacity:.45, cursor:'not-allowed', borderLeft:'3px solid var(--border)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--bg)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontSize:'11px', color:'var(--ink-4)' }}>—</span>
                </div>
                <div>
                  <div style={{ fontSize:'13px', fontWeight:'500' }}>{s.label}</div>
                  <div style={{ fontSize:'11px', fontFamily:'var(--mono)', color:'var(--ink-3)' }}>{s.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
