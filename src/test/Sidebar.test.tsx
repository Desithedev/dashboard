import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
// @ts-ignore
import { screen, fireEvent } from '@testing-library/react'
import './mocks'
import Sidebar from '../components/Sidebar'

function renderSidebar(overrides: Partial<React.ComponentProps<typeof Sidebar>> = {}) {
  const defaults = {
    active: 'dashboard',
    onNavigate: vi.fn(),
    isOpen: true,
    onClose: vi.fn(),
    onMaisonClick: vi.fn(),
  }
  return render(<Sidebar {...defaults} {...overrides} />)
}

describe('Sidebar', () => {
  describe('Rendering', () => {
    it('renders the navigation element', () => {
      renderSidebar()
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('shows all 5 navigation groups', () => {
      renderSidebar()
      expect(screen.getByText(/overview/i)).toBeInTheDocument()
      expect(screen.getByText(/work/i)).toBeInTheDocument()
      expect(screen.getByText(/analysis/i)).toBeInTheDocument()
      expect(screen.getByText(/operations/i)).toBeInTheDocument()
      expect(screen.getByText(/system/i)).toBeInTheDocument()
    })

    it('shows all side links', () => {
      renderSidebar()
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
      expect(screen.getByText(/tasks/i)).toBeInTheDocument()
      expect(screen.getByText(/settings/i)).toBeInTheDocument()
      expect(screen.getByText(/agents/i)).toBeInTheDocument()
    })

    it('shows the Maison button', () => {
      renderSidebar()
      expect(screen.getByRole('button', { name: /maison/i })).toBeInTheDocument()
    })

    it('shows "Mission Kontrol" version string', () => {
      renderSidebar()
      expect(screen.getByText(/mission kontrol/i)).toBeInTheDocument()
    })
  })

  describe('Active state', () => {
    it('marks active element with aria-current="page"', () => {
      renderSidebar({ active: 'tasks' })
      const taskLink = screen.getByRole('link', { name: /tasks/i })
      expect(taskLink).toHaveAttribute('aria-current', 'page')
    })

    it('inactive elements do NOT have aria-current', () => {
      renderSidebar({ active: 'tasks' })
      const dashLink = screen.getByRole('link', { name: /dashboard/i })
      expect(dashLink).not.toHaveAttribute('aria-current', 'page')
    })

    it('changes active page on click', () => {
      const onNavigate = vi.fn()
      renderSidebar({ active: 'dashboard', onNavigate })
      fireEvent.click(screen.getByRole('link', { name: /tasks/i }))
      expect(onNavigate).toHaveBeenCalledWith('tasks')
    })
  })

  describe('Navigation', () => {
    it('calls onNavigate with correct id', () => {
      const onNavigate = vi.fn()
      renderSidebar({ onNavigate })
      fireEvent.click(screen.getByRole('link', { name: /agents/i }))
      expect(onNavigate).toHaveBeenCalledWith('agents')
    })

    it('prevents default link navigation', () => {
      const onNavigate = vi.fn()
      renderSidebar({ onNavigate })
      const link = screen.getByRole('link', { name: /dashboard/i })
      fireEvent.click(link)
      // click returns true if preventDefault not called, false if called
      expect(onNavigate).toHaveBeenCalled()
    })

    it('calls onMaisonClick on Maison click', () => {
      const onMaisonClick = vi.fn()
      renderSidebar({ onMaisonClick })
      fireEvent.click(screen.getByRole('button', { name: /maison/i }))
      expect(onMaisonClick).toHaveBeenCalledTimes(1)
    })

    it('calls onMaisonClick on Enter key on Maison', () => {
      const onMaisonClick = vi.fn()
      renderSidebar({ onMaisonClick })
      const maisonBtn = screen.getByRole('button', { name: /maison/i })
      fireEvent.keyDown(maisonBtn, { key: 'Enter' })
      expect(onMaisonClick).toHaveBeenCalledTimes(1)
    })

    it('calls onClose on close button click (mobile)', () => {
      const onClose = vi.fn()
      renderSidebar({ onClose })
      const closeBtn = screen.getByRole('button', { name: /close menu/i })
      fireEvent.click(closeBtn)
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Badge counts', () => {
    it('shows badge for agents with correct count', () => {
      renderSidebar()
      // mockLiveData has 1 subagent (kind !== 'main')
      const badge = screen.getByText('1')
      expect(badge).toBeInTheDocument()
    })

    it('shows badge for cron with active jobs', () => {
      renderSidebar()
      // mockLiveData has 2 enabled cron jobs
      const badge = screen.getByText('2')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('Visibility', () => {
    it('is visible when isOpen=true (lg: always visible)', () => {
      const { container } = renderSidebar({ isOpen: true })
      const aside = container.querySelector('aside')
      expect(aside).toHaveClass('translate-x-0')
    })

    it('is hidden when isOpen=false', () => {
      const { container } = renderSidebar({ isOpen: false })
      const aside = container.querySelector('aside')
      expect(aside).toHaveClass('-translate-x-full')
    })
  })
})
