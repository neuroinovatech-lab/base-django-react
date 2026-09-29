import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  Plus,
  FolderOpen,
  CircleCheck,
  FilePenLine,
  Archive,
  Sparkles,
} from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { Badge, date, Empty, ErrorNotice, Loading, PageTitle } from '../components/ui'
import type { Dashboard as DashboardData, Page, RecordItem } from '../types'

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [records, setRecords] = useState<RecordItem[]>([])
  const [error, setError] = useState('')
  useEffect(() => {
    let alive = true
    Promise.all([api<DashboardData>('/dashboard/'), api<Page<RecordItem>>('/records/')])
      .then(([d, r]) => {
        if (alive) {
          setData(d)
          setRecords(r.results.slice(0, 4))
        }
      })
      .catch((e) => {
        if (alive) setError(e.message)
      })
    return () => {
      alive = false
    }
  }, [])
  return (
    <>
      <PageTitle
        eyebrow="SEU ESPAÇO DE TRABALHO"
        title={`Olá, ${user?.first_name || user?.username}.`}
        description="Uma visão clara do que está acontecendo por aqui."
      >
        <Link className="button primary" to="/registros/novo">
          <Plus size={17} />
          Novo registro
        </Link>
      </PageTitle>
      <ErrorNotice message={error} />
      {!data && !error ? (
        <Loading />
      ) : (
        data && (
          <>
            <section className="welcome-card">
              <div>
                <span className="welcome-label">
                  <Sparkles size={14} />
                  CADA IDEIA TEM UM COMEÇO
                </span>
                <h2>
                  O próximo passo
                  <br />
                  começa aqui.
                </h2>
                <p>
                  Reúna informações, acompanhe mudanças
                  <br className="desktop-break" /> e mantenha tudo no lugar.
                </p>
                <Link to="/registros">
                  Ir para meus registros <ArrowRight size={17} />
                </Link>
              </div>
              <div className="block-art" aria-hidden="true">
                <div className="art-grid" />
                <span className="art-block block-one" />
                <span className="art-block block-two" />
                <span className="art-block block-three" />
                <span className="art-caption">CONSTRUA. ORGANIZE. EVOLUA.</span>
              </div>
            </section>
            <section className="stats-grid" aria-label="Resumo dos registros">
              {[
                {
                  label: 'Total de registros',
                  value: data.total,
                  icon: FolderOpen,
                  tone: 'neutral',
                },
                { label: 'Ativos', value: data.active, icon: CircleCheck, tone: 'accent' },
                { label: 'Rascunhos', value: data.draft, icon: FilePenLine, tone: 'amber' },
                { label: 'Arquivados', value: data.archived, icon: Archive, tone: 'neutral' },
              ].map(({ label, value, icon: Icon, tone }) => (
                <div className="stat-card" key={label}>
                  <div>
                    <span>{label}</span>
                    <Icon size={17} />
                  </div>
                  <strong>{value.toString().padStart(2, '0')}</strong>
                  <span className={`stat-caption ${tone}`}>
                    <span className="tiny-dot" />
                    {label === 'Total de registros'
                      ? 'No seu espaço'
                      : label === 'Ativos'
                        ? 'Em andamento'
                        : label === 'Rascunhos'
                          ? 'Aguardando seu próximo passo'
                          : 'Guardados para consultar'}
                  </span>
                </div>
              ))}
            </section>
            <div className="dashboard-grid">
              <section className="panel">
                <div className="section-heading">
                  <div>
                    <h2>Registros recentes</h2>
                    <p>Suas últimas atualizações.</p>
                  </div>
                  <Link className="text-link" to="/registros">
                    Ver todos <ArrowUpRight size={16} />
                  </Link>
                </div>
                {records.length ? (
                  <div className="recent-list">
                    {records.map((record) => (
                      <Link className="recent-row" to={`/registros/${record.id}`} key={record.id}>
                        <span className="record-icon">
                          <FolderOpen size={19} />
                        </span>
                        <div>
                          <strong>{record.title}</strong>
                          <small>
                            {record.category || 'Sem categoria'} · {date(record.updated_at)}
                          </small>
                        </div>
                        <Badge status={record.status} />
                        <ArrowRight className="row-arrow" size={16} />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Empty title="O primeiro registro é seu.">
                    <p>Adicione algo que você quer organizar.</p>
                    <Link className="text-link" to="/registros/novo">
                      Criar registro <ArrowRight size={15} />
                    </Link>
                  </Empty>
                )}
              </section>
              <section className="panel activity-panel">
                <div className="section-heading">
                  <div>
                    <h2>Últimos movimentos</h2>
                    <p>A história do seu espaço.</p>
                  </div>
                  <span className="live-dot" />
                </div>
                {data.activity.length ? (
                  <div className="activity-list">
                    {data.activity.map((item) => (
                      <div className="activity-item" key={item.id}>
                        <span className="activity-dot" />
                        <div>
                          <p>
                            Você {item.verb} <strong>{item.target}</strong>
                          </p>
                          <small>{date(item.created_at)}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty title="Tudo começa agora.">
                    <p>Suas ações aparecerão aqui.</p>
                  </Empty>
                )}
                <Link to="/atividade" className="activity-footer">
                  Ver toda a atividade <ArrowRight size={15} />
                </Link>
              </section>
            </div>
            <div className="quiet-note">
              <span className="note-number">01 /</span>
              <div>
                <strong>Um espaço que acompanha seu ritmo.</strong>
                <p>Comece com um registro. O resto vai tomando forma.</p>
              </div>
              <span className="note-decoration">↗</span>
            </div>
          </>
        )
      )}
    </>
  )
}
