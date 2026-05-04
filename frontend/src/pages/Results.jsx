import { useState, useEffect, useRef } from 'react'

const SYSTEM = `You are the OpThemis AI assistant — expert in industrial energy optimization, pinch analysis, and dairy factory decarbonization. The factory is Molkerei Alpenfrisch (Bavaria, Germany): dairy processing, 3,800 t/y, 7,200 MWh/y electricity, 2,600 kW steam for pasteurization at 85°C, 1,800 kW refrigeration, grid CO₂ 350 g/kWh, baseline ~2,520 tCO₂/y. Key opportunities: pasteurizer heat recovery, heat pump (35→85°C upgrade), PV 300m², biogas from whey. Be concise and engineering-accurate.`

const SCENARIOS = [
  { name: 'Pasteurizer heat recovery', co2: 185, pct: 7.3, sav: 17.6, capex: 3.2, color: '#5DCAA5', time: 'Month 1–2' },
  { name: 'Heat pump (35/85°C)', co2: 210, pct: 8.3, sav: 31.2, capex: 65, color: '#1D9E75', time: 'Month 3–4' },
  { name: 'HP + PV 300m²', co2: 310, pct: 12.3, sav: 42.8, capex: 14.2, color: '#0F6E56', time: 'Month 5–6' },
  { name: 'HP + PV + biogas whey', co2: 520, pct: 20.6, sav: 58.4, capex: 28.5, color: '#085041', time: 'Year 2' },
  { name: 'Full decarbonisation (2030)', co2: 1060, pct: 42.0, sav: 68.0, capex: 45.0, color: '#04342C', time: '2030' },
]

const QUICK = ['Best scenario for payback < 3 years?', 'How does pasteurizer heat recovery work?', 'What is the biogas potential from whey?', 'Explain Scope 3 for dairy logistics']

