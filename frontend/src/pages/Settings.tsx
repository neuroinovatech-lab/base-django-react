import { useState, type FormEvent } from 'react'
import { Check, Monitor, Moon, Sun, UserRound, LockKeyhole } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { ErrorNotice, PageTitle } from '../components/ui'
import type { User } from '../types'

export type Theme = 'light' | 'dark' | 'system'
export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme =
    theme === 'system'
      ? matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme
}
export default function Settings() {
  const { user, setUser } = useAuth()
  const [theme, setTheme] = useState<Theme>(
    (localStorage.getItem('base-theme') as Theme) || 'light',
  )
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const saveProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setBusy('profile')
    setError('')
    setSuccess('')
    const values = Object.fromEntries(new FormData(e.currentTarget))
    try {
      setUser(await api<User>('/auth/me/', { method: 'PATCH', body: JSON.stringify(values) }))
      setSuccess('Perfil atualizado.')
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setBusy('')
    }
  }
  const savePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    const form = e.currentTarget
    const values = Object.fromEntries(new FormData(form))
    if (values.new_password !== values.confirm_password) {
      setError('As senhas não coincidem.')
      return
    }
    setBusy('password')
    try {
      await api('/auth/password/', { method: 'POST', body: JSON.stringify(values) })
      form.reset()
      setSuccess('Senha alterada com sucesso.')
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setBusy('')
    }
  }
  return (
    <>
      <PageTitle
        eyebrow="PREFERÊNCIAS"
        title="Seu espaço, do seu jeito."
        description="Cuide do seu perfil e escolha como prefere trabalhar."
      />
      <ErrorNotice message={error} />
      {success && (
        <div className="notice success" role="status">
          <Check size={17} />
          {success}
        </div>
      )}
      <div className="settings-grid">
        <form className="panel form-panel" onSubmit={saveProfile}>
          <div className="section-heading">
            <div>
              <h2>Meu perfil</h2>
              <p>Como você aparece no sistema.</p>
            </div>
            <UserRound size={21} />
          </div>
          <div className="form-body">
            <div className="form-columns">
              <label>
                Nome
                <input
                  name="first_name"
                  maxLength={150}
                  defaultValue={user?.first_name}
                  autoComplete="given-name"
                />
              </label>
              <label>
                Sobrenome
                <input
                  name="last_name"
                  maxLength={150}
                  defaultValue={user?.last_name}
                  autoComplete="family-name"
                />
              </label>
            </div>
            <label>
              E-mail
              <input name="email" type="email" defaultValue={user?.email} autoComplete="email" />
            </label>
            <label>
              Usuário
              <input value={user?.username} disabled />
            </label>
            <small className="field-hint">
              O nome de usuário é administrado pela equipe responsável.
            </small>
          </div>
          <div className="form-footer">
            <button className="button primary" disabled={!!busy}>
              {busy === 'profile' ? 'Salvando…' : 'Salvar perfil'}
            </button>
          </div>
        </form>
        <section className="panel appearance-panel">
          <div className="section-heading">
            <div>
              <h2>Aparência</h2>
              <p>Um ambiente confortável para você.</p>
            </div>
          </div>
          <div className="theme-options">
            {[
              { key: 'light' as const, label: 'Claro', icon: Sun },
              { key: 'dark' as const, label: 'Escuro', icon: Moon },
              { key: 'system' as const, label: 'Sistema', icon: Monitor },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                aria-pressed={theme === key}
                className={`theme-option ${theme === key ? 'selected' : ''}`}
                onClick={() => {
                  setTheme(key)
                  localStorage.setItem('base-theme', key)
                  applyTheme(key)
                }}
              >
                <Icon size={22} />
                <span>{label}</span>
              </button>
            ))}
          </div>
          <p className="appearance-note">Sua escolha fica salva neste navegador.</p>
        </section>
        <form className="panel form-panel" onSubmit={savePassword}>
          <div className="section-heading">
            <div>
              <h2>Senha e acesso</h2>
              <p>Atualize sua senha quando precisar.</p>
            </div>
            <LockKeyhole size={21} />
          </div>
          <div className="form-body">
            <label>
              Senha atual
              <input
                name="current_password"
                type="password"
                required
                autoComplete="current-password"
              />
            </label>
            <label>
              Nova senha
              <input
                name="new_password"
                type="password"
                required
                minLength={10}
                maxLength={256}
                autoComplete="new-password"
              />
            </label>
            <label>
              Confirme a nova senha
              <input
                name="confirm_password"
                type="password"
                required
                minLength={10}
                maxLength={256}
                autoComplete="new-password"
              />
            </label>
            <small className="field-hint">
              Use pelo menos 10 caracteres. Evite senhas comuns e dados pessoais.
            </small>
          </div>
          <div className="form-footer">
            <button className="button secondary" disabled={!!busy}>
              {busy === 'password' ? 'Atualizando…' : 'Atualizar senha'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
