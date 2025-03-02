import { Card } from "@/components/common/Card"
import ResourceCard from "@/components/common/ResourceCards"
import LineCharts from "@/components/common/LineCharts"
import { cn } from "@/utils/cn"
import { ReactNode } from "react"

interface ResourceSectionProps {
  title: string
  children: ReactNode
  className?: string
}

interface ResourceComponentProps {
  children: ReactNode
}

export default function ResourceSection({ title, children, className }: ResourceSectionProps) {
  return (
    <Card className={cn("p-6", className)}>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="flex flex-col space-y-6">
        {children}
      </div>
    </Card>
  )
}

// 子组件
export function ResourceMetrics({ children }: ResourceComponentProps) {
  return (
    <div className="mb-6">
      {children}
    </div>
  )
}

export function ResourceCharts({ children }: ResourceComponentProps) {
  return (
    <div>
      {children}
    </div>
  )
}

