import { useState } from 'react'

const DAIRY_DEFAULTS = {
  region: 'Western Europe',
  hubs: 5,
  avg_distance: 320,
  fleet: 'Refrigerated diesel trucks',
  truck_co2: 0.138,
  load_factor: 74,
  warehouse_energy: 580,
  cold_chain: 'Yes',
  cold_temp: '2–6°C (fresh dairy)',
  returns_pct: 8,
}

export default function Logistics({ nav, projectData, setProjectData }) {
  const [form, setForm] = useState(projectData.logistics || DAIRY_DEFAULTS)
  const mfg = projectData.manufacturing
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const dist_co2 = ((mfg?.production || 3800) * form.avg_distance * form.truck_co2 / 1000).toFixed(0)
  const warehouse_co2 = (form.warehouse_energy * 0.35).toFixed(0)

  const handleSubmit = async () => {
    try {
      await fetch('/api/factory_data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stage: 'logistics', data: form }) })
    } catch {}
    setProjectData(d => ({ ...d, logistics: form }))
    nav('results')
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>🚚</div>
          <div>
            <h1>Distribution</h1>
            <p>Logistics · Scope 3 downstream · cold chain</p>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span style={{ fontSize: '10px', fontFamily: 'var(--mono)', padding: '4px 10px', borderRadius: '20px', background: '#E1F5EE', color: 'var(--g2)' }}>
              🐄 Dairy — Molkerei Alpenfrisch
            </span>
          </div>
        </div>
      </div>

      {mfg && (
        <div className="data-note">
          ↓ Product from manufacturing: {mfg.production?.toLocaleString()} t/y · {mfg.factory_name}. Cold chain required for fresh dairy.
        </div>
      )}

      {/* Live scope 3 downstream preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
        {[
          { label: 'Distribution CO₂', val: `${dist_co2} tCO₂/y`, color: 'var(--coral)' },
          { label: 'Warehousing CO₂', val: `${warehouse_co2} tCO₂/y`, color: 'var(--amber)' },
          { label: 'EV fleet potential', val: form.fleet.includes('diesel') ? '−30–45%' : 'applied ✓', color: 'var(--g3)' },
        ].map(k => (
          <div key={k.label} style={{ background: 'var(--bg)', borderRadius: '8px', padding: '12px', border: '0.5px solid var(--border)' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: k.color }}>{k.val}</div>
            <div style={{ fontSize: '10px', fontFamily: 'var(--mono)', color: 'var(--muted)', marginTop: '2px' }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="section-label">Distribution network</div>
        <div className="form-grid">
          <div className="field"><label>Market region</label>
            <select value={form.region} onChange={e => set('region', e.target.value)}>
              {['Western Europe','Central Europe','Germany only','DACH region','Global'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="field"><label>Distribution hubs</label>
            <input type="number" value={form.hubs} onChange={e => set('hubs', +e.target.value)}/>
          </div>
          <div className="field"><label>Avg. delivery distance (km)</label>
            <input type="number" value={form.avg_distance} onChange={e => set('avg_distance', +e.target.value)}/>
          </div>
          <div className="field"><label>Fleet type</label>
            <select value={form.fleet} onChange={e => set('fleet', e.target.value)}>
              {['Refrigerated diesel trucks','Mixed (diesel + electric)','Full electric fleet','Rail + last mile'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div className="section-label">Cold chain specifics</div>
        <div className="form-grid">
          <div className="field"><label>Cold chain required</label>
            <select value={form.cold_chain} onChange={e => set('cold_chain', e.target.value)}>
              <option>Yes</option><option>No</option>
            </select>
          </div>
          <div className="field"><label>Temperature range</label>
            <select value={form.cold_temp} onChange={e => set('cold_temp', e.target.value)}>
              {['2–6°C (fresh dairy)','−18°C (frozen)','−2°C (chilled)','Ambient'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="field"><label>Returns / expired (% of volume)</label>
            <input type="number" value={form.returns_pct} onChange={e => set('returns_pct', +e.target.value)}/>
          </div>
        </div>

        <div className="section-label">Emissions factors</div>
        <div className="form-grid">
          <div className="field"><label>Truck CO₂ (kg/t·km) — refrigerated</label>
            <input type="number" step="0.001" value={form.truck_co2} onChange={e => set('truck_co2', +e.target.value)}/>
          </div>
          <div className="field"><label>Average load factor (%)</label>
            <input type="number" value={form.load_factor} onChange={e => set('load_factor', +e.target.value)}/>
          </div>
          <div className="field"><label>Cold storage energy (MWh/y)</label>
            <input type="number" value={form.warehouse_energy} onChange={e => set('warehouse_energy', +e.target.value)}/>
          </div>
        </div>

        {/* AnyLogic */}
        <div style={{ marginTop: '16px', border: '0.5px dashed var(--border2)', borderRadius: '8px', padding: '14px', background: 'var(--bg)', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', background: 'var(--g0)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: '#5DCAA5', fontFamily: 'var(--mono)', flexShrink: 0 }}>AL</div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
              <span style={{ width: '7px', height: '7px', background: '#5DCAA5', borderRadius: '50%', display: 'inline-block', marginRight: '5px' }}/>
              AnyLogic cold chain simulation
            </div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--muted)', lineHeight: 1.6 }}>
              Distribution data exports to your AnyLogic model to simulate route optimization, cold chain CO₂ per delivery, and fleet utilization. Results flow back into the dashboard.
            </div>
          </div>
        </div>

        <div className="submit-row">
          <button className="btn-secondary" onClick={() => setProjectData(d => ({ ...d, logistics: form }))}>Save draft</button>
          <button className="btn-primary" onClick={handleSubmit}>Submit → close the loop ↗</button>
        </div>
      </div>
    </div>
  )
}
