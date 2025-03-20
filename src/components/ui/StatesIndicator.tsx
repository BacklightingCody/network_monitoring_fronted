"use client"

import type * as React from "react"

export interface StatusIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: "online" | "offline" | "warning" | "error"
  size?: "sm" | "md" | "lg"
  pulseSpeed?: "slow" | "normal" | "fast"
  label?: string
  showLabel?: boolean
}

export function StatusIndicator({
  status = "online",
  size = "md",
  pulseSpeed = "normal",
  label,
  showLabel = true,
  className,
  ...props
}: StatusIndicatorProps) {
  // 根据状态确定颜色
  const getStatusColor = () => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "offline":
        return "bg-zinc-400"
      case "warning":
        return "bg-amber-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-green-500"
    }
  }

  // 根据尺寸确定大小
  const getSize = () => {
    switch (size) {
      case "sm":
        return "h-2 w-2"
      case "md":
        return "h-3 w-3"
      case "lg":
        return "h-4 w-4"
      default:
        return "h-3 w-3"
    }
  }

  // 根据速度确定动画
  const getPulseAnimation = () => {
    if (status === "offline") return ""

    switch (pulseSpeed) {
      case "slow":
        return "animate-pulse-slow"
      case "fast":
        return "animate-pulse-fast"
      default:
        return "animate-pulse"
    }
  }

  // 获取标签文本
  const getStatusLabel = () => {
    if (label) return label

    switch (status) {
      case "online":
        return "在线"
      case "offline":
        return "离线"
      case "warning":
        return "警告"
      case "error":
        return "错误"
      default:
        return "在线"
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className || ""}`} {...props}>
      <div className={`rounded-full ${getSize()} ${getStatusColor()} ${getPulseAnimation()}`} />
      {showLabel && <span className="text-sm text-zinc-400">{getStatusLabel()}</span>}
    </div>
  )
}

