import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import Icon from '../components/Icon'
import Table from '../components/Table'
import { useToast } from '../components/Toast'
import { useLiveData } from '../api/LiveDataContext'
import { createAgent, ApiSession, invokeToolRaw } from '../api/openclaw'
import { usePageTitle } from '../hooks/usePageTitle'
import { SkeletonCard, SkeletonRow, shimmerStyle } from '../components/SkeletonLoader'
import DataFreshness from '../components/DataFreshness'
import ErrorState from '../components/ErrorState'

/* ── Types ──────────────────────────────────────────────────── */
type AgentStatus = 'online' | 'offline' | 'working'

interface OrgAgent {
  id: string
  name: string
  role: string
  description?: string
  icon: string
  iconBg: string
  model?: string
  status?: AgentStatus
  contextPercent?: number
  session?: ApiSession
  children?: OrgAgent[]
}

interface WorkspaceInfo {
  agent: string
  path: string
  exists: boolean
  files: string[]
}

/* ── Helper Functions ────────────────────────────────────────── */
function statusColor(s: AgentStatus) {
  return { online: '#30D158', offline: '#636366', working: '#007AFF' }[s]
}

function statusLabel(s: AgentStatus, t: any) {
  return { online: t('common.online', 'Online'), offline: t('common.offline', 'Offline'), working: t('agents.status.working', 'Working') }[s]
}

function getAgentStatus(sessions: ApiSession[], agentId: string): { status: AgentStatus; session?: ApiSession; contextPercent?: number } {
  const now = Date.now()
  const maxCtx = 200000

  let agentSession: ApiSession | undefined

  if (agentId === 'main') {
    agentSession = sessions.find(s => s.key === 'agent:main:main')
  } else {
    agentSession = sessions.find(s => {
      const label = (s.label || '').toLowerCase()
      const display = (s.displayName || '').toLowerCase()
      return label.includes(agentId) || display.includes(agentId) || s.key.includes(agentId)
    })
  }

  if (agentSession) {
    const isActive = now - agentSession.updatedAt < 120000
    const ctxPct = agentSession.contextTokens ? Math.min(100, Math.round((agentSession.contextTokens / maxCtx) * 100)) : 0
    return {
      status: isActive ? 'online' : 'offline',
      session: agentSession,
      contextPercent: ctxPct,
    }
  }

  return { status: 'offline' }
}

/* ── Org Chart Data ──────────────────────────────────────────── */
function buildOrgChart(sessions: ApiSession[], t: any): OrgAgent {
  const maisonData = getAgentStatus(sessions, 'main')
  const elonData = getAgentStatus(sessions, 'elon')
  const garyData = getAgentStatus(sessions, 'gary')
  const warrenData = getAgentStatus(sessions, 'warren')

  // Find sub-agents
  const subAgents = sessions.filter(s => s.key.includes('subagent'))

  return {
    id: 'martin',
    name: 'Martin',
    role: 'CEO',
    description: t('agents.orgChart.ceo.desc', 'Vision, strategy and all final decisions. Communicates via Telegram.'),
    icon: 'user',
    iconBg: 'linear-gradient(135deg, #FFD700, #FF8C00)',
    children: [
      {
        id: 'main',
        name: 'Maison',
        role: 'COO',
        description: t('agents.orgChart.coo.desc', 'Research, delegation, orchestration. Coordinates all agents, spawns sub-tasks, reports to Martin. Runs 24/7 with proactive cycles.'),
        icon: 'brain',
        iconBg: 'linear-gradient(135deg, #007AFF, #AF52DE)',
        model: 'Opus 4.6',
        ...maisonData,
        children: [
          {
            id: 'elon',
            name: 'Elon',
            role: 'CTO',
            description: t('agents.orgChart.cto.desc', 'Backend, Frontend, DevOps, QA. Builds and maintains all code in Mission Kontrol and FLOW. Inspired by Elon Musk — move fast, break nothing.'),
            icon: 'rocket',
            iconBg: 'linear-gradient(135deg, #FF3B30, #FF6B35)',
            model: 'GPT 5.2',
            ...elonData,
            children: [
              {
                id: 'frontend-sub',
                name: 'Frontend',
                role: t('agents.orgChart.role.frontend', 'React Development'),
                description: t('agents.orgChart.desc.frontend', 'Implements UI components in React + TypeScript + Tailwind.'),
                icon: 'code',
                iconBg: 'linear-gradient(135deg, #FF6B35, #FF3B30)',
                model: 'Opus 4.6',
              },
              {
                id: 'backend-sub',
                name: 'Backend',
                role: t('agents.orgChart.role.backend', 'API & Database'),
                description: t('agents.orgChart.desc.backend', 'Supabase, PostgreSQL, API endpoints and data management.'),
                icon: 'server',
                iconBg: 'linear-gradient(135deg, #30D158, #34C759)',
                model: 'GPT 5.2',
              },
              {
                id: 'tester-sub',
                name: 'Tester',
                role: t('agents.orgChart.role.tester', 'QA & Testing'),
                description: t('agents.orgChart.desc.tester', 'Build validation, smoke tests, regression checks.'),
                icon: 'magnifying-glass',
                iconBg: 'linear-gradient(135deg, #5AC8FA, #007AFF)',
                model: 'GPT 5.2',
              },
            ],
          },
          {
            id: 'gary',
            name: 'Gary',
            role: 'CMO',
            description: t('agents.orgChart.cmo.desc', "Content, YouTube, Newsletter, Social Media. Manages all external communication and content pipeline. Inspired by Gary Vaynerchuk — document, don't create."),
            icon: 'megaphone',
            iconBg: 'linear-gradient(135deg, #FF9F0A, #FFCC00)',
            model: 'Opus 4.6',
            ...garyData,
            children: [
              {
                id: 'content-sub',
                name: 'Content',
                role: t('agents.orgChart.role.content', 'Content Creation'),
                description: t('agents.orgChart.desc.content', 'Writes blog posts, social media content, newsletters.'),
                icon: 'doc-text',
                iconBg: 'linear-gradient(135deg, #FF9F0A, #FFCC00)',
                model: 'Opus 4.6',
              },
            ],
          },
          {
            id: 'warren',
            name: 'Warren',
            role: 'CRO',
            description: t('agents.orgChart.cro.desc', 'Products, Growth, Community. Market analysis, competitor intelligence, pricing and growth strategy. Inspired by Warren Buffett — data-driven, long-term.'),
            icon: 'chart-bar',
            iconBg: 'linear-gradient(135deg, #30D158, #34C759)',
            model: 'Sonnet 4.5',
            ...warrenData,
            children: [
              {
                id: 'product-sub',
                name: 'Product',
                role: t('agents.orgChart.role.product', 'Product Development'),
                description: t('agents.orgChart.desc.product', 'Feature prioritization, roadmap, user research.'),
                icon: 'lightbulb',
                iconBg: 'linear-gradient(135deg, #30D158, #34C759)',
                model: 'Sonnet 4.5',
              },
            ],
          },
        ],
      },
    ],
  }
}

