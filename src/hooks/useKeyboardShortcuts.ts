import { useEffect } from 'react'

interface KeyboardShortcutsOptions {
  onCommandK: () => void
  onEscape: () => void
  onNavigate: (page: string) => void
  onHelp: () => void
  isCommandPaletteOpen: boolean
}

// Map af tal til sider (1-9)
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
      // Tjek om vi er i et input-felt
      const target = e.target as HTMLElement
      const isInputFocused = 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable

      // Cmd+K / Ctrl+K → Åbn Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onCommandK()
        return
      }

      // Escape → Luk modals/command palette
      if (e.key === 'Escape') {
        e.preventDefault()
        onEscape()
        return
      }

      // ? → Toggle keyboard shortcuts oversigt (kun når intet input-felt er fokuseret)
      // Browser sender typisk e.key === '?' (Shift + /)
      if (!isInputFocused && !isCommandPaletteOpen && e.key === '?') {
        e.preventDefault()
        onHelp()
        return
      }

      // Numeriske shortcuts (1-9) - KUN når intet input-felt er fokuseret
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

// Eksporter shortcut map så CommandPalette kan vise dem
export { NUMBER_SHORTCUTS }
