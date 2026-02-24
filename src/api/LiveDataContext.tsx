import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react'
import i18n from '../i18n'
import { fetchSessions, fetchStatus, fetchCronJobs, fetchConfig, fetchInstalledSkills, getGatewayToken, ApiSession, CronJobApi, SkillInfo } from './openclaw'

interface LiveData {
  isConnected: boolean
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  lastUpdated: Date | null
  consecutiveErrors: number
  sessions: ApiSession[]
  statusText: string | null
  cronJobs: CronJobApi[]
  gatewayConfig: Record<string, any> | null
  skills: SkillInfo[]
  refresh: () => Promise<void>
}

const LiveDataContext = createContext<LiveData>({
  isConnected: false,
  isLoading: false,
  isRefreshing: false,
  error: null,
  lastUpdated: null,
  consecutiveErrors: 0,
  sessions: [],
  statusText: null,
  cronJobs: [],
  gatewayConfig: null,
  skills: [],
  refresh: async () => {},
})

export function useLiveData() {
  return useContext(LiveDataContext)
}

const CACHE_KEY = 'openclaw-live-cache'
const ACTIVE_POLL_MS = 2500
const HIDDEN_POLL_MS = 15000

function loadCache(): { sessions: ApiSession[], statusText: string | null, cronJobs: CronJobApi[], gatewayConfig: Record<string, any> | null, skills: SkillInfo[] } {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        sessions: parsed.sessions || [],
        statusText: parsed.statusText || null,
        cronJobs: parsed.cronJobs || [],
        gatewayConfig: parsed.gatewayConfig || null,
        skills: parsed.skills || [],
      }
    }
  } catch {}
  return { sessions: [], statusText: null, cronJobs: [], gatewayConfig: null, skills: [] }
}

function saveCache(sessions: ApiSession[], statusText: string | null, cronJobs: CronJobApi[], gatewayConfig: Record<string, any> | null, skills: SkillInfo[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ sessions, statusText, cronJobs, gatewayConfig, skills }))
  } catch {}
}

