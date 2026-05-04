import { useState } from 'react'
import Procurement from './site/Procurement'
import Manufacturing from './site/Manufacturing'
import Distribution from './site/Distribution'

const STAGES = [
  { id:'procurement',   label:'Raw Materials',   angle:-90, color:'#1A9060', span:68, icon:null,
    desc:'Supplier list · cost CHF/kg · CO₂/kg · quantities kg/year' },
  { id:'manufacturing', label:'Manufacturing',   angle:-14, color:'#15784E', span:68, icon:null,
    desc:'Energy per machine/zone · utilities · waste streams' },
  { id:'distribution',  label:'Distribution',   angle:62,  color:'#0F5C3E', span:68, icon:null,
    desc:'Transport routes · fleet · downstream CO₂' },
  { id:'usage',         label:'Usage Phase',    angle:138, color:'#C8C8C4', span:68, icon:null,
    desc:'End-user emissions — coming soon' },
  { id:'endoflife',     label:'End of Life',    angle:214, color:'#C8C8C4', span:68, icon:null,
    desc:'Recycling, landfill — coming soon' },
]


export default function SiteDetail({ nav, project, site }) {
  const [stageData, setStageData] = useState({})
  const [activeStage, setActiveStage] = useState(null)

  const total = (site.scope1||0)+(site.scope2||0)+(site.scope3||0)
  const done = Object.keys(stageData)

  if (activeStage === 'procurement')   return <Procurement   site={site} onBack={() => setActiveStage(null)} onSave={d=>{setStageData(s=>({...s,procurement:d}));setActiveStage(null)}} saved={stageData.procurement}/>
  if (activeStage === 'manufacturing') return <Manufacturing site={site} onBack={() => setActiveStage(null)} onSave={d=>{setStageData(s=>({...s,manufacturing:d}));setActiveStage(null)}} saved={stageData.manufacturing}/>
  if (activeStage === 'distribution')  return <Distribution  site={site} onBack={() => setActiveStage(null)} onSave={d=>{setStageData(s=>({...s,distribution:d}));setActiveStage(null)}} saved={stageData.distribution}/>

  const clickable = id => ['procurement','manufacturing','distribution'].includes(id)

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bc">
        <button onClick={()=>nav('projects')}>Projects</button>
        <span>/</span>
        <button onClick={()=>nav('portfolio',project)}>{project.name}</button>
        <span>/</span>
        <span>{site.name}</span>
      </div>

      {/* Header */}
      <div className="ph">
        <div>
          <h1>{site.name}</h1>
          <p className="ph-sub">{site.country} · {site.industry} · {(site.production||0).toLocaleString()} t/y</p>
        </div>
        <div style={{display:'flex',gap:'20px'}}>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:'18px',fontWeight:'600',color:'var(--red)',fontFamily:'var(--mono)'}}>{total.toLocaleString()}</div>
            <div style={{fontSize:'10px',fontFamily:'var(--mono)',color:'var(--ink-3)'}}>tCO₂/y total</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:'18px',fontWeight:'600',color:'var(--amber)',fontFamily:'var(--mono)'}}>{site.co2_cost}</div>
            <div style={{fontSize:'10px',fontFamily:'var(--mono)',color:'var(--ink-3)'}}>CHF/tCO₂</div>
          </div>
        </div>
      </div>

      {/* Scope bars */}
      <div className="card" style={{marginBottom:'20px',padding:'12px 16px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'16px'}}>
          {[
            {label:'Scope 1 — direct', val:site.scope1||0, color:'#1A9060'},
            {label:'Scope 2 — purchased energy', val:site.scope2||0, color:'#1A5A9C'},
            {label:'Scope 3 — value chain', val:site.scope3||0, color:'#B07218'},
          ].map(s=>{
            const pct=total>0?Math.round(s.val/total*100):0
            return (
              <div key={s.label}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
                  <span style={{fontSize:'11px',color:'var(--ink-3)'}}>{s.label}</span>
                  <span style={{fontSize:'11px',fontFamily:'var(--mono)',fontWeight:'600',color:s.color}}>{s.val.toLocaleString()} t · {pct}%</span>
                </div>
                <div style={{height:'4px',background:'var(--border)',borderRadius:'2px',overflow:'hidden'}}>
                  <div style={{height:'100%',width:pct+'%',background:s.color,borderRadius:'2px'}}/>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Process flow diagram */}
      <div style={{display:'grid',gridTemplateColumns:'1fr',gap:'20px',alignItems:'start'}}>

        {/* Block flow diagram */}
        <div className="card" style={{padding:'20px'}}>
          <div style={{fontSize:'10px',fontFamily:'var(--mono)',color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:'8px'}}>
            Process flow · click a block to fill data
          </div>
          <div style={{fontSize:'14px',fontWeight:'700',marginBottom:'12px'}}>Process-centric factory view</div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'10px',marginBottom:'12px'}}>
            {STAGES.filter((s,i)=>i<3).map((s,i)=>{
              const isClickable = clickable(s.id)
              const isDone = done.includes(s.id)
              return (
                <div key={s.id} onClick={()=>isClickable&&setActiveStage(s.id)}
                  style={{
                    cursor:isClickable?'pointer':'default',
                    border:`1px solid ${isDone?s.color:'var(--border)'}`,
                    background:isDone?'rgba(26,144,96,0.08)':'white',
                    color:isDone?'var(--ink)':'var(--ink-4)',
                    borderRadius:'16px',
                    padding:'14px',
                    minHeight:'132px',
                    display:'flex',
                    flexDirection:'column',
                    justifyContent:'space-between',
                    transition:'all .15s'
                  }}>
                  <div>
                    <div style={{fontSize:'12px',fontWeight:'700',marginBottom:'8px'}}>{s.label}</div>
                    <div style={{fontSize:'11px',lineHeight:1.5,color:'var(--ink-3)'}}>{s.desc}</div>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'12px'}}>
                    <span style={{fontSize:'11px',fontFamily:'var(--mono)',color:isDone?'var(--green-700)':'var(--ink-3)'}}>
                      {isDone ? 'Completed' : isClickable ? 'Click to fill' : 'Planned'}
                    </span>
                    {isDone && <span style={{fontSize:'12px',fontWeight:'700',color:'var(--green-700)'}}>✓</span>}
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{display:'flex',justifyContent:'center',gap:'10px',alignItems:'center',marginBottom:'12px'}}>
            <div style={{width:'20px',height:'1px',background:'var(--border)'}} />
            <span style={{fontSize:'11px',color:'var(--ink-3)',fontFamily:'var(--mono)'}}>Future process stages</span>
            <div style={{width:'20px',height:'1px',background:'var(--border)'}} />
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'10px'}}>
            {STAGES.slice(3).map(s=> (
              <div key={s.id} style={{border:'1px solid var(--border)',borderRadius:'16px',padding:'14px',background:'var(--bg)',opacity:0.65}}>
                <div style={{fontSize:'12px',fontWeight:'700',marginBottom:'8px',color:'var(--ink-4)'}}>{s.label}</div>
                <div style={{fontSize:'11px',color:'var(--ink-4)',lineHeight:1.5}}>{s.desc}</div>
              </div>
            ))}
          </div>

          <div style={{marginTop:'14px',fontSize:'12px',color:'var(--ink-3)',lineHeight:1.6}}>
            This layout shows the process blocks your workflow should follow. The first three stages are interactive; usage and end-of-life remain future build sections.
          </div>
        </div>
      </div>
    </div>
  )
}
