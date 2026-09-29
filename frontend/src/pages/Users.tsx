import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { date, ErrorNotice, Loading, PageTitle, Pagination } from '../components/ui'
import type { Page, User } from '../types'

export default function Users() {
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const [data, setData] = useState<Page<User> | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    if (!user?.is_staff) return
    let alive = true
    setData(null)
    setError('')
    api<Page<User>>(`/users/?page=${page}`)
      .then((d) => {
        if (alive) setData(d)
      })
      .catch((e) => {
        if (alive) setError(e.message)
      })
    return () => {
      alive = false
    }
  }, [page, user?.is_staff])
  if (!user?.is_staff) return <Navigate to="/" replace />
  return (
    <>
      <PageTitle
        eyebrow="ADMINISTRAÇÃO"
        title="Pessoas que fazem parte."
        description="Consulte os usuários ativos e seus níveis de acesso."
      >
        <a href="/admin/accounts/user/" target="_blank" rel="noreferrer" className="button primary">
          Gerenciar no admin <ArrowUpRight size={17} />
        </a>
      </PageTitle>
      <section className="panel">
        <ErrorNotice message={error} />
        {!data && !error ? (
          <Loading />
        ) : (
          data && (
            <>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Pessoa</th>
                      <th>E-mail</th>
                      <th>Acesso</th>
                      <th>Desde</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.results.map((person) => (
                      <tr key={person.id}>
                        <td>
                          <strong>
                            {`${person.first_name} ${person.last_name}`.trim() || person.username}
                          </strong>
                          <small className="table-subtitle">@{person.username}</small>
                        </td>
                        <td>{person.email || '—'}</td>
                        <td>
                          <span className={`badge ${person.is_staff ? 'active' : 'archived'}`}>
                            {person.is_staff ? 'Administrador' : 'Usuário'}
                          </span>
                        </td>
                        <td>{date(person.date_joined)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} total={data.count} onChange={setPage} />
            </>
          )
        )}
      </section>
      <p className="subtle-text">
        Criação de contas, desativação e permissões são gerenciadas no painel administrativo do
        Django.
      </p>
    </>
  )
}
