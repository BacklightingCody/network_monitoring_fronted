"use client"

import { useState } from "react"
import { Activity, AlertCircle, BarChart3, Clock, Database, LineChart, Server, Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { StatusIndicator } from "@/components/ui/StatesIndicator"
import { Button } from "@/components/ui/Button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs"

export default function LightThemeDemo() {
  const [activeTab, setActiveTab] = useState("overview")
  const [systemStatus, setSystemStatus] = useState<"online" | "offline" | "warning" | "error">("online")

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Server className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold">System Monitor</h1>
                <p className="text-muted-foreground">Real-time performance tracking</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <StatusIndicator status={systemStatus} size="md" />
              <Button variant="outline" size="sm">
                <Shield className="mr-2 h-4 w-4" />
                System Settings
              </Button>
            </div>
          </div>
        </header>

        <Tabs defaultValue="overview" className="mb-8" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className={activeTab === "overview" ? "border-blue-200 shadow-sm" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">78%</div>
                  <div className="text-green-600 flex items-center">
                    <Activity className="h-4 w-4 mr-1" />
                    Normal
                  </div>
                </div>
                <div className="mt-4 h-1 w-full bg-muted rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: "78%" }}></div>
                </div>
              </CardContent>
            </Card>

            <Card className={activeTab === "overview" ? "border-blue-200 shadow-sm" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">64%</div>
                  <div className="text-green-600 flex items-center">
                    <Activity className="h-4 w-4 mr-1" />
                    Normal
                  </div>
                </div>
                <div className="mt-4 h-1 w-full bg-muted rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: "64%" }}></div>
                </div>
              </CardContent>
            </Card>

            <Card className={activeTab === "overview" ? "border-blue-200 shadow-sm" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Disk I/O</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">42 MB/s</div>
                  <div className="text-green-600 flex items-center">
                    <Activity className="h-4 w-4 mr-1" />
                    Normal
                  </div>
                </div>
                <div className="mt-4 h-1 w-full bg-muted rounded-full overflow-hidden">
                  <div className="bg-teal-500 h-full rounded-full" style={{ width: "42%" }}></div>
                </div>
              </CardContent>
            </Card>

            <Card className={activeTab === "overview" ? "border-blue-200 shadow-sm" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Network</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">8.2 MB/s</div>
                  <div className="text-green-600 flex items-center">
                    <Activity className="h-4 w-4 mr-1" />
                    Normal
                  </div>
                </div>
                <div className="mt-4 h-1 w-full bg-muted rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full rounded-full" style={{ width: "35%" }}></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>System Health</CardTitle>
                    <CardDescription>Current status overview</CardDescription>
                  </div>
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Database className="h-5 w-5 mr-2 text-blue-600" />
                      <span>Database Service</span>
                    </div>
                    <StatusIndicator status="online" showLabel={false} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-purple-600" />
                      <span>Authentication Service</span>
                    </div>
                    <StatusIndicator status="online" showLabel={false} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-green-600" />
                      <span>API Gateway</span>
                    </div>
                    <StatusIndicator status="online" showLabel={false} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-amber-600" />
                      <span>Scheduler Service</span>
                    </div>
                    <StatusIndicator status="warning" showLabel={false} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Server className="h-5 w-5 mr-2 text-zinc-600" />
                      <span>Storage Service</span>
                    </div>
                    <StatusIndicator status="online" showLabel={false} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Alerts</CardTitle>
                    <CardDescription>Last 24 hours</CardDescription>
                  </div>
                  <LineChart className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 pb-3 border-b">
                    <div className="mt-0.5">
                      <Badge className="bg-amber-500">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Warning
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium">Scheduler Service: High latency detected</p>
                      <p className="text-sm text-muted-foreground">Today, 10:42 AM</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pb-3 border-b">
                    <div className="mt-0.5">
                      <Badge className="bg-red-500">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Error
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium">Database: Connection timeout after 30s</p>
                      <p className="text-sm text-muted-foreground">Today, 08:15 AM</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pb-3 border-b">
                    <div className="mt-0.5">
                      <Badge className="bg-amber-500">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Warning
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium">API Gateway: Rate limit exceeded for IP 192.168.1.1</p>
                      <p className="text-sm text-muted-foreground">Yesterday, 11:30 PM</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <Badge className="bg-red-500">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Error
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium">Storage Service: Disk space below 10% threshold</p>
                      <p className="text-sm text-muted-foreground">Yesterday, 09:45 PM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <Button variant={systemStatus === "online" ? "default" : "outline"} onClick={() => setSystemStatus("online")}>
            Set Online
          </Button>
          <Button
            variant={systemStatus === "warning" ? "default" : "outline"}
            onClick={() => setSystemStatus("warning")}
          >
            Set Warning
          </Button>
          <Button variant={systemStatus === "error" ? "default" : "outline"} onClick={() => setSystemStatus("error")}>
            Set Error
          </Button>
          <Button
            variant={systemStatus === "offline" ? "default" : "outline"}
            onClick={() => setSystemStatus("offline")}
          >
            Set Offline
          </Button>
        </div>
      </div>
    </div>
  )
}

