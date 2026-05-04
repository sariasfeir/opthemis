import { useState } from 'react'

// Molkerei Alpenfrisch — Kempten Plant
// All quantities in kg/year
const DEMO = [
  { id:'m1', name:'Fresh whole milk',        supplier:'Regional farms', country:'Germany', category:'Primary input', qty_year:18500000, cost_unit:0.42, co2_unit:0.9  },
  { id:'m2', name:'Skimmed milk powder',     supplier:'Arla Foods',    country:'Denmark',  category:'Primary input', qty_year:320000,  cost_unit:2.10, co2_unit:3.2  },
  { id:'m3', name:'Cream',                   supplier:'Regional farms', country:'Germany', category:'Primary input', qty_year:480000,  cost_unit:1.80, co2_unit:1.1  },
  { id:'m4', name:'Lactobacillus cultures',  supplier:'Chr. Hansen',   country:'Denmark',  category:'Additive',      qty_year:4200,   cost_unit:85.0, co2_unit:12.0 },
  { id:'m5', name:'Stabilisers (E440)',      supplier:'Cargill',       country:'Germany',  category:'Additive',      qty_year:18000,  cost_unit:3.40, co2_unit:2.8  },
  { id:'m6', name:'HDPE packaging (bottle)', supplier:'Greiner Packaging', country:'Austria', category:'Packaging',  qty_year:420000, cost_unit:1.95, co2_unit:1.8  },
  { id:'m7', name:'Cardboard secondary',     supplier:'DS Smith',      country:'Germany',  category:'Packaging',     qty_year:85000,  cost_unit:0.95, co2_unit:0.7  },
  { id:'m8', name:'Cleaning agents (NaOH)',  supplier:'Brenntag',      country:'Germany',  category:'Cleaning (CIP)', qty_year:24000, cost_unit:0.55, co2_unit:1.4  },
]

