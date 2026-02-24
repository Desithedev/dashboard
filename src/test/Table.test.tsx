import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render } from '@testing-library/react'
// @ts-ignore
import { screen, fireEvent, waitFor } from '@testing-library/react'
import './mocks'
import Table, { Column } from '../components/Table'

afterEach(() => {
  vi.restoreAllMocks()
})

interface TestItem {
  id: string
  name: string
  score: number
  status: string
}

const testData: TestItem[] = [
  { id: '1', name: 'Alfa', score: 90, status: 'active' },
  { id: '2', name: 'Beta', score: 45, status: 'inactive' },
  { id: '3', name: 'Gamma', score: 72, status: 'active' },
  { id: '4', name: 'Delta', score: 10, status: 'inactive' },
  { id: '5', name: 'Epsilon', score: 55, status: 'active' },
]

const columns: Column<TestItem>[] = [
  {
    key: 'name',
    header: 'Name',
    render: item => item.name,
    sortable: true,
    sortKey: item => item.name,
    exportValue: item => item.name,
  },
  {
    key: 'score',
    header: 'Score',
    render: item => item.score,
    sortable: true,
    sortKey: item => item.score,
    exportValue: item => item.score,
  },
  {
    key: 'status',
    header: 'Status',
    render: item => item.status,
  },
]

// Generate N items for pagination tests
function makeMany(n: number): TestItem[] {
  return Array.from({ length: n }, (_, i) => ({
    id: String(i + 1),
    name: `Item ${i + 1}`,
    score: i * 4,
    status: i % 2 === 0 ? 'active' : 'inactive',
  }))
}

