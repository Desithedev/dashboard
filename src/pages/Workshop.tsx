import { useState, useMemo, useEffect, useCallback, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import Card from '../components/Card'
import PageHeader from '../components/PageHeader'
import Icon from '../components/Icon'
import { useLiveData } from '../api/LiveDataContext'
import { runPrompt } from '../api/openclaw'
import { usePageTitle } from '../hooks/usePageTitle'
import { WorkshopSkeleton } from '../components/SkeletonLoader'
import DataFreshness from '../components/DataFreshness'

const HISTORY_KEY = 'mk-workshop-history'
const HISTORY_LIMIT = 10

type PromptHistoryItem = {
  text: string
  ts: number
}

function loadHistory(): PromptHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((x: any) => x && typeof x.text === 'string')
      .map((x: any) => ({ text: String(x.text), ts: typeof x.ts === 'number' ? x.ts : Date.now() }))
      .slice(0, HISTORY_LIMIT)
  } catch {
    return []
  }
}

function saveHistory(items: PromptHistoryItem[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, HISTORY_LIMIT)))
  } catch {
    // ignore
  }
}

export default function Workshop() {
  const { t } = useTranslation()
  usePageTitle(t('workshop.title'))

  const { gatewayConfig, isLoading, skills } = useLiveData() as any
  const [prompt, setPrompt] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState<PromptHistoryItem[]>([])

  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  const persistHistory = useCallback((next: PromptHistoryItem[]) => {
    setHistory(next)
    saveHistory(next)
  }, [])

  const addToHistory = useCallback((text: string) => {
    const clean = text.trim()
    if (!clean) return
    const next: PromptHistoryItem[] = [
      { text: clean, ts: Date.now() },
      ...history.filter(h => h.text !== clean),
    ].slice(0, HISTORY_LIMIT)
    persistHistory(next)
  }, [history, persistHistory])

  const clearHistory = useCallback(() => {
    persistHistory([])
  }, [persistHistory])

  // Get models from config or fallback to known models
  const availableModels = useMemo(() => {
    const configModels = gatewayConfig?.models || []
    if (configModels.length > 0) return configModels

    // Fallback to known models
    return [
      'claude-opus-4-6',
      'claude-sonnet-4-5',
      'claude-opus-4-5',
      'claude-haiku-4-5'
    ]
  }, [gatewayConfig])

  // Set default model
  useEffect(() => {
    if (!selectedModel && availableModels.length > 0) {
      setSelectedModel(availableModels[0])
    }
  }, [availableModels, selectedModel])

  const handleRun = useCallback(async () => {
    const clean = prompt.trim()
    if (!clean) {
      setError(t('workshop.errors.emptyPrompt'))
      return
    }

    addToHistory(clean)

    setIsRunning(true)
    setError('')
    setOutput(t('workshop.spawning'))

    try {
      const res = await runPrompt(clean, selectedModel || undefined)
      setOutput(t('workshop.success', { sessionKey: res.sessionKey }))
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : t('common.error')
      setError(errorMsg)
      setOutput('')
    } finally {
      setIsRunning(false)
    }
  }, [addToHistory, prompt, selectedModel, t])

  const handleTextareaKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter') return
    if (!(e.ctrlKey || e.metaKey)) return
    e.preventDefault()
    if (isRunning) return
    if (!prompt.trim()) return
    void handleRun()
  }, [handleRun, isRunning, prompt])

  // Templates
  const templates = useMemo(() => [
    {
      id: 'websearch',
      name: t('workshop.templateItems.webSearch', 'Web Search'),
      prompt: t('workshop.templateItems.webSearchPrompt', 'Do deep research on: [TOPIC]\n\nUse Perplexity to find the latest sources and summarize the results.')
    },
    {
      id: 'codereview',
      name: t('workshop.templateItems.codeReview', 'Code Review'),
      prompt: t('workshop.templateItems.codeReviewPrompt', 'Review the following code and provide feedback on:\n- Readability\n- Performance\n- Best practices\n\n```\n[CODE]\n```')
    },
    {
      id: 'summarize',
      name: t('workshop.templateItems.summarize', 'Summarize Document'),
      prompt: t('workshop.templateItems.summarizePrompt', 'Read the following document and create a concise summary with key takeaways:\n\n[DOCUMENT]')
    }
  ], [t])

  const fallbackSkills = useMemo(() => (
    [
      { name: 'perplexity', description: t('workshop.skillsDesc.perplexity', 'Web search via Sonar Pro'), status: t('common.installed', 'Installed') },
      { name: 'youtube-watcher', description: t('workshop.skillsDesc.youtube', 'Video transcriptions'), status: t('common.installed', 'Installed') },
    ]
  ), [t])

  const liveSkills = useMemo(() => {
    if (Array.isArray(skills) && skills.length > 0) {
      return skills.map((s: any) => ({
        name: s?.name || t('common.unknown', 'unknown'),
        description: s?.description || t('common.noDescription', 'No description'),
        status: t('common.installed', 'Installed'),
      }))
    }
    return fallbackSkills
  }, [skills, fallbackSkills, t])

  if (isLoading) {
    return <WorkshopSkeleton />
  }

  return (
    <div className="animate-page-in">
      <PageHeader
        title={t('workshop.title')}
        description={t('workshop.description')}
        breadcrumb={[{ label: t('dashboard.title'), href: '#dashboard' }, { label: t('workshop.title') }]}
        actions={<DataFreshness />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2 space-y-4">
          <Card title={t('workshop.promptEditor')} style={{ animationDelay: '0ms' }}>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={handleTextareaKeyDown}
              placeholder={t('workshop.placeholder')}
              className="w-full h-64 resize-none font-mono text-sm"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '12px', padding: '12px', outline: 'none' }}
              disabled={isRunning}
            />
            <div className="mt-2 flex items-center gap-8" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Icon name="command" size={14} style={{ color: 'rgba(255,255,255,0.6)' }} />
                </span>
                <span>{t('workshop.tip')}</span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4">
              <button
                onClick={handleRun}
                disabled={isRunning || !prompt.trim()}
                style={{
                  minHeight: '44px', background: '#007AFF', color: '#fff', padding: '8px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 500, border: 'none',
                  opacity: (isRunning || !prompt.trim()) ? 0.5 : 1,
                  cursor: (isRunning || !prompt.trim()) ? 'not-allowed' : 'pointer'
                }}
              >
                {isRunning ? t('workshop.running') : t('workshop.runPrompt')}
              </button>

              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                className="text-sm"
                style={{ minHeight: '44px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '12px', padding: '8px 16px', outline: 'none', cursor: 'pointer' }}
                disabled={isRunning}
              >
                {availableModels.map((m: any) => (
                  <option key={m} value={m} style={{ background: '#0a0a0f', color: 'rgba(255,255,255,0.9)' }}>{m}</option>
                ))}
              </select>

              <button
                onClick={() => setPrompt('')}
                style={{ minHeight: '44px', background: 'rgba(0,122,255,0.15)', color: '#007AFF', padding: '8px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 500, border: '1px solid rgba(0,122,255,0.3)', cursor: 'pointer', opacity: isRunning ? 0.5 : 1 }}
                disabled={isRunning}
              >
                {t('workshop.reset')}
              </button>
            </div>
          </Card>

          <Card title={t('workshop.output')} style={{ animationDelay: '60ms' }}>
            {error && (
              <div className="rounded-xl p-4 mb-3 text-sm" style={{ background: 'rgba(255,59,48,0.1)', color: '#FF3B30' }}>
                {t('workshop.errorPrefix')} {error}
              </div>
            )}
            <div
              className="rounded-xl p-4 min-h-[120px] max-h-[400px] overflow-y-auto text-sm font-mono whitespace-pre-wrap"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: output ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)'
              }}
            >
              {output || t('workshop.emptyOutput')}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card
            title={t('workshop.history')}
            subtitle={history.length > 0 ? t('workshop.historySubtitle', { count: history.length }) : t('workshop.noHistory')}
            style={{ animationDelay: '120ms' }}
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-8" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Icon name="clock" size={14} style={{ color: 'rgba(255,255,255,0.6)' }} />
                  </span>
                  <span>{t('workshop.clickToReload')}</span>
                </span>
              </div>

              <button
                onClick={clearHistory}
                disabled={history.length === 0}
                style={{
                  minHeight: '36px',
                  background: 'rgba(255,59,48,0.12)',
                  color: '#FF3B30',
                  padding: '6px 10px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: '1px solid rgba(255,59,48,0.25)',
                  cursor: history.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: history.length === 0 ? 0.5 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Icon name="xmark" size={14} style={{ color: '#FF3B30' }} />
                {t('workshop.clearHistory')}
              </button>
            </div>

            {history.length === 0 ? (
              <div className="rounded-xl p-3 text-sm" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {t('workshop.noHistoryDesc')}
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((h, i) => (
                  <div
                    key={`${h.ts}-${i}`}
                    onClick={() => !isRunning && setPrompt(h.text)}
                    className="p-3 rounded-xl cursor-pointer transition-all hover:bg-white/10"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      minHeight: '44px',
                      opacity: isRunning ? 0.5 : 1,
                      cursor: isRunning ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <p className="text-sm font-mono" style={{ color: 'rgba(255,255,255,0.92)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {h.text}
                    </p>
                    <p className="mt-1" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>{t('workshop.clickToInsert')}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title={t('workshop.templates')} subtitle={t('workshop.templatesSubtitle', { count: templates.length })} style={{ animationDelay: '180ms' }}>
            <div className="space-y-2">
              {templates.map(t_item => (
                <div
                  key={t_item.id}
                  onClick={() => !isRunning && setPrompt(t_item.prompt)}
                  className="p-3 rounded-xl cursor-pointer transition-all hover:bg-white/10"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    minHeight: '44px',
                    opacity: isRunning ? 0.5 : 1,
                    cursor: isRunning ? 'not-allowed' : 'pointer'
                  }}
                >
                  <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.92)' }}>{t_item.name}</p>
                  <p className="mt-1" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>{t('workshop.clickToInsert')}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card title={t('workshop.installedSkills')} subtitle={t('workshop.installedSkillsSubtitle', { count: liveSkills.length })}>
            <div className="space-y-2">
              {liveSkills.map((s: any, i: number) => (
                <div key={i} className="flex flex-col gap-1 py-2 glass-row text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium font-mono" style={{ color: 'rgba(255,255,255,0.92)' }}>{s.name}</span>
                    <span
                      className="px-2 py-0.5 rounded-lg text-[11px]"
                      style={{ background: 'rgba(52,199,89,0.1)', color: '#34C759' }}
                    >
                      {s.status}
                    </span>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>{s.description}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card title={t('workshop.info')}>
            <div className="text-xs space-y-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <p>• {t('workshop.infoItem1')}</p>
              <p>• {t('workshop.infoItem2')}</p>
              <p>• {t('workshop.infoItem3')}</p>
              <p>• {t('workshop.infoItem4')}</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
