import { Moon, Sun } from "lucide-react"
import { useThemeStore } from "@/stores/theme"
import { Button } from "@/components/ui/Button"

export function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme) || 'light'
  const toggleTheme = useThemeStore((state) => state.toggleTheme)

  return (
    <Button
      variant="outline"
      size="icon"
      className="w-8 h-8 border-border bg-background text-foreground hover:bg-accent"
      onClick={toggleTheme}
    >
      {theme === 'dark' ? (
        <Moon className="h-4 w-4" />

      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  )
} 