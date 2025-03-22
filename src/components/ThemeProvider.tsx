import { useEffect } from 'react'
import { useThemeStore } from '@/stores/theme'

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme, setTheme } = useThemeStore()

  // 初始化主题
  useEffect(() => {
    if (typeof window === 'undefined') return

    // 获取存储的主题
    const storedTheme = localStorage.getItem('theme-storage')
    let initialTheme: 'light' | 'dark' = 'light'

    if (storedTheme) {
      try {
        const { state } = JSON.parse(storedTheme)
        initialTheme = state.theme
      } catch {
        // 如果解析失败，检查系统主题
        initialTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
    } else {
      // 如果没有存储的主题，检查系统主题
      initialTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }

    // 立即设置主题
    setTheme(initialTheme)

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme-storage')) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // 监听主题变化，更新 DOM
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)

    // 更新 meta theme-color
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      meta.setAttribute(
        'content',
        theme === 'dark' ? 'hsl(240 10% 3.9%)' : 'hsl(0 0% 100%)'
      )
    }
  }, [theme])

  return <>{children}</>
} 