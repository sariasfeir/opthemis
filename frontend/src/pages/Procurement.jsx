import { useState } from 'react'

const DAIRY_DEFAULTS = {
  material: 'Fresh whole milk',
  supplier_country: 'Germany (local farms)',
  annual_volume: 18500,
  co2_cert: 0.9,
  transport_mode: 'Road (refrigerated truck)',
  distance: 45,
  load_factor: 88,
  return_empty: 'No (backhaul)',
  bio_alt: 'Yes — organic milk option',
  bio_alt_co2: 0.7,
  packaging_material: 'Mixed (plastic + cardboard)',
  packaging_supplier: 'Germany',
  packaging_volume: 420,
  packaging_co2: 1.8,
}

export default function Procurement({ nav, projectData, setProjectData }) {
  const [form, setForm] = useState(projectData.procurement || DAIRY_DEFAULTS)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const scope3_transport = ((form.annual_volume * form.distance * 0.096) / 1000).toFixed(1)
  const scope3_material = ((form.annual_volume * form.co2_cert) / 1000).toFixed(1)

  const handleSubmit = async () => {
    try {
      await fetch('/api/factory_data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stage: 'procurement', data: form }) })
    } catch {}
    setProjectData(d => ({ ...d, procurement: form }))
    nav('manufacturing')
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>🌱</div>
          <div>
            <h1>Raw materials</h1>
            <p>Procurement · Scope 3 upstream emissions</p>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span style={{ fontSize: '10px', fontFamily: 'var(--mono)', padding: '4px 10px', borderRadius: '20px', background: '#E1F5EE', color: 'var(--g2)' }}>
              🐄 Dairy — Molkerei Alpenfrisch
            </span>
          </div>
        </div>
      </div>

      {/* Live scope 3 preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
        {[
          { label: 'Transport CO₂ (est.)', val: `${scope3_transport} tCO₂/y`, color: 'var(--amber)' },
          { label: 'Material CO₂ (est.)', val: `${scope3_material} tCO₂/y`, color: 'var(--coral)' },
          { label: 'Bio-alt potential', val: form.bio_alt.startsWith('Yes') ? `−${((form.annual_volume * (form.co2_cert - form.bio_alt_co2))/1000).toFixed(1)} tCO₂/y` : '—', color: 'var(--g3)' },
        ].map(k => (
          <div key={k.label} style={{ background: 'var(--bg)', borderRadius: '8px', padding: '12px', border: '0.5px solid var(--border)' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: k.color }}>{k.val}</div>
            <div style={{ fontSize: '10px', fontFamily: 'var(--mono)', color: 'var(--muted)', marginTop: '2px' }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="section-label">Primary input — raw milk</div>
        <div className="form-grid">
          <div className="field"><label>Material</label>
            <select value={form.material} onChange={e => set('material', e.target.value)}>
              {['Fresh whole milk','Skimmed milk','Cream','Whey'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="field"><label>Supplier region</label>
            <select value={form.supplier_country} onChange={e => set('supplier_country', e.target.value)}>
              {['Germany (local farms)','France','Netherlands','Switzerland','Austria'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="field"><label>Annual volume (t/y)</label>
            <input type="number" value={form.annual_volume} onChange={e => set('annual_volume', +e.target.value)}/>
          </div>
          <div className="field"><label>Supplier CO₂ cert (kg CO₂/t)</label>
            <input type="number" step="0.1" value={form.co2_cert} onChange={e => set('co2_cert', +e.target.value)}/>
          </div>
        </div>

        <div className="section-label">Milk collection transport</div>
        <div className="form-grid">
          <div className="field"><label>Transport mode</label>
            <select value={form.transport_mode} onChange={e => set('transport_mode', e.target.value)}>
              {['Road (refrigerated truck)','Road (diesel truck)','Rail'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="field"><label>Average farm distance (km)</label>
            <input type="number" value={form.distance} onChange={e => set('distance', +e.target.value)}/>
          </div>
          <div className="field"><label>Load factor (%)</label>
            <input type="number" value={form.load_factor} onChange={e => set('load_factor', +e.target.value)}/>
          </div>
          <div className="field"><label>Return trip</label>
            <select value={form.return_empty} onChange={e => set('return_empty', e.target.value)}>
              <option>No (backhaul)</option><option>Yes (empty)</option>
            </select>
          </div>
        </div>

        <div className="section-label">Packaging materials</div>
        <div className="form-grid">
          <div className="field"><label>Packaging type</label>
            <select value={form.packaging_material} onChange={e => set('packaging_material', e.target.value)}>
              {['Mixed (plastic + cardboard)','Glass bottles','Tetra Pak','Bio-based packaging'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="field"><label>Annual packaging (t/y)</label>
            <input type="number" value={form.packaging_volume} onChange={e => set('packaging_volume', +e.target.value)}/>
          </div>
          <div className="field"><label>Packaging CO₂ (kg CO₂/t)</label>
            <input type="number" step="0.1" value={form.packaging_co2} onChange={e => set('packaging_co2', +e.target.value)}/>
          </div>
        </div>

        <div className="section-label">Bio-alternative options</div>
        <div className="form-grid">
          <div className="field"><label>Sustainable sourcing option</label>
            <select value={form.bio_alt} onChange={e => set('bio_alt', e.target.value)}>
              {['Yes — organic milk option','Yes — regional certified farms','No'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="field"><label>Bio-alt CO₂ factor (kg/t)</label>
            <input type="number" step="0.1" value={form.bio_alt_co2} onChange={e => set('bio_alt_co2', +e.target.value)}/>
          </div>
        </div>

        <div className="submit-row">
          <button className="btn-secondary" onClick={() => setProjectData(d => ({ ...d, procurement: form }))}>Save draft</button>
          <button className="btn-primary" onClick={handleSubmit}>Submit → pass to manufacturing ↗</button>
        </div>
      </div>
    </div>
  )
}
