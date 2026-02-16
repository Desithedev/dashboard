import { useState, useEffect } from 'react'
import Icon from '../components/Icon'
import { useLiveData } from '../api/LiveDataContext'
import { createAgent, ApiSession, invokeToolRaw } from '../api/openclaw'

/* ── Types ──────────────────────────────────────────────────── */
type AgentStatus = 'online' | 'offline' | 'working'

interface OrgAgent {
  id: string
  name: string
  role: string
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

function statusLabel(s: AgentStatus) {
  return { online: 'Online', offline: 'Offline', working: 'Arbejder' }[s]
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
function buildOrgChart(sessions: ApiSession[]): OrgAgent {
  const maisonData = getAgentStatus(sessions, 'main')
  const elonData = getAgentStatus(sessions, 'elon')
  const garyData = getAgentStatus(sessions, 'gary')
  const warrenData = getAgentStatus(sessions, 'warren')
  
  // Find sub-agents
  const subAgents = sessions.filter(s => s.key.includes('subagent'))
  
  return {
    id: 'martin',
    name: 'Martin',
    role: 'CEO — Vision & Strategi',
    icon: 'user',
    iconBg: 'linear-gradient(135deg, #FFD700, #FF8C00)',
    children: [
      {
        id: 'main',
        name: 'Maison',
        role: 'COO — Research, Delegation, Orkestrering',
        icon: 'brain',
        iconBg: 'linear-gradient(135deg, #007AFF, #AF52DE)',
        model: 'Opus 4.6',
        ...maisonData,
        children: [
          {
            id: 'elon',
            name: 'Elon',
            role: 'CTO — Backend, Frontend, DevOps, QA',
            icon: 'rocket',
            iconBg: 'linear-gradient(135deg, #FF3B30, #FF6B35)',
            model: 'Sonnet 4.5',
            ...elonData,
            children: [
              {
                id: 'frontend-sub',
                name: 'Frontend',
                role: 'React Udvikling',
                icon: 'code',
                iconBg: 'linear-gradient(135deg, #FF6B35, #FF3B30)',
              },
              {
                id: 'backend-sub',
                name: 'Backend',
                role: 'API & Database',
                icon: 'server',
                iconBg: 'linear-gradient(135deg, #30D158, #34C759)',
              },
              {
                id: 'tester-sub',
                name: 'Tester',
                role: 'QA & Testing',
                icon: 'magnifying-glass',
                iconBg: 'linear-gradient(135deg, #5AC8FA, #007AFF)',
              },
            ],
          },
          {
            id: 'gary',
            name: 'Gary',
            role: 'CMO — Content, YouTube, Newsletter, Social',
            icon: 'megaphone',
            iconBg: 'linear-gradient(135deg, #FF9F0A, #FFCC00)',
            model: 'Sonnet 4.5',
            ...garyData,
            children: [
              {
                id: 'content-sub',
                name: 'Content',
                role: 'Content Creation',
                icon: 'doc-text',
                iconBg: 'linear-gradient(135deg, #FF9F0A, #FFCC00)',
              },
            ],
          },
          {
            id: 'warren',
            name: 'Warren',
            role: 'CRO — Produkter, Vækst, Community',
            icon: 'chart-bar',
            iconBg: 'linear-gradient(135deg, #30D158, #34C759)',
            model: 'Sonnet 4.5',
            ...warrenData,
            children: [
              {
                id: 'product-sub',
                name: 'Product',
                role: 'Produktudvikling',
                icon: 'lightbulb',
                iconBg: 'linear-gradient(135deg, #30D158, #34C759)',
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
  return (
    <div 
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
      style={{ background: `${statusColor(status)}20`, border: `1px solid ${statusColor(status)}40` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor(status) }} />
      <span className="text-xs font-semibold" style={{ color: statusColor(status) }}>{statusLabel(status)}</span>
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
    large: { width: 'w-64', iconSize: 48, padding: 'p-6' },
    normal: { width: 'w-44', iconSize: 32, padding: 'p-4' },
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
      
      <h3 className={`${size === 'large' ? 'text-lg' : 'text-base'} font-bold text-white text-center mb-1`}>{agent.name}</h3>
      <p className="text-xs text-center mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>{agent.role}</p>
      
      {agent.status && <div className="flex justify-center"><StatusBadge status={agent.status} /></div>}
      
      {agent.model && (
        <p className="text-xs text-center mt-2 font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>{agent.model}</p>
      )}
      
      {agent.contextPercent !== undefined && agent.contextPercent > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Context</span>
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
    <div className="flex flex-col items-center gap-8 py-8">
      {/* Martin (CEO) */}
      <div className="flex flex-col items-center">
        <OrgNode agent={orgChart} onClick={() => onSelectAgent(orgChart)} size="normal" />
        <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.15)' }} />
      </div>
      
      {/* Maison (COO) */}
      {orgChart.children && orgChart.children.length > 0 && (
        <div className="flex flex-col items-center">
          <OrgNode agent={orgChart.children[0]} onClick={() => orgChart.children && onSelectAgent(orgChart.children[0])} size="large" />
          <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.15)' }} />
          
          {/* Horizontal line for department heads */}
          <div className="relative w-full" style={{ height: '1px', background: 'rgba(255,255,255,0.15)', width: '800px', maxWidth: '90vw' }}>
            <div className="absolute left-0 w-px h-8" style={{ background: 'rgba(255,255,255,0.15)', top: '0' }} />
            <div className="absolute left-1/2 -translate-x-1/2 w-px h-8" style={{ background: 'rgba(255,255,255,0.15)', top: '0' }} />
            <div className="absolute right-0 w-px h-8" style={{ background: 'rgba(255,255,255,0.15)', top: '0' }} />
          </div>
          
          {/* Department Heads (Elon, Gary, Warren) */}
          <div className="flex gap-8 mt-8 flex-wrap justify-center">
            {orgChart.children[0].children && orgChart.children[0].children.map((dept) => (
              <div key={dept.id} className="flex flex-col items-center">
                <OrgNode agent={dept} onClick={() => onSelectAgent(dept)} size="normal" />
                
                {/* Sub-agents */}
                {dept.children && dept.children.length > 0 && (
                  <>
                    <div className="w-px h-6" style={{ background: 'rgba(255,255,255,0.15)' }} />
                    <div className="flex gap-3">
                      {dept.children.map((sub) => (
                        <OrgNode key={sub.id} agent={sub} onClick={() => onSelectAgent(sub)} size="small" />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Standups View ──────────────────────────────────────────── */
function StandupsView() {
  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white mb-6"
          style={{ background: 'linear-gradient(135deg, #007AFF, #AF52DE)', cursor: 'not-allowed', opacity: 0.6 }}
        >
          <Icon name="chat" size={18} />
          Start Standup (kommer snart)
        </div>
        
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Standup funktion kommer snart - agenter vil kunne holde autonome møder
        </p>
      </div>
      
      {/* Mock Standup History */}
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="rounded-xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white mb-1">Sprint Planning — Mission Kontrol v2</h3>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                15. februar 2026 · 14:30
              </p>
            </div>
            <Icon name="clock" size={16} style={{ color: 'rgba(255,255,255,0.3)' }} />
          </div>
          
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(0,122,255,0.15)', color: '#5AC8FA' }}>
              Maison
            </span>
            <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(255,59,48,0.15)', color: '#FF6B35' }}>
              Elon
            </span>
            <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(255,159,10,0.15)', color: '#FF9F0A' }}>
              Gary
            </span>
            <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(48,209,88,0.15)', color: '#30D158' }}>
              Warren
            </span>
          </div>
          
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <input type="checkbox" checked readOnly className="rounded" />
              Implementer org chart view
            </label>
            <label className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <input type="checkbox" readOnly className="rounded" />
              Opret standup automation
            </label>
            <label className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <input type="checkbox" readOnly className="rounded" />
              Launch marketing kampagne
            </label>
          </div>
        </div>
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
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
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
                {ws.exists ? `${ws.files.length} filer` : 'Ikke oprettet'}
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
              <p className="text-[10px] font-mono mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>FILER</p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {ws.files.slice(0, 10).map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Icon name="doc" size={10} style={{ color: 'rgba(255,255,255,0.3)' }} />
                    <span className="text-xs font-mono truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>{file}</span>
                  </div>
                ))}
                {ws.files.length > 10 && (
                  <p className="text-[10px] italic" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    +{ws.files.length - 10} flere
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
          <h2 className="text-xl font-bold text-white">Agent Detaljer</h2>
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
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Context Forbrug</span>
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
      onClose()
      setName('')
      setTask('')
    } catch (e) {
      console.error('Fejl ved oprettelse:', e)
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
          <h2 className="text-xl font-bold text-white">Opret Agent</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <Icon name="xmark" size={14} className="text-white/60" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-white">Navn</label>
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
            <label className="block text-sm font-medium mb-2 text-white">Opgave</label>
            <textarea 
              value={task} 
              onChange={e => setTask(e.target.value)}
              placeholder="Beskriv hvad agenten skal gøre..."
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
            {creating ? 'Opretter...' : 'Opret Agent'}
          </button>
        </div>
      </div>
    </>
  )
}

/* ── Main Page ──────────────────────────────────────────────── */
export default function Agents() {
  const { sessions } = useLiveData()
  const [activeTab, setActiveTab] = useState<'org' | 'standups' | 'workspaces'>('org')
  const [selectedAgent, setSelectedAgent] = useState<OrgAgent | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const orgChart = buildOrgChart(sessions)

  const tabs = [
    { id: 'org' as const, label: 'Org Chart', icon: 'hierarchy' },
    { id: 'standups' as const, label: 'Standups', icon: 'chat' },
    { id: 'workspaces' as const, label: 'Workspaces', icon: 'folder' },
  ]

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Agenter</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            AI-drevne team members med specialiserede roller
          </p>
        </div>
        
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm transition-all"
          style={{ background: 'linear-gradient(135deg, #007AFF, #AF52DE)' }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,122,255,0.4)' }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
        >
          <Icon name="user-plus" size={16} />
          Opret Agent
        </button>
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
        {activeTab === 'org' && <OrgChartView orgChart={orgChart} onSelectAgent={setSelectedAgent} />}
        {activeTab === 'standups' && <StandupsView />}
        {activeTab === 'workspaces' && <WorkspacesView />}
      </div>

      {selectedAgent && <DetailPanel agent={selectedAgent} onClose={() => setSelectedAgent(null)} />}
      <CreateModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}
