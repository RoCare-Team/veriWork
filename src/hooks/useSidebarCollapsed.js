import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'pagerlook:sidebar-collapsed'

function readStored() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

/**
 * Desktop sidebar rail state, persisted to localStorage.
 * Returns [collapsed, toggle].
 */
export default function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(readStored)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(collapsed))
    } catch {
      /* storage unavailable (private mode) — state still works for the session */
    }
  }, [collapsed])

  const toggle = useCallback(() => setCollapsed((prev) => !prev), [])

  return [collapsed, toggle]
}
