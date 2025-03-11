import { useEffect, useState, useRef } from 'react';
import ResourceSection from '@/components/common/ResourceSection';
import ResourceCard from '@/components/common/ResourceCards';
import LineCharts from '@/components/common/LineCharts';
import { Card, CardContent } from '@/components/common/Card';
import { transformMetricsData, transformMetricsSeries, calculateAverageCpuUsage, aggregateMetricsData, processCpuCStateData, getCurrentCpuState } from '../utils/transformMetricsData';
import { ChartHeight } from '../constant'
import {
  getLogicalProcessorCount,
  getClockInterrupts,
  getCoreFrequency,
  getCpuCState,
  getCpuTime,
  getProcessorPerformance,
  getDpcs,
  getInterrupts
} from '@/services/api/cpu';
import { ResourceMetrics, ResourceCharts } from '@/components/common/ResourceSection';
import { Cpu, HardDrive, CircuitBoard, Activity, Clock, Zap } from 'lucide-react';
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
    performanceCount: number;  // 当前CPU使用率
    coreFrequency: number;    // 当前频率
    cpuState: string;        // 当前CPU状态
    // 历史趋势数据
    performanceTrend: MetricDataPoint[];  // CPU使用率趋势
    clockInterruptsTrend: MetricDataPoint[]; // 时钟中断趋势
    dpcsTrend: MetricDataPoint[];  // DPC趋势
    interruptsTrend: MetricDataPoint[]; // 中断趋势
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

  useEffect(() => {
    let mounted = true;
    let intervalId: number | null = null;

    async function fetchData() {
      if (!mounted || isLoading) return;
      setIsLoading(true);
      setError(null);

      try {
        const [
          processorCount,
          clockInterrupts,
          coreFrequency,
          cpuCState,
          processorPerformance,
          dpcs,
          interrupts
        ] = await Promise.all([
          getLogicalProcessorCount(),
          getClockInterrupts(),
          getCoreFrequency(),
          getCpuCState(),
          getProcessorPerformance(),
          getDpcs(),
          getInterrupts()
        ]);

        if (mounted) {
          // 处理 CPU 使用率数据
          // console.log(processorCount,'1111')
          // console.log(processorPerformance,'2222')
          // console.log(clockInterrupts,'3333')
          // console.log(coreFrequency,'4444')
          // console.log(cpuCState,'5555')
          // console.log(dpcs,'6666')
          // console.log(interrupts,'7777')
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
            processorCount: transformMetricsData(processorCount, { latestOnly: true }) as number,
            performanceCount: currentPerformance,
            performanceTrend: metricsHistory.current.performance,
            coreFrequency: transformMetricsData(coreFrequency, { latestOnly: true }) as number,
            cpuState: cpuState,
            clockInterruptsTrend: metricsHistory.current.clockInterrupts,
            dpcsTrend: metricsHistory.current.dpcs,
            interruptsTrend: metricsHistory.current.interrupts
          }));
        }
      } catch (error) {
        if (mounted) {
          console.error('Failed to fetch metrics:', error);
          setError('获取数据失败，请稍后重试');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchData();
    intervalId = window.setInterval(fetchData, 10000);

    return () => {
      mounted = false;
      if (intervalId) {
        clearInterval(intervalId);
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
            {/* <Card className="p-4">
              <h3 className="text-lg font-semibold mb-2">CPU 状态趋势</h3>
              <LineCharts
                data={[
                  { name: 'c1', data: metrics. },
                  { name: 'c2', data: metrics. },
                  { name: 'c3', data: metrics. }
                ]}
                timeRange="1h"
                yAxisUnit="/秒"
                showLegend={true}
              />
            </Card> */}
          </div>
        </ResourceCharts>
      </ResourceSection>
    </div>
  );
}