/* ── Components ──────────────────────────────────────────────── */
function StatusBadge({ status }: { status: AgentStatus }) {
  const { t } = useTranslation()
  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
      style={{ background: `${statusColor(status)}20`, border: `${statusColor(status)}40` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor(status) }} />
      <span className="text-xs font-semibold" style={{ color: statusColor(status) }}>{statusLabel(status, t)}</span>
    </div>
  )
}

function ProgressBar({ value, color = '#007AFF' }: { value: number; color?: string }) {
  return (
    <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, background: color }} />
    </div>
  )
}

/* ── Org Chart Node ──────────────────────────────────────────── */
function OrgNode({ agent, onClick, size = 'normal' }: { agent: OrgAgent; onClick: () => void; size?: 'large' | 'normal' | 'small' }) {
  const sizeStyles = {
    large: { width: 'w-72', iconSize: 48, padding: 'p-6' },
    normal: { width: 'w-52', iconSize: 32, padding: 'p-4' },
    small: { width: 'w-36', iconSize: 24, padding: 'p-3' },
  }[size]

  return (
    <div
      onClick={onClick}
      className={`${sizeStyles.width} ${sizeStyles.padding} rounded-xl cursor-pointer transition-all duration-300`}
      style={{
        background: agent.status ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(20px)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,122,255,0.3)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div
        className={`${size === 'large' ? 'w-20 h-20' : size === 'normal' ? 'w-16 h-16' : 'w-12 h-12'} rounded-xl flex items-center justify-center mx-auto mb-3`}
        style={{ background: agent.iconBg }}
      >
        <Icon name={agent.icon} size={sizeStyles.iconSize} className="text-white" />
      </div>

      <h3 className={`${size === 'large' ? 'text-lg' : 'text-base'} font-bold text-white text-center mb-0.5`}>{agent.name}</h3>
      <p className={`${size === 'small' ? 'text-[10px]' : 'text-xs'} text-center font-semibold mb-1`} style={{ color: 'rgba(255,255,255,0.6)' }}>{agent.role}</p>

      {agent.description && size !== 'small' && (
        <p className="text-[10px] text-center mb-2 leading-snug" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {agent.description.length > (size === 'large' ? 120 : 80) ? agent.description.slice(0, size === 'large' ? 120 : 80) + '...' : agent.description}
        </p>
      )}

      <div className="flex items-center justify-center gap-2 flex-wrap">
        {agent.status && <StatusBadge status={agent.status} />}
        {agent.model && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(175,82,222,0.15)', color: '#AF52DE' }}>
            {agent.model}
          </span>
        )}
      </div>

      {agent.contextPercent !== undefined && agent.contextPercent > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('agents.context', 'Context')}</span>
            <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.6)' }}>{agent.contextPercent}%</span>
          </div>
          <ProgressBar
            value={agent.contextPercent}
            color={agent.contextPercent > 80 ? '#FF453A' : agent.contextPercent > 50 ? '#FF9F0A' : '#30D158'}
          />
        </div>
      )}
    </div>
  )
}

