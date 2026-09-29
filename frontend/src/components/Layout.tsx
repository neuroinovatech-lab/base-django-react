import { useState } from 'react'
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import {
  ArrowUpRight,
  ChevronRight,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react'
import { brand, navigation } from '../config'
import { useAuth } from '../lib/auth'
import { ErrorNotice } from './ui'

export function Brand() {
  return (
    <span className="brand">
      <span className="brand-mark">
        <i />
        <i />
        <i />
        <i />
      </span>
      {brand.name}
      <span className="brand-period">.</span>
    </span>
  )
}
export default function Layout() {
  const { user, signOut } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [mobile, setMobile] = useState(false)
  const [error, setError] = useState('')
  const [leaving, setLeaving] = useState(false)
  const location = useLocation()
  const current = navigation.find((n) =>
    n.to === '/' ? location.pathname === '/' : location.pathname.startsWith(n.to),
  )
  const name = user?.first_name || user?.username || ''
  return (
    <div className={`app ${collapsed ? 'is-collapsed' : ''}`}>
      {mobile && (
        <button
          className="sidebar-overlay"
          aria-label="Fechar menu"
          onClick={() => setMobile(false)}
        />
      )}
      <aside className={`sidebar ${mobile ? 'mobile-open' : ''}`}>
        <Link to="/" className="brand-link" aria-label="Base início">
          <Brand />
        </Link>
        <button
          className="icon-button mobile-close"
          onClick={() => setMobile(false)}
          aria-label="Fechar menu"
        >
          <X size={20} />
        </button>
        <div className="workspace">
          <span className="workspace-symbol">B</span>
          <div>
            <strong>Meu espaço</strong>
            <small>Área pessoal</small>
          </div>
          <ChevronRight size={16} />
        </div>
        <span className="nav-label">PRINCIPAL</span>
        <nav aria-label="Menu principal">
          {navigation
            .filter((n) => !n.staff || user?.is_staff)
            .map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setMobile(false)}
                title={collapsed ? label : undefined}
              >
                <Icon size={19} />
                <span>{label}</span>
              </NavLink>
            ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="tiny-dot" />
            <strong>Seu próximo passo</strong>
            <p>
              Organize suas ideias.
              <br />
              Dê espaço ao que vem.
            </p>
            <Link to="/registros">
              Explorar registros <ArrowUpRight size={14} />
            </Link>
          </div>
          <button
            className="collapse-button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            <span>Recolher menu</span>
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-toggle"
              aria-label="Abrir menu"
              onClick={() => setMobile(true)}
            >
              <Menu size={20} />
            </button>
            <span>Meu espaço</span>
            <ChevronRight size={14} />
            <strong>{current?.label || 'Página'}</strong>
          </div>
          <div className="topbar-right">
            <span className="private-label">
              <span className="tiny-dot" />
              Espaço pessoal
            </span>
            <Link to="/configuracoes" className="user-chip">
              <span className="avatar">{name.slice(0, 2).toUpperCase()}</span>
              <span>{name}</span>
            </Link>
            <button
              className="icon-button"
              aria-label="Sair"
              title="Sair"
              disabled={leaving}
              onClick={async () => {
                setLeaving(true)
                try {
                  await signOut()
                } catch (e) {
                  setError((e as Error).message)
                } finally {
                  setLeaving(false)
                }
              }}
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>
        <main id="main-content">
          <ErrorNotice message={error} />
          <Outlet />
        </main>
        <footer className="footer">
          <span>{brand.name} · Feito para o seu próximo passo.</span>
          <span>Seu espaço, do seu jeito.</span>
        </footer>
      </div>
    </div>
  )
}
