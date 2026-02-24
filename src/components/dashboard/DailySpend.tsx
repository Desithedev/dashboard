import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import Card from '../Card'
import Icon from '../Icon'
import { BarChart } from '../Chart'
import type { ApiSession } from '../../api/openclaw'

interface DagsForbrugProps {
  sessions: ApiSession[]
}

interface SessionCost {
  name: string
  cost: number
  model: string
}

interface CostData {
  hasData: boolean
  totalCost: number
  top3: SessionCost[]
  barData: { label: string; value: number; color: string }[]
}

const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  opus: { input: 15, output: 75 },
  sonnet: { input: 3, output: 15 },
  haiku: { input: 0.25, output: 1.25 },
}

const MODEL_COLORS: Record<string, string> = {
  opus: '#AF52DE',
  sonnet: '#007AFF',
  haiku: '#34C759',
}

function getModelKey(model: string): string {
  const m = model.toLowerCase()
  if (m.includes('opus')) return 'opus'
  if (m.includes('sonnet')) return 'sonnet'
  if (m.includes('haiku')) return 'haiku'
  return 'opus'
}

function getModelLabel(key: string): string {
  if (key === 'opus') return 'Opus'
  if (key === 'sonnet') return 'Sonnet'
  if (key === 'haiku') return 'Haiku'
  return key
}

const DailySpend = memo(function DailySpend({ sessions }: DagsForbrugProps) {
  const { t } = useTranslation()

  const costData = useMemo<CostData>(() => {
    const today = new Date()
    const isSameDay = (ts: number) => {
      const d = new Date(ts)
      return (
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate()
      )
    }

    const sessionCosts: SessionCost[] = []
    const modelTotals: Record<string, number> = {}
    let totalCost = 0

    for (const s of sessions) {
      if (!isSameDay(s.updatedAt)) continue

      const modelKey = getModelKey(s.model || '')
      const p = MODEL_PRICING[modelKey] || MODEL_PRICING['opus']

      const total = s.totalTokens || s.contextTokens || 0
      if (total === 0) continue

      const inputTokens = Math.round(total * 0.4)
      const outputTokens = Math.round(total * 0.6)
      const cost = (inputTokens / 1_000_000 * p.input) + (outputTokens / 1_000_000 * p.output)

      totalCost += cost
      modelTotals[modelKey] = (modelTotals[modelKey] || 0) + cost

      const name =
        s.displayName ||
        s.label ||
        (s.key === 'agent:main:main' ? t('dashboard.mainAgent', 'Main Agent') : s.key.split(':').pop() || 'Session')

      sessionCosts.push({ name, cost, model: getModelLabel(modelKey) })
    }

    const top3 = [...sessionCosts].sort((a, b) => b.cost - a.cost).slice(0, 3)

    const barData = Object.entries(modelTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([key, cost]) => ({
        label: getModelLabel(key),
        value: parseFloat(cost.toFixed(4)),
        color: MODEL_COLORS[key] || '#8E8E93',
      }))

    return { hasData: sessionCosts.length > 0, totalCost, top3, barData }
  }, [sessions, t])

  return (
    <Card className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'rgba(255,159,10,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="chart-bar" size={14} style={{ color: '#FF9F0A' }} />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{t('pages.apiUsage.estimatedCost', 'Estimated cost')}</p>
          <p className="caption text-xs">{t('dashboard.tokenCostOverview', 'Token and cost overview')}</p>
        </div>
      </div>

      {!costData.hasData ? (
        <div className="text-center py-8 text-white/50 text-sm">
          <p style={{ color: 'rgba(255,255,255,0.3)' }}>&mdash;</p>
          <p className="mt-1">{t('pages.apiUsage.noTokenData', 'No token data yet')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Total usage */}
          <div className="flex flex-col items-center justify-center">
            <p className="caption text-xs mb-1">{t('pages.apiUsage.totalTokens', 'Total tokens')}</p>
            <p className="text-3xl font-bold text-white">${costData.totalCost.toFixed(2)}</p>
            <p className="caption text-xs mt-1">USD {t('common.loading', 'estimated')}</p>
          </div>

          {/* Top 3 sessions */}
          <div>
            <p className="caption text-xs mb-3">{t('pages.weekly.recentSessionsTitle', 'Recent sessions')}</p>
            <div className="space-y-2">
              {costData.top3.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 600, width: 16 }}>{i + 1}.</span>
                    <span className="truncate text-white/80">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="caption text-xs">{s.model}</span>
                    <span className="font-medium text-white">${s.cost.toFixed(3)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bar chart per model */}
          <div>
            <p className="caption text-xs mb-3">{t('pages.apiUsage.modelsInUse', 'Models in use')}</p>
            {costData.barData.length > 0 ? (
              <BarChart data={costData.barData} height={120} showValues />
            ) : (
              <p className="text-white/30 text-sm text-center py-4">&mdash;</p>
            )}
          </div>
        </div>
      )}
    </Card>
  )
})

export default DailySpend