export default function Procurement({ site, onBack, onSave, saved }) {
  const [materials, setMaterials] = useState(saved?.materials || DEMO)
  const [adding, setAdding] = useState(false)
  const [newRow, setNewRow] = useState({ name:'', supplier:'', country:'Germany', unit:'kg', qty_year:'', cost_unit:'', co2_unit:'', category:'' })
  const setN = (k,v) => setNewRow(r => ({...r,[k]:v}))

  const addMaterial = () => {
    if (!newRow.name) return
    setMaterials(m => [...m, { ...newRow, id:'m'+Date.now(), qty_year:+newRow.qty_year, cost_unit:+newRow.cost_unit, co2_unit:+newRow.co2_unit }])
    setNewRow({ name:'', supplier:'', country:'Germany', unit:'kg', qty_year:'', cost_unit:'', co2_unit:'', category:'' })
    setAdding(false)
  }

  const del = id => setMaterials(m => m.filter(x => x.id !== id))

  const totalCO2_t = materials.reduce((s,m) => s + (m.qty_year||0)*(m.co2_unit||0)/1000, 0)
  const totalCost_k = materials.reduce((s,m) => s + (m.qty_year||0)*(m.cost_unit||0)/1000, 0)
  const CATS = [...new Set(materials.map(m => m.category).filter(Boolean))]

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
          <p className="ph-sub">Procurement · Scope 3 upstream · quantities in kg/year</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setAdding(true)}>+ Add material</button>
      </div>

      <div className="note">
        List every raw material purchased by this plant. Ask suppliers for their CO₂ certificate (kg CO₂ per kg product). Quantities are annual — kg/year or litres/year.
      </div>

      {/* KPIs */}
      <div className="stat-grid" style={{ marginBottom:'14px' }}>
        <div className="stat"><div className="stat-val" style={{ color:'var(--red)', fontSize:'16px' }}>{totalCO2_t.toFixed(0)} tCO₂/y</div><div className="stat-label">Upstream CO₂</div></div>
        <div className="stat"><div className="stat-val" style={{ color:'var(--amber)', fontSize:'16px' }}>CHF {totalCost_k.toFixed(0)}k</div><div className="stat-label">Material cost / year</div></div>
        <div className="stat"><div className="stat-val" style={{ fontSize:'16px' }}>{materials.length}</div><div className="stat-label">Materials tracked</div></div>
        <div className="stat"><div className="stat-val" style={{ fontSize:'16px' }}>{CATS.length}</div><div className="stat-label">Categories</div></div>
      </div>

      {/* Add row */}
      {adding && (
        <div className="card" style={{ marginBottom:'12px', borderColor:'var(--green-400)' }}>
          <h3 style={{ marginBottom:'10px' }}>Add material</h3>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 1fr 1fr', gap:'8px', marginBottom:'10px' }}>
            <div className="field"><label>Material name</label><input placeholder="Fresh milk" value={newRow.name} onChange={e=>setN('name',e.target.value)}/></div>
            <div className="field"><label>Supplier</label><input placeholder="Arla" value={newRow.supplier} onChange={e=>setN('supplier',e.target.value)}/></div>
            <div className="field"><label>Country</label><input placeholder="DE" value={newRow.country} onChange={e=>setN('country',e.target.value)}/></div>
            <div className="field"><label>Category</label><input placeholder="Primary input" value={newRow.category} onChange={e=>setN('category',e.target.value)}/></div>
            <div className="field"><label>Qty / year (kg)</label><input type="number" value={newRow.qty_year} onChange={e=>setN('qty_year',e.target.value)}/></div>
            <div className="field"><label>Cost CHF/kg</label><input type="number" step="0.01" value={newRow.cost_unit} onChange={e=>setN('cost_unit',e.target.value)}/></div>
            <div className="field"><label>CO₂ kg/kg</label><input type="number" step="0.01" value={newRow.co2_unit} onChange={e=>setN('co2_unit',e.target.value)}/></div>
          </div>
          <div style={{ display:'flex', gap:'6px' }}>
            <button className="btn btn-sm" onClick={() => setAdding(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={addMaterial}>Add →</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <table className="tbl">
          <thead><tr>
            <th>Material</th>
            <th>Supplier</th>
            <th>Category</th>
            <th>Qty (t/y)</th>
            <th>Cost CHF/kg</th>
            <th>CO₂ kg/kg</th>
            <th style={{ color:'var(--red)' }}>CO₂ tCO₂/y</th>
            <th style={{ color:'var(--amber)' }}>Cost kCHF/y</th>
            <th></th>
          </tr></thead>
          <tbody>
            {materials.map(m => {
              const co2y = ((m.qty_year||0)*(m.co2_unit||0)/1000)
              const costy = ((m.qty_year||0)*(m.cost_unit||0)/1000)
              const pct = totalCO2_t > 0 ? co2y/totalCO2_t*100 : 0
              return (
                <tr key={m.id}>
                  <td style={{ fontWeight:'500' }}>{m.name}</td>
                  <td style={{ fontSize:'11px', color:'var(--ink-3)' }}>{m.supplier} · {m.country}</td>
                  <td><span className="badge badge-gray">{m.category}</span></td>
                  <td style={{ fontFamily:'var(--mono)', fontSize:'12px' }}>{((m.qty_year||0)/1000).toFixed(0)}</td>
                  <td style={{ fontFamily:'var(--mono)', fontSize:'12px' }}>{m.cost_unit}</td>
                  <td style={{ fontFamily:'var(--mono)', fontSize:'12px' }}>{m.co2_unit}</td>
                  <td>
                    <div style={{ fontFamily:'var(--mono)', fontSize:'12px', fontWeight:'600', color:'var(--red)' }}>{co2y.toFixed(0)}</div>
                    <div style={{ height:3, background:'var(--border)', borderRadius:1, marginTop:3, overflow:'hidden', width:60 }}>
                      <div style={{ height:'100%', width:Math.min(pct,100)+'%', background:'var(--red)', borderRadius:1 }}/>
                    </div>
                  </td>
                  <td style={{ fontFamily:'var(--mono)', fontSize:'12px', color:'var(--amber)' }}>{costy.toFixed(0)}</td>
                  <td>
                    <button onClick={() => del(m.id)} style={{ background:'none', border:'none', color:'var(--ink-4)', cursor:'pointer', fontSize:'14px', padding:'0 4px' }}>×</button>
                  </td>
                </tr>
              )
            })}
            {/* Total row */}
            <tr style={{ background:'var(--bg)', fontWeight:'600' }}>
              <td colSpan={6} style={{ fontSize:'12px' }}>Total</td>
              <td style={{ fontFamily:'var(--mono)', fontSize:'12px', color:'var(--red)', fontWeight:'700' }}>{totalCO2_t.toFixed(0)} tCO₂/y</td>
              <td style={{ fontFamily:'var(--mono)', fontSize:'12px', color:'var(--amber)', fontWeight:'700' }}>CHF {totalCost_k.toFixed(0)}k</td>
              <td/>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ display:'flex', gap:'8px', marginTop:'14px' }}>
        <button className="btn" onClick={onBack}>← Back</button>
        <button className="btn btn-primary" onClick={() => onSave({ materials, totalCO2_t, totalCost_k })}>
          Save →
        </button>
      </div>
    </div>
  )
}