describe('Table', () => {
  describe('Basic rendering', () => {
    it('shows table headers', () => {
      render(<Table data={testData} columns={columns} />)
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Score')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
    })

    it('renders all rows', () => {
      render(<Table data={testData} columns={columns} />)
      expect(screen.getByText('Alfa')).toBeInTheDocument()
      expect(screen.getByText('Beta')).toBeInTheDocument()
      expect(screen.getByText('Gamma')).toBeInTheDocument()
    })

    it('shows empty table without error', () => {
      render(<Table data={[]} columns={columns} />)
      const tbody = document.querySelector('tbody')
      expect(tbody).toBeInTheDocument()
      expect(tbody?.querySelectorAll('tr').length).toBe(0)
    })
  })

  describe('Sorting', () => {
    it('sorts ascending on first click', () => {
      render(<Table data={testData} columns={columns} />)
      const nameHeader = screen.getByRole('button', { name: /name/i })
      fireEvent.click(nameHeader)

      const rows = document.querySelectorAll('tbody tr')
      const firstCell = rows[0].querySelector('td')
      expect(firstCell?.textContent).toBe('Alfa')
    })

    it('sorts descending on second click', () => {
      render(<Table data={testData} columns={columns} />)
      const nameHeader = screen.getByRole('button', { name: /name/i })
      fireEvent.click(nameHeader)
      fireEvent.click(nameHeader)

      const rows = document.querySelectorAll('tbody tr')
      const firstCell = rows[0].querySelector('td')
      expect(firstCell?.textContent).toBe('Gamma')
    })

    it('resets sorting on third click', () => {
      render(<Table data={testData} columns={columns} />)
      const nameHeader = screen.getByRole('button', { name: /name/i })
      fireEvent.click(nameHeader) // asc
      fireEvent.click(nameHeader) // desc
      fireEvent.click(nameHeader) // no sorting

      // First element should be the original one again
      const rows = document.querySelectorAll('tbody tr')
      const firstCell = rows[0].querySelector('td')
      expect(firstCell?.textContent).toBe('Alfa')
    })

    it('sorts numerically correct', () => {
      render(<Table data={testData} columns={columns} />)
      const scoreHeader = screen.getByRole('button', { name: /score/i })
      fireEvent.click(scoreHeader) // asc → lowest score first

      const rows = document.querySelectorAll('tbody tr')
      const cells = Array.from(rows).map(r => r.querySelectorAll('td')[1]?.textContent)
      expect(cells[0]).toBe('10')
      expect(cells[cells.length - 1]).toBe('90')
    })

    it('non-sortable columns ignore clicks', () => {
      render(<Table data={testData} columns={columns} />)
      const statusHeader = screen.getByRole('button', { name: /status/i })
      expect(statusHeader).toBeDisabled()
    })
  })

  describe('Search', () => {
    it('filters rows upon search', async () => {
      render(<Table data={testData} columns={columns} searchable />)
      const input = screen.getByPlaceholderText(/search/i)
      fireEvent.change(input, { target: { value: 'Beta' } })

      await waitFor(() => {
        expect(screen.getByText('Beta')).toBeInTheDocument()
        expect(screen.queryByText('Alfa')).not.toBeInTheDocument()
      }, { timeout: 500 })
    })

    it('shows "no results" when no match', async () => {
      render(<Table data={testData} columns={columns} searchable />)
      const input = screen.getByPlaceholderText(/search/i)
      fireEvent.change(input, { target: { value: 'XXXXXXXXXX' } })

      await waitFor(() => {
        expect(screen.getByText(/no results/i)).toBeInTheDocument()
      }, { timeout: 500 })
    })

    it('shows result counter when search is active', async () => {
      render(<Table data={testData} columns={columns} searchable />)
      const input = screen.getByPlaceholderText(/search/i)
      fireEvent.change(input, { target: { value: 'a' } })

      await waitFor(() => {
        const counter = screen.getByText(/of 5/i)
        expect(counter).toBeInTheDocument()
      }, { timeout: 500 })
    })

    it('resets search on Escape', async () => {
      render(<Table data={testData} columns={columns} searchable />)
      const input = screen.getByPlaceholderText(/search/i)
      fireEvent.change(input, { target: { value: 'Beta' } })
      fireEvent.keyDown(input, { key: 'Escape' })
      expect(input).toHaveValue('')
    })
  })

  describe('Pagination', () => {
    it('does not show pagination with fewer than pageSize items', () => {
      render(<Table data={testData} columns={columns} pageSize={20} />)
      expect(screen.queryByRole('button', { name: /next page/i })).not.toBeInTheDocument()
    })

    it('shows pagination with more than pageSize items', () => {
      const bigData = makeMany(25)
      render(<Table data={bigData} columns={columns} pageSize={10} />)
      expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument()
    })

    it('shows "Showing X–Y of Z" text', () => {
      const bigData = makeMany(25)
      render(<Table data={bigData} columns={columns} pageSize={10} />)
      expect(screen.getByText(/showing 1–10 of 25/i)).toBeInTheDocument()
    })

    it('navigates to next page', () => {
      const bigData = makeMany(25)
      render(<Table data={bigData} columns={columns} pageSize={10} />)
      fireEvent.click(screen.getByRole('button', { name: /next page/i }))
      expect(screen.getByText(/showing 11–20 of 25/i)).toBeInTheDocument()
    })

    it('previous button is disabled on first page', () => {
      const bigData = makeMany(25)
      render(<Table data={bigData} columns={columns} pageSize={10} />)
      expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled()
    })

    it('next button is disabled on last page', () => {
      const bigData = makeMany(25)
      render(<Table data={bigData} columns={columns} pageSize={10} />)
      // Navigate to page 3
      fireEvent.click(screen.getByRole('button', { name: /next page/i }))
      fireEvent.click(screen.getByRole('button', { name: /next page/i }))
      expect(screen.getByRole('button', { name: /next page/i })).toBeDisabled()
    })
  })

  describe('CSV Export', () => {
    it('shows export button when exportable=true', () => {
      render(<Table data={testData} columns={columns} exportable />)
      expect(screen.getByText(/export csv/i)).toBeInTheDocument()
    })

    it('hides export button by default', () => {
      render(<Table data={testData} columns={columns} />)
      expect(screen.queryByText(/export csv/i)).not.toBeInTheDocument()
    })

    it('triggers CSV download on click', () => {
      // Render FIRST — then set up mocks
      render(<Table data={testData} columns={columns} exportable exportFilename="test-export" />)

      const clickMock = vi.fn()
      const createObjectURLMock = vi.fn(() => 'blob:mock')
      const revokeObjectURLMock = vi.fn()

      // Mock URL API
      Object.defineProperty(globalThis, 'URL', {
        value: { createObjectURL: createObjectURLMock, revokeObjectURL: revokeObjectURLMock },
        writable: true,
        configurable: true,
      })

      // Mock createElement so <a> gets a click-spy
      const origCreate = document.createElement.bind(document)
      vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        const el = origCreate(tag)
        if (tag === 'a') {
          Object.defineProperty(el, 'click', { value: clickMock, configurable: true })
        }
        return el
      })

      // Spy on appendChild/removeChild without changing behavior
      const appendSpy = vi.spyOn(document.body, 'appendChild')
      const removeSpy = vi.spyOn(document.body, 'removeChild')

      fireEvent.click(screen.getByText(/export csv/i))

      expect(createObjectURLMock).toHaveBeenCalled()
      expect(clickMock).toHaveBeenCalled()
      expect(revokeObjectURLMock).toHaveBeenCalled()
      expect(appendSpy).toHaveBeenCalled()
      expect(removeSpy).toHaveBeenCalled()
    })
  })

  describe('Row interaction', () => {
    it('calls onRowClick on row click', () => {
      const onRowClick = vi.fn()
      render(<Table data={testData} columns={columns} onRowClick={onRowClick} />)
      fireEvent.click(screen.getAllByRole('row')[1]) // first data row
      expect(onRowClick).toHaveBeenCalledWith(testData[0])
    })
  })
})
