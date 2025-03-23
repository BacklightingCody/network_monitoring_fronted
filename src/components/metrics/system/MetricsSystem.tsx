import { useEffect, useRef, useState } from 'react';
import ResourceSection from '@/components/common/ResourceSection';
import ResourceCard from '@/components/common/ResourceCards';
import AreaCharts from '@/components/common/AreaCharts';
import PieCharts from '@/components/common/PieCharts';
import BarCharts from '@/components/common/BarCharts';
import { Card } from '@/components/common/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResourceMetrics, ResourceCharts } from '@/components/common/ResourceSection';
import { Activity, Clock, Cpu, Database, Gauge, HardDrive, Server, Users, Layers, Timer } from 'lucide-react';
import { useSystemMetricsData, useSystemMetricsActions } from '@/stores';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/Badge';

export function MetricsSystem() {
  // 分别获取数据和操作，避免不必要的重渲染
  const metrics = useSystemMetricsData();
  const actions = useSystemMetricsActions();
  console.log(metrics, 'kxc')
  // 使用 ref 追踪组件是否已挂载，避免多次设置轮询
  const isMounted = useRef(false);

  // 用于控制激活的饼图扇区
  const [activeServicesIndex, setActiveServicesIndex] = useState<number | undefined>(undefined);
  const [activeMemoryIndex, setActiveMemoryIndex] = useState<number | undefined>(undefined);

  // 格式化字节为可读格式
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  // 格式化百分比
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  // 格式化数字（增加千分位分隔符）
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  // 准备服务状态饼图数据
  const servicesPieData = [
    {
      name: '运行中服务',
      value: metrics.runningServicesCount,
    },
    {
      name: '已停止服务',
      value: metrics.stoppedServicesCount,
    }
  ];

  // 准备内存使用率饼图数据
  const memoryUsagePieData = [
    {
      name: '已用内存',
      value: metrics.physicalMemory - metrics.memoryFree,
    },
    {
      name: '可用内存',
      value: metrics.memoryFree,
    }
  ];

  // 准备系统调用和性能指标柱状图数据
  const systemCallsBarData = [
    {
      name: '上下文切换',
      系统性能: metrics.contextSwitches,
    },
    {
      name: '系统调用',
      系统性能: metrics.systemCalls,
    },
    {
      name: '异常分发',
      系统性能: metrics.exceptionDispatches,
    },
    {
      name: '磁盘IO',
      系统性能: metrics.diskIO,
    }
  ];

  // 准备进程和线程趋势数据
  const processThreadsAreaData = [
    {
      name: '进程数',
      data: metrics.processesTrend,
    },
    {
      name: '线程数',
      data: metrics.threadsTrend,
    }
  ];

  // 准备系统调用和上下文切换趋势数据
  const systemCallsAreaData = [
    {
      name: '系统调用',
      data: metrics.systemCallsTrend,
    },
    {
      name: '上下文切换',
      data: metrics.contextSwitchesTrend,
    }
  ];

  // 准备异常分发和磁盘IO趋势数据
  const exceptionDiskAreaData = [
    {
      name: '异常分发',
      data: metrics.exceptionDispatchesTrend,
    },
    {
      name: '磁盘IO',
      data: metrics.diskIOTrend,
    }
  ];

  useEffect(() => {
    // 只在首次渲染时设置轮询
    if (!isMounted.current) {
      isMounted.current = true;
      console.log('系统组件挂载，开始轮询');
      actions.startPolling();
    }
    const intervalId = setInterval(() => {
      actions.startPolling();
    }, 5000);
    // 组件卸载时清理
    return () => {
      clearInterval(intervalId)
      if (isMounted.current) {
        console.log('系统组件卸载，停止轮询');
        actions.stopPolling();
        isMounted.current = false;
      }
    };
  }, []); // 空依赖数组，只在组件挂载和卸载时执行

  if (metrics.error) {
    return <div className="text-red-500 text-center p-4">{metrics.error}</div>;
  }

  return (
    <div className="space-y-6">
      <ResourceSection title="系统性能监控" className="bg-card text-card-foreground">
        <ResourceMetrics>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <ResourceCard
              title="主机名"
              value={metrics.hostname || 'N/A'}
              unit=""
              showProgress={false}
              icon={<Server className="h-6 w-6" />}
              colorScheme="gray"
            />
            <ResourceCard
              title="系统运行时间"
              value={metrics.uptimeFormatted || '0秒'}
              unit=""
              showProgress={false}
              icon={<Clock className="h-6 w-6" />}
              colorScheme="gray"
            />
            <ResourceCard
              title="时区"
              value={metrics.timezone || 'N/A'}
              unit=""
              showProgress={false}
              icon={<Clock className="h-6 w-6" />}
              colorScheme="gray"
            />
            <ResourceCard
              title="活跃用户"
              value={formatNumber(metrics.users)}
              unit="个"
              showProgress={false}
              icon={<Users className="h-6 w-6" />}
              colorScheme="gray"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <ResourceCard
              title="逻辑处理器"
              value={formatNumber(metrics.logicalProcessors)}
              unit="个"
              showProgress={false}
              icon={<Cpu className="h-6 w-6" />}
              colorScheme="blue"
            />
            <ResourceCard
              title="物理内存"
              value={formatBytes(metrics.physicalMemory)}
              unit=""
              showProgress={false}
              icon={<Database className="h-6 w-6" />}
              colorScheme="purple"
            />
            <ResourceCard
              title="进程数"
              value={formatNumber(metrics.processes)}
              unit="个"
              showProgress={true}
              // progressValue={(metrics.processes / (metrics.processesLimit || 1)) * 100}
              icon={<Activity className="h-6 w-6" />}
              colorScheme="amber"
            />
            <ResourceCard
              title="线程数"
              value={formatNumber(metrics.threads)}
              unit="个"
              showProgress={false}
              icon={<Layers className="h-6 w-6" />}
              colorScheme="amber"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ResourceCard
              title="CPU队列长度"
              value={formatNumber(metrics.cpuQueueLength)}
              unit=""
              showProgress={false}
              icon={<Gauge className="h-6 w-6" />}
              colorScheme="blue"
            />
            <ResourceCard
              title="内存使用率"
              value={metrics.memoryUsagePercentage.toFixed(2)}
              unit="%"
              showProgress={true}
              progressValue={metrics.memoryUsagePercentage}
              icon={<Database className="h-6 w-6" />}
              colorScheme="purple"
            />
            <ResourceCard
              title="磁盘IO"
              value={formatNumber(metrics.diskIO)}
              unit="次/秒"
              showProgress={false}
              icon={<HardDrive className="h-6 w-6" />}
              colorScheme="teal"
            />
            <ResourceCard
              title="收集器耗时"
              value={(metrics.collectorDuration / 1000).toFixed(2)}
              unit="秒"
              showProgress={false}
              icon={<Timer className="h-6 w-6" />}
              colorScheme="gray"
            />
          </div>
        </ResourceMetrics>

        <ResourceCharts>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* 服务状态饼图 */}
            <Card className="p-4 min-h-[400px] z-10 bg-card text-card-foreground">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">服务状态分布</h3>
                <div className="h-[350px]">
                  <PieCharts
                    data={servicesPieData}
                    valueUnit="个"
                    donut={true}
                    innerRadius={60}
                    title="服务状态"
                    activeIndex={activeServicesIndex}
                    labelVisible={true}
                    customColors={['rgb(34, 197, 94)', 'rgb(239, 68, 68)']}
                    paddingAngle={4}
                    showLegend={true}
                  />
                </div>
              </div>

            </Card>

            {/* 内存使用饼图 */}
            <Card className="p-4 min-h-[400px] z-10 bg-card text-card-foreground">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">内存使用分布</h3>
                <div className="h-[350px]">
                  <PieCharts
                    data={memoryUsagePieData}
                    valueUnit="B"
                    donut={true}
                    innerRadius={60}
                    title={`${metrics.memoryUsagePercentage.toFixed(2)}%`}
                    activeIndex={activeMemoryIndex}
                    labelVisible={true}
                    customColors={['rgb(168, 85, 247)', 'rgb(192, 132, 252)']}
                    paddingAngle={4}
                    showLegend={true}
                  />
                </div>
              </div>

            </Card>
          </div>

          <Tabs defaultValue="resource-usage" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="resource-usage">资源使用趋势</TabsTrigger>
              <TabsTrigger value="performance">性能指标</TabsTrigger>
              <TabsTrigger value="services">系统服务</TabsTrigger>
            </TabsList>

            <TabsContent value="resource-usage" className="space-y-6">
              {/* 进程和线程趋势 */}
              <Card className="p-4 min-h-[400px] z-10 bg-card text-card-foreground">
                <h3 className="text-lg font-semibold mb-2 text-foreground">进程和线程趋势</h3>
                <div className="h-[350px]">
                  <AreaCharts
                    data={processThreadsAreaData}
                    yAxisUnit="个"
                    showLegend={true}
                    curveType="monotone"
                    customColors={['rgb(245, 158, 11)', 'rgb(251, 191, 36)']}
                  />
                </div>
              </Card>

              {/* 系统调用和上下文切换趋势 */}
              <Card className="p-4 min-h-[400px] z-10 bg-card text-card-foreground">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">系统调用和上下文切换趋势</h3>
                  <div className="h-[350px]">
                    <AreaCharts
                      data={systemCallsAreaData}
                      yAxisUnit="次/秒"
                      showLegend={true}
                      curveType="monotone"
                      customColors={['rgb(59, 130, 246)', 'rgb(6, 182, 212)']}
                    />
                  </div>
                </div>

              </Card>

              {/* 异常分发和磁盘IO趋势 */}
              <Card className="p-4 min-h-[400px] z-10 bg-card text-card-foreground">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">异常分发和磁盘IO趋势</h3>
                  <div className="h-[350px]">
                    <AreaCharts
                      data={exceptionDiskAreaData}
                      yAxisUnit="次/秒"
                      showLegend={true}
                      curveType="monotone"
                      customColors={['rgb(239, 68, 68)', 'rgb(20, 184, 166)']}
                    />
                  </div>
                </div>

              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              {/* 系统性能指标柱状图 */}
              <Card className="p-4 min-h-[400px] z-10 bg-card text-card-foreground">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">系统性能指标</h3>
                  <div className="h-[350px]">
                    <BarCharts
                      data={systemCallsBarData}
                      yAxisUnit="次/秒"
                      showLegend={true}
                      barSize={40}
                      xAxisKey="name"
                      customColors={['rgb(59, 130, 246)']}
                    />
                  </div>
                </div>

              </Card>

              {/* CPU队列长度趋势 */}
              <Card className="p-4 min-h-[400px] z-10 bg-card text-card-foreground">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">CPU队列长度趋势</h3>
                  <div className="h-[350px]">
                    <AreaCharts
                      data={[{
                        name: 'CPU队列长度',
                        data: metrics.cpuQueueTrend
                      }]}
                      yAxisUnit=""
                      showLegend={false}
                      curveType="monotone"
                      customColors={['rgb(59, 130, 246)']}
                    />
                  </div>
                </div>

              </Card>
            </TabsContent>

            <TabsContent value="services" className="space-y-6">
              {/* 系统服务列表 */}
              <Card className="p-4 z-10 bg-card text-card-foreground">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-foreground">系统服务列表</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>服务名称</TableHead>
                          <TableHead>显示名称</TableHead>
                          <TableHead>启动类型</TableHead>
                          <TableHead>状态</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {metrics.services.map((service, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{service.name}</TableCell>
                            <TableCell>{service.displayName || service.name}</TableCell>
                            <TableCell>{service.startType || '未知'}</TableCell>
                            <TableCell>
                              {service.state === 'Running' ? (
                                <Badge className="bg-green-500 hover:bg-green-600">运行中</Badge>
                              ) : (
                                <Badge className="bg-red-500 hover:bg-red-600">已停止</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

              </Card>

              {/* 服务统计 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4 bg-card text-card-foreground">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">运行中服务</h3>
                    <div className="text-3xl font-bold">{metrics.runningServicesCount} <span className="text-sm text-muted-foreground">个</span></div>
                    <div className="mt-2 text-muted-foreground">占总服务数的 {((metrics.runningServicesCount / (metrics.runningServicesCount + metrics.stoppedServicesCount)) * 100).toFixed(2)}%</div>
                  </div>

                </Card>

                <Card className="p-4 bg-card text-card-foreground">
                  <div>

                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">已停止服务</h3>
                  <div className="text-3xl font-bold">{metrics.stoppedServicesCount} <span className="text-sm text-muted-foreground">个</span></div>
                  <div className="mt-2 text-muted-foreground">占总服务数的 {((metrics.stoppedServicesCount / (metrics.runningServicesCount + metrics.stoppedServicesCount)) * 100).toFixed(2)}%</div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </ResourceCharts>
      </ResourceSection>
    </div>

  );
}

export default MetricsSystem;
