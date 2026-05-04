import { useState } from 'react'

const DEMO_MATERIALS = [
  { id:'m1', name:'Carbon Black #300IHB', supplier:'Cabot Corp', country:'USA', unit:'kg', qty:180, cost_unit:2.80, co2_unit:2.4, category:'Filler' },
  { id:'m2', name:'Calcium CALOFIL 100', supplier:'Omya AG', country:'Switzerland', unit:'kg', qty:320, cost_unit:0.45, co2_unit:0.12, category:'Filler' },
  { id:'m3', name:'DINP Plasticizer', supplier:'BASF', country:'Germany', unit:'kg', qty:160, cost_unit:1.20, co2_unit:1.8, category:'Plasticizer' },
  { id:'m4', name:'Genix GA5000', supplier:'Momentive', country:'Germany', unit:'kg', qty:95, cost_unit:4.50, co2_unit:3.2, category:'Polymer' },
  { id:'m5', name:'MDI Isocyanate', supplier:'Covestro', country:'Germany', unit:'kg', qty:80, cost_unit:3.20, co2_unit:4.1, category:'Crosslinker' },
  { id:'m6', name:'DMDEE Catalyst', supplier:'Huntsman', country:'USA', unit:'kg', qty:12, cost_unit:18.50, co2_unit:6.5, category:'Catalyst' },
]

