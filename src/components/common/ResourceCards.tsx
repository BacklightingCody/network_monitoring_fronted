import { Card, CardContent } from "@/components/common/Card"
import { Progress } from "@/components/common/Progress"
import { useThemeStore } from "@/stores/theme"

interface ResourceCardProps {
  icon: React.ReactNode
  title: string
  value: number | string
  unit: string
  showProgress: boolean
  colorScheme?: 'blue' | 'emerald' | 'purple' | 'cyan' | 'amber' | 'teal' | 'gray'
}

export default function ResourceCard({
  icon,
  title,
  value,
  unit,
  showProgress,
  colorScheme = 'blue'
}: ResourceCardProps) {
  const theme = useThemeStore((state) => state.theme);

// 根据不同的配色方案定义颜色
const colorSchemes = {
  blue: {
    text: theme === 'dark' ? 'text-blue-400' : 'text-blue-500',
    progress: 'bg-blue-500 dark:bg-blue-400'
  },
  emerald: {
    text: theme === 'dark' ? 'text-emerald-400' : 'text-emerald-500',
    progress: 'bg-emerald-500 dark:bg-emerald-400'
  },
  purple: {
    text: theme === 'dark' ? 'text-purple-400' : 'text-purple-500',
    progress: 'bg-purple-500 dark:bg-purple-400'
  },
  cyan: {
    text: theme === 'dark' ? 'text-cyan-400' : 'text-cyan-500',
    progress: 'bg-cyan-500 dark:bg-cyan-400'
  },
  amber: {
    text: theme === 'dark' ? 'text-amber-400' : 'text-amber-500',
    progress: 'bg-amber-500 dark:bg-amber-400'
  },
  teal: {
    text: theme === 'dark' ? 'text-teal-400' : 'text-teal-500',
    progress: 'bg-teal-500 dark:bg-teal-400'
  },
  gray: {
    text: theme === 'dark' ? 'text-gray-400' : 'text-gray-500',
    progress: 'bg-gray-500 dark:bg-gray-400'
  }
};


  return (
    <Card>
      <CardContent className="pt-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-lg font-medium ${colorSchemes[colorScheme].text}`}>{title}</h3>
            <div className={colorSchemes[colorScheme].text}>{icon}</div>
          </div>

          <span className={`text-2xl font-bold ${colorSchemes[colorScheme].text}`}>
            {value}{unit}
          </span>
        </div>
        {showProgress && (
          <Progress
            value={value as number}
            className="h-2 bg-muted"
            indicatorClassName={colorSchemes[colorScheme].progress}
          />
        )}
      </CardContent>
    </Card>
  )
}

