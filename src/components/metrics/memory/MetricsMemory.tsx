import { useEffect, useRef } from 'react';
import ResourceSection from '@/components/common/ResourceSection';
import ResourceCard from '@/components/common/ResourceCards';
import LineCharts from '@/components/common/LineCharts';
import { Card } from '@/components/common/Card';
import { ResourceMetrics, ResourceCharts } from '@/components/common/ResourceSection';
import { MemoryStick, Database, BarChart, ArrowUp, HardDrive, CircleOff } from 'lucide-react';
import { useMemoryMetricsData, useMemoryMetricsActions } from '@/stores';

export function MemoryMetrics() {
  // 分别获取数据和操作，避免不必要的重渲染
  const metrics = useMemoryMetricsData();
  const actions = useMemoryMetricsActions();
  
  // 使用 ref 追踪组件是否已挂载，避免多次设置轮询
  const isMounted = useRef(false);

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

  // 计算页面内存使用量
  const calculatePageFileUsage = (): number => {
    if (metrics.committedMemory > metrics.physicalTotalMemory) {
      return metrics.committedMemory - metrics.physicalTotalMemory + metrics.physicalFreeMemory;
    }
    return 0;
  };

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
              icon={<MemoryStick className="h-6 w-6" />}
              colorScheme="purple"
            />
            <ResourceCard
              title="物理内存"
              value={formatBytes(metrics.physicalTotalMemory)}
              unit="总量"
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
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <Card className="p-4 min-h-[400px] z-10 bg-card text-card-foreground">
              <h3 className="text-lg font-semibold mb-2 text-foreground">内存使用趋势</h3>
              <LineCharts
                data={[
                  { name: '可用内存', data: metrics.availableMemoryTrend },
                  { name: '提交内存', data: metrics.commitMemoryTrend }
                ]}
                timeRange="1h"
                yAxisUnit="B"
                showLegend={true}
              />
            </Card>
            <Card className="p-4 min-h-[400px] z-10 bg-card text-card-foreground">
              <h3 className="text-lg font-semibold mb-2 text-foreground">页面文件使用趋势</h3>
              <LineCharts
                data={metrics.pageFileUsageTrend}
                timeRange="1h"
                yAxisUnit="B"
                showLegend={false}
              />
            </Card>
            <Card className="p-4 min-h-[400px] z-10 bg-card text-card-foreground">
              <h3 className="text-lg font-semibold mb-2 text-foreground">错误趋势</h3>
              <LineCharts
                data={[
                  { name: '页面错误', data: metrics.pageFaultsTrend },
                  { name: '缓存错误', data: metrics.cacheFaultsTrend }
                ]}
                timeRange="1h"
                yAxisUnit="次"
                showLegend={true}
              />
            </Card>
            <Card className="p-4 min-h-[400px] z-10 bg-card text-card-foreground">
              <h3 className="text-lg font-semibold mb-2 text-foreground">内存交换趋势</h3>
              <LineCharts
                data={[
                  { name: '交换操作', data: metrics.swapTrend.operations },
                  { name: '读取操作', data: metrics.swapTrend.reads },
                  { name: '写入操作', data: metrics.swapTrend.writes }
                ]}
                timeRange="1h"
                yAxisUnit="次"
                showLegend={true}
              />
            </Card>
          </div>
        </ResourceCharts>
      </ResourceSection>
    </div>
  );
}
