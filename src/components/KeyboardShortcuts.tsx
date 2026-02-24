/**
 * KeyboardShortcuts.tsx
 * Global keyboard shortcut provider for Mission Kontrol.
 *
 * Shortcuts:
 *  Ctrl+K / Cmd+K  → Open command palette
 *  Ctrl+/          → Show shortcuts overlay
 *  ?               → Show shortcuts overlay (Shift+/)
 *  1–9             → Navigate to pages (only without active input field)
 *  Escape          → Close open overlays/modals
 */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import CommandPalette from './CommandPalette'
import KeyboardShortcutsModal from './KeyboardShortcutsModal'
import { NUMBER_SHORTCUTS } from '../hooks/useKeyboardShortcuts'

// ── Context ──────────────────────────────────────────────────────────────────

interface KeyboardShortcutsContextValue {
  cmdOpen: boolean
  helpOpen: boolean
  openCmd: () => void
  closeCmd: () => void
  openHelp: () => void
  closeHelp: () => void
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextValue | null>(null)

// ── Provider ─────────────────────────────────────────────────────────────────

interface KeyboardShortcutsProviderProps {
  children: ReactNode
  onNavigate: (page: string) => void
}

export function KeyboardShortcutsProvider({
  children,
  onNavigate,
}: KeyboardShortcutsProviderProps) {
  const [cmdOpen, setCmdOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  // Refs for reading current state inside event listeners without stale closures
  const cmdOpenRef = useRef(false)
  const helpOpenRef = useRef(false)
  useEffect(() => { cmdOpenRef.current = cmdOpen }, [cmdOpen])
  useEffect(() => { helpOpenRef.current = helpOpen }, [helpOpen])

  const openCmd = useCallback(() => {
    setCmdOpen(true)
    setHelpOpen(false)
  }, [])

  const closeCmd = useCallback(() => setCmdOpen(false), [])

  const openHelp = useCallback(() => {
    setHelpOpen(true)
    setCmdOpen(false)
  }, [])

  const closeHelp = useCallback(() => setHelpOpen(false), [])

  const handleNavigate = useCallback(
    (page: string) => {
      onNavigate(page)
      setCmdOpen(false)
    },
    [onNavigate],
  )

  // Global keyboard handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInputFocused =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable

      // Ctrl+K / Cmd+K → Toggle command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (cmdOpenRef.current) {
          setCmdOpen(false)
        } else {
          setCmdOpen(true)
          setHelpOpen(false)
        }
        return
      }

      // Ctrl+/ → Toggle shortcuts overlay
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault()
        if (helpOpenRef.current) {
          setHelpOpen(false)
        } else {
          setHelpOpen(true)
          setCmdOpen(false)
        }
        return
      }

      // Escape → Close the top overlay/modal
      if (e.key === 'Escape') {
        if (cmdOpenRef.current) {
          e.preventDefault()
          setCmdOpen(false)
        } else if (helpOpenRef.current) {
          e.preventDefault()
          setHelpOpen(false)
        } else {
          // Let other components listen for 'modal-close'
          window.dispatchEvent(new CustomEvent('modal-close'))
        }
        return
      }

      // ? (Shift+/) → Toggle shortcuts overlay (only when no input field is focused)
      if (!isInputFocused && !cmdOpenRef.current && e.key === '?') {
        e.preventDefault()
        setHelpOpen(o => !o)
        return
      }

      // Numbers 1–9 → Navigate to page (only when no input field is focused and palette closed)
      if (!isInputFocused && !cmdOpenRef.current) {
        const page = NUMBER_SHORTCUTS[e.key]
        if (page) {
          e.preventDefault()
          onNavigate(page)
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onNavigate])

  const contextValue: KeyboardShortcutsContextValue = {
    cmdOpen,
    helpOpen,
    openCmd,
    closeCmd,
    openHelp,
    closeHelp,
  }

  return (
    <KeyboardShortcutsContext.Provider value={contextValue}>
      {children}
      {/* Modals are rendered here so they are always available globally */}
      <CommandPalette open={cmdOpen} onClose={closeCmd} onNavigate={handleNavigate} />
      <KeyboardShortcutsModal open={helpOpen} onClose={closeHelp} />
    </KeyboardShortcutsContext.Provider>
  )
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useKeyboardShortcutsContext(): KeyboardShortcutsContextValue {
  const ctx = useContext(KeyboardShortcutsContext)
  if (!ctx) {
    throw new Error(
      'useKeyboardShortcutsContext must be used within a <KeyboardShortcutsProvider>',
    )
  }
  return ctx
}
