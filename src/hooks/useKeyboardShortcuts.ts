import { useEffect } from 'react'

interface KeyboardShortcutsOptions {
  onCommandK: () => void
  onEscape: () => void
  onNavigate: (page: string) => void
  onHelp: () => void
  isCommandPaletteOpen: boolean
}

// Map of numbers to pages (1-9)
const NUMBER_SHORTCUTS: Record<string, string> = {
  '1': 'dashboard',
  '2': 'tasks',
  '3': 'agents',
  '4': 'skills',
  '5': 'communication',
  '6': 'journal',
  '7': 'documents',
  '8': 'intelligence',
  '9': 'settings',
}

export function useKeyboardShortcuts({
  onCommandK,
  onEscape,
  onNavigate,
  onHelp,
  isCommandPaletteOpen,
}: KeyboardShortcutsOptions) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Check if we are in an input field
      const target = e.target as HTMLElement
      const isInputFocused =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable

      // Cmd+K / Ctrl+K → Open Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onCommandK()
        return
      }

      // Escape → Close modals/command palette
      if (e.key === 'Escape') {
        e.preventDefault()
        onEscape()
        return
      }

      // Ctrl+/ → Show shortcuts overlay
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault()
        onHelp()
        return
      }

      // ? → Toggle keyboard shortcuts overview (only when no input field is focused)
      // Browser typically sends e.key === '?' (Shift + /)
      if (!isInputFocused && !isCommandPaletteOpen && e.key === '?') {
        e.preventDefault()
        onHelp()
        return
      }

      // Numerical shortcuts (1-9) - ONLY when no input field is focused
      if (!isInputFocused && !isCommandPaletteOpen) {
        const page = NUMBER_SHORTCUTS[e.key]
        if (page) {
          e.preventDefault()
          onNavigate(page)
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onCommandK, onEscape, onNavigate, onHelp, isCommandPaletteOpen])
}

// Export shortcut map so CommandPalette can show them
export { NUMBER_SHORTCUTS }
