import { Store } from '@tanstack/store'

export type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'hris_theme'

export function getResolvedTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  }
  return theme
}

export function getSavedTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved
    }
  } catch {
    // ignore
  }
  return 'dark'
}

export const themeStore = new Store<{ theme: Theme; resolved: 'light' | 'dark' }>({
  theme: getSavedTheme(),
  resolved: getResolvedTheme(getSavedTheme()),
})

export function applyTheme(newTheme: Theme) {
  const resolved = getResolvedTheme(newTheme)
  themeStore.setState(() => ({
    theme: newTheme,
    resolved,
  }))

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, newTheme)
    } catch {
      // ignore
    }

    const root = document.documentElement
    if (resolved === 'dark') {
      root.classList.add('dark')
      root.setAttribute('data-theme', 'dark')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.remove('dark')
      root.setAttribute('data-theme', 'light')
      root.style.colorScheme = 'light'
    }
  }
}

export function toggleTheme(): 'light' | 'dark' {
  const current = themeStore.state.resolved
  const next = current === 'dark' ? 'light' : 'dark'
  applyTheme(next)
  return next
}

export function initTheme() {
  if (typeof window !== 'undefined') {
    applyTheme(getSavedTheme())
  }
}
