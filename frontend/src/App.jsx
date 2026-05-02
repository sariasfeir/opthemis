import { useState } from 'react'
import Login from './pages/Login'
import Overview from './pages/Overview'
import Procurement from './pages/Procurement'
import Manufacturing from './pages/Manufacturing'
import Logistics from './pages/Logistics'
import Results from './pages/Results'
import Layout from './components/Layout'

export default function App() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('overview')
  const [projectData, setProjectData] = useState({
    procurement: null,
    manufacturing: null,
    logistics: null,
    results: null,
  })

  if (!user) return <Login onLogin={setUser} />

  const nav = (p) => setPage(p)

  const pages = {
    overview: <Overview nav={nav} projectData={projectData} user={user} />,
    procurement: <Procurement nav={nav} projectData={projectData} setProjectData={setProjectData} />,
    manufacturing: <Manufacturing nav={nav} projectData={projectData} setProjectData={setProjectData} />,
    logistics: <Logistics nav={nav} projectData={projectData} setProjectData={setProjectData} />,
    results: <Results nav={nav} projectData={projectData} setProjectData={setProjectData} />,
  }

  return (
    <Layout page={page} nav={nav} user={user} setUser={setUser}>
      {pages[page] || pages.overview}
    </Layout>
  )
}
