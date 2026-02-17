import { useEffect } from 'react'
import { useLiveData } from '../api/LiveDataContext'

// SVG favicon indhold (spejl af /public/favicon.svg)
const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#0a0a0f"/>
  <g fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 32 8 L 24 32 L 32 32 L 28 56 L 48 28 L 36 28 L 40 8 Z"/>
  </g>
</svg>`

/**
 * Hook der dynamisk opdaterer favicon med en status-dot overlay via Canvas API.
 * Grøn dot (●) = Gateway forbundet
 * Rød dot (●)  = Gateway ikke forbundet
 *
 * Placér denne hook i en komponent der er child af LiveDataProvider.
 */
export function useFaviconBadge() {
  const { isConnected } = useLiveData()

  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const svgBlob = new Blob([FAVICON_SVG], { type: 'image/svg+xml' })
    const objectUrl = URL.createObjectURL(svgBlob)

    const img = new Image()
    img.onload = () => {
      // Tegn SVG-favicon
      ctx.drawImage(img, 0, 0, 64, 64)
      URL.revokeObjectURL(objectUrl)

      // Dot position: nederste højre hjørne
      const dotX = 49
      const dotY = 49
      const dotRadius = 9

      // Mørk ring baggrund for kontrast mod alle baggrunde
      ctx.beginPath()
      ctx.arc(dotX, dotY, dotRadius + 2.5, 0, Math.PI * 2)
      ctx.fillStyle = '#0a0a0f'
      ctx.fill()

      // Status-farvet dot
      ctx.beginPath()
      ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2)
      ctx.fillStyle = isConnected ? '#30d158' : '#ff453a'
      ctx.fill()

      // Sæt favicon
      const dataUrl = canvas.toDataURL('image/png')
      let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }
      link.type = 'image/png'
      link.href = dataUrl
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
    }

    img.src = objectUrl
  }, [isConnected])
}
