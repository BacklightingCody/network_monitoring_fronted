import { useEffect, useState, useRef } from 'react';
import ResourceSection from '@/components/common/ResourceSection';
import ResourceCard from '@/components/common/ResourceCards';
import LineCharts from '@/components/common/LineCharts';
import { Card } from '@/components/common/Card';
import { transformMetricsData, transformMetricsSeries } from '../utils/transformMetricsData';
import {
  getAvgReadRequestsQueued,
  getAvgWriteRequestsQueued,
  getFreeBytes,
  getIdleSeconds,
  getReadBytesTotal,
  getReadLatencySeconds,
  getReadSeconds,
  getWriteBytesTotal,
  getWriteLatencySeconds,
  getWriteSeconds
} from '@/services/api/disk';
import { ResourceMetrics, ResourceCharts } from '@/components/common/ResourceSection';
import { HardDrive, ArrowDownToLine, ArrowUpFromLine, Clock } from 'lucide-react';
import { timeRangeMs } from '../constant';

interface MetricDataPoint {
  time: string;
  value: number;
}

interface DiskMetric {
  volume: string;
  value: number;
}

interface DiskMetricsState {
  freeSpace: DiskMetric[];
  readLatency: DiskMetric[];
  writeLatency: DiskMetric[];
  idleTime: DiskMetric[];
  readWriteSpeedTrend: {
    readSpeed: MetricDataPoint[];
    writeSpeed: MetricDataPoint[];
  };
  latencyTrend: {
    readLatency: MetricDataPoint[];
    writeLatency: MetricDataPoint[];
  };
  queueTrend: {
    readQueue: MetricDataPoint[];
    writeQueue: MetricDataPoint[];
  };
}

