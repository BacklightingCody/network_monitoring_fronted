"use client"

import { useState, useEffect } from "react"
import {
  Activity,
  AlertCircle,
  Clock,
  Database,
  Filter,
  HardDrive,
  Layers,
  RefreshCw,
  Search,
  Server,
  Shield,
  Zap,
} from "lucide-react"
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useThemeStore } from "@/stores/theme"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Badge } from "@/components/ui/Badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"

// Sample data for charts
const performanceData = [
  { time: "00:00", cpu: 45, memory: 30, disk: 20 },
  { time: "04:00", cpu: 50, memory: 35, disk: 20 },
  { time: "08:00", cpu: 65, memory: 45, disk: 22 },
  { time: "12:00", cpu: 80, memory: 60, disk: 25 },
  { time: "16:00", cpu: 75, memory: 55, disk: 24 },
  { time: "20:00", cpu: 60, memory: 40, disk: 21 },
  { time: "24:00", cpu: 45, memory: 30, disk: 20 },
]

const errorDistribution = [
  { name: "Database", value: 35 },
  { name: "Network", value: 25 },
  { name: "Auth", value: 20 },
  { name: "API", value: 15 },
  { name: "Other", value: 5 },
]

// Sample log data
const initialLogs = [
  {
    id: 1,
    timestamp: "2025-03-19 23:42:15",
    level: "ERROR",
    service: "database",
    message: "Connection timeout after 30s",
    count: 3,
  },
  {
    id: 2,
    timestamp: "2025-03-19 23:40:02",
    level: "WARN",
    service: "auth",
    message: "Rate limit exceeded for IP 192.168.1.1",
    count: 12,
  },
  {
    id: 3,
    timestamp: "2025-03-19 23:38:45",
    level: "INFO",
    service: "api",
    message: "Request processed successfully in 235ms",
    count: 1,
  },
  {
    id: 4,
    timestamp: "2025-03-19 23:35:30",
    level: "ERROR",
    service: "network",
    message: "Failed to establish connection to external service",
    count: 5,
  },
  {
    id: 5,
    timestamp: "2025-03-19 23:32:18",
    level: "INFO",
    service: "scheduler",
    message: "Batch job completed: user_cleanup",
    count: 1,
  },
  {
    id: 6,
    timestamp: "2025-03-19 23:30:05",
    level: "DEBUG",
    service: "frontend",
    message: "Rendering dashboard components",
    count: 1,
  },
  {
    id: 7,
    timestamp: "2025-03-19 23:28:57",
    level: "WARN",
    service: "cache",
    message: "Cache hit ratio below threshold (45%)",
    count: 8,
  },
  {
    id: 8,
    timestamp: "2025-03-19 23:25:42",
    level: "INFO",
    service: "auth",
    message: "User login successful: user_id=31415",
    count: 1,
  },
]

