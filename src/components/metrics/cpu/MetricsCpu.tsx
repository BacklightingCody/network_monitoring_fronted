import { useEffect, useState, useRef, useCallback } from 'react';
import ResourceSection from '@/components/common/ResourceSection';
import ResourceCard from '@/components/common/ResourceCards';
import LineCharts from '@/components/common/LineCharts';
import { Card } from '@/components/common/Card';
import { transformMetricsData, transformMetricsSeries, calculateAverageCpuUsage, aggregateMetricsData, processCpuCStateData, getCurrentCpuState } from '../utils/transformMetricsData';
import { getCpuAllMetrics } from '@/services/api/cpu';
import { ResourceMetrics, ResourceCharts } from '@/components/common/ResourceSection';
import { Cpu, Activity, Clock, Zap } from 'lucide-react';
import { timeRangeMs } from '../constant';

interface MetricData {
  time: string;
  value: number;
}

interface MetricDataPoint {
  time: string;
  value: number;
  [key: string]: any;
}

export function CpuMetrics() {
  const [metrics, setMetrics] = useState<{
    processorCount: number;
    performanceCount: number;
    coreFrequency: number;
    cpuState: string;
    performanceTrend: MetricDataPoint[];
    clockInterruptsTrend: MetricDataPoint[];
    dpcsTrend: MetricDataPoint[];
    interruptsTrend: MetricDataPoint[];
  }>({
    processorCount: 0,
    performanceCount: 0,
    coreFrequency: 0,
    cpuState: '',
    performanceTrend: [],
    clockInterruptsTrend: [],
    dpcsTrend: [],
    interruptsTrend: []
  });

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const mounted = useRef(true);

  // 使用 useRef 存储历史数据
  const metricsHistory = useRef<{
    performance: MetricDataPoint[];
    clockInterrupts: MetricDataPoint[];
    dpcs: MetricDataPoint[];
    interrupts: MetricDataPoint[];
  }>({
    performance: [],
    clockInterrupts: [],
    dpcs: [],
    interrupts: []
  });

  const fetchData = useCallback(async () => {
    if (!mounted.current || isLoading) return;

    try {
      console.log('开始获取CPU指标数据...');
      setIsLoading(true);
      setError(null);

      const allMetrics = await getCpuAllMetrics();
      
      if (!mounted.current) return;

      const {
        clockInterrupts,
        coreFrequency,
        cpuCState,
        dpcs,
        interrupts,
        logicalProcessor,
        processorPerformance,
        processorUtility,
        cpuTime
      } = allMetrics;

      // 处理 CPU 使用率数据
      const currentPerformance = calculateAverageCpuUsage(transformMetricsData(processorPerformance));
      const newPerformancePoint = {
        time: new Date().toLocaleTimeString(),
        value: currentPerformance
      };

      // 处理中断相关数据
      const currentTime = new Date().toLocaleTimeString();
      const cStateData = processCpuCStateData(cpuCState);
      const cpuState = getCurrentCpuState(cStateData);
      const newMetricsPoints = {
        clockInterrupts: {
          time: currentTime,
          value: transformMetricsData(clockInterrupts, { latestOnly: true }) as number
        },
        dpcs: {
          time: currentTime,
          value: transformMetricsData(dpcs, { latestOnly: true }) as number
        },
        interrupts: {
          time: currentTime,
          value: transformMetricsData(interrupts, { latestOnly: true }) as number
        }
      };

      // 更新历史数据
      metricsHistory.current = {
        performance: [...metricsHistory.current.performance, newPerformancePoint].slice(-timeRangeMs['7d']),
        clockInterrupts: [...metricsHistory.current.clockInterrupts, newMetricsPoints.clockInterrupts].slice(-timeRangeMs['7d']),
        dpcs: [...metricsHistory.current.dpcs, newMetricsPoints.dpcs].slice(-timeRangeMs['7d']),
        interrupts: [...metricsHistory.current.interrupts, newMetricsPoints.interrupts].slice(-timeRangeMs['7d'])
      };

      // 更新状态
      setMetrics(prev => ({
        ...prev,
        processorCount: transformMetricsData(logicalProcessor, { latestOnly: true }) as number,
        performanceCount: currentPerformance,
        performanceTrend: metricsHistory.current.performance,
        coreFrequency: transformMetricsData(coreFrequency, { latestOnly: true }) as number,
        cpuState: cpuState,
        clockInterruptsTrend: metricsHistory.current.clockInterrupts,
        dpcsTrend: metricsHistory.current.dpcs,
        interruptsTrend: metricsHistory.current.interrupts
      }));

    } catch (error) {
      console.error('获取CPU指标失败:', error);
      if (mounted.current) {
        setError('获取数据失败，请稍后重试');
      }
    } finally {
      if (mounted.current) {
        setIsLoading(false);
      }
    }
  }, [isLoading]);

  useEffect(() => {
    mounted.current = true;
    console.log('CPU指标组件已挂载');

    // 立即获取一次数据
    fetchData();

    // 设置定时器
    const intervalId = window.setInterval(() => {
      console.log('定时获取CPU指标...');
      fetchData();
    }, 5000);

    // 清理函数
    return () => {
      mounted.current = false;
      if (intervalId) {
        clearInterval(intervalId);
        console.log('CPU指标定时器已清除');
      }
    };
  }, []);

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <ResourceSection title="CPU 性能监控">
        <ResourceMetrics>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ResourceCard
              title="CPU 使用率"
              value={metrics.performanceCount}
              unit="%"
              showProgress={true}
              icon={<Cpu className="h-6 w-6 text-blue-500" />}
            />
            <ResourceCard
              title="处理器数量"
              value={metrics.processorCount}
              unit="核"
              showProgress={false}
              icon={<Activity className="h-6 w-6 text-green-500" />}
            />
            <ResourceCard
              title="核心频率"
              value={metrics.coreFrequency}
              unit="MHz"
              showProgress={false}
              icon={<Clock className="h-6 w-6 text-purple-500" />}
            />
            <ResourceCard
              title="CPU 状态"
              value={metrics.cpuState}
              unit=""
              showProgress={false}
              icon={<Zap className="h-6 w-6 text-yellow-500" />}
            />
          </div>
        </ResourceMetrics>

        <ResourceCharts>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <Card className="p-4 min-h-[400px] z-10">
              <h3 className="text-lg font-semibold mb-2">CPU 使用率趋势</h3>
              <LineCharts
                data={metrics.performanceTrend}
                yAxisUnit="%"
                timeRange="1h"
                showLegend={false}
              />
            </Card>
            <Card className="p-4 min-h-[400px] z-10">
              <h3 className="text-lg font-semibold mb-2">中断和 DPC 趋势</h3>
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