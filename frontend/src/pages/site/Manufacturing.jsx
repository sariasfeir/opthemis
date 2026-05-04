import { useState } from 'react'

// Molkerei Alpenfrisch — Kempten Plant
// Dairy processing zones
const DEMO_ZONES = [
  {
    id:'z1', name:'Milk reception & storage', color:'#1A9060',
    machines:[
      { id:'e1', name:'Milk reception pump', type:'Pump', utility:'Electricity', power_kw:7.5, hours_day:16, notes:'Continuous during reception shift' },
      { id:'e2', name:'Cold storage tanks (3×)', type:'Refrigeration', utility:'Chiller', power_kw:22, hours_day:24, notes:'Milk must stay at 4°C — large continuous load' },
      { id:'e3', name:'Separator / clarifier', type:'Centrifuge', utility:'Electricity', power_kw:15, hours_day:12, notes:'' },
    ],
    waste:[
      { id:'w1', type:'Liquid waste', name:'CIP cleaning water', qty_t_year:420, treatment:'Wastewater treatment', cost_chf:0.8 },
    ]
  },
  {
    id:'z2', name:'Pasteurisation & homogenisation', color:'#15784E',
    machines:[
      { id:'e4', name:'Plate heat exchanger (PHE)', type:'Heat exchanger', utility:'Hot water', power_kw:45, hours_day:14, notes:'Main heat recovery opportunity — pasteurise at 72°C · regeneration ~85%' },
      { id:'e5', name:'Hot water circuit (boiler fed)', type:'Boiler circuit', utility:'Steam', power_kw:68, hours_day:14, notes:'Steam boiler feeds this — direct CO₂ source (Scope 1)' },
      { id:'e6', name:'Homogeniser', type:'High pressure pump', utility:'Electricity', power_kw:37, hours_day:12, notes:'High electricity consumer — 150–200 bar' },
      { id:'e7', name:'Cooling after pasteurisation', type:'Refrigeration', utility:'Chiller', power_kw:18, hours_day:14, notes:'Cool product from 72°C to 4°C — heat pump opportunity' },
    ],
    waste:[]
  },
  {
    id:'z3', name:'Fermentation (yogurt lines)', color:'#0F5C3E',
    machines:[
      { id:'e8', name:'Incubation chamber', type:'Temperature controlled', utility:'Hot water', power_kw:12, hours_day:20, notes:'Fermentation at 42°C for ~4h per batch' },
      { id:'e9', name:'Cooling after fermentation', type:'Refrigeration', utility:'Chiller', power_kw:14, hours_day:16, notes:'' },
    ],
    waste:[
      { id:'w2', type:'Solid waste', name:'Off-spec product / returns', qty_t_year:85, treatment:'Animal feed or biogas', cost_chf:0.2 },
    ]
  },
  {
    id:'z4', name:'Filling & packaging', color:'#B07218',
    machines:[
      { id:'e10', name:'Bottle filling line', type:'Filling machine', utility:'Electricity', power_kw:18, hours_day:14, notes:'' },
      { id:'e11', name:'Labelling & capping', type:'Packaging line', utility:'Electricity', power_kw:8, hours_day:14, notes:'' },
    ],
    waste:[
      { id:'w3', type:'Packaging waste', name:'HDPE bottle rejects', qty_t_year:6, treatment:'Plastic recycling', cost_chf:0.15 },
      { id:'w4', type:'Packaging waste', name:'Cardboard & film', qty_t_year:12, treatment:'Paper recycling', cost_chf:0.1 },
    ]
  },
  {
    id:'z5', name:'Utilities (site-level)', color:'#C44B2A',
    machines:[
      { id:'e12', name:'Steam boiler (natural gas)', type:'Boiler', utility:'Natural gas', power_kw:180, hours_day:14, notes:'Main Scope 1 source · serves PHE + fermentation · ~280 tCO₂/y' },
      { id:'e13', name:'Chiller plant', type:'Compression chiller', utility:'Electricity', power_kw:95, hours_day:22, notes:'Serves all cold storage + pasteurisation cooling' },
      { id:'e14', name:'Compressed air system', type:'Compressor', utility:'Electricity', power_kw:22, hours_day:18, notes:'Often underestimated — check for leaks' },
      { id:'e15', name:'Lighting & HVAC', type:'Building services', utility:'Electricity', power_kw:35, hours_day:16, notes:'' },
    ],
    waste:[]
  }
]

const UTILITIES = ['Steam','Hot water','Chiller','Cooling water','Electricity','Natural gas','LPG','Compressed air']