export default function Procurement({ site, onBack, onSave, saved }) {
  const [materials, setMaterials] = useState(saved?.materials || DEMO_MATERIALS)
  const [adding, setAdding] = useState(false)
  const [newRow, setNewRow] = useState({ name:'', supplier:'', country:'', unit:'kg', qty:'', cost_unit:'', co2_unit:'', category:'' })
  const setN = (k,v) => setNewRow(r => ({...r, [k]:v}))

  const addMaterial = () => {
    if (!newRow.name) return
    setMaterials(m => [...m, { ...newRow, id:'m'+Date.now(), qty:+newRow.qty, cost_unit:+newRow.cost_unit, co2_unit:+newRow.co2_unit }])
    setNewRow({ name:'', supplier:'', country:'', unit:'kg', qty:'', cost_unit:'', co2_unit:'', category:'' })
    setAdding(false)
  }

  const del = id => setMaterials(m => m.filter(x => x.id !== id))

  const totalCO2 = materials.reduce((s,m) => s + (m.qty||0)*(m.co2_unit||0), 0)
  const totalCost = materials.reduce((s,m) => s + (m.qty||0)*(m.cost_unit||0), 0)

  const CATEGORIES = [...new Set(materials.map(m => m.category).filter(Boolean))]

  return (
    <div>
      <div className="bc">
        <button onClick={onBack}>← {site.name}</button>
        <span>/</span>
        <span>Raw Materials</span>
      </div>

      <div className="ph">
        <div>
          <h1>Raw materials</h1>
          <p className="ph-sub">Procurement · Scope 3 upstream · one entry per material purchased</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setAdding(true)}>+ Add material</button>
      </div>

      <div className="note">
        Enter each raw material your factory buys. Ask suppliers for their product CO₂ certificate (kg CO₂ per kg product). If unavailable, use industry averages from Ecoinvent.
      </div>

      {/* Summary KPIs */}
      <div className="stat-grid" style={{ marginBottom:'14px' }}>
        <div className="stat"><div className="stat-val" style={{ color:'var(--red)', fontSize:'16px' }}>{totalCO2.toFixed(0)} kg CO₂</div><div className="stat-label">CO₂ per batch</div></div>
        <div className="stat"><div className="stat-val" style={{ color:'var(--amber)', fontSize:'16px' }}>CHF {totalCost.toFixed(0)}</div><div className="stat-label">Material cost / batch</div></div>
        <div className="stat"><div className="stat-val" style={{ fontSize:'16px' }}>{materials.length}</div><div className="stat-label">Materials tracked</div></div>
        <div className="stat"><div className="stat-val" style={{ fontSize:'16px' }}>{CATEGORIES.length}</div><div className="stat-label">Categories</div></div>
      </div>

      {/* Add form */}
      {adding && (
        <div className="card" style={{ marginBottom:'12px', borderColor:'var(--green-400)' }}>
          <h3 style={{ marginBottom:'10px' }}>Add material</h3>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 1fr 1fr', gap:'8px', marginBottom:'10px' }}>
            <div className="field"><label>Material name</label><input placeholder="Carbon Black #300" value={newRow.name} onChange={e=>setN('name',e.target.value)}/></div>
            <div className="field"><label>Supplier</label><input placeholder="BASF" value={newRow.supplier} onChange={e=>setN('supplier',e.target.value)}/></div>
            <div className="field"><label>Country</label><input placeholder="DE" value={newRow.country} onChange={e=>setN('country',e.target.value)}/></div>
            <div className="field"><label>Category</label><input placeholder="Filler" value={newRow.category} onChange={e=>setN('category',e.target.value)}/></div>
            <div className="field"><label>Qty/batch (kg)</label><input type="number" value={newRow.qty} onChange={e=>setN('qty',e.target.value)}/></div>
            <div className="field"><label>Cost CHF/kg</label><input type="number" step="0.01" value={newRow.cost_unit} onChange={e=>setN('cost_unit',e.target.value)}/></div>
            <div className="field"><label>CO₂ kg/kg</label><input type="number" step="0.01" value={newRow.co2_unit} onChange={e=>setN('co2_unit',e.target.value)}/></div>
          </div>
          <div style={{ display:'flex', gap:'6px' }}>
            <button className="btn btn-sm" onClick={() => setAdding(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={addMaterial}>Add →</button>
          </div>
        </div>
      )}

      {/* Materials table grouped by category */}
      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <table className="tbl">
          <thead><tr>
            <th>Material</th><th>Supplier</th><th>Category</th>
            <th>Qty / batch</th><th>Cost CHF/kg</th><th>CO₂ kg/kg</th>
            <th style={{ color:'var(--red)' }}>CO₂ total</th>
            <th style={{ color:'var(--amber)' }}>Cost total</th>
            <th></th>
          </tr></thead>
          <tbody>
            {materials.map(m => {
              const co2total = ((m.qty||0)*(m.co2_unit||0)).toFixed(1)
              const costtotal = ((m.qty||0)*(m.cost_unit||0)).toFixed(0)
              const co2pct = totalCO2 > 0 ? ((m.qty||0)*(m.co2_unit||0))/totalCO2*100 : 0
              return (
                <tr key={m.id}>
                  <td style={{ fontWeight:'500' }}>{m.name}</td>
                  <td style={{ fontSize:'11px', color:'var(--ink-3)' }}>{m.supplier} · {m.country}</td>
                  <td><span className="badge badge-gray" style={{ fontSize:'10px' }}>{m.category}</span></td>
                  <td style={{ fontFamily:'var(--mono)', fontSize:'12px' }}>{m.qty} kg</td>
                  <td style={{ fontFamily:'var(--mono)', fontSize:'12px' }}>{m.cost_unit}</td>
                  <td style={{ fontFamily:'var(--mono)', fontSize:'12px' }}>{m.co2_unit}</td>
                  <td>
                    <div style={{ fontFamily:'var(--mono)', fontSize:'12px', color:'var(--red)', fontWeight:'600' }}>{co2total} kg</div>
                    <div style={{ height:3, background:'var(--border)', borderRadius:1, marginTop:3, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:co2pct+'%', background:'var(--red)', borderRadius:1 }}/>
                    </div>
                  </td>
                  <td style={{ fontFamily:'var(--mono)', fontSize:'12px', color:'var(--amber)' }}>CHF {costtotal}</td>
                  <td><button onClick={() => del(m.id)} style={{ background:'none', border:'none', color:'var(--ink-4)', cursor:'pointer', fontSize:'14px' }}>×</button></td>
                </tr>
              )
            })}
            <tr style={{ background:'var(--bg)' }}>
              <td colSpan={6} style={{ fontWeight:'600', fontSize:'12px' }}>Total per batch</td>
              <td style={{ fontFamily:'var(--mono)', fontSize:'12px', fontWeight:'700', color:'var(--red)' }}>{totalCO2.toFixed(0)} kg CO₂</td>
              <td style={{ fontFamily:'var(--mono)', fontSize:'12px', fontWeight:'700', color:'var(--amber)' }}>CHF {totalCost.toFixed(0)}</td>
              <td/>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ display:'flex', gap:'8px', marginTop:'14px' }}>
        <button className="btn" onClick={onBack}>← Back to site</button>
        <button className="btn btn-primary" onClick={() => onSave({ materials, totalCO2, totalCost })}>Save & continue to manufacturing →</button>
      </div>
    </div>
  )
}
