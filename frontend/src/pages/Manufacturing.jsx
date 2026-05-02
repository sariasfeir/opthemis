import { useState } from 'react'

export default function Manufacturing({ nav, projectData, setProjectData }) {
  const saved = projectData.manufacturing
  const upstream = projectData.procurement
  const [form, setForm] = useState(saved || {
    production: 4814, electricity: 1620, steam: 180, heat_temp: 65,
    solid_waste: 42, waste_heat_pct: 28, wastewater: 1100, solvent_loss: 3.2,
    heat_recovery: 'Include', heat_pump: 'Include', pv_area: 250, biomass: 'Evaluate',
    grid_co2: 437, elec_cost: 85, target_year: '2025',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    try {
      await fetch('/api/factory_data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 'manufacturing', data: form }),
      })
    } catch (e) { /* offline fallback */ }
    setProjectData(d => ({ ...d, manufacturing: form }))
    nav('logistics')
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🏭</div>
          <div>
            <h1>Manufacturing input</h1>
            <p>Operations · Scope 1 + 2 energy & waste flows</p>
          </div>
        </div>
      </div>

      {upstream && (
        <div className="data-note">
          ↓ Upstream data received from procurement: {upstream.material} ({upstream.supplier_country}, {upstream.annual_volume} t/y, {upstream.co2_cert} kg CO₂/t). Add process data below.
        </div>
      )}

      <div className="card">
        <div className="section-label">Process & energy</div>
        <div className="form-grid">
          <div className="field">
            <label>Annual production (t/y)</label>
            <input type="number" value={form.production} onChange={e => set('production', e.target.value)} />
          </div>
          <div className="field">
            <label>Annual electricity (MWh/y)</label>
            <input type="number" value={form.electricity} onChange={e => set('electricity', e.target.value)} />
          </div>
          <div className="field">
            <label>Steam demand (kW)</label>
            <input type="number" value={form.steam} onChange={e => set('steam', e.target.value)} />
          </div>
          <div className="field">
            <label>Process heat temp (°C)</label>
            <input type="number" value={form.heat_temp} onChange={e => set('heat_temp', e.target.value)} />
          </div>
        </div>

        <div className="section-label">Utilities</div>
        <div className="form-grid">
          <div className="field">
            <label>Grid CO₂ intensity (kg/MWh)</label>
            <input type="number" value={form.grid_co2} onChange={e => set('grid_co2', e.target.value)} />
          </div>
          <div className="field">
            <label>Electricity cost ($/MWh)</label>
            <input type="number" value={form.elec_cost} onChange={e => set('elec_cost', e.target.value)} />
          </div>
          <div className="field">
            <label>Target analysis year</label>
            <select value={form.target_year} onChange={e => set('target_year', e.target.value)}>
              <option>2025</option><option>2030</option><option>2035</option>
            </select>
          </div>
        </div>

        <div className="section-label">Waste & water</div>
        <div className="form-grid">
          <div className="field">
            <label>Solid waste (t/y)</label>
            <input type="number" value={form.solid_waste} onChange={e => set('solid_waste', e.target.value)} />
          </div>
          <div className="field">
            <label>Waste heat recoverable (%)</label>
            <input type="number" value={form.waste_heat_pct} onChange={e => set('waste_heat_pct', e.target.value)} />
          </div>
          <div className="field">
            <label>Wastewater (m³/y)</label>
            <input type="number" value={form.wastewater} onChange={e => set('wastewater', e.target.value)} />
          </div>
          <div className="field">
            <label>Solvent losses (t/y)</label>
            <input type="number" step="0.1" value={form.solvent_loss} onChange={e => set('solvent_loss', e.target.value)} />
          </div>
        </div>

        <div className="section-label">Technologies to evaluate</div>
        <div className="form-grid">
          <div className="field">
            <label>Heat recovery</label>
            <select value={form.heat_recovery} onChange={e => set('heat_recovery', e.target.value)}>
              <option>Include</option><option>Exclude</option>
            </select>
          </div>
          <div className="field">
            <label>Heat pump</label>
            <select value={form.heat_pump} onChange={e => set('heat_pump', e.target.value)}>
              <option>Include</option><option>Exclude</option>
            </select>
          </div>
          <div className="field">
            <label>PV solar area (m²)</label>
            <input type="number" value={form.pv_area} onChange={e => set('pv_area', e.target.value)} />
          </div>
          <div className="field">
            <label>Biomass boiler</label>
            <select value={form.biomass} onChange={e => set('biomass', e.target.value)}>
              <option>Evaluate</option><option>Exclude</option>
            </select>
          </div>
        </div>

        <div className="submit-row">
          <button className="btn-secondary" onClick={() => setProjectData(d => ({ ...d, manufacturing: form }))}>
            Save draft
          </button>
          <button className="btn-primary" onClick={handleSubmit}>
            Submit → pass to logistics ↗
          </button>
        </div>
      </div>
    </div>
  )
}
