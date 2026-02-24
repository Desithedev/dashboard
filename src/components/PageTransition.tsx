import { ReactNode, useEffect, useRef } from 'react'

interface PageTransitionProps {
  children: ReactNode
}

/**
 * PageTransition — Wrapper-komponent til smooth sideskift-animationer.
 * PageTransition — Wrapper component for smooth page transition animations.
 *
 * Uses pure CSS (no external libraries):
 *   - Fade-in: opacity 0 → 1
 *   - Subtle slide-up: translateY(8px) → translateY(0)
 *   - Duration: 200ms with ease-out curve
 *
 * The animation is defined via `.animate-page-in` + `@keyframes pageIn` in index.css.
 *
 * Used with `key={page}` in App.tsx so React unmounts and remounts
 * the component on each page change, which triggers the animation from the beginning.
 */
export default function PageTransition({ children }: PageTransitionProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Genstart animationen eksplicit ved mount for browser-kompatibilitet
    el.style.animation = 'none'
    // Force browser reflow so animation resets correctly
    void el.offsetHeight
    el.style.animation = ''
  }, [])

  return (
    <div ref={ref} className="animate-page-in">
      {children}
    </div>
  )
}
