import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, Plus, Search, Trash2, FolderOpen } from 'lucide-react'
import { api } from '../lib/api'
import {
  Badge,
  date,
  Empty,
  ErrorNotice,
  Loading,
  PageTitle,
  Pagination,
  statusLabels,
} from '../components/ui'
import type { Page, RecordItem, RecordInput, RecordStatus } from '../types'

export function Records() {
  const [params, setParams] = useSearchParams()
  const page = Math.max(1, Number(params.get('page')) || 1)
  const search = params.get('search') || ''
  const status = params.get('status') || ''
  const [searchInput, setSearchInput] = useState(search)
  const [data, setData] = useState<Page<RecordItem> | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    setSearchInput(search)
  }, [search])
  useEffect(() => {
    let alive = true
    setData(null)
    setError('')
    api<Page<RecordItem>>(
      `/records/?${new URLSearchParams({ page: String(page), search, status })}`,
    )
      .then((d) => {
        if (alive) setData(d)
      })
      .catch((e) => {
        if (alive) setError(e.message)
      })
    return () => {
      alive = false
    }
  }, [page, search, status])
  const update = (values: Record<string, string>) =>
    setParams({ search, status, page: '1', ...values })
  return (
    <>
      <PageTitle
        eyebrow="ORGANIZAÇÃO"
        title="Seus registros."
        description="Informações organizadas, do primeiro rascunho ao próximo passo."
      >
        <Link to="/registros/novo" className="button primary">
          <Plus size={17} />
          Novo registro
        </Link>
      </PageTitle>
      <section className="panel">
        <div className="table-toolbar">
          <form
            className="search-field"
            onSubmit={(e) => {
              e.preventDefault()
              update({ search: searchInput })
            }}
          >
            <Search size={18} />
            <input
              aria-label="Buscar registros"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por nome ou categoria…"
            />
            <button type="submit">Buscar</button>
          </form>
          <select
            aria-label="Filtrar por situação"
            value={status}
            onChange={(e) => update({ status: e.target.value })}
          >
            <option value="">Todas as situações</option>
            {Object.entries(statusLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <ErrorNotice message={error} />
        {!data && !error ? (
          <Loading />
        ) : (
          data && (
            <>
              {data.results.length ? (
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Nome do registro</th>
                        <th>Categoria</th>
                        <th>Situação</th>
                        <th>Atualizado em</th>
                        <th>
                          <span className="sr-only">Abrir</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.results.map((record) => (
                        <tr key={record.id}>
                          <td>
                            <Link className="table-name" to={`/registros/${record.id}`}>
                              <span className="record-icon">
                                <FolderOpen size={18} />
                              </span>
                              {record.title}
                            </Link>
                          </td>
                          <td>{record.category || '—'}</td>
                          <td>
                            <Badge status={record.status} />
                          </td>
                          <td>{date(record.updated_at)}</td>
                          <td>
                            <Link
                              className="icon-button"
                              aria-label={`Editar ${record.title}`}
                              to={`/registros/${record.id}`}
                            >
                              <ArrowUpRight size={18} />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Empty
                  title={
                    search || status
                      ? 'Nenhum registro encontrado.'
                      : 'Espaço para a sua primeira ideia.'
                  }
                >
                  <p>
                    {search || status
                      ? 'Experimente outra busca ou situação.'
                      : 'Crie um registro para começar a organizar.'}
                  </p>
                  {search || status ? (
                    <button className="button secondary" onClick={() => setParams({})}>
                      Limpar filtros
                    </button>
                  ) : (
                    <Link className="button primary" to="/registros/novo">
                      <Plus size={16} />
                      Criar registro
                    </Link>
                  )}
                </Empty>
              )}
              <Pagination
                page={page}
                total={data.count}
                onChange={(p) => update({ page: String(p) })}
              />
            </>
          )
        )}
      </section>
    </>
  )
}

const blank: RecordInput = { title: '', category: '', status: 'draft', notes: '' }
export function RecordEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState<RecordInput>(blank)
  const [loading, setLoading] = useState(Boolean(id))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [confirming, setConfirming] = useState(false)
  useEffect(() => {
    if (!id) {
      setForm(blank)
      setLoading(false)
      return
    }
    let alive = true
    setLoading(true)
    api<RecordItem>(`/records/${id}/`)
      .then((r) => {
        if (alive)
          setForm({ title: r.title, category: r.category, status: r.status, notes: r.notes })
      })
      .catch((e) => {
        if (alive) setError(e.message)
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [id])
  const save = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api(`/records/${id ? `${id}/` : ''}`, {
        method: id ? 'PATCH' : 'POST',
        body: JSON.stringify(form),
      })
      navigate('/registros')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  const remove = async () => {
    setBusy(true)
    setError('')
    try {
      await api(`/records/${id}/`, { method: 'DELETE' })
      navigate('/registros')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <>
      <Link className="back-link" to="/registros">
        <ArrowLeft size={16} />
        Voltar aos registros
      </Link>
      <PageTitle
        eyebrow="REGISTROS"
        title={id ? 'Cada detalhe no lugar.' : 'Dê forma a uma ideia.'}
        description={
          id
            ? 'Revise e atualize as informações do seu registro.'
            : 'Comece pelo essencial. Você pode editar tudo depois.'
        }
      />
      <ErrorNotice message={error} />
      {loading ? (
        <Loading />
      ) : (
        <div className="editor-grid">
          <form className="panel form-panel" onSubmit={save}>
            <div className="section-heading">
              <div>
                <h2>{id ? 'Editar registro' : 'Novo registro'}</h2>
                <p>Os campos com * são obrigatórios.</p>
              </div>
              <FolderOpen size={21} />
            </div>
            <div className="form-body">
              <label>
                Nome do registro *
                <input
                  required
                  maxLength={160}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Como você quer chamar este registro?"
                />
              </label>
              <div className="form-columns">
                <label>
                  Categoria
                  <input
                    maxLength={80}
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="Ex.: Planejamento"
                  />
                </label>
                <label>
                  Situação
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as RecordStatus })}
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                Observações
                <textarea
                  rows={6}
                  maxLength={5000}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Contexto, detalhes e o que mais vale guardar…"
                />
              </label>
              <small className="field-hint">{form.notes.length}/5.000 caracteres</small>
            </div>
            <div className="form-footer">
              <Link className="button secondary" to="/registros">
                Cancelar
              </Link>
              <button className="button primary" disabled={busy || !form.title.trim()}>
                {busy ? 'Salvando…' : 'Salvar registro'}
              </button>
            </div>
          </form>
          <aside className="editor-aside">
            <span className="eyebrow">DO SEU JEITO</span>
            <h3>Organizar é abrir espaço.</h3>
            <p>
              Use categorias para encontrar informações com facilidade. A situação ajuda a
              acompanhar o momento de cada registro.
            </p>
            <div className="status-guide">
              <Badge status="draft" />
              <p>Uma ideia em construção.</p>
              <Badge status="active" />
              <p>Pronto para acompanhar.</p>
              <Badge status="archived" />
              <p>Guardado para consultar depois.</p>
            </div>
            {id && (
              <div className="delete-area">
                {confirming ? (
                  <>
                    <p>Excluir este registro definitivamente?</p>
                    <button className="button danger" onClick={remove} disabled={busy}>
                      Confirmar exclusão
                    </button>
                    <button
                      className="text-button"
                      onClick={() => setConfirming(false)}
                      disabled={busy}
                    >
                      Manter registro
                    </button>
                  </>
                ) : (
                  <button className="text-button danger-text" onClick={() => setConfirming(true)}>
                    <Trash2 size={15} />
                    Excluir registro
                  </button>
                )}
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  )
}
