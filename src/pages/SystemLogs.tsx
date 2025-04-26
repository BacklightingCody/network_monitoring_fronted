"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  Activity,
  AlertCircle,
  Calendar,
  Clock,
  Database,
  Download,
  FileText,
  Filter,
  HardDrive,
  Info,
  Layers,
  MoreHorizontal,
  RefreshCw,
  Search,
  Server,
  Shield,
  Trash2,
  XCircle,
  Zap
} from "lucide-react"
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts"
import { format, parseISO, subHours } from "date-fns"
import { useThemeStore } from "@/stores/theme"
import { useLogs } from "@/stores"
import { LogType, LogSource } from "@/services/api/log"
import useMonitoringAlerts from "@/hooks/useMonitoringAlerts"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Badge } from "@/components/ui/Badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination } from "@/components/ui/pagination"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function SystemLogs() {
  // 获取日志数据和操作方法
  const {
    logs,
    totalLogs,
    logTypeStats,
    logSourceStats,
    logTimeStats,
    filter,
    isLoading,
    isStatsLoading,
    isPolling,
    pollingInterval,
    setFilter,
    fetchLogs,
    fetchLogStats,
    refreshLogs,
    clearAllLogs,
    startPolling,
    stopPolling,
    setPollingInterval,
  } = useLogs();
  
  console.log('🔍 SystemLogs组件渲染 - 日志数据:', {
    logsCount: logs?.length,
    totalLogs,
    logTypeStats: logTypeStats?.length,
    logSourceStats: logSourceStats?.length,
    logTimeStats: logTimeStats?.length,
    filter,
    isLoading,
    isStatsLoading,
    isPolling,
    pollingInterval
  });

  // 使用监控告警钩子
  const { enabledAlerts } = useMonitoringAlerts();
  
  // 主题色
  const theme = useThemeStore((state) => state.theme);
  
  // 导出对话框状态
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState("csv");
  
  // 清空日志对话框状态
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  
  // 用于跟踪组件挂载状态
  const isMounted = useRef(false);
  // 跟踪轮询定时器
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 初始化加载数据
  useEffect(() => {
    console.log('🚀 SystemLogs组件初始化');
    
    if (!isMounted.current) {
      isMounted.current = true;
      console.log('📊 首次加载日志数据');
      
      // 立即获取日志数据和统计数据
      fetchLogs().then(() => {
        console.log('✅ 初始日志数据加载完成');
      }).catch(err => {
        console.error('❌ 初始日志数据加载失败:', err);
      });
      
      fetchLogStats().then(() => {
        console.log('✅ 初始日志统计数据加载完成');
      }).catch(err => {
        console.error('❌ 初始日志统计数据加载失败:', err);
      });
      
      // 默认开启轮询
      console.log('🔄 默认开启日志数据轮询');
      startPolling();
    }
    
    // 组件卸载时清理
    return () => {
      if (isMounted.current) {
        console.log('💤 SystemLogs组件卸载');
        
        // 确保停止轮询
        console.log('🛑 确保停止日志轮询');
        stopPolling();
        
        // 清除可能的轮询定时器
        if (pollingTimerRef.current) {
          console.log('🧹 清除额外的轮询定时器');
          clearInterval(pollingTimerRef.current);
          pollingTimerRef.current = null;
        }
        
        isMounted.current = false;
      }
    };
  }, [fetchLogs, fetchLogStats, startPolling, stopPolling]);
  
  // 监控轮询状态变化
  useEffect(() => {
    console.log('🔄 轮询状态变更:', isPolling, '当前轮询间隔:', pollingInterval);
    
    // 清除之前的定时器
    if (pollingTimerRef.current) {
      console.log('🧹 清除现有轮询定时器');
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
    
    if (isPolling) {
      console.log('🚀 开始轮询日志数据');
      
      // 立即执行一次请求
      console.log('📡 立即执行轮询请求');
      refreshLogs().then(() => {
        console.log('✅ 轮询刷新成功');
      }).catch(err => {
        console.error('❌ 轮询刷新失败:', err);
      });
      
      // 设置新的定时器
      console.log(`⏱️ 设置轮询间隔: ${pollingInterval}ms`);
      pollingTimerRef.current = setInterval(() => {
        console.log('⏰ 定时轮询触发');
        refreshLogs().then(() => {
          console.log('✅ 定时轮询刷新成功');
        }).catch(err => {
          console.error('❌ 定时轮询刷新失败:', err);
        });
      }, pollingInterval);
    }
    
    return () => {
      if (pollingTimerRef.current) {
        console.log('🧹 清除轮询定时器');
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };
  }, [isPolling, pollingInterval, refreshLogs]);

  // 日志过滤器变更
  useEffect(() => {
    console.log('🔍 日志过滤条件变更:', filter);
  }, [filter]);
  
  // 搜索处理
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🔍 搜索关键词:', e.target.value);
    setFilter({ search: e.target.value });
  };
  
  // 处理类型过滤
  const handleTypeFilter = (value: string) => {
    console.log('🔍 过滤日志类型:', value);
    setFilter({ type: value === "all" ? undefined : value as LogType });
  };
  
  // 处理来源过滤
  const handleSourceFilter = (value: string) => {
    console.log('🔍 过滤日志来源:', value);
    setFilter({ source: value === "all" ? undefined : value as LogSource });
  };
  
  // 处理分页
  const handlePageChange = (page: number) => {
    console.log('📄 切换到页码:', page);
    const newOffset = (page - 1) * filter.limit!;
    setFilter({ offset: newOffset });
  };
  
  // 当前页码
  const currentPage = Math.floor(filter.offset! / filter.limit!) + 1;
  const totalPages = Math.ceil(totalLogs / filter.limit!);
  
  // 处理手动刷新
  const handleRefresh = () => {
    console.log('🔄 手动刷新日志数据');
    refreshLogs().then(() => {
      console.log('✅ 手动刷新成功');
    }).catch(err => {
      console.error('❌ 手动刷新失败:', err);
    });
  };
  
  // 确认清除所有日志
  const confirmClearLogs = async () => {
    console.log('🗑️ 执行清除所有日志操作');
    await clearAllLogs();
    setClearDialogOpen(false);
  };
  
  // 格式化日期时间
  const formatDateTime = (dateTime: string) => {
    try {
      return format(parseISO(dateTime), "yyyy-MM-dd HH:mm:ss");
    } catch (error) {
      console.warn('⚠️ 日期格式化错误:', error);
      return dateTime;
    }
  };
  
  // 获取日志级别颜色
  const getLevelColor = (level: string) => {
    switch (level) {
      case LogType.ERROR:
        return "bg-red-500 text-foreground";
      case LogType.WARNING:
        return "bg-amber-500 text-foreground";
      case LogType.SYSTEM_START:
      case LogType.SYSTEM_STOP:
        return "bg-emerald-500 text-foreground";
      case LogType.API_ACCESS:
        return "bg-blue-500 text-foreground";
      case LogType.INFO:
        return "bg-gray-500 text-foreground";
      default:
        return "bg-gray-500 text-foreground";
    }
  };
  
  // 获取日志图标
  const getLogIcon = (source: string) => {
    switch (source) {
      case LogSource.DATABASE:
        return <Database className="h-3 w-3 inline text-blue-400" />;
      case LogSource.AUTH:
        return <Shield className="h-3 w-3 inline text-purple-400" />;
      case LogSource.API:
        return <Zap className="h-3 w-3 inline text-yellow-400" />;
      case LogSource.NETWORK:
        return <Activity className="h-3 w-3 inline text-green-400" />;
      case LogSource.SCHEDULER:
        return <Clock className="h-3 w-3 inline text-orange-400" />;
      case LogSource.FRONTEND:
        return <Layers className="h-3 w-3 inline text-pink-400" />;
      case LogSource.CACHE:
        return <HardDrive className="h-3 w-3 inline text-cyan-400" />;
      case LogSource.SYSTEM:
        return <Server className="h-3 w-3 inline text-gray-400" />;
      case LogSource.MONITORING:
        return <AlertCircle className="h-3 w-3 inline text-rose-400" />;
      default:
        return <Info className="h-3 w-3 inline text-gray-400" />;
    }
  };
  
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex-1 p-6 bg-background">
        {/* 系统状态指标卡片 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground text-sm font-medium">日志总数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-foreground">
                  {isLoading ? <Skeleton className="h-8 w-16" /> : totalLogs}
                </div>
                <div className="text-emerald-500 flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  条目
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground text-sm font-medium">错误日志</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-foreground">
                  {isStatsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    logTypeStats.find(stat => stat.type === LogType.ERROR)?.count || 0
                  )}
                </div>
                <div className="text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  错误
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground text-sm font-medium">警告日志</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-foreground">
                  {isStatsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    logTypeStats.find(stat => stat.type === LogType.WARNING)?.count || 0
                  )}
                </div>
                <div className="text-amber-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  警告
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground text-sm font-medium">实时监控</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">自动轮询</div>
                <Switch
                  checked={isPolling}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      startPolling();
                    } else {
                      stopPolling();
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 统计图表 */}
        <div className="mt-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">日志概览</TabsTrigger>
              <TabsTrigger value="types">类型分布</TabsTrigger>
              <TabsTrigger value="sources">来源分布</TabsTrigger>
              <TabsTrigger value="trends">时间趋势</TabsTrigger>
            </TabsList>
            
            {/* 日志概览标签 */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {logTypeStats.length > 0 && (
                  <Card className="bg-card border-border shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-foreground">最近日志类型分布</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={logTypeStats}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              dataKey="count"
                              nameKey="type"
                            >
                              {logTypeStats.map((entry, index) => {
                                const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
                                return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                              })}
                            </Pie>
                            <Tooltip 
                              formatter={(value: any) => [`${value} 条日志`, '数量']}
                              labelFormatter={(label) => `类型: ${label}`}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {logSourceStats.length > 0 && (
                  <Card className="bg-card border-border shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-foreground">最近日志来源分布</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={logSourceStats}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              dataKey="count"
                              nameKey="source"
                            >
                              {logSourceStats.map((entry, index) => {
                                const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];
                                return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                              })}
                            </Pie>
                            <Tooltip 
                              formatter={(value: any) => [`${value} 条日志`, '数量']}
                              labelFormatter={(label) => `来源: ${label}`}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            {/* 类型分布标签 */}
            <TabsContent value="types">
              <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-foreground">日志类型分布</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    按日志级别和类型统计
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {logTypeStats.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={logTypeStats}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="type" />
                          <YAxis />
                          <Tooltip formatter={(value: any) => [`${value} 条日志`, '数量']} />
                          <Legend />
                          <Bar 
                            dataKey="count" 
                            name="数量" 
                            fill={theme === 'dark' ? '#8884d8' : '#82ca9d'} 
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center h-80 text-muted-foreground">
                      {isStatsLoading ? (
                        <div className="flex flex-col items-center">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <Skeleton className="h-4 w-32 mt-2" />
                        </div>
                      ) : (
                        <p>暂无日志类型统计数据</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* 来源分布标签 */}
            <TabsContent value="sources">
              <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-foreground">日志来源分布</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    按日志来源模块统计
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {logSourceStats.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={logSourceStats}
                          layout="vertical"
                          margin={{
                            top: 20,
                            right: 30,
                            left: 100,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis type="category" dataKey="source" />
                          <Tooltip formatter={(value: any) => [`${value} 条日志`, '数量']} />
                          <Legend />
                          <Bar
                            dataKey="count"
                            name="数量"
                            fill={theme === 'dark' ? '#0088FE' : '#FF8042'}
                            radius={[0, 4, 4, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center h-80 text-muted-foreground">
                      {isStatsLoading ? (
                        <div className="flex flex-col items-center">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <Skeleton className="h-4 w-32 mt-2" />
                        </div>
                      ) : (
                        <p>暂无日志来源统计数据</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* 时间趋势标签 */}
            <TabsContent value="trends">
              <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-foreground">日志时间趋势</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    按时间分析日志数量变化
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {logTimeStats.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={logTimeStats}
                          margin={{
                            top: 10,
                            right: 30,
                            left: 0,
                            bottom: 0,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="time" 
                            tickFormatter={(time) => {
                              try {
                                return format(new Date(time), "HH:mm");
                              } catch (error) {
                                return time;
                              }
                            }}
                          />
                          <YAxis />
                          <Tooltip 
                            labelFormatter={(label) => {
                              try {
                                return format(new Date(label), "MM-dd HH:mm");
                              } catch (error) {
                                return label;
                              }
                            }}
                          />
                          <Legend />
                          <Area type="monotone" dataKey="errorCount" name="错误" stackId="1" stroke="#FF0000" fill="#FF0000" fillOpacity={0.5} />
                          <Area type="monotone" dataKey="warningCount" name="警告" stackId="1" stroke="#FFA500" fill="#FFA500" fillOpacity={0.5} />
                          <Area type="monotone" dataKey="infoCount" name="信息" stackId="1" stroke="#0088FE" fill="#0088FE" fillOpacity={0.5} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center h-80 text-muted-foreground">
                      {isStatsLoading ? (
                        <div className="flex flex-col items-center">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <Skeleton className="h-4 w-32 mt-2" />
                        </div>
                      ) : (
                        <p>暂无日志时间趋势数据</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* 日志列表 */}
        <div className="mt-6">
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">系统日志</CardTitle>
                  <CardDescription className="text-muted-foreground">日志详细记录</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="border-border bg-background text-foreground hover:bg-accent/50"
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    刷新
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border bg-background text-foreground hover:bg-accent/50"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setExportDialogOpen(true)}>
                        <Download className="mr-2 h-4 w-4" />
                        导出日志
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setClearDialogOpen(true)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        清空日志
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        console.log('请求重新生成500条模拟日志');
                        // 使用API中的reseedLogs方法重新生成500条日志
                        import('@/services/api/log').then(({ reseedLogs }) => {
                          reseedLogs(500).then(() => {
                            // 重新生成后刷新日志
                            refreshLogs();
                          });
                        });
                      }}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        重新生成模拟数据
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="搜索日志..."
                    className="w-full bg-background border-border pl-9 text-foreground placeholder:text-muted-foreground"
                    value={filter.search || ""}
                    onChange={handleSearch}
                  />
                </div>
                <div className="flex gap-2">
                  <Select 
                    value={filter.type || "all"}
                    onValueChange={handleTypeFilter}
                  >
                    <SelectTrigger className="w-[130px] bg-background border-border text-foreground">
                      <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="类型" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-popover-foreground">
                      <SelectItem value="all">所有类型</SelectItem>
                      <SelectItem value={LogType.ERROR}>错误</SelectItem>
                      <SelectItem value={LogType.WARNING}>警告</SelectItem>
                      <SelectItem value={LogType.INFO}>信息</SelectItem>
                      <SelectItem value={LogType.API_ACCESS}>API访问</SelectItem>
                      <SelectItem value={LogType.SYSTEM_START}>系统启动</SelectItem>
                      <SelectItem value={LogType.SYSTEM_STOP}>系统停止</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select 
                    value={filter.source || "all"}
                    onValueChange={handleSourceFilter}
                  >
                    <SelectTrigger className="w-[130px] bg-background border-border text-foreground">
                      <Layers className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="来源" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-popover-foreground">
                      <SelectItem value="all">所有来源</SelectItem>
                      <SelectItem value={LogSource.SYSTEM}>系统</SelectItem>
                      <SelectItem value={LogSource.API}>API</SelectItem>
                      <SelectItem value={LogSource.DATABASE}>数据库</SelectItem>
                      <SelectItem value={LogSource.AUTH}>认证</SelectItem>
                      <SelectItem value={LogSource.NETWORK}>网络</SelectItem>
                      <SelectItem value={LogSource.SCHEDULER}>调度器</SelectItem>
                      <SelectItem value={LogSource.FRONTEND}>前端</SelectItem>
                      <SelectItem value={LogSource.CACHE}>缓存</SelectItem>
                      <SelectItem value={LogSource.MONITORING}>监控</SelectItem>
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
                          时间
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          级别
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          来源
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          消息
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-card">
                      {isLoading ? (
                        Array(5).fill(0).map((_, index) => (
                          <tr key={`skeleton-${index}`}>
                            <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                            <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                            <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                            <td className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                          </tr>
                        ))
                      ) : logs.length > 0 ? (
                        logs.map((log) => (
                          <tr key={log.id} className="hover:bg-accent/50 transition-colors">
                            <td className="px-4 py-3 text-sm text-foreground font-mono whitespace-nowrap">
                              <div className="flex items-center">
                                <Clock className="mr-2 h-3 w-3 text-muted-foreground" />
                                {formatDateTime(log.timestamp)}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">
                              <Badge className={`${getLevelColor(log.logType)}`}>
                                {log.logType === LogType.ERROR && <XCircle className="mr-1 h-3 w-3" />}
                                {log.logType === LogType.WARNING && <AlertCircle className="mr-1 h-3 w-3" />}
                                {log.logType}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">
                              {getLogIcon(log.source)}
                              <span className="ml-1">{log.source}</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-foreground">
                              {log.message}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                            没有匹配的日志记录
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {totalPages > 1 && (
                <div className="mt-4 flex justify-end">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      {/* 导出日志对话框 */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>导出日志</DialogTitle>
            <DialogDescription>
              选择导出格式及范围
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="export-format">导出格式</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger id="export-format">
                  <SelectValue placeholder="选择格式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV 文件</SelectItem>
                  <SelectItem value="json">JSON 文件</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={() => {
              console.log('导出日志，格式:', exportFormat);
              
              // 获取当前的过滤条件
              const { type, source, search, startTime, endTime } = filter;
              
              // 使用API的exportLogs方法导出
              import('@/services/api/log').then(({ exportLogs }) => {
                exportLogs(exportFormat as 'csv' | 'json', {
                  type,
                  source,
                  search,
                  startTime,
                  endTime,
                  // 导出时不考虑分页
                  limit: 1000,
                  offset: 0
                }).then((response) => {
                  console.log('导出响应:', response);
                  
                  // 使用类型断言处理response
                  type ExportResponse = { data: any };
                  const typedResponse = response as ExportResponse;
                  
                  // 创建Blob并下载
                  const blob = new Blob([typedResponse.data], { 
                    type: exportFormat === 'csv' ? 'text/csv' : 'application/json' 
                  });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `logs_export_${new Date().toISOString()}.${exportFormat}`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                  
                  // 关闭对话框
                  setExportDialogOpen(false);
                }).catch(error => {
                  console.error('导出日志出错:', error);
                  alert('导出失败: ' + (error.message || '未知错误'));
                });
              });
            }}>
              导出
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 清空日志确认对话框 */}
      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>清空所有日志</DialogTitle>
            <DialogDescription>
              此操作将永久删除所有日志记录，无法恢复。确定要继续吗？
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={confirmClearLogs}>
              确认清空
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

