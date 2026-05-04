import { useState } from 'react'

const DAIRY_DEFAULTS = {
  factory_name: 'Molkerei Alpenfrisch',
  industry: 'Dairy processing',
  production: 3800,
  electricity: 7200,
  steam: 2600,
  heat_temp: 85,
  cooling_kw: 1800,
  grid_co2: 350,
  elec_cost: 95,
  solid_waste: 35,
  waste_heat_pct: 48,
  wastewater: 9200,
  solvent_loss: 0,
  heat_recovery: 'Include',
  heat_pump: 'Include',
  pv_area: 300,
  biomass: 'Evaluate',
  target_year: '2025',
}

export default function Manufacturing({ nav, projectData, setProjectData }) {
  const [form, setForm] = useState(projectData.manufacturing || DAIRY_DEFAULTS)
  const upstream = projectData.procurement
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const baseline_co2 = Math.round(form.electricity * form.grid_co2 / 1000)
  const baseline_cost = Math.round(form.electricity * form.elec_cost / 1000)
  const missing = !form.cooling_kw || !form.heat_temp

  const handleSubmit = async () => {
    try {
      await fetch('/api/factory_data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stage: 'manufacturing', data: form }) })
    } catch {}
    setProjectData(d => ({ ...d, manufacturing: form }))
    nav('logistics')
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>🏭</div>
          <div>
            <h1>Manufacturing</h1>
            <p>Operations · Scope 1 + 2 · energy & process data</p>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span style={{ fontSize: '10px', fontFamily: 'var(--mono)', padding: '4px 10px', borderRadius: '20px', background: '#E1F5EE', color: 'var(--g2)' }}>
              🐄 Dairy — Molkerei Alpenfrisch
            </span>
          </div>
        </div>
      </div>

      {upstream && (
        <div className="data-note">
          ↓ Upstream: {upstream.material} from {upstream.supplier_country} · {upstream.annual_volume.toLocaleString()} t/y · {upstream.co2_cert} kg CO₂/t
        </div>
      )}

      {/* Live baseline preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
        {[
          { label: 'Baseline CO₂ (Scope 2)', val: `${baseline_co2.toLocaleString()} tCO₂/y`, color: 'var(--coral)' },
          { label: 'Electricity cost', val: `${baseline_cost.toLocaleString()} kCHF/y`, color: 'var(--amber)' },
          { label: 'Waste heat potential', val: `${Math.round(form.steam * form.waste_heat_pct / 100)} kW recoverable`, color: 'var(--g3)' },
        ].map(k => (
          <div key={k.label} style={{ background: 'var(--bg)', borderRadius: '8px', padding: '12px', border: '0.5px solid var(--border)' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: k.color }}>{k.val}</div>
            <div style={{ fontSize: '10px', fontFamily: 'var(--mono)', color: 'var(--muted)', marginTop: '2px' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {missing && (
        <div style={{ background: '#FAEEDA', border: '0.5px solid #EF9F27', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', fontFamily: 'var(--mono)', color: '#633806', marginBottom: '14px' }}>
          ⚠ Missing data detected: cooling return temperature not provided. For accurate pinch analysis, this value is recommended. Estimated impact: ±4%.
        </div>
      )}

      <div className="card">
        <div className="section-label">Factory profile</div>
        <div className="form-grid">
          <div className="field"><label>Factory name</label>
            <input type="text" value={form.factory_name} onChange={e => set('factory_name', e.target.value)}/>
          </div>
          <div className="field"><label>Industry type</label>
            <select value={form.industry} onChange={e => set('industry', e.target.value)}>
              {['Dairy processing','Cheese production','Yogurt & fermented','Ice cream','Beverage'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="field"><label>Annual production (t/y)</label>
            <input type="number" value={form.production} onChange={e => set('production', +e.target.value)}/>
          </div>
          <div className="field"><label>Target analysis year</label>
            <select value={form.target_year} onChange={e => set('target_year', e.target.value)}>
              <option>2025</option><option>2030</option><option>2035</option>
            </select>
          </div>
        </div>

        <div className="section-label">Energy & utilities</div>
        <div className="form-grid">
          <div className="field"><label>Annual electricity (MWh/y)</label>
            <input type="number" value={form.electricity} onChange={e => set('electricity', +e.target.value)}/>
          </div>
          <div className="field"><label>Steam demand — pasteurization (kW)</label>
            <input type="number" value={form.steam} onChange={e => set('steam', +e.target.value)}/>
          </div>
          <div className="field"><label>Pasteurization temp (°C)</label>
            <input type="number" value={form.heat_temp} onChange={e => set('heat_temp', +e.target.value)}/>
          </div>
          <div className="field"><label>Refrigeration demand (kW)</label>
            <input type="number" value={form.cooling_kw} onChange={e => set('cooling_kw', +e.target.value)}/>
          </div>
          <div className="field"><label>Grid CO₂ intensity (g/kWh)</label>
            <input type="number" value={form.grid_co2} onChange={e => set('grid_co2', +e.target.value)}/>
          </div>
          <div className="field"><label>Electricity cost (€/MWh)</label>
            <input type="number" value={form.elec_cost} onChange={e => set('elec_cost', +e.target.value)}/>
          </div>
        </div>

        <div className="section-label">Waste & water</div>
        <div className="form-grid">
          <div className="field"><label>Solid waste — whey, filters (t/y)</label>
            <input type="number" value={form.solid_waste} onChange={e => set('solid_waste', +e.target.value)}/>
          </div>
          <div className="field"><label>Waste heat recoverable (%)</label>
            <input type="number" value={form.waste_heat_pct} onChange={e => set('waste_heat_pct', +e.target.value)}/>
          </div>
          <div className="field"><label>Wastewater — CIP cycles (m³/y)</label>
            <input type="number" value={form.wastewater} onChange={e => set('wastewater', +e.target.value)}/>
          </div>
        </div>

        <div className="section-label">Technologies to evaluate</div>
        <div className="form-grid">
          <div className="field"><label>Heat recovery — pasteurizer</label>
            <select value={form.heat_recovery} onChange={e => set('heat_recovery', e.target.value)}>
              <option>Include</option><option>Exclude</option>
            </select>
          </div>
          <div className="field"><label>Heat pump — upgrade waste heat</label>
            <select value={form.heat_pump} onChange={e => set('heat_pump', e.target.value)}>
              <option>Include</option><option>Exclude</option>
            </select>
          </div>
          <div className="field"><label>PV solar area (m²)</label>
            <input type="number" value={form.pv_area} onChange={e => set('pv_area', +e.target.value)}/>
          </div>
          <div className="field"><label>Biogas from whey</label>
            <select value={form.biomass} onChange={e => set('biomass', e.target.value)}>
              <option>Evaluate</option><option>Include</option><option>Exclude</option>
            </select>
          </div>
        </div>

        <div className="submit-row">
          <button className="btn-secondary" onClick={() => setProjectData(d => ({ ...d, manufacturing: form }))}>Save draft</button>
          <button className="btn-primary" onClick={handleSubmit}>Submit → pass to logistics ↗</button>
        </div>
      </div>
    </div>
  )
}
