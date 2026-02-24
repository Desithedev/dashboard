import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Card from '../components/Card'
import SearchBar from '../components/SearchBar'
import Modal from '../components/Modal'
import Icon from '../components/Icon'
import { fetchProjects, type Project } from '../api/openclaw'
import { usePageTitle } from '../hooks/usePageTitle'
import { ClientsSkeleton } from '../components/SkeletonLoader'
import DataFreshness from '../components/DataFreshness'

const statusColors: Record<string, { bg: string; text: string }> = {
  active: { bg: 'rgba(52,199,89,0.1)', text: '#34C759' },
  paused: { bg: 'rgba(255,159,10,0.1)', text: '#FF9F0A' },
  planning: { bg: 'rgba(0,122,255,0.1)', text: '#007AFF' },
}

export default function Clients() {
  const { t } = useTranslation()
  usePageTitle(t('clients.title', 'Clients'))

  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  const statusLabels: Record<string, string> = useMemo(() => ({
    active: t('clients.statusActive', 'Active'),
    paused: t('clients.statusPaused', 'Paused'),
    planning: t('clients.statusPlanning', 'Planning'),
  }), [t])

  // Fetch projects on mount
  useEffect(() => {
    async function loadProjects() {
      setLoading(true)
      try {
        const data = await fetchProjects()
        setProjects(data)
      } catch (error) {
        console.error('Failed to load projects:', error)
      } finally {
        setLoading(false)
      }
    }
    loadProjects()
  }, [])

  const filtered = useMemo(() => {
    if (!search) return projects
    const q = search.toLowerCase()
    return projects.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.techStack.some(tech => tech.toLowerCase().includes(q))
    )
  }, [search, projects])

  return (
    <div className="animate-page-in">
      <div className="flex items-center gap-3 mb-1">
        <h1 className="text-xl sm:text-2xl font-bold">{t('clients.title', 'Projects')}</h1>
        <DataFreshness className="ml-auto" />
      </div>
      <p className="caption mb-6">
        {t('clients.subtitle', 'Projects you build with Mission Kontrol')}
      </p>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder={t('clients.searchPlaceholder', 'Search projects...')} />
        </div>
      </div>

      {loading && <ClientsSkeleton />}

      {!loading && (
        <div className="space-y-3">
          {filtered.map((project, projIdx) => (
            <Card key={project.id} style={{ animationDelay: `${projIdx * 50}ms` }}>
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                onClick={() => setSelected(project)}
              >
                <div className="flex items-start gap-4">
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: `${project.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon
                      name={project.icon}
                      size={24}
                      style={{ color: project.color }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-base font-semibold">{project.name}</p>
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{
                          background: statusColors[project.status].bg,
                          color: statusColors[project.status].text,
                        }}
                      >
                        {statusLabels[project.status]}
                      </span>
                    </div>
                    <p className="caption mb-2 leading-relaxed">{project.description}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {project.techStack.map(tech => (
                        <span
                          key={tech}
                          className="text-[10px] font-medium px-2 py-0.5 rounded"
                          style={{
                            background: 'rgba(255,255,255,0.06)',
                            color: 'rgba(255,255,255,0.5)',
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <Icon name="chevron-right" size={16} className="text-white/30 flex-shrink-0" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <Card>
          <div className="text-center py-16 px-4">
            <Icon name="folder" size={40} className="text-white/30 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {projects.length === 0 ? t('clients.noProjectsYet', 'No projects yet') : t('clients.noProjectsFound', 'No projects found')}
            </p>
            <p className="caption max-w-md mx-auto">
              {projects.length === 0
                ? t('clients.noProjectsDescription', 'Your projects will appear here when they are added')
                : t('clients.tryAnotherSearch', 'Try another search')}
            </p>
          </div>
        </Card>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name || ''}>
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: `${selected.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon
                  name={selected.icon}
                  size={32}
                  style={{ color: selected.color }}
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{selected.name}</h3>
                <span
                  className="text-xs font-medium px-2.5 py-1 rounded-full inline-block"
                  style={{
                    background: statusColors[selected.status].bg,
                    color: statusColors[selected.status].text,
                  }}
                >
                  {statusLabels[selected.status]}
                </span>
              </div>
            </div>

            <div>
              <p className="caption mb-2">{t('clients.description', 'Description')}</p>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {selected.description}
              </p>
            </div>

            <div>
              <p className="caption mb-2">{t('clients.techStack', 'Tech Stack')}</p>
              <div className="flex items-center gap-2 flex-wrap">
                {selected.techStack.map(tech => (
                  <span
                    key={tech}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      color: 'rgba(255,255,255,0.8)',
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {selected.id === 'mission-kontrol' && (
              <div className="rounded-lg p-4" style={{ background: 'rgba(0,122,255,0.08)', border: '1px solid rgba(0,122,255,0.2)' }}>
                <div className="flex items-start gap-3">
                  <Icon name="info-circle" size={16} style={{ color: '#007AFF', marginTop: '2px' }} />
                  <div>
                    <p className="text-xs font-semibold mb-1" style={{ color: '#5AC8FA' }}>
                      {t('clients.liveProject', 'Live project')}
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      {t('clients.liveProjectDescription', 'This dashboard you use right now. Deployed on Vercel with automatic CI/CD from GitHub.')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selected.id === 'flow' && (
              <div className="rounded-lg p-4" style={{ background: 'rgba(255,159,10,0.08)', border: '1px solid rgba(255,159,10,0.2)' }}>
                <div className="flex items-start gap-3">
                  <Icon name="pause-circle" size={16} style={{ color: '#FF9F0A', marginTop: '2px' }} />
                  <div>
                    <p className="text-xs font-semibold mb-1" style={{ color: '#FF9F0A' }}>
                      {t('clients.statusPaused', 'Paused')}
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      {t('clients.pausedProjectDescription', 'Development is on pause while Mission Kontrol is built. Resumes later in 2026.')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
