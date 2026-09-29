import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Link, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import Layout from './components/Layout'
import { Loading } from './components/ui'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { RecordEditor, Records } from './pages/Records'
import Settings, { applyTheme, type Theme } from './pages/Settings'
import Activity from './pages/Activity'
import Users from './pages/Users'
import './styles.css'

applyTheme((localStorage.getItem('base-theme') as Theme) || 'light')
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (localStorage.getItem('base-theme') === 'system') applyTheme('system')
})
function Protected() {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <Loading />
  return user ? (
    <Outlet />
  ) : (
    <Navigate to="/entrar" state={{ from: location.pathname + location.search }} replace />
  )
}
function App() {
  const { loading } = useAuth()
  if (loading) return <Loading />
  return (
    <Routes>
      <Route path="/entrar" element={<Login />} />
      <Route element={<Protected />}>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="registros" element={<Records />} />
          <Route path="registros/novo" element={<RecordEditor />} />
          <Route path="registros/:id" element={<RecordEditor />} />
          <Route path="atividade" element={<Activity />} />
          <Route path="usuarios" element={<Users />} />
          <Route path="configuracoes" element={<Settings />} />
          <Route
            path="*"
            element={
              <div className="empty">
                <h1>Página não encontrada.</h1>
                <Link to="/" className="button primary">
                  Voltar ao início
                </Link>
              </div>
            }
          />
        </Route>
      </Route>
    </Routes>
  )
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <a className="skip-link" href="#main-content">
          Pular para o conteúdo
        </a>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
