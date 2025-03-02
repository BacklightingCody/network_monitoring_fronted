import { useEffect, useState } from 'react';
import ResourceSection from '@/components/common/ResourceSection';
import ResourceCard from '@/components/common/ResourceCards';
import LineCharts from '@/components/common/LineCharts';
import { Card, CardContent } from '@/components/common/Card';
import { transformMetricsData, transformMetricsSeries, calculateAverageCpuUsage } from '../utils/transformMetricsData';
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
import { Cpu, HardDrive, CircuitBoard } from 'lucide-react';

interface MetricData {
  time: string;
  value: number;
}

interface MetricDataPoint {
  time: string | number;
  value: number;
  [key: string]: any;
}

export function CpuMetrics() {
  const [metrics, setMetrics] = useState<{
    processorCount: number;
    performanceCount: number;
    clockInterrupts: MetricDataPoint[];
    coreFrequency: MetricDataPoint[];
    cpuCState: MetricDataPoint[];
    cpuTime: MetricDataPoint[];
    processorPerformance: MetricDataPoint[];
    dpcs: MetricDataPoint[];
    interrupts: MetricDataPoint[];
  }>({
    processorCount: 0,
    performanceCount: 0,
    clockInterrupts: [],
    coreFrequency: [],
    cpuCState: [],
    cpuTime: [],
    processorPerformance: [],
    dpcs: [],
    interrupts: []
  });

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
          cpuTime,
          processorPerformance,
          dpcs,
          interrupts
        ] = await Promise.all([
          getLogicalProcessorCount(),
          getClockInterrupts(),
          getCoreFrequency(),
          getCpuCState(),
          getCpuTime(),
          getProcessorPerformance(),
          getDpcs(),
          getInterrupts()
        ]);

        if (mounted) {
          setMetrics({
            processorCount: transformMetricsData(processorCount, {
              latestOnly: true
            }) as number,

            performanceCount:calculateAverageCpuUsage(transformMetricsData(processorPerformance, {
              formatTime: true,
            }) as MetricDataPoint[]) as number,

            clockInterrupts: transformMetricsData(clockInterrupts, {
              formatTime: true
            }) as MetricDataPoint[],

            coreFrequency: transformMetricsData(coreFrequency, {
              formatTime: true,
              keepLabels: ['core']
            }) as MetricDataPoint[],

            cpuCState: transformMetricsData(cpuCState, {
              formatTime: true,
              keepLabels: ['state']
            }) as MetricDataPoint[],

            cpuTime: transformMetricsData(cpuTime, {
              formatTime: true,
              valueProcessor: (v) => parseFloat(v) / 1000
            }) as MetricDataPoint[],

            processorPerformance: transformMetricsData(processorPerformance, {
              formatTime: true,
              keepLabels: ['value']
            }) as MetricDataPoint[],

            dpcs: transformMetricsData(dpcs, {
              formatTime: true
            }) as MetricDataPoint[],

            interrupts: transformMetricsData(interrupts, {
              formatTime: true
            }) as MetricDataPoint[]
          });
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
    intervalId = window.setInterval(fetchData, 2000);

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

  // 获取最新的指标值
  const getLatestValue = (data: MetricDataPoint[], key: string = 'value') => {
    return data.length > 0 ? data[data.length - 1][key] : 0;
  };

  return (
    <div className="space-y-6">
      <ResourceSection title="CPU 性能监控">
        {/* CPU 指标卡片区域 */}
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
              icon={<Cpu className="h-6 w-6 text-blue-500" />}
            />
            <ResourceCard
              title="CPU 状态"
              value={getLatestValue(metrics.cpuCState,'state')}
              unit=""
              showProgress={false}
              icon={<Cpu className="h-6 w-6 text-blue-500" />}
            />
            <ResourceCard
              title="核心频率"
              value={getLatestValue(metrics.coreFrequency)}
              unit="MHz"
              icon={<Cpu className="h-6 w-6 text-blue-500" />}
              showProgress={false}
            />
          </div>
        </ResourceMetrics>

        {/* CPU 图表区域 */}
        <ResourceCharts>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-2">CPU 使用趋势</h3>
              <LineCharts
                data={metrics.processorPerformance}
                yAxisUnit="%"
                timeRange="1h"
                showLegend={false}
              />
            </Card>
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-2">CPU 频率趋势</h3>
              <LineCharts
                data={metrics.coreFrequency}
                yAxisUnit="MHz"
                timeRange="1h"
                showLegend={false}
              />
            </Card>
          </div>
        </ResourceCharts>
      </ResourceSection>

      {/* 中断和 DPC 监控 */}
      <ResourceSection title="中断和 DPC 监控">
        <ResourceMetrics>
          <div className="grid grid-cols-2 gap-4">
            <ResourceCard
            icon={<Cpu className="h-6 w-6 text-blue-500" />}
              title="中断率"
              value={getLatestValue(metrics.interrupts)}
              unit="/秒"
              showProgress={false}
            />
            <ResourceCard
            icon={<Cpu className="h-6 w-6 text-blue-500" />}
              title="DPC 率"
              value={getLatestValue(metrics.dpcs)}
              unit="/秒"
              showProgress={false}
            />
          </div>
        </ResourceMetrics>
        <ResourceCharts>
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-2">中断和 DPC 趋势</h3>
            <LineCharts
              data={[
                { name: '中断', data: metrics.interrupts },
                { name: 'DPC', data: metrics.dpcs }
              ]}
              timeRange="1h"
              showLegend={true}
            />
          </Card>
        </ResourceCharts>
      </ResourceSection>
    </div>
  );
}