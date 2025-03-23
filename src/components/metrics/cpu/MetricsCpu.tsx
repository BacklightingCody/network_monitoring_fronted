import { useEffect, useRef } from 'react';
import ResourceSection from '@/components/common/ResourceSection';
import ResourceCard from '@/components/common/ResourceCards';
import LineCharts from '@/components/common/LineCharts';
import { Card } from '@/components/common/Card';
import { ResourceMetrics, ResourceCharts } from '@/components/common/ResourceSection';
import { Cpu, Activity, Clock, Zap } from 'lucide-react';
import { useCpuMetricsData, useCpuMetricsActions } from '@/stores';

export function CpuMetrics() {
  // 分别获取数据和操作，避免不必要的重渲染
  const metrics = useCpuMetricsData();
  const actions = useCpuMetricsActions();
  
  // 使用 ref 追踪组件是否已挂载，避免多次设置轮询
  const isMounted = useRef(false);

  useEffect(() => {
    // 只在首次渲染时设置轮询
    if (!isMounted.current) {
      isMounted.current = true;
      console.log('CPU组件挂载，开始轮询');
      actions.startPolling(); // 启动轮询
    }
    const intervalId = setInterval(() => {
      actions.startPolling();
    }, 5000);

    // 组件卸载时清理
    return () => {
      clearInterval(intervalId); // 清除轮询间隔
      if (isMounted.current) {
        console.log('CPU组件卸载，停止轮询');
        actions.stopPolling(); // 停止轮询
        isMounted.current = false;
      }
    };
  }, []); // 依赖 actions，确保在 actions 变化时重新执行

  if (metrics.error) {
    return <div className="text-red-500 text-center p-4">{metrics.error}</div>;
  }

  return (
    <div className="space-y-6">
      <ResourceSection title="CPU 性能监控" className="bg-card text-card-foreground">
        <ResourceMetrics>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ResourceCard
              title="CPU 使用率"
              value={metrics.performanceCount}
              unit="%"
              showProgress={true}
              icon={<Cpu className="h-6 w-6" />}
              colorScheme="blue"
            />
            <ResourceCard
              title="处理器数量"
              value={metrics.processorCount}
              unit="核"
              showProgress={false}
              icon={<Activity className="h-6 w-6" />}
              colorScheme="blue"
            />
            <ResourceCard
              title="核心频率"
              value={metrics.coreFrequency}
              unit="MHz"
              showProgress={false}
              icon={<Clock className="h-6 w-6" />}
              colorScheme="blue"
            />
            <ResourceCard
              title="CPU 状态"
              value={metrics.cpuState}
              unit=""
              showProgress={false}
              icon={<Zap className="h-6 w-6" />}
              colorScheme="blue"
            />
          </div>
        </ResourceMetrics>

        <ResourceCharts>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <Card className="p-4 min-h-[400px] z-10 bg-card text-card-foreground">
              <h3 className="text-lg font-semibold mb-2 text-foreground">CPU 使用率趋势</h3>
              <LineCharts
                data={metrics.performanceTrend}
                yAxisUnit="%"
                timeRange="1h"
                showLegend={false}
              />
            </Card>
            <Card className="p-4 min-h-[400px] z-10 bg-card text-card-foreground">
              <h3 className="text-lg font-semibold mb-2 text-foreground">中断和 DPC 趋势</h3>
              <LineCharts
                data={[
                  { name: '时钟中断', data: metrics.clockInterruptsTrend },
                  { name: 'DPC', data: metrics.dpcsTrend },
                  { name: '中断', data: metrics.interruptsTrend }
                ]}
                timeRange="1h"
                yAxisUnit="/秒"
                yAxisDomain={[0, 1000000]}
                showLegend={true}
              />
            </Card>
          </div>
        </ResourceCharts>
      </ResourceSection>
    </div>
  );
}