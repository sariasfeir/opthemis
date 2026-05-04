import { useState } from 'react'

const DEMO_ZONES = [
  {
    id:'z1', name:'Paste making', color:'#1A9060',
    machines: [
      { id:'e1', name:'Paste mixer', type:'Mixer', runs_per_day:3, cycle_min:90, utility:'Steam', power_kw:18, temp_in:25, temp_out:120, notes:'Jacketed vessel, steam condensate recoverable' },
      { id:'e2', name:'DINP heater', type:'Heat exchanger', runs_per_day:3, cycle_min:54, utility:'Hot water', power_kw:8, temp_in:30, temp_out:90, notes:'' },
    ],
    waste: [{ id:'w1', type:'Liquid waste', name:'Cleaning solvent', qty_kg_day:12, treatment:'Hazardous disposal', cost_chf:2.5 }]
  },
  {
    id:'z2', name:'MDI preparation', color:'#15784E',
    machines: [
      { id:'e3', name:'MDI cold storage', type:'Refrigeration', runs_per_day:1, cycle_min:480, utility:'Chiller', power_kw:4.5, temp_in:20, temp_out:-10, notes:'Continuous — MDI must stay below 5°C' },
      { id:'e4', name:'Hot water bath', type:'Tank', runs_per_day:3, cycle_min:35, utility:'Steam', power_kw:12, temp_in:-5, temp_out:80, notes:'Steam condensate to drain — recover opportunity' },
    ],
    waste: []
  },
  {
    id:'z3', name:'Final mixing & filling', color:'#0F5C3E',
    machines: [
      { id:'e5', name:'Catalyst mixer', type:'Mixer', runs_per_day:3, cycle_min:30, utility:'Hot water', power_kw:3.5, temp_in:25, temp_out:65, notes:'' },
      { id:'e6', name:'Churn mixer (RAM)', type:'Reactor', runs_per_day:3, cycle_min:60, utility:'Steam', power_kw:25, temp_in:30, temp_out:100, notes:'Main energy consumer — 25 kW steam jacket' },
      { id:'e7', name:'Cartridge filling', type:'Filling machine', runs_per_day:3, cycle_min:45, utility:'Electricity', power_kw:2.2, temp_in:65, temp_out:30, notes:'' },
    ],
    waste: [
      { id:'w2', type:'Solid waste', name:'Off-spec product', qty_kg_day:8, treatment:'Internal reprocessing', cost_chf:0.3 },
      { id:'w3', type:'Packaging waste', name:'Cartridge rejects', qty_kg_day:3, treatment:'Plastic recycling', cost_chf:0.1 },
    ]
  },
  {
    id:'z4', name:'Utilities', color:'#B07218',
    machines: [
      { id:'e8', name:'Steam boiler (LPG)', type:'Boiler', runs_per_day:1, cycle_min:480, utility:'LPG', power_kw:95, temp_in:15, temp_out:150, notes:'Main CO₂ source — 95 kW · ~70 tCO₂/y' },
      { id:'e9', name:'Cooling tower', type:'Cooling', runs_per_day:1, cycle_min:480, utility:'Electricity', power_kw:12, temp_in:35, temp_out:8, notes:'' },
      { id:'e10', name:'Compressed air', type:'Compressor', runs_per_day:1, cycle_min:480, utility:'Electricity', power_kw:18, temp_in:20, temp_out:20, notes:'Significant electricity load — often overlooked' },
    ],
    waste: []
  }
]

const UTILITIES = ['Steam','Hot water','Cooling water','Chiller','Electricity','LPG','Natural gas','Compressed air']

