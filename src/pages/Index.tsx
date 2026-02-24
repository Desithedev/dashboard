import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Card from '../components/Card'
import SearchBar from '../components/SearchBar'
import Icon from '../components/Icon'
import { useLiveData } from '../api/LiveDataContext'
import { searchWorkspace, invokeToolRaw } from '../api/openclaw'
import { usePageTitle } from '../hooks/usePageTitle'
import { SkeletonRow } from '../components/SkeletonLoader'

type Category = 'all' | 'workspace' | 'sessions' | 'cron' | 'web'

interface SearchResult {
  type: string
  title: string
  subtitle: string
  status?: string
  content?: string
}

export default function Index() {
  const { t } = useTranslation()
  usePageTitle(t('index.title'))

  const { sessions, cronJobs, isLoading } = useLiveData()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<Category>('all')
  const [workspaceResults, setWorkspaceResults] = useState<SearchResult[]>([])
  const [webResults, setWebResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isSearchingWeb, setIsSearchingWeb] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)

  const categoryLabels: Record<Category, string> = {
    all: t('index.category.all'),
    workspace: t('index.category.workspace'),
    sessions: t('index.category.sessions'),
    cron: t('index.category.cron'),
    web: t('index.category.web')
  }

  // Set initialLoad to false after data is loaded
  useEffect(() => {
    if (!isLoading && (sessions.length > 0 || cronJobs.length > 0)) {
      setInitialLoad(false)
    }
  }, [isLoading, sessions, cronJobs])

  // Search in workspace files when search updates
  const performWorkspaceSearch = async (query: string) => {
    if (!query.trim() || (category !== 'all' && category !== 'workspace')) {
      setWorkspaceResults([])
      return
    }

    setIsSearching(true)
    try {
      const results = await searchWorkspace(query)

      const parsed: SearchResult[] = results
        .filter((r: any) => r.file)
        .slice(0, 20)
        .map((r: any) => ({
          type: t('index.category.workspace'),
          title: r.file.split('/').pop() || r.file,
          subtitle: t('common.line', { count: r.line }),
          content: r.text
        }))

      setWorkspaceResults(parsed)
    } catch (err) {
      console.error('Workspace search error:', err)
      setWorkspaceResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Web search
  const performWebSearch = async (query: string) => {
    if (!query.trim() || (category !== 'all' && category !== 'web')) {
      setWebResults([])
      return
    }

    setIsSearchingWeb(true)
    try {
      const result = await invokeToolRaw('web_search', { query }) as any
      const text = result?.result?.content?.[0]?.text || ''

      // Parse simple results from text
      const parsed: SearchResult[] = []
      if (text.length > 0) {
        parsed.push({
          type: t('index.category.web'),
          title: query,
          subtitle: t('index.aiSummary'),
          content: text.slice(0, 500)
        })
      }

      setWebResults(parsed)
    } catch (err) {
      console.error('Web search error:', err)
      setWebResults([])
    } finally {
      setIsSearchingWeb(false)
    }
  }

  // Debounced search
  useMemo(() => {
    const timer = setTimeout(() => {
      performWorkspaceSearch(search)
      performWebSearch(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search, category])

  // Search in sessions
  const sessionResults = useMemo(() => {
    if (!search.trim() || (category !== 'all' && category !== 'sessions')) return []

    const q = search.toLowerCase()
    return sessions
      .filter(s =>
        s.key.toLowerCase().includes(q) ||
        (s.label && s.label.toLowerCase().includes(q))
      )
      .slice(0, 10)
      .map(s => ({
        type: t('index.category.sessions'),
        title: s.key,
        subtitle: `${s.label || t('common.noLabel')} · ${t('common.messagesCount', { count: 0 })}`,
        status: s.kind
      }))
  }, [search, sessions, category])

  // Search in cron jobs
  const cronResults = useMemo(() => {
    if (!search.trim() || (category !== 'all' && category !== 'cron')) return []

    const q = search.toLowerCase()
    return cronJobs
      .filter(c =>
        c.name.toLowerCase().includes(q) ||
        (typeof c.schedule === 'string' ? c.schedule : c.schedule?.expr || '').toLowerCase().includes(q)
      )
      .slice(0, 10)
      .map(c => ({
        type: t('index.category.cron'),
        title: c.name,
        subtitle: typeof c.schedule === 'object' ? (c.schedule?.expr || c.schedule?.kind || t('dashboard.eventRan')) : (c.schedule || ''),
        status: String(c.enabled)
      }))
  }, [search, cronJobs, category])

  // Combine all results
  const allResults = useMemo(() => {
    const combined: SearchResult[] = []

    if (category === 'all' || category === 'web') {
      combined.push(...webResults)
    }
    if (category === 'all' || category === 'workspace') {
      combined.push(...workspaceResults)
    }
    if (category === 'all' || category === 'sessions') {
      combined.push(...sessionResults)
    }
    if (category === 'all' || category === 'cron') {
      combined.push(...cronResults)
    }

    return combined
  }, [webResults, workspaceResults, sessionResults, cronResults, category])

  // Show loading skeleton during initial load
  if (initialLoad && isLoading) {
    return (
      <div>
        <h1 className="text-xl sm:text-2xl font-bold mb-1">{t('index.title')}</h1>
        <p className="caption mb-6">{t('index.subtitle')}</p>
        <div className="w-full">
          <SearchBar value="" onChange={() => { }} placeholder={t('index.searchPlaceholder')} />
          <div className="mt-6 space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Card key={i}>
                <SkeletonRow />
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold mb-1">{t('index.title')}</h1>
      <p className="caption mb-6">{t('index.subtitle')}</p>

      <div className="w-full">
        <SearchBar value={search} onChange={setSearch} placeholder={t('index.searchPlaceholder')} />

        <div className="flex flex-wrap gap-1 mt-4 mb-6">
          {(['all', 'web', 'workspace', 'sessions', 'cron'] as Category[]).map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap`}
              style={{
                minHeight: '44px',
                background: category === c ? '#007AFF' : 'rgba(255,255,255,0.05)',
                border: category === c ? 'none' : '1px solid rgba(255,255,255,0.1)',
                color: category === c ? '#fff' : 'rgba(255,255,255,0.7)'
              }}
            >
              {categoryLabels[c]}
            </button>
          ))}
        </div>

        {!search && (
          <div className="text-center py-16 px-4">
            <Icon name="magnifying-glass" size={40} className="text-white/30 mx-auto mb-4" />
            <p style={{ color: 'rgba(255,255,255,0.4)' }}>
              {t('index.emptySearchTitle')}
            </p>
            <p className="caption mt-2">
              {t('index.emptySearchDescription')}
            </p>
          </div>
        )}

        {search && (isSearching || isSearchingWeb) && (
          <div className="text-center py-8">
            <p style={{ color: 'rgba(255,255,255,0.4)' }}>
              {t('index.searching', { scope: isSearchingWeb ? ` ${t('index.category.web').toLowerCase()}` : '' })}
            </p>
          </div>
        )}

        {search && !isSearching && !isSearchingWeb && allResults.length === 0 && (
          <div className="text-center py-16 px-4">
            <Icon name="magnifying-glass" size={40} className="text-white/20 mx-auto mb-4" />
            <p style={{ color: 'rgba(255,255,255,0.4)' }}>{t('index.noResultsTitle', { query: search })}</p>
            <p className="caption mt-2">{t('index.noResultsDescription')}</p>
          </div>
        )}

        <div className="space-y-2">
          {allResults.map((r, i) => (
            <Card key={i} className="cursor-pointer hover:bg-white/5 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <span
                    className="px-2 py-0.5 rounded-lg text-[11px] font-medium whitespace-nowrap mt-0.5"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      color: 'rgba(255,255,255,0.4)'
                    }}
                  >
                    {r.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium font-mono break-all">{r.title}</p>
                    <p className="caption mt-0.5">{r.subtitle}</p>
                    {r.content && (
                      <p
                        className="text-xs font-mono mt-2 p-2 rounded overflow-x-auto"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          color: 'rgba(255,255,255,0.6)'
                        }}
                      >
                        {r.content}
                      </p>
                    )}
                  </div>
                </div>
                {r.status && (
                  <span
                    className="px-2.5 py-1 rounded-full text-xs whitespace-nowrap"
                    style={{
                      background: r.status === 'active' ? 'rgba(52,199,89,0.1)' :
                        r.status === 'error' ? 'rgba(255,59,48,0.1)' :
                          'rgba(255,255,255,0.06)',
                      color: r.status === 'active' ? '#34C759' :
                        r.status === 'error' ? '#FF3B30' :
                          'rgba(255,255,255,0.4)'
                    }}
                  >
                    {r.status}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>

        {search && allResults.length > 0 && (
          <div className="mt-6 p-4 rounded-xl text-sm" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>
              {t('index.resultsSummary', {
                count: allResults.length,
                scope: category !== 'all' ? ` ${t('common.in')} ${categoryLabels[category]}` : ''
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
