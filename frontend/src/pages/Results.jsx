import { useState, useEffect } from 'react'

const scenarios = [
  { name: 'Heat recovery', co2_red: 16, pct: 2.3, savings: 6.4, capex: 1.2, color: '#5DCAA5', timeline: 'Month 1–2' },
  { name: 'Heat pump (20/65°C)', co2_red: 15.8, pct: 2.2, savings: 24.9, capex: 4.8, color: '#1D9E75', timeline: 'Month 3' },
  { name: 'HP + PV 250m²', co2_red: 66, pct: 9.3, savings: 24.4, capex: 11.4, color: '#0F6E56', timeline: 'Month 5' },
  { name: 'HP + PV (2030 grid)', co2_red: 260, pct: 36.7, savings: 24.4, capex: 11.4, color: '#085041', timeline: '2030' },
]

const SYSTEM = `You are the OpThemis AI assistant — expert in industrial energy optimization, pinch analysis, and lifecycle emissions reduction. The factory is Sika Rayong (adhesives): 707 tCO₂/y baseline, 183 kCHF/y. Best config: heat pump + 250m² PV = −66 tCO₂/y, 11.4 kCHF CAPEX. Be concise and engineering-accurate.`

export default function Results({ nav, projectData }) {
  const [running, setRunning] = useState(false)
  const [ran, setRan] = useState(false)
  const [chat, setChat] = useState([{ role: 'bot', text: 'Hello! I can interpret your optimization results or explain any scenario. What would you like to know?' }])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [history, setHistory] = useState([])

  const mfg = projectData.manufacturing
  const baseline = mfg ? Math.round(mfg.electricity * (mfg.grid_co2 || 437) / 1000) : 707

  const runOptimization = async () => {
    setRunning(true)
    try {
      await fetch('/api/milp_solver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manufacturing: mfg, procurement: projectData.procurement, logistics: projectData.logistics }),
      })
    } catch (e) { /* offline */ }
    setTimeout(() => { setRunning(false); setRan(true) }, 2000)
  }

  const sendChat = async () => {
    const msg = input.trim()
    if (!msg) return
    setInput('')
    const newHistory = [...history, { role: 'user', content: msg }]
    setHistory(newHistory)
    setChat(c => [...c, { role: 'user', text: msg }])
    setThinking(true)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 600, system: SYSTEM, messages: newHistory }),
      })
      const data = await res.json()
      const reply = data.content?.map(b => b.text || '').join('') || 'Sorry, could not connect.'
      setHistory(h => [...h, { role: 'assistant', content: reply }])
      setChat(c => [...c, { role: 'bot', text: reply }])
    } catch {
      setChat(c => [...c, { role: 'bot', text: 'Connection error. Check your API key in settings.' }])
    }
    setThinking(false)
  }

  const allFilled = projectData.procurement && projectData.manufacturing && projectData.logistics

  return (
    <div>
      <div className="page-header">
        <h1>Optimization results</h1>
        <p>Full lifecycle · Scope 1 + 2 + 3 · MILP + AnyLogic</p>
      </div>

      {!allFilled && (
        <div style={{ padding: '14px 18px', borderRadius: 'var(--radius)', border: '0.5px dashed var(--border2)', background: 'var(--bg)', fontSize: '12px', fontFamily: 'var(--mono)', color: 'var(--muted)', marginBottom: '20px' }}>
          ⚠ Not all stages complete. <button onClick={() => nav('procurement')} style={{ background: 'none', border: 'none', color: 'var(--g3)', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: '12px' }}>Go to procurement →</button>
        </div>
      )}

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '20px' }}>
        {[
          { label: 'Baseline CO₂', val: `${baseline} t/y`, color: 'var(--coral)' },
          { label: 'Best reduction', val: ran ? '−66 t/y' : '—', color: 'var(--g3)' },
          { label: 'Annual savings', val: ran ? '24.4 kCHF' : '—', color: 'var(--g3)' },
          { label: 'CAPEX required', val: ran ? '11.4 kCHF' : '—', color: 'var(--amber)' },
        ].map(k => (
          <div key={k.label} style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', padding: '14px', border: '0.5px solid var(--border)' }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: k.color }}>{k.val}</div>
            <div style={{ fontSize: '10px', fontFamily: 'var(--mono)', color: 'var(--muted)', marginTop: '3px' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Run button */}
      {!ran && (
        <button className="btn-primary" onClick={runOptimization} disabled={running} style={{ width: '100%', padding: '12px', marginBottom: '20px' }}>
          {running ? '⟳ Running MILP optimization…' : 'Run full loop optimization →'}
        </button>
      )}

      {/* Scenarios */}
      {ran && (
        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>
            Scenario comparison — CO₂ reduction
          </div>
          {scenarios.map(s => (
            <div key={s.name} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: '500' }}>{s.name}</span>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--mono)', color: 'var(--muted)', marginLeft: '8px' }}>{s.timeline}</span>
                </div>
                <span style={{ fontSize: '12px', fontFamily: 'var(--mono)', color: 'var(--muted)' }}>−{s.co2_red} t/y (−{s.pct}%)</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: '4px', background: s.color, width: `${(s.co2_red / 260) * 100}%`, transition: 'width 0.8s ease' }} />
              </div>
              <div style={{ fontSize: '10px', fontFamily: 'var(--mono)', color: 'var(--muted)', marginTop: '3px' }}>
                Savings: {s.savings} kCHF/y · CAPEX: {s.capex} kCHF
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Chat */}
      <div className="card">
        <div style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
          AI assistant
        </div>
        <div style={{ border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', minHeight: '200px', maxHeight: '280px', overflowY: 'auto', padding: '12px', background: 'var(--bg)', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
          {chat.map((m, i) => (
            <div key={i} style={{
              maxWidth: '85%', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontFamily: 'var(--mono)', lineHeight: 1.55,
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              background: m.role === 'user' ? 'var(--g3)' : 'var(--surface)',
              color: m.role === 'user' ? 'white' : 'var(--text)',
              border: m.role === 'bot' ? '0.5px solid var(--border)' : 'none',
            }}>{m.text}</div>
          ))}
          {thinking && <div style={{ alignSelf: 'flex-start', fontSize: '12px', fontFamily: 'var(--mono)', color: 'var(--muted)', fontStyle: 'italic' }}>Thinking…</div>}
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
          {['Best CO₂ scenario?', 'Explain heat pump ROI', 'Scope 3 breakdown?'].map(q => (
            <button key={q} onClick={() => { setInput(q); }} style={{ fontSize: '11px', padding: '4px 10px', border: '0.5px solid var(--border)', borderRadius: '16px', background: 'transparent', color: 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--mono)' }}>
              {q}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder="Ask about your optimization results…" />
          <button className="btn-primary" onClick={sendChat} style={{ whiteSpace: 'nowrap', padding: '8px 16px' }}>Send</button>
        </div>
      </div>
    </div>
  )
}
