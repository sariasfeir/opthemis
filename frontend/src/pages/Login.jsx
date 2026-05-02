import { useState } from 'react'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('manufacturing')
  const [loading, setLoading] = useState(false)

  const handleLogin = (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setTimeout(() => {
      onLogin({ email, role, name: email.split('@')[0] })
      setLoading(false)
    }, 800)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg)', padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '44px', height: '44px', background: 'var(--g3)',
            borderRadius: '10px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 12px'
          }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <polygon points="11,2 20,18 2,18" fill="white" opacity="0.9"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700' }}>OpThemis</h1>
          <p style={{ fontSize: '12px', fontFamily: 'var(--mono)', color: 'var(--muted)', marginTop: '4px' }}>
            Industrial lifecycle optimization
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="field">
              <label>Email address</label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Your role</label>
              <select value={role} onChange={e => setRole(e.target.value)}>
                <option value="procurement">Procurement</option>
                <option value="manufacturing">Manufacturing / Operations</option>
                <option value="logistics">Logistics</option>
                <option value="consultant">Consultant (full access)</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ marginTop: '6px', padding: '12px' }}
            >
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--muted)', marginTop: '16px' }}>
          opthemis.ch · EPFL Startup Launchpad 2025
        </p>
      </div>
    </div>
  )
}
