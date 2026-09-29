import { useState, type FormEvent } from 'react'
import { ArrowRight, Layers3, ShieldCheck } from 'lucide-react'
import { Navigate, useLocation } from 'react-router-dom'
import { Brand } from '../components/Layout'
import { ErrorNotice } from '../components/ui'
import { useAuth } from '../lib/auth'
import { brand } from '../config'

export default function Login() {
  const { user, signIn, error: connectionError } = useAuth()
  const location = useLocation()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const from = (location.state as { from?: string } | null)?.from || '/'
  if (user) return <Navigate to={from} replace />
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    const data = new FormData(event.currentTarget)
    try {
      await signIn(String(data.get('username')), String(data.get('password')))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="login-page">
      <section className="login-story">
        <Brand />
        <div>
          <span className="eyebrow">ESPAÇO PARA O QUE VEM</span>
          <h1>
            Grandes ideias
            <br />
            começam com
            <br />
            uma boa <em>base.</em>
          </h1>
          <p>{brand.description}</p>
          <div className="login-illustration" aria-hidden="true">
            <div className="illustration-grid" />
            <Layers3 size={112} strokeWidth={0.7} />
            <span className="orbit-dot" />
          </div>
        </div>
        <span className="story-footer">Simples no começo. Pronto para crescer.</span>
      </section>
      <section className="login-form-wrap">
        <form onSubmit={submit} className="login-form">
          <span className="eyebrow">BEM-VINDO DE VOLTA</span>
          <h2>Entre no seu espaço.</h2>
          <p>Tudo pronto para continuar de onde parou.</p>
          <ErrorNotice message={error || connectionError} />
          <label>
            Usuário
            <input
              name="username"
              autoComplete="username"
              required
              autoFocus
              placeholder="Seu nome de usuário"
            />
          </label>
          <label>
            Senha
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Sua senha"
            />
          </label>
          <button className="button primary" disabled={busy}>
            {busy ? 'Entrando…' : 'Entrar'}
            <ArrowRight size={18} />
          </button>
          <div className="login-help">
            <ShieldCheck size={17} />
            <span>Precisa de acesso? Fale com o administrador.</span>
          </div>
        </form>
        <small className="login-footer">{brand.name} · Seu espaço de trabalho</small>
      </section>
    </div>
  )
}
