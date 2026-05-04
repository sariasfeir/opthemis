import { useState, useRef } from 'react'

function score(s) { return (s.co2_cost/55)*0.5 + ((s.scope1+s.scope2+s.scope3)/5000)*0.5 }
function priority(s) {
  const v = score(s)
  if (v > 0.65) return { label:'High', cls:'badge-red' }
  if (v > 0.35) return { label:'Medium', cls:'badge-amber' }
  return { label:'Low', cls:'badge-gray' }
}

function parseCSV(text, onDone) {
  const lines = text.split('\n').filter(l => l.trim())
  const h = lines[0].split(',').map(x => x.trim().toLowerCase())
  const get = (cols, row) => { for (const k of cols) { const i = h.findIndex(x => x.includes(k)); if (i>=0) return parseFloat(row[i]) || row[i] || '' } return '' }
  const sites = lines.slice(1).map((line,i) => {
    const c = line.split(',').map(x => x.trim())
    return { id:'s'+(i+1), name:get(['name','factory','site','plant'],c), country:get(['country','location'],c), industry:get(['industry','type'],c), production:get(['production','volume'],c), scope1:get(['scope1','scope 1'],c), scope2:get(['scope2','scope 2'],c), scope3:get(['scope3','scope 3'],c), co2_cost:get(['cost','chf','co2_cost'],c), status:'pending' }
  }).filter(s => s.name)
  onDone(sites)
}

