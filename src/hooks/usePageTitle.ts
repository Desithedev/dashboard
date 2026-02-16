import { useEffect } from 'react'

/**
 * Custom hook to set the document title for each page
 * @param title - The page-specific title (in Danish)
 */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `Mission Kontrol — ${title}`
    
    // Cleanup: restore default title when component unmounts
    return () => {
      document.title = 'Mission Kontrol'
    }
  }, [title])
}
