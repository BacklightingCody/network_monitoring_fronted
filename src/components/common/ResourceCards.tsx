import { Card, CardContent } from "@/components/common/Card"
import { Progress } from "@/components/common/Progress"

interface ResourceCardProps {
  icon: React.ReactNode
  title: string
  value: number|string
  unit: string
  showProgress: boolean
}

export default function ResourceCard({ icon, title, value, unit, showProgress }: ResourceCardProps) {
  // 根据使用率确定颜色
  const getColorClass = (value: number) => {
    if (value < 50) return "text-green-500"
    if (value < 80) return "text-amber-500"
    return "text-red-500"
  }

  // 根据使用率确定进度条颜色
  const getProgressColorClass = (value: number) => {
    if (value < 50) return "bg-green-500"
    if (value < 80) return "bg-amber-500"
    return "bg-red-500"
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium">{title}</h3>
            {icon}
          </div>

          <span className={`text-2xl font-bold ${getColorClass(value)}`}>{value}{unit}</span>
        </div>
        {showProgress && <Progress value={value as number} className="h-2" indicatorClassName={getProgressColorClass(value)} />}
      </CardContent>
    </Card>
  )
}