export default function Manufacturing({ site, onBack, onSave, saved }) {
  const [zones, setZones] = useState(saved?.zones || DEMO_ZONES)
  const [openZone, setOpenZone] = useState('z2')
  const [editMachine, setEditMachine] = useState(null)
  const [addingWaste, setAddingWaste] = useState(null)
  const [newWaste, setNewWaste] = useState({ type:'Solid waste', name:'', qty_t_year:'', treatment:'', cost_chf:'' })

  const allMachines = zones.flatMap(z => z.machines)
  const allWaste = zones.flatMap(z => z.waste)
  const totalKWh = allMachines.reduce((s,m) => s + m.power_kw * m.hours_day * 365 / 1000, 0)
  const totalWaste = allWaste.reduce((s,w) => s + (w.qty_t_year||0), 0)
  const heatMachines = allMachines.filter(m => ['Steam','Hot water','Natural gas','LPG'].includes(m.utility))

  const updateMachine = (zid, upd) => {
    setZones(zs => zs.map(z => z.id===zid ? {...z, machines:z.machines.map(m => m.id===upd.id?upd:m)} : z))
    setEditMachine(null)
  }

  const addWaste = (zid) => {
    if (!newWaste.name) return
    setZones(zs => zs.map(z => z.id===zid ? {...z, waste:[...z.waste, {...newWaste, id:'w'+Date.now(), qty_t_year:+newWaste.qty_t_year, cost_chf:+newWaste.cost_chf}]} : z))
    setNewWaste({ type:'Solid waste', name:'', qty_t_year:'', treatment:'', cost_chf:'' })
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
          <p className="ph-sub">Scope 1 + 2 · energy per zone · waste streams · {site.name}</p>
        </div>
      </div>

      <div className="note">
        Organised by zone. For each machine: utility used, power (kW), hours/day. <strong>No need to track per recipe</strong> — the machine's energy profile is what matters for pinch analysis. Quantities in t/year or MWh/year.
      </div>

      <div className="card" style={{ marginBottom:'20px', padding:'18px', background:'rgba(15,92,62,.05)', border:'1px solid rgba(15,92,62,.12)' }}>
        <div style={{ display:'grid', gap:'10px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'12px', flexWrap:'wrap' }}>
            <div>
              <div style={{ fontSize:'11px', fontFamily:'var(--mono)', color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:'4px' }}>Process-driven view</div>
              <div style={{ fontSize:'15px', fontWeight:'700' }}>Show each workbook as a process, each sheet as a subprocess</div>
            </div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'var(--green-100)', color:'var(--green-900)', borderRadius:'999px', padding:'6px 10px', fontSize:'12px' }}>
              Planned
            </div>
          </div>

          <div style={{ fontSize:'12px', color:'var(--ink-3)', lineHeight:1.6 }}>
            The goal is to move from a zone-only energy page to a process-centric view. A process workbook becomes one process, and each sheet is a subprocess with its input/output streams, utilities, and mass balance.
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(170px,1fr))', gap:'10px' }}>
            <div style={{ padding:'12px', borderRadius:'12px', background:'white', border:'1px solid var(--border)' }}>
              <div style={{ fontSize:'12px', color:'var(--ink-3)', marginBottom:'6px' }}>Process file</div>
              <div style={{ fontWeight:'700' }}>Ethanol recovery</div>
              <div style={{ fontSize:'11px', color:'var(--ink-4)', marginTop:'6px' }}>5 subprocess tabs</div>
            </div>
            <div style={{ padding:'12px', borderRadius:'12px', background:'white', border:'1px solid var(--border)' }}>
              <div style={{ fontSize:'12px', color:'var(--ink-3)', marginBottom:'6px' }}>Subprocess</div>
              <div style={{ fontWeight:'700' }}>Drying</div>
              <div style={{ fontSize:'11px', color:'var(--ink-4)', marginTop:'6px' }}>Balance check, utilities, stream count</div>
            </div>
            <div style={{ padding:'12px', borderRadius:'12px', background:'white', border:'1px solid var(--border)' }}>
              <div style={{ fontSize:'12px', color:'var(--ink-3)', marginBottom:'6px' }}>Visualization</div>
              <div style={{ fontWeight:'700' }}>Mass balance</div>
              <div style={{ fontSize:'11px', color:'var(--ink-4)', marginTop:'6px' }}>Input vs output discrepancies are highlighted</div>
            </div>
          </div>

          <div style={{ fontSize:'12px', color:'var(--ink-3)', lineHeight:1.5, marginTop:'4px' }}>
            For now this is a UI skeleton: later the page should allow uploading the workbook, then show process summary cards, subprocess rows, and red/green balance warnings.
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="stat-grid" style={{ gridTemplateColumns:'repeat(4,1fr)', marginBottom:'14px' }}>
        <div className="stat"><div className="stat-val" style={{ color:'var(--red)', fontSize:'16px' }}>{totalKWh.toFixed(0)} MWh/y</div><div className="stat-label">Total energy</div></div>
        <div className="stat"><div className="stat-val" style={{ color:'var(--amber)', fontSize:'16px' }}>{heatMachines.length}</div><div className="stat-label">Thermal machines</div></div>
        <div className="stat"><div className="stat-val" style={{ fontSize:'16px' }}>{totalWaste.toFixed(0)} t/y</div><div className="stat-label">Waste generated</div></div>
        <div className="stat"><div className="stat-val" style={{ fontSize:'16px' }}>{allMachines.length}</div><div className="stat-label">Equipment items</div></div>
      </div>

      {/* Zones */}
      {zones.map(zone => {
        const zKwh = zone.machines.reduce((s,m) => s + m.power_kw*m.hours_day*365/1000, 0)
        const isOpen = openZone === zone.id
        return (
          <div key={zone.id} style={{ marginBottom:'6px', border:'1px solid var(--border)', borderLeft:`3px solid ${zone.color}`, borderRadius:'var(--r-lg)', overflow:'hidden', background:'var(--surface)' }}>
            {/* Zone header */}
            <div style={{ display:'flex', alignItems:'center', padding:'11px 14px', cursor:'pointer', background:isOpen?'var(--bg)':'' }}
              onClick={() => setOpenZone(isOpen?null:zone.id)}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:zone.color, marginRight:10, flexShrink:0 }}/>
              <div style={{ flex:1 }}>
                <span style={{ fontSize:'13px', fontWeight:'600' }}>{zone.name}</span>
                <span style={{ fontSize:'11px', fontFamily:'var(--mono)', color:'var(--ink-3)', marginLeft:10 }}>
                  {zone.machines.length} machines · {zKwh.toFixed(0)} MWh/y
                  {zone.waste.length > 0 && ` · ${zone.waste.reduce((s,w)=>s+(w.qty_t_year||0),0).toFixed(0)} t waste/y`}
                </span>
              </div>
              <span style={{ fontSize:'11px', color:'var(--ink-4)' }}>{isOpen?'▲':'▼'}</span>
            </div>

            {isOpen && (
              <div style={{ padding:'0 14px 14px' }}>
                <div style={{ overflowX:'auto', marginBottom:'8px' }}>
                  <table className="tbl">
                    <thead><tr>
                      <th>Machine</th><th>Type</th><th>Utility</th>
                      <th>kW</th><th>h/day</th>
                      <th>MWh/y</th><th></th>
                    </tr></thead>
                    <tbody>
                      {zone.machines.map(m => {
                        const mwh = (m.power_kw*m.hours_day*365/1000).toFixed(0)
                        const isEd = editMachine?.id===m.id && editMachine?.zid===zone.id
                        if (isEd) return (
                          <tr key={m.id} style={{ background:'var(--green-50)' }}>
                            <td><input value={editMachine.name} onChange={e=>setEditMachine(s=>({...s,name:e.target.value}))} style={{width:'100%'}}/></td>
                            <td><input value={editMachine.type} onChange={e=>setEditMachine(s=>({...s,type:e.target.value}))} style={{width:80}}/></td>
                            <td><select value={editMachine.utility} onChange={e=>setEditMachine(s=>({...s,utility:e.target.value}))} style={{width:'100%'}}>
                              {UTILITIES.map(u=><option key={u}>{u}</option>)}
                            </select></td>
                            <td><input type="number" value={editMachine.power_kw} onChange={e=>setEditMachine(s=>({...s,power_kw:+e.target.value}))} style={{width:55}}/></td>
                            <td><input type="number" value={editMachine.hours_day} onChange={e=>setEditMachine(s=>({...s,hours_day:+e.target.value}))} style={{width:45}}/></td>
                            <td style={{ fontFamily:'var(--mono)', fontSize:'12px', color:'var(--green-700)', fontWeight:'600' }}>
                              {(editMachine.power_kw*editMachine.hours_day*365/1000).toFixed(0)}
                            </td>
                            <td><button className="btn btn-primary btn-sm" onClick={() => updateMachine(zone.id, editMachine)}>✓</button></td>
                          </tr>
                        )
                        return (
                          <tr key={m.id}>
                            <td>
                              <div style={{ fontWeight:'500' }}>{m.name}</div>
                              {m.notes && <div style={{ fontSize:'10px', fontFamily:'var(--mono)', color:'var(--ink-3)', marginTop:'1px' }}>{m.notes}</div>}
                            </td>
                            <td style={{ fontSize:'11px', color:'var(--ink-3)' }}>{m.type}</td>
                            <td>
                              <span className="badge" style={{
                                background: ['Steam','Natural gas','LPG','Hot water'].includes(m.utility)?'var(--red-bg)': ['Chiller','Cooling water'].includes(m.utility)?'var(--blue-bg)':'var(--bg)',
                                color: ['Steam','Natural gas','LPG','Hot water'].includes(m.utility)?'var(--red)': ['Chiller','Cooling water'].includes(m.utility)?'var(--blue)':'var(--ink-3)'
                              }}>{m.utility}</span>
                            </td>
                            <td style={{ fontFamily:'var(--mono)', fontSize:'12px' }}>{m.power_kw}</td>
                            <td style={{ fontFamily:'var(--mono)', fontSize:'12px' }}>{m.hours_day}h</td>
                            <td style={{ fontFamily:'var(--mono)', fontSize:'12px', fontWeight:'600', color:'var(--green-700)' }}>{mwh}</td>
                            <td><button className="btn btn-sm" onClick={() => setEditMachine({...m,zid:zone.id})}>Edit</button></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Waste */}
                {zone.waste.length > 0 && (
                  <div style={{ marginBottom:'8px' }}>
                    <div style={{ fontSize:'10px', fontFamily:'var(--mono)', color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:'5px' }}>Waste streams</div>
                    {zone.waste.map(w => (
                      <div key={w.id} style={{ display:'flex', gap:'10px', alignItems:'center', padding:'5px 8px', background:'var(--bg)', borderRadius:'var(--r)', marginBottom:'3px', fontSize:'12px' }}>
                        <span className={`badge ${w.type.includes('Solid')?'badge-amber':w.type.includes('Liquid')?'badge-red':'badge-gray'}`} style={{ fontSize:'10px', flexShrink:0 }}>{w.type}</span>
                        <span style={{ fontWeight:'500', flex:1 }}>{w.name}</span>
                        <span style={{ fontFamily:'var(--mono)', fontSize:'11px', color:'var(--ink-3)' }}>{w.qty_t_year} t/y</span>
                        <span style={{ fontFamily:'var(--mono)', fontSize:'11px', color:'var(--ink-3)' }}>{w.treatment}</span>
                      </div>
                    ))}
                  </div>
                )}

                {addingWaste === zone.id && (
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr 1fr 2fr', gap:'6px', padding:'8px', background:'var(--green-50)', borderRadius:'var(--r)', marginBottom:'8px' }}>
                    <div className="field"><label>Type</label>
                      <select value={newWaste.type} onChange={e=>setNewWaste(w=>({...w,type:e.target.value}))}>
                        {['Solid waste','Liquid waste','Packaging waste','Off-spec product','Scrap','Emissions'].map(t=><option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="field"><label>Name</label><input placeholder="CIP water" value={newWaste.name} onChange={e=>setNewWaste(w=>({...w,name:e.target.value}))}/></div>
                    <div className="field"><label>t/year</label><input type="number" value={newWaste.qty_t_year} onChange={e=>setNewWaste(w=>({...w,qty_t_year:e.target.value}))}/></div>
                    <div className="field"><label>Treatment</label><input placeholder="Wastewater" value={newWaste.treatment} onChange={e=>setNewWaste(w=>({...w,treatment:e.target.value}))}/></div>
                    <div style={{ gridColumn:'1/-1', display:'flex', gap:'6px' }}>
                      <button className="btn btn-sm" onClick={() => setAddingWaste(null)}>Cancel</button>
                      <button className="btn btn-primary btn-sm" onClick={() => addWaste(zone.id)}>Add</button>
                    </div>
                  </div>
                )}

                <button className="btn btn-sm" onClick={() => setAddingWaste(zone.id)}>+ Add waste stream</button>
              </div>
            )}
          </div>
        )
      })}

      <div style={{ display:'flex', gap:'8px', marginTop:'14px' }}>
        <button className="btn" onClick={onBack}>← Back</button>
        <button className="btn btn-primary" onClick={() => onSave({ zones, totalKWh, totalWaste })}>Save →</button>
      </div>
    </div>
  )
}
