import { useState } from 'react'

export default function Logistics({ nav, projectData, setProjectData }) {
  const saved = projectData.logistics
  const mfg = projectData.manufacturing
  const [form, setForm] = useState(saved || {
    region: 'Southeast Asia', hubs: 4, avg_distance: 850,
    fleet: 'Diesel trucks', truck_co2: 0.096,
    load_factor: 71, warehouse_energy: 220, cold_chain: 'No',
    anylogic_export: false,
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    try {
      await fetch('/api/factory_data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 'logistics', data: form }),
      })
    } catch (e) { /* offline fallback */ }
    setProjectData(d => ({ ...d, logistics: form }))
    nav('results')
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🚚</div>
          <div>
            <h1>Distribution input</h1>
            <p>Logistics · Scope 3 downstream + AnyLogic interface</p>
          </div>
        </div>
      </div>

      {mfg && (
        <div className="data-note">
          ↓ Product data received from manufacturing: {mfg.production} t/y. Enter outbound distribution data below.
        </div>
      )}

      <div className="card">
        <div className="section-label">Distribution network</div>
        <div className="form-grid">
          <div className="field">
            <label>Primary market region</label>
            <select value={form.region} onChange={e => set('region', e.target.value)}>
              {['Southeast Asia', 'East Asia', 'Europe', 'Global'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="field">
            <label>No. of distribution hubs</label>
            <input type="number" value={form.hubs} onChange={e => set('hubs', e.target.value)} />
          </div>
          <div className="field">
            <label>Avg. delivery distance (km)</label>
            <input type="number" value={form.avg_distance} onChange={e => set('avg_distance', e.target.value)} />
          </div>
          <div className="field">
            <label>Fleet type</label>
            <select value={form.fleet} onChange={e => set('fleet', e.target.value)}>
              {['Diesel trucks', 'Mixed (diesel + EV)', 'Full EV', 'Rail + last mile'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div className="section-label">Emissions factors</div>
        <div className="form-grid">
          <div className="field">
            <label>Truck CO₂ (kg/t·km)</label>
            <input type="number" step="0.001" value={form.truck_co2} onChange={e => set('truck_co2', e.target.value)} />
          </div>
          <div className="field">
            <label>Average load factor (%)</label>
            <input type="number" value={form.load_factor} onChange={e => set('load_factor', e.target.value)} />
          </div>
          <div className="field">
            <label>Warehousing energy (MWh/y)</label>
            <input type="number" value={form.warehouse_energy} onChange={e => set('warehouse_energy', e.target.value)} />
          </div>
          <div className="field">
            <label>Cold chain required?</label>
            <select value={form.cold_chain} onChange={e => set('cold_chain', e.target.value)}>
              <option>No</option><option>Yes</option>
            </select>
          </div>
        </div>

        {/* AnyLogic box */}
        <div style={{ marginTop: '16px', border: '0.5px dashed var(--border2)', borderRadius: 'var(--radius)', padding: '14px', background: 'var(--bg)', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', background: 'var(--g0)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: '#5DCAA5', fontFamily: 'var(--mono)', flexShrink: 0 }}>AL</div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
              <span style={{ width: '7px', height: '7px', background: '#5DCAA5', borderRadius: '50%', display: 'inline-block', marginRight: '5px' }} />
              AnyLogic interface
            </div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--muted)', lineHeight: 1.6 }}>
              Distribution data will be exported to your AnyLogic logistics model. Simulation results (optimal routes, fleet utilization, CO₂ per shipment) flow back into the OpThemis results dashboard.
            </div>
            <button
              className="btn-secondary"
              style={{ marginTop: '10px', fontSize: '11px', padding: '6px 12px' }}
              onClick={() => alert('AnyLogic export — connect your AnyLogic workspace URL in settings.')}
            >
              Export to AnyLogic →
            </button>
          </div>
        </div>

        <div className="submit-row">
          <button className="btn-secondary" onClick={() => setProjectData(d => ({ ...d, logistics: form }))}>
            Save draft
          </button>
          <button className="btn-primary" onClick={handleSubmit}>
            Submit → close the loop ↗
          </button>
        </div>
      </div>
    </div>
  )
}
