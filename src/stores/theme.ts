import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
}

// **获取初始主题，并更新 DOM**
const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light'

  try {
    const storedTheme = localStorage.getItem('theme-storage')
    if (storedTheme) {
      const { state } = JSON.parse(storedTheme)
      updateDOM(state.theme)
      return state.theme
    }
  } catch {
    // 解析失败，使用系统主题
  }

  // 如果无存储，使用系统主题
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  updateDOM(systemTheme)
  return systemTheme
}

// **更新 HTML class 以适配 Tailwind**
const updateDOM = (theme: 'light' | 'dark') => {
  if (typeof window === 'undefined') return

  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(theme)

  // 更新 `<meta name="theme-color">`
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    meta.setAttribute('content', theme === 'dark' ? 'hsl(240 10% 3.9%)' : 'hsl(0 0% 100%)')
  }
}

// **Zustand 状态管理**
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: getInitialTheme(),
      toggleTheme: () => 
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light'
          updateDOM(newTheme)
          return { theme: newTheme }
        }),
      setTheme: (theme) => {
        updateDOM(theme)
        set({ theme })
      },
    }),
    {
      name: 'theme-storage',
      skipHydration: true,
    }
  )
)

// **监听系统主题变化**
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleChange = (e: MediaQueryListEvent) => {
    if (!localStorage.getItem('theme-storage')) {
      const newTheme = e.matches ? 'dark' : 'light'
      updateDOM(newTheme)
      useThemeStore.getState().setTheme(newTheme)
    }
  }
  mediaQuery.addEventListener('change', handleChange)
}