export function LiveDataProvider({ children }: { children: ReactNode }) {
  const cached = useRef(loadCache())
  const [isConnected, setIsConnected] = useState(cached.current.sessions.length > 0)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [sessions, setSessions] = useState<ApiSession[]>(cached.current.sessions)
  const [statusText, setStatusText] = useState<string | null>(cached.current.statusText)
  const [cronJobs, setCronJobs] = useState<CronJobApi[]>(cached.current.cronJobs)
  const [gatewayConfig, setGatewayConfig] = useState<Record<string, any> | null>(cached.current.gatewayConfig)
  const [skills, setSkills] = useState<SkillInfo[]>(cached.current.skills)
  const [consecutiveErrors, setConsecutiveErrors] = useState(0)
  const inFlightRefresh = useRef(false)
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestSnapshotRef = useRef(cached.current)
  
  // Track previous data hash to only update when data actually changes
  const prevSessionsHash = useRef<string>('')
  const prevStatusHash = useRef<string>('')
  const prevCronHash = useRef<string>('')
  const prevConfigHash = useRef<string>('')
  const prevSkillsHash = useRef<string>('')
  
  // Track if this is first load (show loading only on first load)
  const isFirstLoad = useRef(true)

  useEffect(() => {
    latestSnapshotRef.current = { sessions, statusText, cronJobs, gatewayConfig, skills }
  }, [sessions, statusText, cronJobs, gatewayConfig, skills])

  const refresh = useCallback(async () => {
    if (inFlightRefresh.current) return

    const token = getGatewayToken()
    if (!token) {
      setIsConnected(false)
      return
    }

    inFlightRefresh.current = true
    if (isFirstLoad.current) setIsLoading(true)
    setIsRefreshing(true)
    try {
      const [sessionsData, statusData, cronData, configData, skillsData] = await Promise.all([
        fetchSessions().catch(() => null),
        fetchStatus().catch(() => null),
        fetchCronJobs().catch(() => null),
        fetchConfig().catch(() => null),
        fetchInstalledSkills().catch(() => null),
      ])

      const anySuccess = sessionsData || statusData || cronData !== null || configData || skillsData
      if (anySuccess) {
        setIsConnected(true)
        setError(null)
        setLastUpdated(new Date())
        setConsecutiveErrors(0)
        
        // Only update state if data has actually changed (using hash)
        if (sessionsData) {
          const newHash = JSON.stringify(sessionsData.sessions.map(s => ({
            key: s.key,
            updated: s.updatedAt,
            ctx: s.contextTokens,
            total: s.totalTokens
          })))
          if (newHash !== prevSessionsHash.current) {
            prevSessionsHash.current = newHash
            setSessions(sessionsData.sessions)
          }
        }
        
        if (statusData) {
          const newHash = String(statusData)
          if (newHash !== prevStatusHash.current) {
            prevStatusHash.current = newHash
            setStatusText(statusData)
          }
        }
        
        if (cronData) {
          const newHash = JSON.stringify(cronData.map(c => ({ id: c.id, enabled: c.enabled, lastRun: c.lastRun })))
          if (newHash !== prevCronHash.current) {
            prevCronHash.current = newHash
            setCronJobs(cronData)
          }
        }
        
        if (configData) {
          const newHash = JSON.stringify(configData)
          if (newHash !== prevConfigHash.current) {
            prevConfigHash.current = newHash
            setGatewayConfig(configData)
          }
        }

        if (skillsData) {
          const newHash = JSON.stringify(skillsData.map(s => ({ name: s.name, desc: s.description, loc: s.location })))
          if (newHash !== prevSkillsHash.current) {
            prevSkillsHash.current = newHash
            setSkills(skillsData)
          }
        }
        
        // After first successful load, never show loading again
        isFirstLoad.current = false
        
        // Persist to localStorage so data survives refresh
        const nextSnapshot = {
          sessions: sessionsData ? sessionsData.sessions : latestSnapshotRef.current.sessions,
          statusText: statusData || latestSnapshotRef.current.statusText,
          cronJobs: cronData || latestSnapshotRef.current.cronJobs,
          gatewayConfig: configData || latestSnapshotRef.current.gatewayConfig,
          skills: skillsData || latestSnapshotRef.current.skills,
        }
        latestSnapshotRef.current = nextSnapshot
        saveCache(
          nextSnapshot.sessions,
          nextSnapshot.statusText,
          nextSnapshot.cronJobs,
          nextSnapshot.gatewayConfig,
          nextSnapshot.skills
        )
      } else {
        setIsConnected(false)
        setError(i18n.t('connection.gatewayError', 'Could not connect to Gateway'))
        setConsecutiveErrors(prev => prev + 1)
      }
    } catch {
      setIsConnected(false)
      setError(i18n.t('connection.gatewayError', 'Could not connect to Gateway'))
      setConsecutiveErrors(prev => prev + 1)
    } finally {
      setIsRefreshing(false)
      setIsLoading(false)
      inFlightRefresh.current = false
    }
  }, [])

  useEffect(() => {
    let stopped = false

    const clearPoll = () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current)
        pollTimeoutRef.current = null
      }
    }

    const scheduleNext = () => {
      if (stopped) return
      clearPoll()
      const delay = document.hidden ? HIDDEN_POLL_MS : ACTIVE_POLL_MS
      pollTimeoutRef.current = setTimeout(async () => {
        await refresh()
        scheduleNext()
      }, delay)
    }

    refresh().finally(scheduleNext)
    
    // Also refresh when page becomes visible again
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refresh()
      }
      scheduleNext()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    const handleOnline = () => {
      refresh()
      scheduleNext()
    }
    window.addEventListener('online', handleOnline)
    
    return () => {
      stopped = true
      clearPoll()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('online', handleOnline)
    }
  }, [refresh])

  // Listen for storage changes (when settings are updated)
  useEffect(() => {
    const handler = () => { refresh() }
    window.addEventListener('openclaw-settings-changed', handler)
    return () => window.removeEventListener('openclaw-settings-changed', handler)
  }, [refresh])

  return (
    <LiveDataContext.Provider value={{ 
      isConnected,
      isLoading,
      isRefreshing,
      error,
      lastUpdated,
      consecutiveErrors,
      sessions, 
      statusText, 
      cronJobs, 
      gatewayConfig,
      skills,
      refresh 
    }}>
      {children}
    </LiveDataContext.Provider>
  )
}