export function DiskMetrics() {
  const [metrics, setMetrics] = useState<DiskMetricsState>({
    freeSpace: [],
    readLatency: [],
    writeLatency: [],
    idleTime: [],
    readWriteSpeedTrend: {
      readSpeed: [],
      writeSpeed: []
    },
    latencyTrend: {
      readLatency: [],
      writeLatency: []
    },
    queueTrend: {
      readQueue: [],
      writeQueue: []
    }
  });

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 使用 useRef 存储历史数据
  const metricsHistory = useRef<{
    readSpeed: MetricDataPoint[];
    writeSpeed: MetricDataPoint[];
    readLatency: MetricDataPoint[];
    writeLatency: MetricDataPoint[];
    readQueue: MetricDataPoint[];
    writeQueue: MetricDataPoint[];
  }>({
    readSpeed: [],
    writeSpeed: [],
    readLatency: [],
    writeLatency: [],
    readQueue: [],
    writeQueue: []
  });

  // 转换字节为可读格式
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  // 计算读写速度（每秒）
  const calculateSpeed = (bytes: number, seconds: number): number => {
    return seconds > 0 ? bytes / seconds : 0;
  };

  // 处理指标数据
  const processMetricData = (data: any[]): DiskMetric[] => {
    if (!Array.isArray(data)) return [];
    
    return data.map(item => ({
      volume: item.metric.volume || '',
      value: parseFloat(item.value[1]) || 0
    }));
  };

  useEffect(() => {
    let mounted = true;
    let intervalId: number | null = null;

    async function fetchData() {
      if (!mounted || isLoading) return;
      setIsLoading(true);
      setError(null);

      try {
        const [
          freeBytes,
          readLatency,
          writeLatency,
          idleSeconds,
          readBytes,
          writeBytes,
          readTime,
          writeTime,
          readQueue,
          writeQueue
        ] = await Promise.all([
          getFreeBytes(),
          getReadLatencySeconds(),
          getWriteLatencySeconds(),
          getIdleSeconds(),
          getReadBytesTotal(),
          getWriteBytesTotal(),
          getReadSeconds(),
          getWriteSeconds(),
          getAvgReadRequestsQueued(),
          getAvgWriteRequestsQueued()
        ]);
        console.log(freeBytes, readLatency, writeLatency, idleSeconds, readBytes, writeBytes, readTime, writeTime, readQueue, writeQueue);
        if (mounted) {
          const currentTime = new Date().toLocaleTimeString();
          console.log(freeBytes, readLatency, writeLatency, idleSeconds, readBytes, writeBytes, readTime, writeTime, readQueue, writeQueue);
          // 处理各个磁盘的指标数据
          const freeBytesMetrics = processMetricData(freeBytes.data || []);
          const readLatencyMetrics = processMetricData(readLatency.data || []);
          const writeLatencyMetrics = processMetricData(writeLatency.data || []);
          const idleSecondsMetrics = processMetricData(idleSeconds.data || []);
          console.log(111)
          // 计算读写速度
          const readBytesMetrics = processMetricData(readBytes.data || []);
          const writeBytesMetrics = processMetricData(writeBytes.data || []);
          const readTimeMetrics = processMetricData(readTime.data || []);
          const writeTimeMetrics = processMetricData(writeTime.data || []);

          // 计算每个磁盘的读写速度
          const readSpeedMetrics = readBytesMetrics.map(rb => {
            const rt = readTimeMetrics.find(t => t.volume === rb.volume);
            return {
              volume: rb.volume,
              value: calculateSpeed(rb.value, rt?.value || 1)
            };
          });

          const writeSpeedMetrics = writeBytesMetrics.map(wb => {
            const wt = writeTimeMetrics.find(t => t.volume === wb.volume);
            return {
              volume: wb.volume,
              value: calculateSpeed(wb.value, wt?.value || 1)
            };
          });

          // 创建趋势数据点
          const newMetricsPoints = {
            readSpeed: { time: currentTime, value: readSpeedMetrics.reduce((sum, m) => sum + m.value, 0) },
            writeSpeed: { time: currentTime, value: writeSpeedMetrics.reduce((sum, m) => sum + m.value, 0) },
            readLatency: { time: currentTime, value: readLatencyMetrics.reduce((sum, m) => sum + m.value, 0) / readLatencyMetrics.length },
            writeLatency: { time: currentTime, value: writeLatencyMetrics.reduce((sum, m) => sum + m.value, 0) / writeLatencyMetrics.length },
            readQueue: { time: currentTime, value: processMetricData(readQueue.data || [])[0]?.value || 0 },
            writeQueue: { time: currentTime, value: processMetricData(writeQueue.data || [])[0]?.value || 0 }
          };

          // 更新历史数据
          metricsHistory.current = {
            readSpeed: [...metricsHistory.current.readSpeed, newMetricsPoints.readSpeed].slice(-timeRangeMs['7d']),
            writeSpeed: [...metricsHistory.current.writeSpeed, newMetricsPoints.writeSpeed].slice(-timeRangeMs['7d']),
            readLatency: [...metricsHistory.current.readLatency, newMetricsPoints.readLatency].slice(-timeRangeMs['7d']),
            writeLatency: [...metricsHistory.current.writeLatency, newMetricsPoints.writeLatency].slice(-timeRangeMs['7d']),
            readQueue: [...metricsHistory.current.readQueue, newMetricsPoints.readQueue].slice(-timeRangeMs['7d']),
            writeQueue: [...metricsHistory.current.writeQueue, newMetricsPoints.writeQueue].slice(-timeRangeMs['7d'])
          };

          // 更新状态
          setMetrics({
            freeSpace: freeBytesMetrics,
            readLatency: readLatencyMetrics,
            writeLatency: writeLatencyMetrics,
            idleTime: idleSecondsMetrics,
            readWriteSpeedTrend: {
              readSpeed: metricsHistory.current.readSpeed,
              writeSpeed: metricsHistory.current.writeSpeed
            },
            latencyTrend: {
              readLatency: metricsHistory.current.readLatency,
              writeLatency: metricsHistory.current.writeLatency
            },
            queueTrend: {
              readQueue: metricsHistory.current.readQueue,
              writeQueue: metricsHistory.current.writeQueue
            }
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
    intervalId = window.setInterval(fetchData, 5000);

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

  // 获取特定卷的指标值
  const getVolumeMetric = (metrics: DiskMetric[], volume: string): number => {
    return metrics.find(m => m.volume === volume)?.value || 0;
  };

  return (
    <div className="space-y-6">
      <ResourceSection title="磁盘性能监控">
        <ResourceMetrics>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ResourceCard
              title="C盘剩余空间"
              value={formatBytes(getVolumeMetric(metrics.freeSpace, 'C:'))}
              unit=""
              showProgress={false}
              icon={<HardDrive className="h-6 w-6 text-blue-500" />}
            />
            <ResourceCard
              title="D盘剩余空间"
              value={formatBytes(getVolumeMetric(metrics.freeSpace, 'D:'))}
              unit=""
              showProgress={false}
              icon={<HardDrive className="h-6 w-6 text-blue-500" />}
            />
            <ResourceCard
              title="HarddiskVolume1剩余空间"
              value={formatBytes(getVolumeMetric(metrics.freeSpace, 'HarddiskVolume1'))}
              unit=""
              showProgress={false}
              icon={<HardDrive className="h-6 w-6 text-blue-500" />}
            />
            <ResourceCard
              title="HarddiskVolume5剩余空间"
              value={formatBytes(getVolumeMetric(metrics.freeSpace, 'HarddiskVolume5'))}
              unit=""
              showProgress={false}
              icon={<HardDrive className="h-6 w-6 text-blue-500" />}
            />
            <ResourceCard
              title="C盘读取延迟"
              value={getVolumeMetric(metrics.readLatency, 'C:').toFixed(2)}
              unit="ms"
              showProgress={false}
              icon={<ArrowDownToLine className="h-6 w-6 text-green-500" />}
            />
            <ResourceCard
              title="D盘读取延迟"
              value={getVolumeMetric(metrics.readLatency, 'D:').toFixed(2)}
              unit="ms"
              showProgress={false}
              icon={<ArrowDownToLine className="h-6 w-6 text-green-500" />}
            />
            <ResourceCard
              title="C盘写入延迟"
              value={getVolumeMetric(metrics.writeLatency, 'C:').toFixed(2)}
              unit="ms"
              showProgress={false}
              icon={<ArrowUpFromLine className="h-6 w-6 text-purple-500" />}
            />
            <ResourceCard
              title="D盘写入延迟"
              value={getVolumeMetric(metrics.writeLatency, 'D:').toFixed(2)}
              unit="ms"
              showProgress={false}
              icon={<ArrowUpFromLine className="h-6 w-6 text-purple-500" />}
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
