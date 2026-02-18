import { ReactNode, useEffect, useRef } from 'react'

interface PageTransitionProps {
  children: ReactNode
}

/**
 * PageTransition — Wrapper-komponent til smooth sideskift-animationer.
 *
 * Bruger ren CSS (ingen externe libraries):
 *   - Fade-in: opacity 0 → 1
 *   - Subtle slide-up: translateY(8px) → translateY(0)
 *   - Varighed: 200ms med ease-out kurve
 *
 * Animationen er defineret via `.animate-page-in` + `@keyframes pageIn` i index.css.
 *
 * Bruges med `key={page}` i App.tsx så React unmounter og remounter
 * komponenten ved hvert sideskift, hvilket trigger animationen forfra.
 */
export default function PageTransition({ children }: PageTransitionProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Genstart animationen eksplicit ved mount for browser-kompatibilitet
    el.style.animation = 'none'
    // Tving browser reflow så animation resettes korrekt
    void el.offsetHeight
    el.style.animation = ''
  }, [])

  return (
    <div ref={ref} className="animate-page-in">
      {children}
    </div>
  )
}
