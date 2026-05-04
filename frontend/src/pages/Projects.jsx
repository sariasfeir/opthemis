import { useState } from 'react'

function dairySites() {
  return [
    { id:'s1', name:'Kempten Plant', country:'Germany', industry:'Dairy processing', production:3800, scope1:980, scope2:1190, scope3:390, co2_cost:42, status:'assessed' },
    { id:'s2', name:'Munich Distribution', country:'Germany', industry:'Cold storage', production:1200, scope1:180, scope2:420, scope3:95, co2_cost:38, status:'pending' },
    { id:'s3', name:'Augsburg Cheese', country:'Germany', industry:'Cheese production', production:2100, scope1:1840, scope2:760, scope3:280, co2_cost:51, status:'pending' },
    { id:'s4', name:'Innsbruck Yogurt', country:'Austria', industry:'Fermented dairy', production:950, scope1:420, scope2:310, scope3:140, co2_cost:39, status:'pending' },
    { id:'s5', name:'Zurich Hub', country:'Switzerland', industry:'Distribution', production:580, scope1:95, scope2:245, scope3:820, co2_cost:55, status:'pending' },
  ]
}

const DEMO = [
  { id:'dairy', name:'Lifecycle assessment 2025', company:'Molkerei Alpenfrisch', region:'Bavaria, DE', year:'2025', sites:dairySites(), status:'active' },
  { id:'sika', name:'APAC energy decarbonisation', company:'Sika AG', region:'Asia Pacific', year:'2025', sites:null, status:'setup' },
]

export default function Projects({ nav, user }) {
  const [projects, setProjects] = useState(DEMO)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name:'', company:'' })

  const create = () => {
    if (!form.name || !form.company) return
    const p = { id: String(Date.now()), ...form, region:'', year:'2025', sites:null, status:'setup' }
    setProjects(ps => [p, ...ps])
    setCreating(false)
    setForm({ name:'', company:'' })
    nav('portfolio', p)
  }

  return (
    <div>
      <div className="ph">
        <div>
          <h1>Projects</h1>
          <p className="ph-sub">Each project = one company's decarbonisation initiative</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setCreating(true)}>+ New project</button>
      </div>

      {creating && (
        <div className="card" style={{ marginBottom:'12px', borderColor:'var(--green-400)' }}>
          <h3 style={{ marginBottom:'10px' }}>New project</h3>
          <div className="form-grid" style={{ marginBottom:'10px' }}>
            <div className="field"><label>Project name</label><input placeholder="APAC decarbonisation 2025" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}/></div>
            <div className="field"><label>Company</label><input placeholder="Sika AG" value={form.company} onChange={e => setForm(f => ({...f, company: e.target.value}))}/></div>
          </div>
          <div style={{ display:'flex', gap:'6px' }}>
            <button className="btn btn-sm" onClick={() => setCreating(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={create}>Create →</button>
          </div>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
        {projects.map(p => {
          const total = p.sites ? p.sites.reduce((s,x) => s+x.scope1+x.scope2+x.scope3, 0) : null
          const high = p.sites ? p.sites.filter(s => s.co2_cost > 40).length : null
          return (
            <div key={p.id} className="card-row" onClick={() => nav('portfolio', p)}>
              <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'3px' }}>
                    <span style={{ fontSize:'13px', fontWeight:'600' }}>{p.name}</span>
                    <span className={`badge badge-${p.status==='active'?'green':p.status==='setup'?'gray':'amber'}`}>{p.status}</span>
                  </div>
                  <span style={{ fontSize:'11px', fontFamily:'var(--mono)', color:'var(--ink-3)' }}>{p.company} · {p.region} · {p.year}</span>
                </div>
                {p.sites ? (
                  <div style={{ display:'flex', gap:'20px', flexShrink:0 }}>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:'15px', fontWeight:'600', color:'var(--red)' }}>{total?.toLocaleString()}</div>
                      <div style={{ fontSize:'10px', fontFamily:'var(--mono)', color:'var(--ink-3)' }}>tCO₂/y</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:'15px', fontWeight:'600', color:'var(--amber)' }}>{high}</div>
                      <div style={{ fontSize:'10px', fontFamily:'var(--mono)', color:'var(--ink-3)' }}>high priority</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:'15px', fontWeight:'600' }}>{p.sites.length}</div>
                      <div style={{ fontSize:'10px', fontFamily:'var(--mono)', color:'var(--ink-3)' }}>sites</div>
                    </div>
                  </div>
                ) : (
                  <span style={{ fontSize:'11px', fontFamily:'var(--mono)', color:'var(--ink-4)' }}>Upload Excel to start →</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
