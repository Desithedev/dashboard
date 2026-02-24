import type { Channel } from './types'
import { t } from 'i18next'

export function parseStatusText(text: string): Record<string, string> {
  const result: Record<string, string> = {}
  const lines = text.split('\n')
  for (const line of lines) {
    if (line.includes('OpenClaw')) result.version = line.replace(/🦞\s*/, '').trim()
    if (line.includes('Time:')) result.time = line.replace(/🕒\s*Time:\s*/, '').trim()
    if (line.includes('Model:')) result.model = line.replace(/🧠\s*Model:\s*/, '').split('·')[0].trim()
    if (line.includes('Tokens:')) result.tokens = line.replace(/🧮\s*Tokens:\s*/, '').trim()
    if (line.includes('Context:')) result.context = line.replace(/📚\s*Context:\s*/, '').trim()
    if (line.includes('Session:')) result.session = line.replace(/🧵\s*Session:\s*/, '').trim()
    if (line.includes('Runtime:')) result.runtime = line.replace(/⚙️\s*Runtime:\s*/, '').trim()
    if (line.includes('Queue:')) result.queue = line.replace(/🪢\s*Queue:\s*/, '').trim()
  }
  return result
}

export function deriveChannelsFromConfig(
  config: Record<string, unknown>
): Channel[] {
  const channelNames: Record<string, string> = {
    telegram: 'Telegram', whatsapp: 'WhatsApp', discord: 'Discord',
    slack: 'Slack', imessage: 'iMessage', nostr: 'Nostr',
    signal: 'Signal', googlechat: 'Google Chat',
  }
  const channels: Channel[] = []
  const channelConfigs = (config.channels as Record<string, unknown>) || {}

  for (const [key, chConf] of Object.entries(channelConfigs) as [string, Record<string, unknown>][]) {
    const name = channelNames[key] || key
    const enabled = chConf.enabled !== false
    const hasToken = !!(chConf.token || chConf.botToken)
    const hasCreds = hasToken || chConf.cliPath || chConf.dmPolicy || chConf.allowFrom

    if (!enabled) {
      channels.push({ name, status: 'off', detail: t('connection.status.disabled', 'Disabled'), enabled: false })
    } else if (hasCreds) {
      const details: string[] = []
      if (chConf.dmPolicy) details.push(`dmPolicy: ${chConf.dmPolicy}`)
      if (chConf.groupPolicy) details.push(`groups: ${chConf.groupPolicy}`)
      if (chConf.streamMode) details.push(String(chConf.streamMode))
      channels.push({ name, status: 'ok', detail: details.join(' · ') || t('connection.status.active', 'Active'), enabled: true })
    } else {
      channels.push({ name, status: 'setup', detail: t('connection.status.notConfigured', 'Not configured'), enabled: true })
    }
  }
  return channels
}

export function getTimeGreeting(t_instance?: any): string {
  const t_func = t_instance || t
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return t_func('dashboard.greetings.morning', 'Good morning')
  if (hour >= 12 && hour < 18) return t_func('dashboard.greetings.afternoon', 'Good afternoon')
  if (hour >= 18 && hour < 24) return t_func('dashboard.greetings.evening', 'Good evening')
  return t_func('dashboard.greetings.night', 'Good night')
}

export { formatTimeAgo } from '../../utils/timeAgo'
