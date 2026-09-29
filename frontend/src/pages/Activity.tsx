import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { date, Empty, ErrorNotice, Loading, PageTitle, Pagination } from '../components/ui'
import type { ActivityItem, Page } from '../types'

export default function Activity() {
  const [page, setPage] = useState(1)
  const [data, setData] = useState<Page<ActivityItem> | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    let alive = true
    setData(null)
    setError('')
    api<Page<ActivityItem>>(`/activity/?page=${page}`)
      .then((d) => {
        if (alive) setData(d)
      })
      .catch((e) => {
        if (alive) setError(e.message)
      })
    return () => {
      alive = false
    }
  }, [page])
  return (
    <>
      <PageTitle
        eyebrow="ACOMPANHAMENTO"
        title="Cada movimento conta."
        description="O histórico das suas alterações em registros."
      />
      <section className="panel">
        <ErrorNotice message={error} />
        {!data && !error ? (
          <Loading />
        ) : (
          data && (
            <>
              {data.results.length ? (
                <div className="activity-list full-activity">
                  {data.results.map((item) => (
                    <div className="activity-item" key={item.id}>
                      <span className="activity-dot" />
                      <div>
                        <p>
                          Você {item.verb} <strong>{item.target}</strong>
                        </p>
                        <small>
                          {date(item.created_at)} às{' '}
                          {new Date(item.created_at).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty title="Seu histórico começa aqui.">
                  <p>As alterações nos seus registros aparecerão nesta página.</p>
                </Empty>
              )}
              <Pagination page={page} total={data.count} onChange={setPage} />
            </>
          )
        )}
      </section>
    </>
  )
}
