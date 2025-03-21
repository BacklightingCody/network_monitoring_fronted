import { Card, CardContent } from "@/components/common/Card"
import { Progress } from "@/components/common/Progress"

interface ResourceCardProps {
  icon: React.ReactNode
  title: string
  value: number|string
  unit: string
  showProgress: boolean
  colorScheme?: 'blue' | 'emerald' | 'purple' | 'cyan'
}

export default function ResourceCard({ 
  icon, 
  title, 
  value, 
  unit, 
  showProgress,
  colorScheme = 'blue' 
}: ResourceCardProps) {
  // 根据不同的配色方案定义颜色
  const colorSchemes = {
    blue: {
      text: 'text-blue-500 dark:text-blue-400',
      progress: 'bg-blue-500 dark:bg-blue-400'
    },
    emerald: {
      text: 'text-emerald-500 dark:text-emerald-400',
      progress: 'bg-emerald-500 dark:bg-emerald-400'
    },
    purple: {
      text: 'text-purple-500 dark:text-purple-400',
      progress: 'bg-purple-500 dark:bg-purple-400'
    },
    cyan: {
      text: 'text-cyan-500 dark:text-cyan-400',
      progress: 'bg-cyan-500 dark:bg-cyan-400'
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-foreground">{title}</h3>
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

