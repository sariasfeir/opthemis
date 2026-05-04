import { useState } from 'react'

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('landing')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('consultant')
  const [loading, setLoading] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setTimeout(() => { onLogin({ email, role, name: email.split('@')[0] }); setLoading(false) }, 600)
  }

  if (mode === 'signin') return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:'24px' }}>
      <div style={{ width:'100%', maxWidth:'340px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'28px', cursor:'pointer' }} onClick={() => setMode('landing')}>
          <LogoMark />
          <span style={{ fontSize:'14px', fontWeight:'600' }}>OpThemis</span>
        </div>
        <h1 style={{ fontSize:'17px', marginBottom:'4px' }}>Sign in</h1>
        <p style={{ fontSize:'12px', color:'var(--ink-3)', marginBottom:'20px' }}>Access your decarbonisation projects</p>
        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          <div className="field"><label>Work email</label><input type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <div className="field">
            <label>Role</label>
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="consultant">Consultant</option>
              <option value="sustainability">Sustainability manager</option>
              <option value="engineer">Process engineer</option>
              <option value="executive">Executive</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop:'4px', justifyContent:'center', padding:'8px' }}>
            {loading ? 'Signing in…' : 'Continue →'}
          </button>
        </form>
        <p style={{ fontSize:'11px', color:'var(--ink-4)', marginTop:'16px', fontFamily:'var(--mono)' }}>opthemis.ch · EPFL · Switzerland</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'var(--surface)' }}>
      {/* Top nav */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 48px', borderBottom:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <LogoMark />
          <span style={{ fontSize:'14px', fontWeight:'600' }}>OpThemis</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <span style={{ fontSize:'11px', color:'var(--ink-3)', fontFamily:'var(--mono)' }}>EPFL STARTUP · 2025</span>
          <button className="btn btn-primary btn-sm" onClick={() => setMode('signin')}>Sign in →</button>
        </div>
      </div>

      {/* Hero */}
      <div style={{ maxWidth:'880px', margin:'0 auto', padding:'64px 48px 48px' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:'var(--green-50)', border:'1px solid var(--green-100)', borderRadius:'3px', padding:'3px 9px', fontSize:'11px', fontFamily:'var(--mono)', color:'var(--green-700)', marginBottom:'20px' }}>
          Industrial energy & lifecycle optimisation
        </div>
        <h1 style={{ fontSize:'38px', fontWeight:'600', lineHeight:'1.15', letterSpacing:'-0.5px', marginBottom:'16px', maxWidth:'620px' }}>
          Turn your sustainability report into an engineering action plan
        </h1>
        <p style={{ fontSize:'14px', color:'var(--ink-2)', lineHeight:'1.7', maxWidth:'500px', marginBottom:'28px' }}>
          OpThemis connects the people who measure CO₂ with the engineers who can reduce it — across every factory in your portfolio.
        </p>
        <div style={{ display:'flex', gap:'8px' }}>
          <button className="btn btn-primary" onClick={() => setMode('signin')} style={{ padding:'8px 18px', fontSize:'13px' }}>Request access →</button>
          <button className="btn" style={{ padding:'8px 18px', fontSize:'13px' }}>View demo</button>
        </div>
      </div>

      {/* Feature strip */}
      <div style={{ borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)', background:'var(--bg)' }}>
        <div style={{ maxWidth:'880px', margin:'0 auto', padding:'0 48px', display:'grid', gridTemplateColumns:'repeat(4,1fr)' }}>
          {[
            ['01','Portfolio upload','Upload one Excel. All factories ranked by decarbonisation priority.'],
            ['02','Structured collection','One contact per site. Scope 1/2/3 data gathered in a traceable workflow.'],
            ['03','MILP optimisation','Process engineers and consultants collaborate on the full energy analysis.'],
            ['04','ROI dashboard','CO₂ reduction, cost savings, CAPEX, payback — live for management.'],
          ].map(([n,t,b],i) => (
            <div key={n} style={{ padding:'22px 20px', borderRight: i<3 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--ink-4)', marginBottom:'8px' }}>{n}</div>
              <div style={{ fontSize:'12px', fontWeight:'600', marginBottom:'5px', color:'var(--ink)' }}>{t}</div>
              <div style={{ fontSize:'11px', color:'var(--ink-3)', lineHeight:'1.6' }}>{b}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Problem / Solution */}
      <div style={{ maxWidth:'880px', margin:'0 auto', padding:'48px 48px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'48px' }}>
        {[
          { label:'The problem', title:'Sustainability data exists. Nobody acts on it.', items:['Internal consultants collect Scope 1/2/3 for compliance reports','Process engineers never see the CO₂ numbers','The report is filed. Nothing changes.','Carbon costs keep rising. Deadlines missed.'], dot:'var(--red)' },
          { label:'The approach', title:'One platform. Two teams. One action plan.', items:['Upload the Excel you already have — instant site prioritisation','Structured data collection, one contact per factory','Process engineer + consultant fill in data together','MILP optimiser generates ranked measures with ROI'], dot:'var(--green-500)' },
        ].map(s => (
          <div key={s.label}>
            <div style={{ fontSize:'10px', fontFamily:'var(--mono)', color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:'10px' }}>{s.label}</div>
            <h2 style={{ fontSize:'15px', fontWeight:'600', marginBottom:'14px', lineHeight:'1.4' }}>{s.title}</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {s.items.map(t => (
                <div key={t} style={{ display:'flex', gap:'8px', alignItems:'flex-start' }}>
                  <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:s.dot, flexShrink:0, marginTop:'5px' }}/>
                  <span style={{ fontSize:'12px', color:'var(--ink-2)', lineHeight:'1.6' }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ borderTop:'1px solid var(--border)', padding:'16px 48px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}><LogoMark size={18}/><span style={{ fontSize:'11px', fontFamily:'var(--mono)', color:'var(--ink-3)' }}>opthemis.ch</span></div>
        <span style={{ fontSize:'11px', fontFamily:'var(--mono)', color:'var(--ink-4)' }}>EPFL Startup Launchpad · Switzerland · 2025</span>
      </div>
    </div>
  )
}

export function LogoMark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <rect width="22" height="22" rx="5" fill="#1A9060"/>
      <path d="M11 4L18 17H4L11 4Z" fill="none" stroke="#D6F0E5" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M11 9L15 17H7L11 9Z" fill="#D6F0E5"/>
    </svg>
  )
}