export default function Manufacturing({ site, onBack, onSave, saved }) {
  const [zones, setZones] = useState(saved?.zones || DEMO_ZONES)
  const [expandedZone, setExpandedZone] = useState('z1')
  const [editMachine, setEditMachine] = useState(null)
  const [addingWaste, setAddingWaste] = useState(null)
  const [newWaste, setNewWaste] = useState({ type:'Solid waste', name:'', qty_kg_day:'', treatment:'', cost_chf:'' })

  const totalEnergy = zones.flatMap(z => z.machines).reduce((s,m) => s + m.power_kw * (m.cycle_min/60) * m.runs_per_day, 0)
  const totalWaste = zones.flatMap(z => z.waste).reduce((s,w) => s + (w.qty_kg_day||0), 0)
  const steamMachines = zones.flatMap(z => z.machines).filter(m => m.utility === 'Steam' || m.utility === 'LPG')

  const updateMachine = (zid, updated) => {
    setZones(zs => zs.map(z => z.id===zid ? {...z, machines: z.machines.map(m => m.id===updated.id ? updated : m)} : z))
    setEditMachine(null)
  }

  const addWaste = (zid) => {
    if (!newWaste.name) return
    setZones(zs => zs.map(z => z.id===zid ? {...z, waste:[...z.waste, {...newWaste, id:'w'+Date.now(), qty_kg_day:+newWaste.qty_kg_day, cost_chf:+newWaste.cost_chf}]} : z))
    setNewWaste({ type:'Solid waste', name:'', qty_kg_day:'', treatment:'', cost_chf:'' })
    setAddingWaste(null)
  }

  return (
    <div>
      <div className="bc">
        <button onClick={onBack}>← {site.name}</button>
        <span>/</span>
        <span>Manufacturing</span>
      </div>

      <div className="ph">
        <div>
          <h1>Manufacturing</h1>
          <p className="ph-sub">Scope 1 + 2 · energy per machine/zone · waste streams</p>
        </div>
      </div>

      <div className="note">
        Organised by zone or subprocess. For each machine: what utility it uses, how much power, how long it runs. Don't worry about which recipe — the machine's energy profile is what matters for pinch analysis.
      </div>

      {/* Summary */}
      <div className="stat-grid" style={{ marginBottom:'14px' }}>
        <div className="stat"><div className="stat-val" style={{ color:'var(--red)', fontSize:'16px' }}>{totalEnergy.toFixed(0)} kWh/day</div><div className="stat-label">Total energy</div></div>
        <div className="stat"><div className="stat-val" style={{ color:'var(--amber)', fontSize:'16px' }}>{steamMachines.length} machines</div><div className="stat-label">On steam/gas</div></div>
        <div className="stat"><div className="stat-val" style={{ fontSize:'16px' }}>{totalWaste.toFixed(0)} kg/day</div><div className="stat-label">Waste generated</div></div>
        <div className="stat"><div className="stat-val" style={{ fontSize:'16px' }}>{zones.flatMap(z=>z.machines).length}</div><div className="stat-label">Equipment items</div></div>
      </div>

      {/* Zones */}
      {zones.map(zone => {
        const zoneEnergy = zone.machines.reduce((s,m) => s + m.power_kw*(m.cycle_min/60)*m.runs_per_day, 0)
        const isOpen = expandedZone === zone.id
        return (
          <div key={zone.id} style={{ marginBottom:'8px', border:'1px solid var(--border)', borderLeft:`3px solid ${zone.color}`, borderRadius:'var(--r-lg)', overflow:'hidden', background:'var(--surface)' }}>
            {/* Zone header */}
            <div style={{ display:'flex', alignItems:'center', padding:'12px 14px', cursor:'pointer', background: isOpen ? 'var(--bg)' : '' }}
              onClick={() => setExpandedZone(isOpen ? null : zone.id)}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:zone.color, marginRight:10, flexShrink:0 }}/>
              <div style={{ flex:1 }}>
                <span style={{ fontSize:'13px', fontWeight:'600' }}>{zone.name}</span>
                <span style={{ fontSize:'11px', fontFamily:'var(--mono)', color:'var(--ink-3)', marginLeft:10 }}>
                  {zone.machines.length} machines · {zoneEnergy.toFixed(0)} kWh/day
                  {zone.waste.length > 0 && ` · ${zone.waste.length} waste streams`}
                </span>
              </div>
              <span style={{ fontSize:'12px', color:'var(--ink-4)' }}>{isOpen ? '▲' : '▼'}</span>
            </div>

            {isOpen && (
              <div style={{ padding:'0 14px 14px' }}>
                {/* Machines table */}
                <div style={{ overflowX:'auto', marginBottom:'10px' }}>
                  <table className="tbl">
                    <thead><tr>
                      <th>Machine / equipment</th><th>Type</th><th>Utility</th>
                      <th>Power (kW)</th><th>Cycle (min)</th><th>Runs/day</th>
                      <th>kWh/day</th><th>Tin→Tout</th><th></th>
                    </tr></thead>
                    <tbody>
                      {zone.machines.map(m => {
                        const kwh = (m.power_kw*(m.cycle_min/60)*m.runs_per_day).toFixed(1)
                        const isEditing = editMachine?.id === m.id && editMachine?.zid === zone.id
                        if (isEditing) return (
                          <tr key={m.id} style={{ background:'var(--green-50)' }}>
                            <td><input value={editMachine.name} onChange={e=>setEditMachine(s=>({...s,name:e.target.value}))} style={{ width:'100%' }}/></td>
                            <td><input value={editMachine.type} onChange={e=>setEditMachine(s=>({...s,type:e.target.value}))} style={{ width:'100%' }}/></td>
                            <td><select value={editMachine.utility} onChange={e=>setEditMachine(s=>({...s,utility:e.target.value}))} style={{ width:'100%' }}>
                              {UTILITIES.map(u=><option key={u}>{u}</option>)}
                            </select></td>
                            <td><input type="number" value={editMachine.power_kw} onChange={e=>setEditMachine(s=>({...s,power_kw:+e.target.value}))} style={{ width:60 }}/></td>
                            <td><input type="number" value={editMachine.cycle_min} onChange={e=>setEditMachine(s=>({...s,cycle_min:+e.target.value}))} style={{ width:60 }}/></td>
                            <td><input type="number" value={editMachine.runs_per_day} onChange={e=>setEditMachine(s=>({...s,runs_per_day:+e.target.value}))} style={{ width:50 }}/></td>
                            <td style={{ fontFamily:'var(--mono)', fontSize:'12px', color:'var(--green-700)' }}>{(editMachine.power_kw*(editMachine.cycle_min/60)*editMachine.runs_per_day).toFixed(1)}</td>
                            <td>
                              <div style={{ display:'flex', gap:4 }}>
                                <input type="number" value={editMachine.temp_in} onChange={e=>setEditMachine(s=>({...s,temp_in:+e.target.value}))} style={{ width:45 }} placeholder="Tin"/>
                                <input type="number" value={editMachine.temp_out} onChange={e=>setEditMachine(s=>({...s,temp_out:+e.target.value}))} style={{ width:45 }} placeholder="Tout"/>
                              </div>
                            </td>
                            <td>
                              <button className="btn btn-primary btn-sm" onClick={() => updateMachine(zone.id, editMachine)}>✓</button>
                            </td>
                          </tr>
                        )
                        return (
                          <tr key={m.id}>
                            <td>
                              <div style={{ fontWeight:'500' }}>{m.name}</div>
                              {m.notes && <div style={{ fontSize:'10px', color:'var(--ink-3)', fontFamily:'var(--mono)' }}>{m.notes}</div>}
                            </td>
                            <td style={{ fontSize:'11px', color:'var(--ink-3)' }}>{m.type}</td>
                            <td>
                              <span className="badge" style={{
                                background: m.utility==='Steam'||m.utility==='LPG'?'var(--red-bg)': m.utility==='Chiller'||m.utility==='Cooling water'?'var(--blue-bg)':'var(--bg)',
                                color: m.utility==='Steam'||m.utility==='LPG'?'var(--red)': m.utility==='Chiller'||m.utility==='Cooling water'?'var(--blue)':'var(--ink-3)'
                              }}>{m.utility}</span>
                            </td>
                            <td style={{ fontFamily:'var(--mono)', fontSize:'12px' }}>{m.power_kw}</td>
                            <td style={{ fontFamily:'var(--mono)', fontSize:'12px' }}>{m.cycle_min}</td>
                            <td style={{ fontFamily:'var(--mono)', fontSize:'12px' }}>{m.runs_per_day}×</td>
                            <td style={{ fontFamily:'var(--mono)', fontSize:'12px', color:'var(--green-700)', fontWeight:'600' }}>{kwh}</td>
                            <td style={{ fontFamily:'var(--mono)', fontSize:'11px', color:'var(--ink-3)' }}>{m.temp_in}→{m.temp_out}°C</td>
                            <td><button className="btn btn-sm" onClick={() => setEditMachine({...m, zid:zone.id})}>Edit</button></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Waste streams */}
                {(zone.waste.length > 0 || addingWaste === zone.id) && (
                  <div style={{ marginTop:'8px' }}>
                    <div style={{ fontSize:'10px', fontFamily:'var(--mono)', color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:'6px' }}>
                      Waste streams
                    </div>
                    {zone.waste.map(w => (
                      <div key={w.id} style={{ display:'flex', gap:'10px', alignItems:'center', padding:'5px 8px', background:'var(--bg)', borderRadius:'var(--r)', marginBottom:'4px', fontSize:'12px' }}>
                        <span className={`badge ${w.type.includes('Solid')?'badge-amber':w.type.includes('Liquid')?'badge-red':'badge-gray'}`} style={{ fontSize:'10px' }}>{w.type}</span>
                        <span style={{ fontWeight:'500', flex:1 }}>{w.name}</span>
                        <span style={{ fontFamily:'var(--mono)', fontSize:'11px', color:'var(--ink-3)' }}>{w.qty_kg_day} kg/day</span>
                        <span style={{ fontFamily:'var(--mono)', fontSize:'11px', color:'var(--ink-3)' }}>{w.treatment}</span>
                        <span style={{ fontFamily:'var(--mono)', fontSize:'11px', color:'var(--amber)' }}>CHF {w.cost_chf}/kg</span>
                      </div>
                    ))}
                  </div>
                )}

                {addingWaste === zone.id && (
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr 1fr 2fr 1fr', gap:'6px', marginTop:'6px', padding:'8px', background:'var(--green-50)', borderRadius:'var(--r)' }}>
                    <div className="field"><label>Type</label>
                      <select value={newWaste.type} onChange={e=>setNewWaste(w=>({...w,type:e.target.value}))}>
                        {['Solid waste','Liquid waste','Gaseous emission','Packaging waste','Off-spec product','Scrap'].map(t=><option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="field"><label>Name</label><input placeholder="Cleaning solvent" value={newWaste.name} onChange={e=>setNewWaste(w=>({...w,name:e.target.value}))}/></div>
                    <div className="field"><label>kg/day</label><input type="number" value={newWaste.qty_kg_day} onChange={e=>setNewWaste(w=>({...w,qty_kg_day:e.target.value}))}/></div>
                    <div className="field"><label>Treatment</label><input placeholder="Hazardous disposal" value={newWaste.treatment} onChange={e=>setNewWaste(w=>({...w,treatment:e.target.value}))}/></div>
                    <div className="field"><label>Cost CHF/kg</label><input type="number" step="0.01" value={newWaste.cost_chf} onChange={e=>setNewWaste(w=>({...w,cost_chf:e.target.value}))}/></div>
                    <div style={{ gridColumn:'1/-1', display:'flex', gap:'6px' }}>
                      <button className="btn btn-sm" onClick={() => setAddingWaste(null)}>Cancel</button>
                      <button className="btn btn-primary btn-sm" onClick={() => addWaste(zone.id)}>Add waste stream</button>
                    </div>
                  </div>
                )}

                <div style={{ display:'flex', gap:'6px', marginTop:'8px' }}>
                  <button className="btn btn-sm" onClick={() => setAddingWaste(zone.id)}>+ Add waste stream</button>
                </div>
              </div>
            )}
          </div>
        )
      })}

      <div style={{ display:'flex', gap:'8px', marginTop:'14px' }}>
        <button className="btn" onClick={onBack}>← Back to site</button>
        <button className="btn btn-primary" onClick={() => onSave({ zones, totalEnergy, totalWaste })}>Save & continue →</button>
      </div>
    </div>
  )
}
