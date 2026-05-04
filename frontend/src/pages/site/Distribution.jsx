import { useState } from 'react'

export default function Distribution({ site, onBack, onSave, saved }) {
  const [form, setForm] = useState(saved?.form || {
    region:'Western Europe', hubs:4, avg_distance:320,
    fleet:'Diesel trucks', truck_co2:0.096, load_factor:74,
    warehouse_energy:220, cold_chain:false,
  })
  const set = (k,v) => setForm(f => ({...f,[k]:v}))
  const dist_co2 = ((site.production||3800) * form.avg_distance * form.truck_co2 / 1000).toFixed(0)

  return (
    <div>
      <div className="bc">
        <button onClick={onBack}>← {site.name}</button>
        <span>/</span>
        <span>Distribution</span>
      </div>
      <div className="ph">
        <h1>Distribution</h1>
        <p className="ph-sub">Scope 3 downstream · logistics CO₂</p>
      </div>
      <div className="stat-grid" style={{ marginBottom:'14px' }}>
        <div className="stat"><div className="stat-val" style={{ color:'var(--red)', fontSize:'16px' }}>{dist_co2} tCO₂/y</div><div className="stat-label">Distribution CO₂</div></div>
        <div className="stat"><div className="stat-val" style={{ fontSize:'16px' }}>{form.hubs}</div><div className="stat-label">Distribution hubs</div></div>
      </div>
      <div className="card">
        <div className="form-section">Network</div>
        <div className="form-grid">
          <div className="field"><label>Region</label><select value={form.region} onChange={e=>set('region',e.target.value)}><option>Western Europe</option><option>Germany only</option><option>DACH</option><option>Global</option></select></div>
          <div className="field"><label>Distribution hubs</label><input type="number" value={form.hubs} onChange={e=>set('hubs',+e.target.value)}/></div>
          <div className="field"><label>Avg delivery distance (km)</label><input type="number" value={form.avg_distance} onChange={e=>set('avg_distance',+e.target.value)}/></div>
          <div className="field"><label>Fleet</label><select value={form.fleet} onChange={e=>set('fleet',e.target.value)}><option>Diesel trucks</option><option>Mixed diesel + EV</option><option>Full EV</option><option>Rail + last mile</option></select></div>
        </div>
        <div className="form-section">Emissions</div>
        <div className="form-grid">
          <div className="field"><label>Truck CO₂ (kg/t·km)</label><input type="number" step="0.001" value={form.truck_co2} onChange={e=>set('truck_co2',+e.target.value)}/></div>
          <div className="field"><label>Load factor (%)</label><input type="number" value={form.load_factor} onChange={e=>set('load_factor',+e.target.value)}/></div>
          <div className="field"><label>Warehouse energy (MWh/y)</label><input type="number" value={form.warehouse_energy} onChange={e=>set('warehouse_energy',+e.target.value)}/></div>
        </div>
        <div className="submit-row">
          <button className="btn" onClick={onBack}>← Back</button>
          <button className="btn btn-primary" onClick={() => onSave({ form, dist_co2 })}>Save →</button>
        </div>
      </div>
    </div>
  )
}
