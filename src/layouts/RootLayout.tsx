interface RootLayoutProps {
  children: React.ReactNode
}

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* 这里可以添加导航栏、侧边栏等公共布局组件 */}
      {children}
    </div>
  )
} 