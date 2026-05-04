import { LogoMark } from '../pages/Login'

const STAGE_COLORS = { procurement:'#22B578', manufacturing:'#1A9060', logistics:'#0F5C3E', results:'#B07218' }

export default function Layout({ children, view, nav, user, setUser }) {
  return (
    <div className="app">
      <div className="sidebar">
        <div className="nav-logo" onClick={() => nav('projects')}>
          <LogoMark size={22}/>
          <span>OpThemis</span>
        </div>

        <div style={{ flex:1, overflowY:'auto', paddingTop:'4px' }}>
          <NavItem label="Projects" icon={<GridIcon/>} active={view.page==='projects'} onClick={() => nav('projects')}/>

          {view.project && (<>
            <div className="nav-section">{view.project.company}</div>
            <NavItem label="Portfolio" icon={<ListIcon/>} active={view.page==='portfolio'} onClick={() => nav('portfolio', view.project)}/>
            {view.site && (
              <NavItem label={view.site.name} icon={<FactoryIcon/>} active={view.page==='site'} onClick={() => nav('site', view.project, view.site)} sub="Site analysis"/>
            )}
          </>)}
        </div>

        <div className="nav-footer">
          <div className="nav-user">{user?.name}</div>
          <div className="nav-role">{user?.role}</div>
          <button className="nav-signout" onClick={() => setUser(null)}>Sign out</button>
        </div>
      </div>

      <div className="main">
        <div className="inner">{children}</div>
      </div>
    </div>
  )
}

function NavItem({ label, icon, active, onClick, sub }) {
  return (
    <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
      <span style={{ width:14, height:14, flexShrink:0, opacity: active ? 1 : 0.6 }}>{icon}</span>
      <div>
        <div>{label}</div>
        {sub && <div style={{ fontSize:'10px', fontFamily:'var(--mono)', color:'var(--ink-4)', marginTop:'1px' }}>{sub}</div>}
      </div>
    </button>
  )
}

function GridIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="1" y="1" width="5" height="5" rx="1"/><rect x="8" y="1" width="5" height="5" rx="1"/><rect x="1" y="8" width="5" height="5" rx="1"/><rect x="8" y="8" width="5" height="5" rx="1"/></svg>
}
function ListIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><line x1="1" y1="3.5" x2="13" y2="3.5"/><line x1="1" y1="7" x2="13" y2="7"/><line x1="1" y1="10.5" x2="13" y2="10.5"/></svg>
}
function FactoryIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12V6.5l3.5-2v2l4-3v3l3.5-1.5V12H1z"/></svg>
}