/* ── Org Chart View ──────────────────────────────────────────── */
function OrgChartView({ orgChart, onSelectAgent }: { orgChart: OrgAgent; onSelectAgent: (agent: OrgAgent) => void }) {
  return (
    <div className="flex flex-col items-center gap-0 py-8">
      {/* Martin (CEO) */}
      <OrgNode agent={orgChart} onClick={() => onSelectAgent(orgChart)} size="normal" />
      <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.15)' }} />

      {/* Maison (COO) */}
      {orgChart.children && orgChart.children.length > 0 && (
        <>
          <OrgNode agent={orgChart.children[0]} onClick={() => orgChart.children && onSelectAgent(orgChart.children[0])} size="large" />

          {/* Vertical line from Maison to department heads */}
          <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.15)' }} />

          {/* Horizontal line connecting all 3 departments */}
          {orgChart.children[0].children && orgChart.children[0].children.length > 1 && (
            <div style={{ width: '60%', maxWidth: '700px', height: '1px', background: 'rgba(255,255,255,0.15)' }} />
          )}

          {/* Department Heads — side by side, each with sub-agents below */}
          <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
            {orgChart.children[0].children && orgChart.children[0].children.map((dept) => (
              <div key={dept.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Vertical connector from horizontal line */}
                <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.15)' }} />

                {/* Department head */}
                <OrgNode agent={dept} onClick={() => onSelectAgent(dept)} size="normal" />

                {/* Sub-agents below */}
                {dept.children && dept.children.length > 0 && (
                  <>
                    <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.15)' }} />
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      {dept.children.map((sub) => (
                        <OrgNode key={sub.id} agent={sub} onClick={() => onSelectAgent(sub)} size="small" />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function AgentOverviewTable({ orgChart, onSelectAgent }: { orgChart: OrgAgent; onSelectAgent: (agent: OrgAgent) => void }) {
  const { t } = useTranslation()
  const { rows, byId } = useMemo(() => {
    const list: OrgAgent[] = []
    const map = new Map<string, OrgAgent>()

    const walk = (a: OrgAgent) => {
      list.push(a)
      map.set(a.id, a)
      a.children?.forEach(walk)
    }
    walk(orgChart)

    // Skip the root "Martin" in overview table (org chart already shows it)
    const sliced = list.filter(a => a.id !== 'martin')

    const toRow = (a: OrgAgent) => ({
      id: a.id,
      name: a.name,
      role: a.role,
      status: (a.status || 'offline') as AgentStatus,
    })

    return { rows: sliced.map(toRow), byId: map }
  }, [orgChart])

  return (
    <Table
      data={rows}
      onRowClick={(r) => {
        const a = byId.get(r.id)
        if (a) onSelectAgent(a)
      }}
      searchable={true}
      searchKeys={['name', 'status']}
      columns={[
        {
          key: 'name',
          header: t('common.name', 'Name'),
          sortable: true,
          sortKey: (r) => r.name,
          render: (r) => (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{r.name}</p>
              <p className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{r.role}</p>
            </div>
          ),
        },
        {
          key: 'status',
          header: t('common.status', 'Status'),
          sortable: true,
          sortKey: (r) => ({ working: 3, online: 2, offline: 1 } as any)[r.status] || 0,
          render: (r) => {
            const color = statusColor(r.status)
            return (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                <span className="text-xs font-semibold" style={{ color }}>{statusLabel(r.status, t)}</span>
              </span>
            )
          },
          className: 'whitespace-nowrap',
        },
      ]}
    />
  )
}

/* ── Standups View ──────────────────────────────────────────── */
interface StandupSession {
  key: string
  label: string
  updatedAt: number
  status: string
  lastMessage?: string
  fullText?: string
}

interface ActionItem {
  text: string
  assignee: string
  agentId: string
  hash: string
}

type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'done'

const AGENT_NAME_MAP: Record<string, string> = {
  maison: 'main', main: 'main',
  elon: 'elon',
  gary: 'gary',
  warren: 'warren',
  frontend: 'frontend',
  backend: 'backend',
}

function hashActionItem(text: string, sessionKey: string): string {
  let h = 0
  const s = sessionKey + '::' + text
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0 }
  return 'ai-' + Math.abs(h).toString(36)
}

function parseActionItems(text: string, sessionKey: string): ActionItem[] {
  const items: ActionItem[] = []
  const lines = text.split('\n')
  for (const line of lines) {
    const match = line.match(/[-*]\s*\[[ x]\]\s*(.+)/)
    if (match) {
      const itemText = match[1].trim()
      let assignee = t('common.unknown', 'Unknown')
      let agentId = 'main'
      const assigneeMatch = itemText.match(/\(?@(\w+)\)?/)
      if (assigneeMatch) {
        assignee = assigneeMatch[1].charAt(0).toUpperCase() + assigneeMatch[1].slice(1)
        agentId = AGENT_NAME_MAP[assigneeMatch[1].toLowerCase()] || 'main'
      }
      items.push({ text: itemText, assignee, agentId, hash: hashActionItem(itemText, sessionKey) })
    }
  }
  return items
}

function loadApprovals(): Record<string, ApprovalStatus> {
  try { return JSON.parse(localStorage.getItem('standup-approvals') || '{}') } catch { return {} }
}

function saveApprovals(approvals: Record<string, ApprovalStatus>) {
  localStorage.setItem('standup-approvals', JSON.stringify(approvals))
}

function StandupsView() {
  const { t, i18n } = useTranslation()
  const [showModal, setShowModal] = useState(false)
  const [topic, setTopic] = useState('')
  const [participants, setParticipants] = useState<Record<string, boolean>>({
    maison: true, elon: true, gary: true, warren: true,
  })
  const [submitting, setSubmitting] = useState(false)
  const [standups, setStandups] = useState<StandupSession[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const [standupTexts, setStandupTexts] = useState<Record<string, string>>({})
  const [standupActions, setStandupActions] = useState<Record<string, ActionItem[]>>({})
  const [approvals, setApprovals] = useState<Record<string, ApprovalStatus>>(loadApprovals)
  const [approvingHash, setApprovingHash] = useState<string | null>(null)

  const participantList = [
    { id: 'maison', name: 'Maison', color: '#007AFF', bg: 'rgba(0,122,255,0.15)' },
    { id: 'elon', name: 'Elon', color: '#FF3B30', bg: 'rgba(255,59,48,0.15)' },
    { id: 'gary', name: 'Gary', color: '#FF9F0A', bg: 'rgba(255,159,10,0.15)' },
    { id: 'warren', name: 'Warren', color: '#30D158', bg: 'rgba(48,209,88,0.15)' },
  ]

  const agentColors: Record<string, string> = {
    main: '#007AFF', elon: '#FF3B30', gary: '#FF9F0A', warren: '#30D158', frontend: '#FF6B35', backend: '#30D158',
  }

  // Fetch standup sessions
  useEffect(() => {
    const fetchStandups = async () => {
      try {
        setFetchError(null)
        const data = await invokeToolRaw('sessions_list', { messageLimit: 5, limit: 20 }) as any
        const text = data.result?.content?.[0]?.text
        let raw: any[] = []
        if (text) { try { raw = JSON.parse(text).sessions || [] } catch { /* */ } }
        if (!raw.length && data.result?.details?.sessions) raw = data.result.details.sessions

        const standupSessions = raw
          .filter((s: any) => (s.label || '').toLowerCase().includes('standup'))
          .map((s: any) => {
            const lastMsg = s.lastMessages?.filter((m: any) => m.role === 'assistant')?.pop()
            return {
              key: s.key,
              label: s.label || '',
              updatedAt: s.updatedAt,
              status: Date.now() - s.updatedAt < 120000 ? 'active' : 'done',
              lastMessage: typeof lastMsg?.content === 'string' ? lastMsg.content : lastMsg?.content?.[0]?.text || lastMsg?.text || '',
            }
          })
          .sort((a: StandupSession, b: StandupSession) => b.updatedAt - a.updatedAt)

        setStandups(standupSessions)
      } catch (e) {
        console.error('Error fetching standups:', e)
        setFetchError(t('agents.standups.error', 'Standups could not be fetched from the server.'))
      } finally {
        setLoading(false)
      }
    }
    fetchStandups()
    const interval = setInterval(fetchStandups, 10000)
    return () => clearInterval(interval)
  }, [refetchTrigger])

  // Start standup
  const handleStartStandup = async () => {
    if (!topic.trim()) return
    setSubmitting(true)
    const activeParticipants = Object.entries(participants).filter(([, v]) => v).map(([k]) => k)
    const today = new Date().toISOString().split('T')[0]
    const prompt = t('agents.standups.facilitatorPrompt', {
      topic,
      participants: activeParticipants.join(', '),
      language: i18n.language === 'vi' ? 'Việt Nam' : 'English'
    })

    try {
      await invokeToolRaw('sessions_spawn', {
        task: prompt,
        label: `standup-${today}`,
        agentId: 'main',
      })
      setShowModal(false)
      setTopic('')
    } catch (e) {
      console.error('Error starting standup:', e)
    } finally {
      setSubmitting(false)
    }
  }

  // Expand standup
  const handleExpand = async (standup: StandupSession) => {
    if (expandedKey === standup.key) { setExpandedKey(null); return }
    setExpandedKey(standup.key)

    if (standupTexts[standup.key]) return // already fetched

    try {
      const data = await invokeToolRaw('sessions_history', { sessionKey: standup.key, limit: 50, includeTools: false }) as any
      const text = data.result?.content?.[0]?.text
      let msgs: any[] = []
      if (text) { try { msgs = JSON.parse(text).messages || [] } catch { /* */ } }
      if (!msgs.length && data.result?.details?.messages) msgs = data.result.details.messages

      const mapped = msgs.map((m: any) => ({
        role: m.role,
        text: typeof m.content === 'string' ? m.content : m.content?.[0]?.text || m.text || '',
      }))

      const lastAssistant = mapped.filter((m: { role: string }) => m.role === 'assistant').pop()
      const fullText = lastAssistant?.text || ''
      setStandupTexts(prev => ({ ...prev, [standup.key]: fullText }))
      setStandupActions(prev => ({ ...prev, [standup.key]: parseActionItems(fullText, standup.key) }))
    } catch (e) {
      console.error('Error fetching standup history:', e)
    }
  }

  // Approve action
  const handleApprove = async (item: ActionItem) => {
    setApprovingHash(item.hash)
    try {
      const today = new Date().toISOString().split('T')[0]
      await invokeToolRaw('sessions_spawn', {
        task: t('agents.standups.approvedTaskPrompt', { task: item.text }),
        agentId: item.agentId,
        label: `approved-task-${today}`,
      })
      const next = { ...approvals, [item.hash]: 'approved' as ApprovalStatus }
      setApprovals(next)
      saveApprovals(next)
    } catch (e) {
      console.error('Error approving task:', e)
    } finally {
      setApprovingHash(null)
    }
  }

  // Reject action
  const handleReject = (item: ActionItem) => {
    const next = { ...approvals, [item.hash]: 'rejected' as ApprovalStatus }
    setApprovals(next)
    saveApprovals(next)
  }

  // Compute summary stats
  const allActions = Object.values(standupActions).flat()
  const totalItems = allActions.length
  const approvedCount = allActions.filter(a => approvals[a.hash] === 'approved').length
  const rejectedCount = allActions.filter(a => approvals[a.hash] === 'rejected').length
  const pendingCount = totalItems - approvedCount - rejectedCount

  return (
    <div className="py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 max-w-3xl mx-auto">
        <div>
          {totalItems > 0 && (
            <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {t('agents.standups.actionItemsSummary', {
                total: totalItems,
                approved: approvedCount,
                rejected: rejectedCount,
                pending: pendingCount
              }, '{{total}} action items · {{approved}} approved · {{rejected}} rejected · {{pending}} pending')}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm transition-all"
          style={{ background: 'linear-gradient(135deg, #007AFF, #AF52DE)' }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,122,255,0.4)' }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
        >
          <Icon name="chat" size={16} />
          {t('agents.standups.start', 'Start Standup')}
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.85)' }} onClick={() => setShowModal(false)} />
          <div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 p-6 rounded-xl"
            style={{ background: 'rgba(20,20,24,0.98)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(40px)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{t('agents.standups.newStandup', 'New Standup')}</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <Icon name="xmark" size={14} className="text-white/60" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">{t('agents.standups.topic', 'Topic')}</label>
                <input
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder={t('agents.standups.topicPlaceholder', 'e.g. Sprint Planning, Week status...')}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', outline: 'none' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3 text-white">{t('agents.standups.participants', 'Participants')}</label>
                <div className="space-y-2">
                  {participantList.map(p => (
                    <label
                      key={p.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all"
                      style={{
                        background: participants[p.id] ? p.bg : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${participants[p.id] ? p.color + '40' : 'rgba(255,255,255,0.06)'}`,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={participants[p.id]}
                        onChange={e => setParticipants(prev => ({ ...prev, [p.id]: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm font-medium" style={{ color: participants[p.id] ? p.color : 'rgba(255,255,255,0.5)' }}>
                        {p.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleStartStandup}
                disabled={submitting || !topic.trim()}
                className="w-full py-3 rounded-xl font-semibold text-white transition-all"
                style={{
                  background: submitting || !topic.trim() ? 'rgba(0,122,255,0.3)' : 'linear-gradient(135deg, #007AFF, #AF52DE)',
                  opacity: submitting || !topic.trim() ? 0.6 : 1,
                }}
              >
                {submitting ? t('agents.standups.starting', 'Starting...') : t('agents.standups.start', 'Start Standup')}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Standup Cards */}
      <div className="max-w-3xl mx-auto space-y-4">
        {loading ? (
          <div className="max-w-3xl mx-auto space-y-4">
            <style>{shimmerStyle}</style>
            {[1, 2, 3].map(i => <SkeletonCard key={i} lines={2} />)}
          </div>
        ) : fetchError ? (
          <ErrorState
            title={t('agents.standups.fetchError', 'Standups could not be fetched')}
            message={fetchError}
            onRetry={() => { setLoading(true); setRefetchTrigger(n => n + 1) }}
          />
        ) : standups.length === 0 ? (
          <p className="text-center py-8 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {t('agents.standups.noStandups', 'No standups yet. Start the first standup above.')}
          </p>
        ) : (
          standups.map(s => {
            const isExpanded = expandedKey === s.key
            const fullText = standupTexts[s.key] || ''
            const actions = standupActions[s.key] || []

            return (
              <div key={s.key} className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
                {/* Card header */}
                <div className="p-5 cursor-pointer" onClick={() => handleExpand(s)}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,122,255,0.15)' }}>
                        <Icon name="chat" size={18} style={{ color: '#007AFF' }} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{s.label}</h3>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          {new Date(s.updatedAt).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}
                          {' · '}
                          {new Date(s.updatedAt).toLocaleTimeString(i18n.language === 'en' ? 'en-US' : 'vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {actions.length > 0 && (
                        <span className="text-[10px] px-2 py-1 rounded-full font-medium" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
                          {t('agents.standups.tasksCount', { count: actions.length })}
                        </span>
                      )}
                      <span
                        className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{
                          background: s.status === 'active' ? 'rgba(0,122,255,0.15)' : 'rgba(48,209,88,0.15)',
                          color: s.status === 'active' ? '#5AC8FA' : '#30D158',
                        }}
                      >
                        {s.status === 'active' ? t('agents.standups.active', 'Running...') : t('agents.standups.done', 'Finished')}
                      </span>
                      <Icon name={isExpanded ? 'chevron-down' : 'chevron-right'} size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
                    </div>
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    {/* Action Items */}
                    {actions.length > 0 && (
                      <div className="p-5">
                        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          {t('agents.standups.actionItems', 'Action Items')}
                        </p>
                        <div className="space-y-2">
                          {actions.map((item) => {
                            const status = approvals[item.hash] || 'pending'
                            const isApproving = approvingHash === item.hash
                            const color = agentColors[item.agentId] || '#8E8E93'

                            return (
                              <div
                                key={item.hash}
                                className="flex items-center gap-3 p-3 rounded-lg transition-all"
                                style={{
                                  background: status === 'approved' ? 'rgba(48,209,88,0.08)' : status === 'rejected' ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.03)',
                                  border: status === 'approved' ? '1px solid rgba(48,209,88,0.25)' : status === 'rejected' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,122,255,0.2)',
                                }}
                              >
                                {/* Status indicator */}
                                <div className="flex-shrink-0">
                                  {status === 'approved' && <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(48,209,88,0.2)' }}><Icon name="check" size={12} style={{ color: '#30D158' }} /></div>}
                                  {status === 'rejected' && <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,69,58,0.15)' }}><Icon name="xmark" size={12} style={{ color: '#FF453A' }} /></div>}
                                  {status === 'pending' && <div className="w-6 h-6 rounded-full" style={{ border: '2px solid rgba(0,122,255,0.4)' }} />}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm" style={{
                                    color: status === 'rejected' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.8)',
                                    textDecoration: status === 'rejected' ? 'line-through' : 'none',
                                  }}>
                                    {item.text}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: color + '20', color }}>{item.assignee}</span>
                                    {status === 'approved' && <span className="text-[10px] font-medium" style={{ color: '#30D158' }}>{t('common.approved', 'Approved')}</span>}
                                    {status === 'rejected' && <span className="text-[10px] font-medium" style={{ color: '#FF453A' }}>{t('common.rejected', 'Rejected')}</span>}
                                  </div>
                                </div>

                                {/* Buttons */}
                                {status === 'pending' && (
                                  <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <button
                                      onClick={e => { e.stopPropagation(); handleApprove(item) }}
                                      disabled={isApproving}
                                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                                      style={{ background: 'rgba(48,209,88,0.15)', color: '#30D158', border: '1px solid rgba(48,209,88,0.3)' }}
                                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(48,209,88,0.25)' }}
                                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(48,209,88,0.15)' }}
                                    >
                                      {isApproving ? <div className="w-3 h-3 border border-green-400 border-t-transparent rounded-full animate-spin" /> : <Icon name="check" size={12} />}
                                      {t('common.approve', 'Approve')}
                                    </button>
                                    <button
                                      onClick={e => { e.stopPropagation(); handleReject(item) }}
                                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                                      style={{ background: 'rgba(255,69,58,0.1)', color: '#FF453A', border: '1px solid rgba(255,69,58,0.2)' }}
                                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,69,58,0.2)' }}
                                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,69,58,0.1)' }}
                                    >
                                      <Icon name="xmark" size={12} />
                                      {t('common.reject', 'Reject')}
                                    </button>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Full text (collapsible) */}
                    {fullText && (
                      <div className="px-5 pb-5">
                        <details>
                          <summary className="text-xs font-semibold uppercase tracking-wider cursor-pointer mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            {t('agents.standups.fullMinutes', 'Full minutes')}
                          </summary>
                          <div className="rounded-lg p-4 max-h-96 overflow-y-auto" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <p className="text-xs whitespace-pre-wrap" style={{ color: 'rgba(255,255,255,0.6)' }}>
                              {fullText}
                            </p>
                          </div>
                        </details>
                      </div>
                    )}

                    {/* Loading state */}
                    {!fullText && s.status === 'done' && (
                      <div className="flex items-center justify-center py-6">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

/* ── Workspaces View ──────────────────────────────────────────── */
function WorkspacesView() {
  const [workspaces, setWorkspaces] = useState<WorkspaceInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const agents = ['main', 'elon', 'gary', 'warren', 'frontend', 'backend', 'designer']

    Promise.all(
      agents.map(async (agent) => {
        try {
          const result = await invokeToolRaw('exec', {
            command: `ls -la /data/.openclaw/workspace-${agent}/ 2>/dev/null | tail -n +4 | awk '{print $9}' | grep -v '^$' | head -20`
          }) as { output?: string }
          const files = result.output ? result.output.trim().split('\n').filter((f: string) => f && f !== '.' && f !== '..') : []
          return {
            agent,
            path: `/data/.openclaw/workspace-${agent}/`,
            exists: !result.output?.includes('No such file'),
            files,
          }
        } catch {
          return {
            agent,
            path: `/data/.openclaw/workspace-${agent}/`,
            exists: false,
            files: [],
          }
        }
      })
    ).then(results => {
      setWorkspaces(results)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-8">
        <style>{shimmerStyle}</style>
        {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} lines={3} />)}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-8">
      {workspaces.map((ws) => (
        <div
          key={ws.agent}
          className="rounded-xl p-5"
          style={{
            background: ws.exists ? 'rgba(48,209,88,0.05)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${ws.exists ? 'rgba(48,209,88,0.2)' : 'rgba(255,255,255,0.08)'}`
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: ws.exists ? 'rgba(48,209,88,0.15)' : 'rgba(255,255,255,0.06)' }}
            >
              <Icon name="folder" size={18} style={{ color: ws.exists ? '#30D158' : 'rgba(255,255,255,0.4)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white capitalize">{ws.agent}</h3>
              <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {ws.exists ? t('common.filesCount', '{{count}} files', { count: ws.files.length }) : t('common.notCreated', 'Not created')}
              </p>
            </div>
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: ws.exists ? '#30D158' : '#636366' }}
            />
          </div>

          <div className="mb-3">
            <p className="text-[10px] font-mono mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>PATH</p>
            <p className="text-xs font-mono break-all" style={{ color: 'rgba(255,255,255,0.5)' }}>{ws.path}</p>
          </div>

          {ws.exists && ws.files.length > 0 && (
            <div>
              <p className="text-[10px] font-mono mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>{t('common.files', 'FILES')}</p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {ws.files.slice(0, 10).map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Icon name="doc" size={10} style={{ color: 'rgba(255,255,255,0.3)' }} />
                    <span className="text-xs font-mono truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>{file}</span>
                  </div>
                ))}
                {ws.files.length > 10 && (
                  <p className="text-[10px] italic" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    +{t('common.more', '{{count}} more', { count: ws.files.length - 10 })}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ── Detail Panel ────────────────────────────────────────────── */
function DetailPanel({ agent, onClose }: { agent: OrgAgent; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.85)' }} onClick={onClose} />
      <div
        className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] z-50 overflow-y-auto p-6"
        style={{
          background: 'rgba(10,10,15,0.98)',
          borderLeft: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(40px)',
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">{t('agents.details', 'Agent Details')}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <Icon name="xmark" size={14} className="text-white/60" />
          </button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: agent.iconBg }}
          >
            <Icon name={agent.icon} size={36} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white mb-1">{agent.name}</h3>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{agent.role}</p>
          </div>
        </div>

        {agent.status && <StatusBadge status={agent.status} />}

        {agent.model && (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Model
            </p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {agent.model}
            </p>
          </div>
        )}

        {agent.session && (
          <div className="mt-6 rounded-xl p-4" style={{ background: 'rgba(0,122,255,0.04)', border: '1px solid rgba(0,122,255,0.15)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Icon name="zap" size={14} style={{ color: '#007AFF' }} />
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Session Info
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Total Tokens</p>
                <p className="font-mono font-semibold text-white">{agent.session.totalTokens?.toLocaleString() || '0'}</p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Context Tokens</p>
                <p className="font-mono font-semibold text-white">{agent.session.contextTokens?.toLocaleString() || '0'}</p>
              </div>
            </div>

            {agent.contextPercent !== undefined && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('agents.contextUsage', 'Context Usage')}</span>
                  <span className="text-xs font-mono font-semibold" style={{
                    color: agent.contextPercent > 80 ? '#FF453A' : agent.contextPercent > 50 ? '#FF9F0A' : '#30D158'
                  }}>
                    {agent.contextPercent}%
                  </span>
                </div>
                <ProgressBar
                  value={agent.contextPercent}
                  color={agent.contextPercent > 80 ? '#FF453A' : agent.contextPercent > 50 ? '#FF9F0A' : '#30D158'}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

/* ── Create Modal ────────────────────────────────────────────── */
function CreateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [task, setTask] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    if (!name.trim() || !task.trim()) return
    setCreating(true)
    try {
      await createAgent({
        name: name.trim(),
        task: task.trim(),
        model: 'sonnet',
        label: name.trim().toLowerCase().replace(/\s+/g, '-')
      })
      showToast('success', t('agents.agentCreated', 'Agent created: {{name}}', { name: name.trim() }))
      onClose()
      setName('')
      setTask('')
    } catch (e) {
      console.error('Error creating agent:', e)
      showToast('error', t('agents.createError', 'Could not create agent'))
    } finally {
      setCreating(false)
    }
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.85)' }} onClick={onClose} />
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 p-6 rounded-xl"
        style={{ background: 'rgba(20,20,24,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">{t('agents.tabCreate', 'Create Agent')}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <Icon name="xmark" size={14} className="text-white/60" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-white">{t('common.name', 'Name')}</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="f.eks. Research Agent"
              className="w-full px-4 py-2 rounded-xl text-sm text-white"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', outline: 'none' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white">{t('agents.task', 'Task')}</label>
            <textarea
              value={task}
              onChange={e => setTask(e.target.value)}
              placeholder={t('agents.taskPlaceholder', 'Describe what the agent should do...')}
              rows={4}
              className="w-full px-4 py-2 rounded-xl text-sm text-white resize-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', outline: 'none' }}
            />
          </div>

          <button
            onClick={handleCreate}
            disabled={creating || !name.trim() || !task.trim()}
            className="w-full py-3 rounded-xl font-semibold text-white"
            style={{
              background: creating || !name.trim() || !task.trim() ? 'rgba(0,122,255,0.3)' : 'linear-gradient(135deg, #007AFF, #AF52DE)',
              opacity: creating || !name.trim() || !task.trim() ? 0.6 : 1
            }}
          >
            {creating ? t('common.creating', 'Creating...') : t('agents.tabCreate', 'Create Agent')}
          </button>
        </div>
      </div>
    </>
  )
}

/* ── Agent Chat View (embedded) ──────────────────────────────── */
interface ChatAgentIdentity { name: string; icon: string; color: string; bg: string }

function getChatAgentIdentity(key: string): ChatAgentIdentity {
  const k = key.toLowerCase()
  if (k.includes('elon')) return { name: 'Elon', icon: 'rocket', color: '#FF3B30', bg: 'rgba(255,59,48,0.15)' }
  if (k.includes('gary')) return { name: 'Gary', icon: 'megaphone', color: '#FF9F0A', bg: 'rgba(255,159,10,0.15)' }
  if (k.includes('warren')) return { name: 'Warren', icon: 'chart-bar', color: '#30D158', bg: 'rgba(48,209,88,0.15)' }
  if (k.includes('frontend')) return { name: 'Frontend', icon: 'palette', color: '#FF6B35', bg: 'rgba(255,107,53,0.15)' }
  if (k.includes('backend')) return { name: 'Backend', icon: 'server', color: '#30D158', bg: 'rgba(48,209,88,0.15)' }
  if (k.includes('tester')) return { name: 'Tester', icon: 'magnifying-glass', color: '#AF52DE', bg: 'rgba(175,82,222,0.15)' }
  if (k.includes('main')) return { name: 'Maison', icon: 'zap', color: '#007AFF', bg: 'rgba(0,122,255,0.15)' }
  return { name: 'Agent', icon: 'robot', color: '#8E8E93', bg: 'rgba(142,142,147,0.15)' }
}

interface ChatSession { key: string; label?: string; displayName: string; updatedAt: number; model: string; identity: ChatAgentIdentity }
interface ChatMessage { role: string; text: string; timestamp?: number }

function AgentChatView() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [filter, setFilter] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval>>()

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const fetchSessions = useCallback(async () => {
    try {
      const data = await invokeToolRaw('sessions_list', { messageLimit: 5, limit: 50 }) as any
      const text = data.result?.content?.[0]?.text
      let raw: any[] = []
      if (text) { try { raw = JSON.parse(text).sessions || [] } catch { } }
      if (!raw.length && data.result?.details?.sessions) raw = data.result.details.sessions
      setSessions(raw
        .filter((s: any) => s.key?.includes('subagent') || s.key?.includes('standup'))
        .map((s: any) => ({ key: s.key, label: s.label, displayName: s.displayName || s.label || s.key, updatedAt: s.updatedAt, model: s.model || '', identity: getChatAgentIdentity(s.key) }))
        .sort((a: ChatSession, b: ChatSession) => b.updatedAt - a.updatedAt))
    } catch { } finally { setLoading(false) }
  }, [])

  const fetchMessages = useCallback(async (key: string) => {
    setLoadingMessages(true)
    try {
      const data = await invokeToolRaw('sessions_history', { sessionKey: key, limit: 100, includeTools: false }) as any
      const text = data.result?.content?.[0]?.text
      let msgs: any[] = []
      if (text) { try { msgs = JSON.parse(text).messages || [] } catch { } }
      if (!msgs.length && data.result?.details?.messages) msgs = data.result.details.messages
      setMessages(msgs.map((m: any) => {
        let text = ''
        if (typeof m.content === 'string') {
          text = m.content
        } else if (Array.isArray(m.content)) {
          // Find first text-type block (skip thinking blocks)
          const textBlock = m.content.find((b: any) => b.type === 'text')
          text = textBlock?.text || ''
          // Fallback: try any block with text property
          if (!text) {
            for (const b of m.content) {
              if (b.text && b.type !== 'thinking') { text = b.text; break }
            }
          }
        }
        if (!text) text = m.text || ''
        return { role: m.role, text, timestamp: m.timestamp }
      }).filter((m: any) => m.text.trim().length > 0))
      setTimeout(scrollToBottom, 100)
    } catch { } finally { setLoadingMessages(false) }
  }, [scrollToBottom])

  useEffect(() => {
    fetchSessions()
    pollRef.current = setInterval(() => { fetchSessions(); if (selectedKey) fetchMessages(selectedKey) }, 5000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [fetchSessions, fetchMessages, selectedKey])

  const selectedSession = sessions.find(s => s.key === selectedKey)
  const filteredSessions = filter ? sessions.filter(s => s.displayName.toLowerCase().includes(filter.toLowerCase()) || s.identity.name.toLowerCase().includes(filter.toLowerCase()) || (s.label || '').toLowerCase().includes(filter.toLowerCase())) : sessions
  const formatTime = (ts?: number) => { if (!ts) return ''; return new Date(ts).toLocaleTimeString(i18n.language === 'en' ? 'en-US' : 'vi-VN', { hour: '2-digit', minute: '2-digit' }) }
  const formatChatDate = (ts: number) => { const d = new Date(ts); const now = new Date(); if (d.toDateString() === now.toDateString()) return t('common.today', 'Today'); return d.toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'vi-VN', { day: 'numeric', month: 'short' }) }

  return (
    <div className="flex gap-4 py-4" style={{ height: 'calc(100vh - 280px)' }}>
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 flex flex-col rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="p-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <input type="text" value={filter} onChange={e => setFilter(e.target.value)} placeholder={t('agents.searchSessions', 'Search sessions...')} className="w-full px-3 py-2 rounded-lg text-xs text-white placeholder-white/30" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', outline: 'none' }} />
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-3">
              <style>{shimmerStyle}</style>
              {[1, 2, 3, 4].map(i => <SkeletonRow key={i} />)}
            </div>
          ) : filteredSessions.length === 0 ? <p className="text-center py-8 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{t('agents.noSessions', 'No sessions')}</p>
            : filteredSessions.map(s => (
              <div key={s.key} onClick={() => { setSelectedKey(s.key); fetchMessages(s.key) }} className="px-3 py-3 cursor-pointer transition-all" style={{ background: selectedKey === s.key ? 'rgba(0,122,255,0.12)' : 'transparent', borderLeft: selectedKey === s.key ? '2px solid #007AFF' : '2px solid transparent', borderBottom: '1px solid rgba(255,255,255,0.04)' }} onMouseEnter={e => { if (selectedKey !== s.key) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }} onMouseLeave={e => { if (selectedKey !== s.key) e.currentTarget.style.background = 'transparent' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: s.identity.bg }}><Icon name={s.identity.icon} size={14} style={{ color: s.identity.color }} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between"><p className="text-xs font-semibold text-white truncate">{s.identity.name}</p><span className="text-[10px] flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }}>{formatChatDate(s.updatedAt)}</span></div>
                    <p className="text-[10px] truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.label || s.displayName}</p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {!selectedKey ? (
          <div className="flex-1 flex items-center justify-center"><div className="text-center"><Icon name="chat-bubble" size={48} style={{ color: 'rgba(255,255,255,0.1)' }} /><p className="text-sm mt-4" style={{ color: 'rgba(255,255,255,0.3)' }}>{t('agents.selectSession', 'Select a session to view conversation')}</p></div></div>
        ) : (
          <>
            <div className="px-5 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: selectedSession?.identity.bg }}><Icon name={selectedSession?.identity.icon || 'robot'} size={16} style={{ color: selectedSession?.identity.color }} /></div>
              <div className="flex-1"><p className="text-sm font-semibold text-white">{selectedSession?.identity.name}</p><p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{selectedSession?.label || selectedSession?.displayName} · {selectedSession?.model}</p></div>
              <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: 'rgba(48,209,88,0.15)', color: '#30D158' }}>{t('common.messagesCount', { count: messages.length }, '{{count}} messages')}</span>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {loadingMessages ? <div className="flex items-center justify-center py-12"><div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
                : messages.length === 0 ? <p className="text-center py-8 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{t('agents.noMessages', 'No messages yet')}</p>
                  : messages.map((msg, i) => {
                    const isUser = msg.role === 'user'; const isSystem = msg.role === 'system'; const isAssistant = msg.role === 'assistant'
                    return (
                      <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className="max-w-[75%] rounded-2xl px-4 py-3" style={{ background: isUser ? 'linear-gradient(135deg, #007AFF, #0A84FF)' : isSystem ? 'rgba(255,159,10,0.12)' : 'rgba(255,255,255,0.06)', border: isSystem ? '1px solid rgba(255,159,10,0.25)' : isAssistant ? '1px solid rgba(255,255,255,0.08)' : 'none', backdropFilter: isAssistant ? 'blur(20px)' : undefined }}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-semibold" style={{ color: isUser ? 'rgba(255,255,255,0.8)' : isSystem ? '#FF9F0A' : 'rgba(255,255,255,0.5)' }}>{isUser ? t('agents.task', 'Task') : isSystem ? 'System' : selectedSession?.identity.name || 'Agent'}</span>
                            {msg.timestamp && <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{formatTime(msg.timestamp)}</span>}
                          </div>
                          <p className="text-sm whitespace-pre-wrap break-words" style={{ color: isUser ? '#fff' : isSystem ? 'rgba(255,159,10,0.9)' : 'rgba(255,255,255,0.8)' }}>{msg.text.length > 2000 ? msg.text.slice(0, 2000) + '...' : msg.text}</p>
                        </div>
                      </div>
                    )
                  })}
              <div ref={chatEndRef} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ── Main Page ──────────────────────────────────────────────── */
export default function Agents() {
  const { t, i18n } = useTranslation()
  usePageTitle(t('nav.item.agents', 'Agents'))

  const { sessions, isLoading, error } = useLiveData()
  const [activeTab, setActiveTab] = useState<'org' | 'chat' | 'standups' | 'workspaces'>('org')
  const [selectedAgent, setSelectedAgent] = useState<OrgAgent | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const orgChart = useMemo(() => buildOrgChart(sessions, t), [sessions, t])

  const tabs = [
    { id: 'org' as const, label: t('agents.tabOrg', 'Org Chart'), icon: 'hierarchy' },
    { id: 'chat' as const, label: t('agents.tabChat', 'Chat'), icon: 'chat-bubble' },
    { id: 'standups' as const, label: t('agents.tabStandups', 'Standups'), icon: 'microphone' },
    { id: 'workspaces' as const, label: t('agents.tabWorkspaces', 'Workspaces'), icon: 'briefcase' },
  ]

  return (
    <div className="h-full flex flex-col animate-page-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">{t('nav.item.agents', 'Agents')}</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {t('agents.subtitle', 'AI-powered team members with specialized roles')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DataFreshness />
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm transition-all"
            style={{ background: 'linear-gradient(135deg, #007AFF, #AF52DE)' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,122,255,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
          >
            <Icon name="user-plus" size={16} />
            {t('agents.tabCreate', 'Create Agent')}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap"
            style={{
              background: activeTab === tab.id ? 'rgba(0,122,255,0.15)' : 'rgba(255,255,255,0.03)',
              border: activeTab === tab.id ? '1px solid rgba(0,122,255,0.3)' : '1px solid rgba(255,255,255,0.08)',
              color: activeTab === tab.id ? '#5AC8FA' : 'rgba(255,255,255,0.5)',
            }}
          >
            <Icon name={tab.icon} size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'org' && (
          <div>
            <OrgChartView orgChart={orgChart} onSelectAgent={setSelectedAgent} />

            <div className="max-w-4xl mx-auto px-4 pb-10">
              <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
                <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <h3 className="text-sm font-bold text-white">{t('agents.overview', 'Agent Overview')}</h3>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('common.clickToSort', 'Click columns to sort')}</p>
                </div>

                <AgentOverviewTable orgChart={orgChart} onSelectAgent={setSelectedAgent} />
              </div>
            </div>
          </div>
        )}
        {activeTab === 'chat' && <AgentChatView />}
        {activeTab === 'standups' && <StandupsView />}
        {activeTab === 'workspaces' && <WorkspacesView />}
      </div>

      {selectedAgent && <DetailPanel agent={selectedAgent} onClose={() => setSelectedAgent(null)} />}
      <CreateModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}
