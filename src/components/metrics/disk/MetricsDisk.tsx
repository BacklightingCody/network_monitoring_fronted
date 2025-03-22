import { useEffect, useState, useCallback, useRef } from 'react';
import ResourceSection from '@/components/common/ResourceSection';
import ResourceCard from '@/components/common/ResourceCards';
import LineCharts from '@/components/common/LineCharts';
import { Card } from '@/components/common/Card';
import { getDiskAllMetrics } from '@/services/api/disk';
import { ResourceMetrics, ResourceCharts } from '@/components/common/ResourceSection';
import { HardDrive, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { timeRangeMs } from '../constant';

// 基础接口定义
interface Metrics {
  metric: MetricInfo;
  value: [time: string | number, value: string | number];
}

interface MetricInfo {
  __name__: string;
  instance: string;
  job: string;
  volume?: string;
  key?: string;
}

// 状态数据接口
interface DiskSpace {
  volume: string;
  value: number;
}

interface DiskLatency {
  volume: string;
  value: number;
}

// 趋势图数据接口
interface DiskTrendPoint {
  time: string;
  value: number;
}

interface DiskVolumeMetric {
  volume: string;
  time: string;
  value: number;
}

interface DiskMetricsState {
  // 状态数据
  freeSpace: DiskSpace[];
  totalFreeSpace: number;
  readLatency: DiskLatency[];
  writeLatency: DiskLatency[];
  // 趋势数据
  readWriteSpeedTrend: {
    readSpeed: DiskTrendPoint[];
    writeSpeed: DiskTrendPoint[];
    volumeReadSpeeds: DiskVolumeMetric[];
    volumeWriteSpeeds: DiskVolumeMetric[];
  };
  latencyTrend: {
    readLatency: DiskTrendPoint[];
    writeLatency: DiskTrendPoint[];
  };
  queueTrend: {
    readQueue: DiskTrendPoint[];
    writeQueue: DiskTrendPoint[];
  };
}

export function DiskMetrics() {
  const [metrics, setMetrics] = useState<DiskMetricsState>({
    freeSpace: [],
    totalFreeSpace: 0,
    readLatency: [],
    writeLatency: [],
    readWriteSpeedTrend: {
      readSpeed: [],
      writeSpeed: [],
      volumeReadSpeeds: [],
      volumeWriteSpeeds: []
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
  const mounted = useRef(true);

  // 使用 useRef 存储历史数据
  const metricsHistory = useRef<{
    readSpeed: DiskTrendPoint[];
    writeSpeed: DiskTrendPoint[];
    readLatency: DiskTrendPoint[];
    writeLatency: DiskTrendPoint[];
    readQueue: DiskTrendPoint[];
    writeQueue: DiskTrendPoint[];
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

  // 处理状态指标数据
  const processStateMetrics = (metrics: any[]): DiskSpace[] => {
    if (!Array.isArray(metrics)) {
      // console.warn('Invalid metric data:', metrics);
      return [];
    }
    return metrics.map(item => ({
      volume: item.metric.volume || '',
      value: parseFloat(item.value[1] as string) || 0
    }));
  };

  // 处理趋势指标数据
  const processTrendMetrics = (metrics: any[]): DiskVolumeMetric[] => {
    if (!Array.isArray(metrics)) {
      // console.warn('Invalid metric data:', metrics);
      return [];
    }

    return metrics.map(item => ({
      volume: item.metric.volume || '',
      time: new Date((item.value[0] as number) * 1000).toLocaleTimeString(),
      value: parseFloat(item.value[1] as string) || 0
    }));
  };

  // 计算总和
  const calculateTotal = (metrics: DiskSpace[]): number => {
    return metrics.reduce((sum, m) => sum + m.value, 0);
  };

  // 计算读写速度
  const calculateSpeed = (bytes: DiskVolumeMetric[], seconds: DiskVolumeMetric[]): DiskVolumeMetric[] => {
    return bytes.map(byte => {
      const second = seconds.find(s => s.volume === byte.volume && s.time === byte.time);
      return {
        volume: byte.volume,
        time: byte.time,
        value: second ? byte.value / second.value : 0
      };
    });
  };

  // 获取特定卷的指标值
  const getVolumeMetric = (metrics: DiskSpace[], volume: string): number => {
    return metrics.find(m => m.volume === volume)?.value || 0;
  };

  const fetchData = useCallback(async () => {
    if (!mounted.current || isLoading) return;

    try {
      // console.log('开始获取磁盘指标数据...');
      setIsLoading(true);
      setError(null);

      const allMetrics = await getDiskAllMetrics();

      if (!mounted.current) return;

      const {
        freeBytes,
        readLatencySeconds,
        writeLatencySeconds,
        idleSeconds,
        readBytesTotal,
        writeBytesTotal,
        readSeconds,
        writeSeconds,
        avgReadRequestsQueued: readQueue,
        avgWriteRequestsQueued: writeQueue
      } = allMetrics;

      // 处理状态数据
      const freeBytesMetrics = processStateMetrics(freeBytes);
      const totalFreeSpace = calculateTotal(freeBytesMetrics);
      const readLatencyMetrics = processStateMetrics(readLatencySeconds);
      const writeLatencyMetrics = processStateMetrics(writeLatencySeconds);

      // 处理趋势数据
      const readBytesMetrics = processTrendMetrics(readBytesTotal);
      const writeBytesMetrics = processTrendMetrics(writeBytesTotal);
      const readTimeMetrics = processTrendMetrics(readSeconds);
      const writeTimeMetrics = processTrendMetrics(writeSeconds);

      // 计算读写速度
      const readSpeedMetrics = calculateSpeed(readBytesMetrics, readTimeMetrics);
      const writeSpeedMetrics = calculateSpeed(writeBytesMetrics, writeTimeMetrics);

      // 计算当前时间点的指标
      const currentTime = new Date().toLocaleTimeString();
      const currentMetrics = {
        readSpeed: {
          time: currentTime,
          value: readSpeedMetrics.reduce((sum, m) => sum + m.value, 0)
        },
        writeSpeed: {
          time: currentTime,
          value: writeSpeedMetrics.reduce((sum, m) => sum + m.value, 0)
        },
        readLatency: {
          time: currentTime,
          value: readLatencyMetrics.reduce((sum, m) => sum + m.value, 0) / readLatencyMetrics.length || 0
        },
        writeLatency: {
          time: currentTime,
          value: writeLatencyMetrics.reduce((sum, m) => sum + m.value, 0) / writeLatencyMetrics.length || 0
        },
        readQueue: {
          time: currentTime,
          value: processStateMetrics(readQueue)[0]?.value || 0
        },
        writeQueue: {
          time: currentTime,
          value: processStateMetrics(writeQueue)[0]?.value || 0
        }
      };

      // 更新历史数据
      metricsHistory.current = {
        readSpeed: [...metricsHistory.current.readSpeed, currentMetrics.readSpeed].slice(-timeRangeMs['7d']),
        writeSpeed: [...metricsHistory.current.writeSpeed, currentMetrics.writeSpeed].slice(-timeRangeMs['7d']),
        readLatency: [...metricsHistory.current.readLatency, currentMetrics.readLatency].slice(-timeRangeMs['7d']),
        writeLatency: [...metricsHistory.current.writeLatency, currentMetrics.writeLatency].slice(-timeRangeMs['7d']),
        readQueue: [...metricsHistory.current.readQueue, currentMetrics.readQueue].slice(-timeRangeMs['7d']),
        writeQueue: [...metricsHistory.current.writeQueue, currentMetrics.writeQueue].slice(-timeRangeMs['7d'])
      };
      // console.log(metricsHistory.current)
      // 更新状态
      setMetrics((prev) => ({
        ...prev,
        freeSpace: freeBytesMetrics,
        totalFreeSpace,
        readLatency: readLatencyMetrics,
        writeLatency: writeLatencyMetrics,
        readWriteSpeedTrend: {
          readSpeed: metricsHistory.current.readSpeed,
          writeSpeed: metricsHistory.current.writeSpeed,
          volumeReadSpeeds: readSpeedMetrics,
          volumeWriteSpeeds: writeSpeedMetrics
        },
        latencyTrend: {
          readLatency: metricsHistory.current.readLatency,
          writeLatency: metricsHistory.current.writeLatency
        },
        queueTrend: {
          readQueue: metricsHistory.current.readQueue,
          writeQueue: metricsHistory.current.writeQueue
        }
      }));

    } catch (error) {
      console.error('获取磁盘指标失败:', error);
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
    // console.log('磁盘指标组件已挂载');

    // 立即获取一次数据
    fetchData();

    // 设置定时器
    const intervalId = window.setInterval(() => {
      // console.log('定时获取磁盘指标...');
      fetchData();
    }, 5000);

    // 清理函数
    return () => {
      mounted.current = false;
      if (intervalId) {
        clearInterval(intervalId);
        // console.log('磁盘指标定时器已清除');
      }
    };
  }, []);

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
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
              icon={<HardDrive className="h-6 w-6 text-blue-500" />}
              colorScheme='emerald'
            />
            <ResourceCard
              title="C盘剩余空间"
              value={formatBytes(getVolumeMetric(metrics.freeSpace, 'C:'))}
              unit=""
              showProgress={false}
              icon={<HardDrive className="h-6 w-6 text-blue-500" />}
              colorScheme='emerald'
            />
            <ResourceCard
              title="D盘剩余空间"
              value={formatBytes(getVolumeMetric(metrics.freeSpace, 'D:'))}
              unit=""
              showProgress={false}
              icon={<HardDrive className="h-6 w-6 text-blue-500" />}
              colorScheme='emerald'
            />
            <ResourceCard
              title="总读写速度"
              value={formatBytes(metrics.readWriteSpeedTrend.readSpeed[metrics.readWriteSpeedTrend.readSpeed.length - 1]?.value || 0)}
              unit="/s"
              showProgress={false}
              icon={<ArrowDownToLine className="h-6 w-6 text-green-500" />}
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
