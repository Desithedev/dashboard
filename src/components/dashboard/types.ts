export interface SystemInfo {
  host?: string
  os?: string
  cpu?: string
  ramTotal?: string
  ramUsed?: string
  ramAvailable?: string
  diskTotal?: string
  diskUsed?: string
  diskPercent?: number
  uptime?: string
  nodeVersion?: string
  openclawVersion?: string
}

export interface Channel {
  name: string
  status: 'ok' | 'warning' | 'setup' | 'off'
  detail: string
  enabled: boolean
}

export interface DailySpend {
  hasData: boolean
  dkk: number
  inputTokens: number
  outputTokens: number
}
