import { useEffect, useRef } from 'react';
import ResourceSection from '@/components/common/ResourceSection';
import ResourceCard from '@/components/common/ResourceCards';
import LineCharts from '@/components/common/LineCharts';
import { Card } from '@/components/common/Card';
import { ResourceMetrics, ResourceCharts } from '@/components/common/ResourceSection';
import { HardDrive, ArrowDownToLine } from 'lucide-react';
import { useDiskMetricsData, useDiskMetricsActions } from '@/stores';

export function DiskMetrics() {
  // 分别获取数据和操作，避免不必要的重渲染
  const metrics = useDiskMetricsData();
  const actions = useDiskMetricsActions();
  
  // 使用 ref 追踪组件是否已挂载，避免多次设置轮询
  const isMounted = useRef(false);

  // 转换字节为可读格式
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  // 获取特定卷的指标值
  const getVolumeMetric = (metrics: { volume: string; value: number }[], volume: string): number => {
    return metrics.find(m => m.volume === volume)?.value || 0;
  };

  useEffect(() => {
    // 只在首次渲染时设置轮询
    if (!isMounted.current) {
      isMounted.current = true;
      console.log('磁盘组件挂载，开始轮询');
      actions.startPolling();
    }
    const intervalId = setInterval(() => {
      actions.startPolling();
    }, 5000);
    
    // 组件卸载时清理
    return () => {
      clearInterval(intervalId);
      if (isMounted.current) {
        console.log('磁盘组件卸载，停止轮询');
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
      <ResourceSection title="磁盘性能监控">
        <ResourceMetrics>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ResourceCard
              title="总剩余空间"
              value={formatBytes(metrics.totalFreeSpace)}
              unit=""
              showProgress={false}
              icon={<HardDrive className="h-6 w-6" />}
              colorScheme='emerald'
            />
            <ResourceCard
              title="C盘剩余空间"
              value={formatBytes(getVolumeMetric(metrics.freeSpace, 'C:'))}
              unit=""
              showProgress={false}
              icon={<HardDrive className="h-6 w-6" />}
              colorScheme='emerald'
            />
            <ResourceCard
              title="D盘剩余空间"
              value={formatBytes(getVolumeMetric(metrics.freeSpace, 'D:'))}
              unit=""
              showProgress={false}
              icon={<HardDrive className="h-6 w-6" />}
              colorScheme='emerald'
            />
            <ResourceCard
              title="总读写速度"
              value={formatBytes(metrics.readWriteSpeedTrend.readSpeed[metrics.readWriteSpeedTrend.readSpeed.length - 1]?.value || 0)}
              unit="/s"
              showProgress={false}
              icon={<ArrowDownToLine className="h-6 w-6" />}
              colorScheme='emerald'
            />
          </div>
        </ResourceMetrics>

        <ResourceCharts>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <Card className="p-4 min-h-[400px] z-10">
              <h3 className="text-lg font-semibold mb-2">磁盘读写速度</h3>
              <LineCharts
                data={[
                  { name: '读取速度', data: metrics.readWriteSpeedTrend.readSpeed },
                  { name: '写入速度', data: metrics.readWriteSpeedTrend.writeSpeed }
                ]}
                timeRange="1h"
                yAxisUnit="B/s"
                showLegend={true}
              />
            </Card>
            <Card className="p-4 min-h-[400px] z-10">
              <h3 className="text-lg font-semibold mb-2">磁盘延迟</h3>
              <LineCharts
                data={[
                  { name: '读取延迟', data: metrics.latencyTrend.readLatency },
                  { name: '写入延迟', data: metrics.latencyTrend.writeLatency }
                ]}
                timeRange="1h"
                yAxisUnit="ms"
                showLegend={true}
              />
            </Card>
            <Card className="p-4 min-h-[400px] z-10">
              <h3 className="text-lg font-semibold mb-2">请求队列</h3>
              <LineCharts
                data={[
                  { name: '读取队列', data: metrics.queueTrend.readQueue },
                  { name: '写入队列', data: metrics.queueTrend.writeQueue }
                ]}
                timeRange="1h"
                yAxisUnit=""
                showLegend={true}
              />
            </Card>
          </div>
        </ResourceCharts>
      </ResourceSection>
    </div>
  );
}
