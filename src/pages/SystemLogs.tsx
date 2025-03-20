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
        return "bg-red-500"
      case "WARN":
        return "bg-amber-500"
      case "INFO":
        return "bg-blue-500"
      case "DEBUG":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      {/* <header className="sticky top-0 z-10 border-b border-zinc-800 bg-black/80 backdrop-blur-sm">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center gap-2 font-semibold">
            <Server className="h-6 w-6 text-blue-400" />
            <span className="text-xl">SysMonitor</span>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-zinc-400">Live</span>
            </div>
            <Button variant="outline" size="sm" className="border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700">
              <Shield className="mr-2 h-4 w-4 text-blue-400" />
              System Status
            </Button>
          </div>
        </div>
      </header> */}

      <main className="flex-1 p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-zinc-200 text-sm font-medium">CPU Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-zinc-100">78%</div>
                <div className="text-emerald-500 flex items-center">
                  <Activity className="h-4 w-4 mr-1" />
                  Normal
                </div>
              </div>
              <div className="mt-4 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: "78%" }}></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-zinc-200 text-sm font-medium">Memory Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-zinc-100">64%</div>
                <div className="text-emerald-500 flex items-center">
                  <Activity className="h-4 w-4 mr-1" />
                  Normal
                </div>
              </div>
              <div className="mt-4 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: "64%" }}></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-zinc-200 text-sm font-medium">Disk I/O</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-zinc-100">42 MB/s</div>
                <div className="text-emerald-500 flex items-center">
                  <Activity className="h-4 w-4 mr-1" />
                  Normal
                </div>
              </div>
              <div className="mt-4 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-full rounded-full" style={{ width: "42%" }}></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-zinc-200 text-sm font-medium">Network</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-zinc-100">8.2 MB/s</div>
                <div className="text-emerald-500 flex items-center">
                  <Activity className="h-4 w-4 mr-1" />
                  Normal
                </div>
              </div>
              <div className="mt-4 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: "35%" }}></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-200">System Performance</CardTitle>
              <CardDescription className="text-zinc-400">24-hour monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorDisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="time" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#222", borderColor: "#444" }}
                    itemStyle={{ color: "#fff" }}
                    labelStyle={{ color: "#999" }}
                  />
                  <Area type="monotone" dataKey="cpu" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCpu)" />
                  <Area type="monotone" dataKey="memory" stroke="#a855f7" fillOpacity={1} fill="url(#colorMemory)" />
                  <Area type="monotone" dataKey="disk" stroke="#14b8a6" fillOpacity={1} fill="url(#colorDisk)" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-2 flex justify-center gap-4">
                <div className="flex items-center">
                  <div className="mr-1 h-3 w-3 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-zinc-400">CPU</span>
                </div>
                <div className="flex items-center">
                  <div className="mr-1 h-3 w-3 rounded-full bg-purple-500"></div>
                  <span className="text-xs text-zinc-400">Memory</span>
                </div>
                <div className="flex items-center">
                  <div className="mr-1 h-3 w-3 rounded-full bg-teal-500"></div>
                  <span className="text-xs text-zinc-400">Disk</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-200">Error Distribution</CardTitle>
              <CardDescription className="text-zinc-400">By service category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={errorDistribution} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={true} vertical={false} />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#222", borderColor: "#444" }}
                    itemStyle={{ color: "#fff" }}
                    labelStyle={{ color: "#999" }}
                  />
                  <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-zinc-200">System Logs</CardTitle>
                  <CardDescription className="text-zinc-400">Real-time log monitoring</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshLogs}
                  disabled={isRefreshing}
                  className="border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input
                    type="search"
                    placeholder="Search logs..."
                    className="w-full bg-zinc-800 border-zinc-700 pl-9 text-zinc-200 placeholder:text-zinc-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={levelFilter} onValueChange={setLevelFilter}>
                    <SelectTrigger className="w-[130px] bg-zinc-800 border-zinc-700 text-zinc-200">
                      <Filter className="mr-2 h-4 w-4 text-zinc-500" />
                      <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="ERROR">Error</SelectItem>
                      <SelectItem value="WARN">Warning</SelectItem>
                      <SelectItem value="INFO">Info</SelectItem>
                      <SelectItem value="DEBUG">Debug</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={serviceFilter} onValueChange={setServiceFilter}>
                    <SelectTrigger className="w-[130px] bg-zinc-800 border-zinc-700 text-zinc-200">
                      <Layers className="mr-2 h-4 w-4 text-zinc-500" />
                      <SelectValue placeholder="Service" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
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

              <div className="rounded-lg border border-zinc-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-zinc-800/50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                          Level
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                          Service
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                          Message
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                          Count
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 bg-zinc-900">
                      {filteredLogs.length > 0 ? (
                        filteredLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-zinc-800/50 transition-colors">
                            <td className="px-4 py-3 text-sm text-zinc-300 font-mono whitespace-nowrap">
                              <div className="flex items-center">
                                <Clock className="mr-2 h-3 w-3 text-zinc-500" />
                                {log.timestamp}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm whitespace-nowrap">
                              <Badge className={`${getLevelColor(log.level)} text-white`}>
                                {log.level === "ERROR" && <AlertCircle className="mr-1 h-3 w-3" />}
                                {log.level}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-zinc-300 whitespace-nowrap">
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
                            <td className="px-4 py-3 text-sm text-zinc-300">{log.message}</td>
                            <td className="px-4 py-3 text-sm text-zinc-300 whitespace-nowrap">
                              {log.count > 1 ? (
                                <Badge variant="outline" className="border-zinc-700 text-zinc-300">
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
                          <td colSpan={5} className="px-4 py-8 text-center text-sm text-zinc-500">
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