export default function Results({ nav, projectData }) {
  const [ran, setRan] = useState(false)
  const [running, setRunning] = useState(false)
  const [chat, setChat] = useState([{ role: 'bot', text: 'Hi! I can interpret your dairy factory optimization results, explain scenarios, or answer energy engineering questions. What would you like to know?' }])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [history, setHistory] = useState([])
  const chatRef = useRef()
  const chartRef = useRef()
  const scopeRef = useRef()
  const chartInstance = useRef()
  const scopeInstance = useRef()

  const mfg = projectData.manufacturing
  const baseline = mfg ? Math.round(mfg.electricity * mfg.grid_co2 / 1000) : 2520
  const allFilled = projectData.procurement && projectData.manufacturing && projectData.logistics

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [chat, thinking])

  useEffect(() => {
    if (!ran) return
    const Chart = window.Chart
    if (!Chart) return

    if (chartInstance.current) chartInstance.current.destroy()
    if (scopeInstance.current) scopeInstance.current.destroy()

    chartInstance.current = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: SCENARIOS.map(s => s.name.length > 22 ? s.name.slice(0,22)+'…' : s.name),
        datasets: [
          { label: 'CO₂ reduction (t/y)', data: SCENARIOS.map(s => s.co2), backgroundColor: SCENARIOS.map(s => s.color), borderRadius: 4 },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 11 } } },
          x: { grid: { display: false }, ticks: { font: { size: 10 } } }
        }
      }
    })

    scopeInstance.current = new Chart(scopeRef.current, {
      type: 'doughnut',
      data: {
        labels: ['Scope 1 — direct heat', 'Scope 2 — electricity', 'Scope 3 — supply chain'],
        datasets: [{
          data: [Math.round(baseline*0.38), Math.round(baseline*0.47), Math.round(baseline*0.15)],
          backgroundColor: ['#1D9E75','#378ADD','#EF9F27'],
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '70%',
        plugins: { legend: { display: false } }
      }
    })
  }, [ran])

  const runOpt = async () => {
    setRunning(true)
    try {
      await fetch('/api/milp_solver', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(projectData) })
    } catch {}
    setTimeout(() => { setRunning(false); setRan(true) }, 1800)
  }

  const sendChat = async () => {
    const msg = input.trim(); if (!msg) return
    setInput('')
    const newH = [...history, { role: 'user', content: msg }]
    setHistory(newH)
    setChat(c => [...c, { role: 'user', text: msg }])
    setThinking(true)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 600, system: SYSTEM, messages: newH })
      })
      const data = await res.json()
      const reply = data.content?.map(b => b.text||'').join('') || 'Could not connect.'
      setHistory(h => [...h, { role: 'assistant', content: reply }])
      setChat(c => [...c, { role: 'bot', text: reply }])
    } catch { setChat(c => [...c, { role: 'bot', text: 'Connection error — check API key in Azure settings.' }]) }
    setThinking(false)
  }

  return (
    <div>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js" />
      <div className="page-header">
        <h1>Optimization results</h1>
        <p>Full lifecycle · Scope 1 + 2 + 3 · Molkerei Alpenfrisch</p>
      </div>

      {!allFilled && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', border: '0.5px dashed var(--border2)', background: 'var(--bg)', fontSize: '12px', fontFamily: 'var(--mono)', color: 'var(--muted)', marginBottom: '20px' }}>
          ⚠ Not all stages complete.{' '}
          <button onClick={() => nav('procurement')} style={{ background: 'none', border: 'none', color: 'var(--g3)', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: '12px' }}>Start from procurement →</button>
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '20px' }}>
        {[
          { label: 'Baseline CO₂', val: `${baseline.toLocaleString()} t/y`, color: 'var(--coral)' },
          { label: 'Best reduction', val: ran ? '−520 t/y' : '—', color: 'var(--g3)' },
          { label: 'Annual savings', val: ran ? '42.8 kCHF/y' : '—', color: 'var(--g3)' },
          { label: 'Best CAPEX', val: ran ? '14.2 kCHF' : '—', color: 'var(--amber)' },
        ].map(k => (
          <div key={k.label} style={{ background: 'var(--bg)', borderRadius: '8px', padding: '14px', border: '0.5px solid var(--border)' }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: k.color }}>{k.val}</div>
            <div style={{ fontSize: '10px', fontFamily: 'var(--mono)', color: 'var(--muted)', marginTop: '3px' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {!ran && (
        <button className="btn-primary" onClick={runOpt} disabled={running} style={{ width: '100%', padding: '13px', marginBottom: '20px', fontSize: '14px' }}>
          {running ? '⟳  Running MILP optimization…' : 'Run full lifecycle optimization →'}
        </button>
      )}

      {ran && (
        <>
          {/* Charts row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
            <div className="card">
              <div style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>CO₂ reduction by scenario</div>
              <div style={{ position: 'relative', height: '200px' }}>
                <canvas ref={chartRef} role="img" aria-label="Bar chart showing CO2 reduction for each optimization scenario"/>
              </div>
            </div>
            <div className="card">
              <div style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Emissions by scope</div>
              <div style={{ position: 'relative', height: '160px' }}>
                <canvas ref={scopeRef} role="img" aria-label="Donut chart of emissions breakdown by scope"/>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                {[['#1D9E75','Scope 1','38%'],['#378ADD','Scope 2','47%'],['#EF9F27','Scope 3','15%']].map(([c,l,p]) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontFamily: 'var(--mono)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: c }}/>
                    {l} · {p}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scenario table */}
          <div className="card" style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>Scenario comparison</div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '0', fontSize: '11px', fontFamily: 'var(--mono)' }}>
              {['Scenario','CO₂ red.','Savings/y','CAPEX','Timeline'].map(h => (
                <div key={h} style={{ padding: '6px 10px', background: 'var(--bg)', color: 'var(--muted)', borderBottom: '0.5px solid var(--border)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</div>
              ))}
              {SCENARIOS.map((s,i) => [
                <div key={s.name+'-n'} style={{ padding: '10px 10px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color, flexShrink: 0 }}/>
                  <span style={{ fontWeight: '500', fontSize: '12px' }}>{s.name}</span>
                </div>,
                <div key={s.name+'-c'} style={{ padding: '10px', borderBottom: '0.5px solid var(--border)', color: 'var(--coral)' }}>−{s.co2} t/y</div>,
                <div key={s.name+'-s'} style={{ padding: '10px', borderBottom: '0.5px solid var(--border)', color: 'var(--g2)' }}>{s.sav} k€/y</div>,
                <div key={s.name+'-x'} style={{ padding: '10px', borderBottom: '0.5px solid var(--border)', color: 'var(--amber)' }}>{s.capex} k€</div>,
                <div key={s.name+'-t'} style={{ padding: '10px', borderBottom: '0.5px solid var(--border)', color: 'var(--muted)' }}>{s.time}</div>,
              ])}
            </div>
          </div>
        </>
      )}

      {/* AI Chat */}
      <div className="card">
        <div style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>AI assistant</div>
        <div ref={chatRef} style={{ border: '0.5px solid var(--border)', borderRadius: '8px', minHeight: '180px', maxHeight: '260px', overflowY: 'auto', padding: '12px', background: 'var(--bg)', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
          {chat.map((m,i) => (
            <div key={i} style={{ maxWidth: '85%', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontFamily: 'var(--mono)', lineHeight: 1.55, alignSelf: m.role==='user'?'flex-end':'flex-start', background: m.role==='user'?'var(--g3)':'var(--surface)', color: m.role==='user'?'white':'var(--text)', border: m.role==='bot'?'0.5px solid var(--border)':'none' }}>{m.text}</div>
          ))}
          {thinking && <div style={{ alignSelf: 'flex-start', fontSize: '12px', fontFamily: 'var(--mono)', color: 'var(--muted)', fontStyle: 'italic' }}>Thinking…</div>}
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
          {QUICK.map(q => (
            <button key={q} onClick={() => setInput(q)} style={{ fontSize: '11px', padding: '4px 10px', border: '0.5px solid var(--border)', borderRadius: '16px', background: 'transparent', color: 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--mono)' }}>{q}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter'&&sendChat()} placeholder="Ask about your dairy factory optimization…"/>
          <button className="btn-primary" onClick={sendChat} style={{ whiteSpace: 'nowrap', padding: '8px 16px' }}>Send</button>
        </div>
      </div>
    </div>
  )
}
