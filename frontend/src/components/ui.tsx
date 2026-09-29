import { ArrowLeft, ArrowRight, LoaderCircle, Inbox } from 'lucide-react'
import type { ReactNode } from 'react'
import type { RecordStatus } from '../types'

export const statusLabels: Record<RecordStatus, string> = {
  active: 'Ativo',
  draft: 'Rascunho',
  archived: 'Arquivado',
}
export function Badge({ status }: { status: RecordStatus }) {
  return (
    <span className={`badge ${status}`}>
      <span />
      {statusLabels[status]}
    </span>
  )
}
export function Loading() {
  return (
    <div className="loading" role="status">
      <LoaderCircle className="spin" size={22} /> Carregando…
    </div>
  )
}
export function ErrorNotice({ message }: { message: string }) {
  return message ? (
    <div className="notice error" role="alert">
      {message}
    </div>
  ) : null
}
export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Inbox size={28} />
      </span>
      <h3>{title}</h3>
      <div>{children}</div>
    </div>
  )
}
export function PageTitle({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children?: ReactNode
}) {
  return (
    <div className="page-title">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="page-actions">{children}</div>
    </div>
  )
}
export function Pagination({
  page,
  total,
  onChange,
}: {
  page: number
  total: number
  onChange: (page: number) => void
}) {
  const pages = Math.max(1, Math.ceil(total / 12))
  return (
    <div className="pagination">
      <span>
        {total} {total === 1 ? 'resultado' : 'resultados'}
      </span>
      <div>
        <button
          className="icon-button"
          aria-label="Página anterior"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          <ArrowLeft size={16} />
        </button>
        <span>
          {page} de {pages}
        </span>
        <button
          className="icon-button"
          aria-label="Próxima página"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
        >
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
export const date = (value: string) =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(value),
  )
