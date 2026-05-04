import { useState } from 'react'
import Login from './pages/Login'
import Projects from './pages/Projects'
import Portfolio from './pages/Portfolio'
import SiteDetail from './pages/SiteDetail'
import Layout from './components/Layout'

export default function App() {
  const [user, setUser] = useState(null)
  const [view, setView] = useState({ page:'projects', project:null, site:null })
  if (!user) return <Login onLogin={setUser}/>
  const nav = (page, project=null, site=null) => setView({ page, project, site })
  return (
    <Layout view={view} nav={nav} user={user} setUser={setUser}>
      {view.page==='projects'  && <Projects  nav={nav} user={user}/>}
      {view.page==='portfolio' && <Portfolio nav={nav} project={view.project}/>}
      {view.page==='site'      && <SiteDetail nav={nav} project={view.project} site={view.site}/>}
    </Layout>
  )
}
