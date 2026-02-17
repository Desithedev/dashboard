import { ReactNode, useMemo, useState } from 'react'

export interface Column<T> {
  key: string
  header: string
  render: (item: T) => ReactNode
  className?: string
  sortable?: boolean
  sortKey?: (item: T) => string | number | Date | null | undefined
}

interface TableProps<T> {
  data: T[]
  columns: Column<T>[]
  onRowClick?: (item: T) => void
}

type SortDirection = 'asc' | 'desc'

function normalizeSortValue(v: unknown): string | number | null {
  if (v == null) return null
  if (v instanceof Date) return v.getTime()
  if (typeof v === 'number') return Number.isFinite(v) ? v : null
  if (typeof v === 'string') return v
  if (typeof v === 'boolean') return v ? 1 : 0
  return String(v)
}

function compareValues(aRaw: unknown, bRaw: unknown): number {
  const a = normalizeSortValue(aRaw)
  const b = normalizeSortValue(bRaw)

  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1

  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), 'da', { numeric: true, sensitivity: 'base' })
}

function SortArrow({ direction, active }: { direction: SortDirection | null; active: boolean }) {
  // Single arrow: points up (asc) / down (desc). When unsorted but sortable, show faint down arrow.
  const d: SortDirection = direction ?? 'desc'
  const opacity = active ? 0.75 : 0.28
  const color = active ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.45)'
  const rotation = d === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)'

  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 20 20"
      style={{ opacity, transform: rotation, transition: 'transform 0.12s ease, opacity 0.12s ease' }}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M10 13.5L4.5 8h11L10 13.5z"
        fill={color}
      />
    </svg>
  )
}

export default function Table<T extends { id: string }>({ data, columns, onRowClick }: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDirection | null>(null)

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDir) return data
    const col = columns.find(c => c.key === sortKey)
    if (!col || !col.sortable) return data

    const getValue = (item: T) => {
      if (col.sortKey) return col.sortKey(item)
      return (item as any)?.[col.key]
    }

    const next = [...data]
    next.sort((a, b) => {
      const cmp = compareValues(getValue(a), getValue(b))
      return sortDir === 'asc' ? cmp : -cmp
    })
    return next
  }, [data, columns, sortKey, sortDir])

  const toggleSort = (col: Column<T>) => {
    if (!col.sortable) return
    if (sortKey !== col.key) {
      setSortKey(col.key)
      setSortDir('asc')
      return
    }
    if (sortDir === null) {
      setSortDir('asc')
    } else if (sortDir === 'asc') {
      setSortDir('desc')
    } else {
      setSortKey(null)
      setSortDir(null)
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.04)' }}>
            {columns.map(col => {
              const isActive = sortKey === col.key && sortDir !== null
              const isSortable = !!col.sortable
              return (
                <th
                  key={col.key}
                  className={`text-left px-4 py-3 ${col.className || ''} ${isSortable ? 'select-none' : ''}`}
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: isActive ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.4)',
                    background: 'transparent',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleSort(col)}
                    disabled={!isSortable}
                    className={isSortable ? 'inline-flex items-center gap-2 cursor-pointer' : 'inline-flex items-center gap-2'}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                      margin: 0,
                      color: 'inherit',
                      font: 'inherit',
                      textAlign: 'left',
                      opacity: isSortable ? 1 : 0.95,
                    }}
                  >
                    <span>{col.header}</span>
                    {isSortable && <SortArrow direction={sortKey === col.key ? sortDir : null} active={isActive} />}
                  </button>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {sortedData.map(item => (
            <tr
              key={item.id}
              onClick={() => onRowClick?.(item)}
              className={onRowClick ? 'cursor-pointer' : ''}
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'transparent', transition: 'background 0.15s' }}
              onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
              onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
            >
              {columns.map(col => (
                <td key={col.key} className={`px-4 py-3 text-sm ${col.className || ''}`}>
                  {col.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