export function SystemLogs() {
  const [logs, setLogs] = useState(initialLogs)
  const [searchTerm, setSearchTerm] = useState("")
  const [levelFilter, setLevelFilter] = useState("all")
  const [serviceFilter, setServiceFilter] = useState("all")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const theme = useThemeStore((state) => state.theme) || 'light'

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newLog = {
        id: logs.length + 1,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
        level: ["INFO", "WARN", "ERROR", "DEBUG"][Math.floor(Math.random() * 4)],
        service: ["database", "auth", "api", "network", "scheduler", "frontend", "cache"][
          Math.floor(Math.random() * 7)
        ],
        message: `System operation ${Math.floor(Math.random() * 1000)} completed`,
        count: Math.floor(Math.random() * 5) + 1,
      }
      setLogs((prevLogs) => [newLog, ...prevLogs.slice(0, 49)])
    }, 15000)

    return () => clearInterval(interval)
  }, [logs])

  const refreshLogs = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      // Simulate fetching new logs
      const newLogs = [...logs]
      newLogs.unshift({
        id: logs.length + 1,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
        level: "INFO",
        service: "system",
        message: "Logs refreshed manually by user",
        count: 1,
      })
      setLogs(newLogs)
      setIsRefreshing(false)
    }, 800)
  }

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.service.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = levelFilter === "all" || log.level === levelFilter
    const matchesService = serviceFilter === "all" || log.service === serviceFilter

    return matchesSearch && matchesLevel && matchesService
  })

  const getLevelColor = (level) => {
    switch (level) {
      case "ERROR":
        return "bg-red-500 text-foreground"
      case "WARN":
        return "bg-amber-500 text-foreground"
      case "INFO":
        return "bg-blue-500 text-foreground"
      case "DEBUG":
        return "bg-gray-500 text-foreground"
      default:
        return "bg-gray-500 text-foreground"
    }
  }

  // 修改图表颜色
  const chartColors = {
    grid: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    text: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
    tooltip: {
      bg: theme === 'dark' ? 'hsl(240 10% 3.9%)' : 'hsl(0 0% 100%)',
      border: theme === 'dark' ? 'hsl(240 3.7% 15.9%)' : 'hsl(240 5.9% 90%)',
      text: theme === 'dark' ? 'hsl(0 0% 98%)' : 'hsl(240 10% 3.9%)'
    }
  };

  // 修改进度条背景色
  const progressBg = theme === 'dark' ? 'bg-muted' : 'bg-secondary';

  // 修改图表渐变色
  const gradientColors = {
    cpu: theme === 'dark' ? '#3b82f6' : '#2563eb',
    memory: theme === 'dark' ? '#a855f7' : '#7c3aed',
    disk: theme === 'dark' ? '#14b8a6' : '#0d9488'
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex-1 p-6 bg-background">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground text-sm font-medium">CPU Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-foreground">78%</div>
                <div className="text-emerald-500 flex items-center">
                  <Activity className="h-4 w-4 mr-1" />
                  Normal
                </div>
              </div>
              <div className={`mt-4 h-1 w-full ${progressBg} rounded-full overflow-hidden`}>
                <div className="bg-blue-500 h-full rounded-full" style={{ width: "78%" }}></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground text-sm font-medium">Memory Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-foreground">64%</div>
                <div className="text-emerald-500 flex items-center">
                  <Activity className="h-4 w-4 mr-1" />
                  Normal
                </div>
              </div>
              <div className={`mt-4 h-1 w-full ${progressBg} rounded-full overflow-hidden`}>
                <div className="bg-purple-500 h-full rounded-full" style={{ width: "64%" }}></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground text-sm font-medium">Disk I/O</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-foreground">42 MB/s</div>
                <div className="text-emerald-500 flex items-center">
                  <Activity className="h-4 w-4 mr-1" />
                  Normal
                </div>
              </div>
              <div className={`mt-4 h-1 w-full ${progressBg} rounded-full overflow-hidden`}>
                <div className="bg-teal-500 h-full rounded-full" style={{ width: "42%" }}></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground text-sm font-medium">Network</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-foreground">8.2 MB/s</div>
                <div className="text-emerald-500 flex items-center">
                  <Activity className="h-4 w-4 mr-1" />
                  Normal
                </div>
              </div>
              <div className={`mt-4 h-1 w-full ${progressBg} rounded-full overflow-hidden`}>
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: "35%" }}></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">System Performance</CardTitle>
              <CardDescription className="text-muted-foreground">24-hour monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250} className="bg-background">
                <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={gradientColors.cpu} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={gradientColors.cpu} stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={gradientColors.memory} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={gradientColors.memory} stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorDisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={gradientColors.disk} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={gradientColors.disk} stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false}  />
                  <XAxis dataKey="time" stroke={chartColors.text} />
                  <YAxis stroke={chartColors.text} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartColors.tooltip.bg,
                      borderColor: chartColors.tooltip.border,
                    }}
                    itemStyle={{ color: chartColors.tooltip.text }}
                    labelStyle={{ color: chartColors.text }}
                  />
                  <Area type="monotone" dataKey="cpu" stroke={gradientColors.cpu} fillOpacity={1} fill="url(#colorCpu)" />
                  <Area type="monotone" dataKey="memory" stroke={gradientColors.memory} fillOpacity={1} fill="url(#colorMemory)" />
                  <Area type="monotone" dataKey="disk" stroke={gradientColors.disk} fillOpacity={1} fill="url(#colorDisk)" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-2 flex justify-center gap-4">
                <div className="flex items-center">
                  <div className="mr-1 h-3 w-3 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-muted-foreground">CPU</span>
                </div>
                <div className="flex items-center">
                  <div className="mr-1 h-3 w-3 rounded-full bg-purple-500"></div>
                  <span className="text-xs text-muted-foreground">Memory</span>
                </div>
                <div className="flex items-center">
                  <div className="mr-1 h-3 w-3 rounded-full bg-teal-500"></div>
                  <span className="text-xs text-muted-foreground">Disk</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Error Distribution</CardTitle>
              <CardDescription className="text-muted-foreground">By service category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={errorDistribution} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} horizontal={true} vertical={false} />
                  <XAxis dataKey="name" stroke={chartColors.text} />
                  <YAxis stroke={chartColors.text} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartColors.tooltip.bg,
                      borderColor: chartColors.tooltip.border,
                    }}
                    itemStyle={{ color: chartColors.tooltip.text }}
                    labelStyle={{ color: chartColors.text }}
                  />
                  <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">System Logs</CardTitle>
                  <CardDescription className="text-muted-foreground">Real-time log monitoring</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshLogs}
                  disabled={isRefreshing}
                  className="border-border bg-background text-foreground hover:bg-accent/50"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search logs..."
                    className="w-full bg-background border-border pl-9 text-foreground placeholder:text-muted-foreground"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={levelFilter} onValueChange={setLevelFilter}>
                    <SelectTrigger className="w-[130px] bg-background border-border text-foreground">
                      <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-popover-foreground">
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="ERROR">Error</SelectItem>
                      <SelectItem value="WARN">Warning</SelectItem>
                      <SelectItem value="INFO">Info</SelectItem>
                      <SelectItem value="DEBUG">Debug</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={serviceFilter} onValueChange={setServiceFilter}>
                    <SelectTrigger className="w-[130px] bg-background border-border text-foreground">
                      <Layers className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Service" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-popover-foreground">
                      <SelectItem value="all">All Services</SelectItem>
                      <SelectItem value="database">Database</SelectItem>
                      <SelectItem value="auth">Auth</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="network">Network</SelectItem>
                      <SelectItem value="scheduler">Scheduler</SelectItem>
                      <SelectItem value="frontend">Frontend</SelectItem>
                      <SelectItem value="cache">Cache</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-lg border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Level
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Service
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Message
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Count
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-card">
                      {filteredLogs.length > 0 ? (
                        filteredLogs.map((log) => (
                          <tr key={log.id} >
                            {/* className="hover:bg-accent/50 transition-colors" */}
                            <td className="px-4 py-3 text-sm text-foreground font-mono whitespace-nowrap">
                              <div className="flex items-center">
                                <Clock className="mr-2 h-3 w-3 text-muted-foreground" />
                                {log.timestamp}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">
                              <Badge className={`${getLevelColor(log.level)} text-foreground`}>
                                {log.level === "ERROR" && <AlertCircle className="mr-1 h-3 w-3" />}
                                {log.level}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">
                              {log.service === "database" && <Database className="mr-1 h-3 w-3 inline text-blue-400" />}
                              {log.service === "auth" && <Shield className="mr-1 h-3 w-3 inline text-purple-400" />}
                              {log.service === "api" && <Zap className="mr-1 h-3 w-3 inline text-yellow-400" />}
                              {log.service === "network" && <Activity className="mr-1 h-3 w-3 inline text-green-400" />}
                              {log.service === "scheduler" && <Clock className="mr-1 h-3 w-3 inline text-orange-400" />}
                              {log.service === "frontend" && <Layers className="mr-1 h-3 w-3 inline text-pink-400" />}
                              {log.service === "cache" && <HardDrive className="mr-1 h-3 w-3 inline text-cyan-400" />}
                              {log.service === "system" && <Server className="mr-1 h-3 w-3 inline text-gray-400" />}
                              {log.service}
                            </td>
                            <td className="px-4 py-3 text-sm text-foreground">{log.message}</td>
                            <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">
                              {log.count > 1 ? (
                                <Badge variant="outline" className="border-border text-foreground">
                                  {log.count}×
                                </Badge>
                              ) : (
                                log.count
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                            No logs matching your filters
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

