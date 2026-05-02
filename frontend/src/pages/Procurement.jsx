import { useState } from 'react'

export default function Procurement({ nav, projectData, setProjectData }) {
  const saved = projectData.procurement
  const [form, setForm] = useState(saved || {
    material: 'Polymers (PE/PP)', supplier_country: 'Thailand',
    annual_volume: 1240, co2_cert: 2.8,
    transport_mode: 'Road (diesel truck)', distance: 320,
    load_factor: 78, return_empty: 'Yes',
    bio_alt: 'Yes — local biomass', bio_alt_co2: 0.4,
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    try {
      await fetch('/api/factory_data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 'procurement', data: form }),
      })
    } catch (e) { /* offline fallback */ }
    setProjectData(d => ({ ...d, procurement: form }))
    nav('manufacturing')
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🌱</div>
          <div>
            <h1>Raw materials input</h1>
            <p>Procurement · Scope 3 upstream emissions</p>
          </div>
        </div>
      </div>

      <div className="data-note">
        ↓ This data becomes the upstream input for manufacturing's energy model and Scope 3 tracking.
      </div>

      <div className="card">
        <div className="section-label">Supplier & material data</div>
        <div className="form-grid">
          <div className="field">
            <label>Primary raw material</label>
            <select value={form.material} onChange={e => set('material', e.target.value)}>
              {['Polymers (PE/PP)', 'Epoxy resins', 'Silicone base', 'Solvents', 'Bio-based alternative'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Supplier country</label>
            <select value={form.supplier_country} onChange={e => set('supplier_country', e.target.value)}>
              {['Thailand', 'China', 'Germany', 'Japan', 'Local (≤50km)'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Annual volume (t/y)</label>
            <input type="number" value={form.annual_volume} onChange={e => set('annual_volume', e.target.value)} />
          </div>
          <div className="field">
            <label>Supplier CO₂ cert (kg CO₂/t)</label>
            <input type="number" step="0.1" value={form.co2_cert} onChange={e => set('co2_cert', e.target.value)} />
          </div>
        </div>

        <div className="section-label">Transport to factory</div>
        <div className="form-grid">
          <div className="field">
            <label>Transport mode</label>
            <select value={form.transport_mode} onChange={e => set('transport_mode', e.target.value)}>
              {['Road (diesel truck)', 'Sea freight', 'Rail', 'Air (urgent)'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Distance (km)</label>
            <input type="number" value={form.distance} onChange={e => set('distance', e.target.value)} />
          </div>
          <div className="field">
            <label>Load factor (%)</label>
            <input type="number" value={form.load_factor} onChange={e => set('load_factor', e.target.value)} />
          </div>
          <div className="field">
            <label>Return trip empty?</label>
            <select value={form.return_empty} onChange={e => set('return_empty', e.target.value)}>
              <option>Yes</option><option>No (backhaul)</option>
            </select>
          </div>
        </div>

        <div className="section-label">Bio-alternative options</div>
        <div className="form-grid">
          <div className="field">
            <label>Bio-alt available?</label>
            <select value={form.bio_alt} onChange={e => set('bio_alt', e.target.value)}>
              {['Yes — local biomass', 'Yes — imported', 'No'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Bio-alt CO₂ factor (kg/t)</label>
            <input type="number" step="0.1" value={form.bio_alt_co2} onChange={e => set('bio_alt_co2', e.target.value)} />
          </div>
        </div>

        <div className="submit-row">
          <button className="btn-secondary" onClick={() => setProjectData(d => ({ ...d, procurement: form }))}>
            Save draft
          </button>
          <button className="btn-primary" onClick={handleSubmit}>
            Submit → pass to manufacturing ↗
          </button>
        </div>
      </div>
    </div>
  )
}