export default function Portfolio({ nav, project }) {
  const [sites, setSites] = useState(project.sites || [])
  const [sort, setSort] = useState('priority')
  const fileRef = useRef()

  const handleFile = f => { if (!f) return; const r = new FileReader(); r.onload = e => parseCSV(e.target.result, setSites); r.readAsText(f) }
  const sorted = [...sites].sort((a,b) => sort==='priority' ? score(b)-score(a) : sort==='co2' ? (b.scope1+b.scope2+b.scope3)-(a.scope1+a.scope2+a.scope3) : b.co2_cost-a.co2_cost)
  const total = sites.reduce((s,x) => s+(x.scope1||0)+(x.scope2||0)+(x.scope3||0), 0)
  const high = sites.filter(s => priority(s).label==='High')

  const dlTemplate = () => {
    const csv = 'Factory name,Country,Industry,Production (t/y),Scope 1 (tCO2),Scope 2 (tCO2),Scope 3 (tCO2),CO2 cost (CHF/tCO2)\nKempten Plant,Germany,Dairy,3800,980,1190,390,42\nMunich Distribution,Germany,Cold storage,1200,180,420,95,38\nAugsburg Cheese,Germany,Cheese,2100,1840,760,280,51\n'
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download = 'opthemis_template.csv'; a.click()
  }

  return (
    <div>
      <div className="bc">
        <button onClick={() => nav('projects')}>Projects</button>
        <span>/</span>
        <span>{project.name}</span>
      </div>

      <div className="ph">
        <div>
          <h1>{project.name}</h1>
          <p className="ph-sub">Portfolio prioritisation · {sites.length} sites · {project.company}</p>
        </div>
        <button className="btn btn-sm" onClick={dlTemplate}>↓ Download template</button>
      </div>

      {!sites.length && (
        <div className="upload" onClick={() => fileRef.current.click()} style={{ marginBottom:'16px' }}>
          <div style={{ fontSize:'28px', marginBottom:'10px' }}>📊</div>
          <div style={{ fontSize:'13px', fontWeight:'600', marginBottom:'5px' }}>Upload your sites Excel or CSV</div>
          <div style={{ fontSize:'11px', fontFamily:'var(--mono)', color:'var(--ink-3)', marginBottom:'12px' }}>
            One row per factory · Name, Country, Scope 1, Scope 2, Scope 3, CO₂ cost
          </div>
          <button className="btn btn-primary btn-sm" style={{ pointerEvents:'none' }}>Choose file</button>
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" style={{ display:'none' }} onChange={e=>handleFile(e.target.files[0])}/>
        </div>
      )}

      {sites.length > 0 && (<>
        {/* KPIs */}
        <div className="stat-grid" style={{ gridTemplateColumns:'repeat(5,1fr)', marginBottom:'14px' }}>
          {[
            { l:'Portfolio CO₂', v:total.toLocaleString()+' t/y', c:'var(--red)' },
            { l:'Scope 1 — direct', v:sites.reduce((s,x)=>s+(x.scope1||0),0).toLocaleString()+' t', c:'var(--green-500)' },
            { l:'Scope 2 — energy', v:sites.reduce((s,x)=>s+(x.scope2||0),0).toLocaleString()+' t', c:'var(--blue)' },
            { l:'Scope 3 — chain', v:sites.reduce((s,x)=>s+(x.scope3||0),0).toLocaleString()+' t', c:'var(--amber)' },
            { l:'High priority', v:high.length+' sites', c:'var(--red)' },
          ].map(k => (
            <div key={k.l} className="stat">
              <div className="stat-val" style={{ color:k.c, fontSize:'16px' }}>{k.v}</div>
              <div className="stat-label">{k.l}</div>
            </div>
          ))}
        </div>

        {high.length > 0 && (
          <div className="warn" style={{ borderLeftColor:'var(--red)', background:'var(--red-bg)', color:'var(--red)' }}>
            Recommended start: <strong>{high[0]?.name}</strong> — {high[0]?.co2_cost} CHF/tCO₂ · highest priority score
          </div>
        )}

        {/* Sort */}
        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' }}>
          <span style={{ fontSize:'11px', fontFamily:'var(--mono)', color:'var(--ink-3)' }}>Sort:</span>
          {[['priority','Priority'],['co2','Total CO₂'],['cost','CO₂ cost/t']].map(([k,l]) => (
            <button key={k} onClick={() => setSort(k)} className="btn btn-sm" style={{ background:sort===k?'var(--green-500)':'', color:sort===k?'white':'', borderColor:sort===k?'var(--green-500)':'' }}>{l}</button>
          ))}
          <div style={{ marginLeft:'auto' }}>
            <button className="btn btn-sm" onClick={() => fileRef.current.click()}>↑ Replace file</button>
            <input ref={fileRef} type="file" accept=".csv" style={{ display:'none' }} onChange={e=>handleFile(e.target.files[0])}/>
          </div>
        </div>

        {/* Table */}
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <table className="tbl">
            <thead><tr>
              <th>Factory</th>
              <th style={{ color:'var(--green-700)' }}>Total CO₂</th>
              <th>Scope 1</th><th>Scope 2</th><th>Scope 3</th>
              <th>CO₂ cost/t</th><th>Priority</th><th></th>
            </tr></thead>
            <tbody>
              {sorted.map(s => {
                const p = priority(s)
                const tot = (s.scope1||0)+(s.scope2||0)+(s.scope3||0)
                return (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight:'500' }}>{s.name}</div>
                      <div style={{ fontSize:'11px', fontFamily:'var(--mono)', color:'var(--ink-3)' }}>{s.country} · {s.industry}</div>
                    </td>
                    <td style={{ fontFamily:'var(--mono)', fontSize:'12px', fontWeight:'600', color:'var(--red)' }}>{tot.toLocaleString()}</td>
                    <td style={{ fontFamily:'var(--mono)', fontSize:'12px' }}>{(s.scope1||0).toLocaleString()}</td>
                    <td style={{ fontFamily:'var(--mono)', fontSize:'12px' }}>{(s.scope2||0).toLocaleString()}</td>
                    <td style={{ fontFamily:'var(--mono)', fontSize:'12px' }}>{(s.scope3||0).toLocaleString()}</td>
                    <td style={{ fontFamily:'var(--mono)', fontSize:'12px', fontWeight:'600', color:s.co2_cost>40?'var(--red)':'' }}>{s.co2_cost}</td>
                    <td><span className={`badge ${p.cls}`}>{p.label}</span></td>
                    <td><button className="btn btn-primary btn-sm" onClick={() => nav('site', project, s)}>Open →</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </>)}
    </div>
  )
}
