import { useEffect, useRef, useState } from 'react';
import ResourceSection from '@/components/common/ResourceSection';
import ResourceCard from '@/components/common/ResourceCards';
import LineCharts from '@/components/common/LineCharts';
import AreaCharts from '@/components/common/AreaCharts';
import PieCharts from '@/components/common/PieCharts';
import { Card } from '@/components/common/Card';
import { ResourceMetrics, ResourceCharts } from '@/components/common/ResourceSection';
import { MemoryStick, Database, BarChart, ArrowUp, HardDrive, CircleOff } from 'lucide-react';
import { useMemoryMetricsData, useMemoryMetricsActions } from '@/stores';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function MemoryMetrics() {
  // 分别获取数据和操作，避免不必要的重渲染
  const metrics = useMemoryMetricsData();
  const actions = useMemoryMetricsActions();
  
  // 使用 ref 追踪组件是否已挂载，避免多次设置轮询
  const isMounted = useRef(false);
  
  // 用于控制激活的饼图扇区
  const [activeMemoryIndex, setActiveMemoryIndex] = useState<number | undefined>(undefined);
  const [activePageFileIndex, setActivePageFileIndex] = useState<number | undefined>(undefined);

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
    return `${value.toFixed(2)}`;
  };

  // 准备内存使用率饼图数据
  const memoryUsagePieData = [
    {
      name: '已用内存',
      value: metrics.physicalTotalMemory - metrics.physicalFreeMemory,
    },
    {
      name: '可用内存',
      value: metrics.physicalFreeMemory,
    }
  ];

  // 准备页面文件使用率饼图数据
  const calculatePageFileUsage = (): number => {
    if (metrics.committedMemory > metrics.physicalTotalMemory) {
      return metrics.committedMemory - metrics.physicalTotalMemory + metrics.physicalFreeMemory;
    }
    return 0;
  };

  const pageFileUsagePieData = [
    {
      name: '已使用页面文件',
      value: calculatePageFileUsage(),
    },
    {
      name: '页面文件空余',
      value: metrics.freeAndZeroPageBytes || 0,
    }
  ];

  // 准备内存池区域图数据
  const memoryPoolAreaData = [
    {
      name: '非分页池',
      data: metrics.availableMemoryTrend.map((point, index) => ({
        time: point.time,
        value: typeof metrics.poolNonpagedMemory === 'number' ? metrics.poolNonpagedMemory : 0
      })),
    },
    {
      name: '分页池',
      data: metrics.availableMemoryTrend.map((point, index) => ({
        time: point.time,
        value: typeof metrics.poolPagedMemory === 'number' ? metrics.poolPagedMemory : 0
      })),
    },
    {
      name: '缓存内存',
      data: metrics.availableMemoryTrend.map((point, index) => ({
        time: point.time,
        value: typeof metrics.cacheMemory === 'number' ? metrics.cacheMemory : 0
      })),
    },
    {
      name: '可用内存',
      data: metrics.availableMemoryTrend.map((point, index) => ({
        time: point.time,
        value: typeof metrics.availableMemory === 'number' ? metrics.availableMemory : 0
      })),
    }
  ];

  useEffect(() => {
    // 只在首次渲染时设置轮询
    if (!isMounted.current) {
      isMounted.current = true;
      console.log('内存组件挂载，开始轮询');
      actions.startPolling();
    }

    const intervalId = setInterval(() => {
      actions.startPolling();
    }, 5000);
    
    // 组件卸载时清理
    return () => {
      clearInterval(intervalId);
      if (isMounted.current) {
        console.log('内存组件卸载，停止轮询');
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
      <ResourceSection title="内存性能监控" className="bg-card text-card-foreground">
        <ResourceMetrics>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <ResourceCard
              title="内存使用率"
              value={formatPercentage(metrics.memoryUsagePercentage)}
              unit="%"
              showProgress={true}
              progressValue={metrics.memoryUsagePercentage}
              icon={<MemoryStick className="h-6 w-6" />}
              colorScheme="purple"
            />
            <ResourceCard
              title="物理内存总量"
              value={formatBytes(metrics.physicalTotalMemory)}
              unit=""
              showProgress={false}
              icon={<Database className="h-6 w-6" />}
              colorScheme="purple"
            />
            <ResourceCard
              title="可用内存"
              value={formatBytes(metrics.availableMemory)}
              unit=""
              showProgress={false}
              icon={<MemoryStick className="h-6 w-6" />}
              colorScheme="purple"
            />
            <ResourceCard
              title="提交内存"
              value={formatBytes(metrics.committedMemory)}
              unit=""
              showProgress={true}
              progressValue={metrics.commitPercentage}
              icon={<BarChart className="h-6 w-6" />}
              colorScheme="purple"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <ResourceCard
              title="缓存内存"
              value={formatBytes(metrics.cacheMemory)}
              unit=""
              showProgress={false}
              icon={<Database className="h-6 w-6" />}
              colorScheme="purple"
            />
            <ResourceCard
              title="非分页池"
              value={formatBytes(metrics.poolNonpagedMemory)}
              unit=""
              showProgress={false}
              icon={<Database className="h-6 w-6" />}
              colorScheme="purple"
            />
            <ResourceCard
              title="分页池"
              value={formatBytes(metrics.poolPagedMemory)}
              unit=""
              showProgress={false}
              icon={<Database className="h-6 w-6" />}
              colorScheme="purple"
            />
            <ResourceCard
              title="页面文件使用"
              value={formatBytes(calculatePageFileUsage())}
              unit=""
              showProgress={false}
              icon={<HardDrive className="h-6 w-6" />}
              colorScheme="purple"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ResourceCard
              title="页面错误"
              value={metrics.pageFaults.toLocaleString()}
              unit="次"
              showProgress={false}
              icon={<CircleOff className="h-6 w-6" />}
              colorScheme="purple"
            />
            <ResourceCard
              title="缓存错误"
              value={metrics.cacheFaults.toLocaleString()}
              unit="次"
              showProgress={false}
              icon={<CircleOff className="h-6 w-6" />}
              colorScheme="purple"
            />
            <ResourceCard
              title="交换读"
              value={metrics.swapReads.toLocaleString()}
              unit="次"
              showProgress={false}
              icon={<ArrowUp className="h-6 w-6" />}
              colorScheme="purple"
            />
            <ResourceCard
              title="交换写"
              value={metrics.swapWrites.toLocaleString()}
              unit="次"
              showProgress={false}
              icon={<ArrowUp className="h-6 w-6" />}
              colorScheme="purple"
            />
          </div>
        </ResourceMetrics>

        <ResourceCharts>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* 内存使用率饼图 */}
            <Card className="p-4 min-h-[400px] z-10 bg-card text-card-foreground">
              <h3 className="text-lg font-semibold mb-2 text-foreground">内存使用率分布</h3>
              <div className="h-[350px]">
                <PieCharts
                  data={memoryUsagePieData}
                  valueUnit="B"
                  donut={true}
                  innerRadius={60}
                  title=""
                  activeIndex={activeMemoryIndex}
                  labelVisible={true}
                  customColors={['rgb(168, 85, 247)', 'rgb(192, 132, 252)']}
                  paddingAngle={4}
                />
              </div>
            </Card>

            {/* 页面文件使用饼图 */}
            <Card className="p-4 min-h-[400px] z-10 bg-card text-card-foreground">
              <h3 className="text-lg font-semibold mb-2 text-foreground">页面文件使用分布</h3>
              <div className="h-[350px]">
                <PieCharts
                  data={pageFileUsagePieData}
                  valueUnit="B"
                  donut={true}
                  innerRadius={60}
                  title=""
                  activeIndex={activePageFileIndex}
                  labelVisible={true}
                  customColors={['rgb(236, 72, 153)', 'rgb(244, 114, 182)']}
                  paddingAngle={4}
                />
              </div>
            </Card>
          </div>

          <Tabs defaultValue="memory-pools" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="memory-pools">内存池分布</TabsTrigger>
              <TabsTrigger value="memory-usage">内存使用趋势</TabsTrigger>
              <TabsTrigger value="errors">错误与交换趋势</TabsTrigger>
            </TabsList>
            
            <TabsContent value="memory-pools" className="space-y-6">
              {/* 内存池区域图 */}
              <Card className="p-4 min-h-[400px] z-10 bg-card text-card-foreground">
                <h3 className="text-lg font-semibold mb-2 text-foreground">内存池分布</h3>
                <div className="h-[350px]">
                  <AreaCharts
                    data={memoryPoolAreaData}
                    yAxisUnit="B"
                    stackAreas={false}
                    gradientColors={true}
                    showLegend={true}
                    curveType="monotone"
                    customColors={[
                      'rgb(168, 85, 247)', // 紫色-非分页池
                      'rgb(192, 132, 252)', // 浅紫色-分页池
                      'rgb(236, 72, 153)', // 粉色-缓存
                      'rgb(6, 182, 212)'   // 青色-可用内存
                    ]}
                  />
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="memory-usage" className="space-y-6">
              {/* 内存使用趋势 */}
              <Card className="p-4 min-h-[400px] z-10 bg-card text-card-foreground">
                <h3 className="text-lg font-semibold mb-2 text-foreground">内存使用率趋势</h3>
                <div className="h-[350px]">
                  <LineCharts
                    data={[
                      { name: '内存使用率', data: metrics.availableMemoryTrend }
                    ]}
                    timeRange="1h"
                    yAxisUnit="%"
                    showLegend={false}
                    customColors={['rgb(168, 85, 247)']}
                  />
                </div>
              </Card>
              
              {/* 提交内存趋势 */}
              <Card className="p-4 min-h-[400px] z-10 bg-card text-card-foreground">
                <h3 className="text-lg font-semibold mb-2 text-foreground">提交内存趋势</h3>
                <div className="h-[350px]">
                  <AreaCharts
                    data={[
                      { name: '提交内存', data: metrics.availableMemoryTrend.map((point, index) => ({
                        time: point.time,
                        value: metrics.committedMemory
                      })) }
                    ]}
                    timeRange="1h"
                    yAxisUnit="B"
                    showLegend={false}
                    customColors={['rgb(236, 72, 153)']}
                    gradientColors={true}
                  />
                </div>
              </Card>
              
              {/* 页面文件使用趋势 */}
              <Card className="p-4 min-h-[400px] z-10 bg-card text-card-foreground">
                <h3 className="text-lg font-semibold mb-2 text-foreground">页面文件使用趋势</h3>
                <div className="h-[350px]">
                  <AreaCharts
                    data={[
                      { name: '页面文件使用', data: metrics.pageFileUsageTrend },
                      { name: '空闲页面空间', data: metrics.pageFreeUsageTrend }
                    ]}
                    timeRange="1h"
                    yAxisUnit="B"
                    showLegend={true}
                    customColors={['rgb(236, 72, 153)', 'rgb(6, 182, 212)']}
                    gradientColors={true}
                  />
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="errors" className="space-y-6">
              {/* 错误趋势 */}
              <Card className="p-4 min-h-[400px] z-10 bg-card text-card-foreground">
                <h3 className="text-lg font-semibold mb-2 text-foreground">内存错误趋势</h3>
                <div className="h-[350px]">
                  <LineCharts
                    data={[
                      { name: '页面错误', data: metrics.pageFaultsTrend },
                      { name: '缓存错误', data: metrics.cacheFaultsTrend }
                    ]}
                    timeRange="1h"
                    yAxisUnit="次"
                    showLegend={true}
                    customColors={['rgb(239, 68, 68)', 'rgb(245, 158, 11)']}
                  />
                </div>
              </Card>
              
              {/* 内存交换趋势 */}
              <Card className="p-4 min-h-[400px] z-10 bg-card text-card-foreground">
                <h3 className="text-lg font-semibold mb-2 text-foreground">内存交换趋势</h3>
                <div className="h-[350px]">
                  <LineCharts
                    data={[
                      { name: '交换操作', data: metrics.swapTrend.operations },
                      { name: '读取操作', data: metrics.swapTrend.reads },
                      { name: '写入操作', data: metrics.swapTrend.writes }
                    ]}
                    timeRange="1h"
                    yAxisUnit="次"
                    showLegend={true}
                    customColors={['rgb(6, 182, 212)', 'rgb(34, 197, 94)', 'rgb(245, 158, 11)']}
                  />
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </ResourceCharts>
      </ResourceSection>
    </div>
  );
}
