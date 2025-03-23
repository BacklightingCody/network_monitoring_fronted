import { StateCreator } from 'zustand';
import { getDiskAllMetrics } from '@/services/api/disk';
import { transformMetricsData } from '@/components/metrics/utils/transformMetricsData';
import { StoreState } from '../index';
import { timeRangeMs } from '@/components/metrics/constant';

export interface DiskSpace {
  volume: string;
  value: number;
}

export interface DiskLatency {
  volume: string;
  value: number;
}

export interface DiskTrendPoint {
  time: string;
  value: number;
}

export interface DiskVolumeMetric {
  volume: string;
  time: string;
  value: number;
}

export interface DiskMetricsState {
  freeSpace: DiskSpace[];
  totalFreeSpace: number;
  readLatency: DiskLatency[];
  writeLatency: DiskLatency[];
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
  error: string | null;
  isLoading: boolean;
  isPolling: boolean;
}

export interface DiskMetricsActions {
  fetchDiskMetrics: () => Promise<void>;
  updateMetrics: (metrics: Partial<DiskMetricsState>) => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  startPolling: () => void;
  stopPolling: () => void;
}

export type DiskMetricsSlice = DiskMetricsState & DiskMetricsActions;

const initialState: DiskMetricsState = {
  freeSpace: [],
  totalFreeSpace: 0,
  readLatency: [],
  writeLatency: [],
  readWriteSpeedTrend: {
    readSpeed: [],
    writeSpeed: [],
    volumeReadSpeeds: [],
    volumeWriteSpeeds: [],
  },
  latencyTrend: {
    readLatency: [],
    writeLatency: [],
  },
  queueTrend: {
    readQueue: [],
    writeQueue: [],
  },
  error: null,
  isLoading: false,
  isPolling: false,
};

export const createDiskMetricsSlice: StateCreator<
  StoreState,
  [],
  [],
  DiskMetricsSlice
> = (set, get) => {
  let pollingInterval: NodeJS.Timeout | null = null;
  const updateDisk = (newState: Partial<DiskMetricsState>) =>
    set(state => ({ disk: { ...state.disk, ...newState } }));
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

  return {
    ...initialState,

    fetchDiskMetrics: async () => {
      const diskState = get().disk;
      if (diskState.isLoading) return;

      try {
        updateDisk({ isLoading: true, error: null });

        const allMetrics = await getDiskAllMetrics();
        const currentTime = new Date().toLocaleTimeString();

        const {
          freeBytes,
          readLatencySeconds,
          writeLatencySeconds,
          readBytesTotal,
          writeBytesTotal,
          readSeconds,
          writeSeconds,
          avgReadRequestsQueued,
          avgWriteRequestsQueued,
        } = allMetrics;

        // Process state data - 使用类型断言避免类型错误
        const freeBytesMetrics = processStateMetrics(freeBytes) as unknown as DiskSpace[];
        const totalFreeSpace = (freeBytesMetrics as any[]).reduce((sum, m) => sum + m.value, 0);
        const readLatencyMetrics = transformMetricsData(readLatencySeconds) as unknown as DiskLatency[];
        const writeLatencyMetrics = transformMetricsData(writeLatencySeconds) as unknown as DiskLatency[];

        // Process trend data
        const readBytesMetrics = transformMetricsData(readBytesTotal) as any[];
        const writeBytesMetrics = transformMetricsData(writeBytesTotal) as any[];

        updateDisk({
          freeSpace: freeBytesMetrics,
          totalFreeSpace,
          readLatency: readLatencyMetrics,
          writeLatency: writeLatencyMetrics,
          readWriteSpeedTrend: {
            ...diskState.readWriteSpeedTrend,
            readSpeed: [
              ...diskState.readWriteSpeedTrend.readSpeed,
              {
                time: currentTime,
                value: readBytesMetrics.reduce((sum, m) => sum + m.value, 0),
              },
            ].slice(-timeRangeMs['7d']),
            writeSpeed: [
              ...diskState.readWriteSpeedTrend.writeSpeed,
              {
                time: currentTime,
                value: writeBytesMetrics.reduce((sum, m) => sum + m.value, 0),
              },
            ].slice(-timeRangeMs['7d']),
            volumeReadSpeeds: diskState.readWriteSpeedTrend.volumeReadSpeeds, // Preserve if not updated
            volumeWriteSpeeds: diskState.readWriteSpeedTrend.volumeWriteSpeeds, // Preserve if not updated
          },
          latencyTrend: {
            readLatency: [
              ...diskState.latencyTrend.readLatency,
              {
                time: currentTime,
                value: (readLatencyMetrics as any[]).reduce((sum, m) => sum + m.value, 0),
              },
            ].slice(-timeRangeMs['7d']),
            writeLatency: [
              ...diskState.latencyTrend.writeLatency,
              {
                time: currentTime,
                value: (writeLatencyMetrics as any[]).reduce((sum, m) => sum + m.value, 0),
              },
            ].slice(-timeRangeMs['7d']),
          },
          queueTrend: {
            readQueue: [
              ...diskState.queueTrend.readQueue,
              {
                time: currentTime,
                value: transformMetricsData(avgReadRequestsQueued, { latestOnly: true }) as number,
              },
            ].slice(-timeRangeMs['7d']),
            writeQueue: [
              ...diskState.queueTrend.writeQueue,
              {
                time: currentTime,
                value: transformMetricsData(avgWriteRequestsQueued, { latestOnly: true }) as number,
              },
            ].slice(-timeRangeMs['7d']),
          },
          isLoading: false,
        });
      } catch (error) {
        console.error('获取磁盘指标失败:', error);
        const errorMessage = error instanceof Error ? error.message : '获取数据失败，请稍后重试';
        updateDisk({ error: errorMessage, isLoading: false });
      }
    },

    updateMetrics: (metrics) => updateDisk(metrics),
    setError: (error) => updateDisk({ error }),
    setLoading: (isLoading) => updateDisk({ isLoading }),
    
    // 新增轮询方法
    startPolling: () => {
      const currentState = get().disk;
      // 如果已经在轮询中，直接返回
      if (currentState.isPolling || pollingInterval) return;

      // 先设置状态
      updateDisk({ isPolling: true });

      // 定义一个不依赖闭包的函数来获取最新状态
      const fetchMetrics = () => {
        // 每次都从 store 获取最新状态
        const state = get().disk;
        if (state.isPolling) {
          state.fetchDiskMetrics().catch(err =>
            console.error('轮询期间获取磁盘指标失败:', err)
          );
        }
      };

      // 立即执行一次获取
      fetchMetrics();

      // 设置轮询间隔
      pollingInterval = setInterval(fetchMetrics, 5000);
    },

    stopPolling: () => {
      // 先清除定时器
      if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
      }

      // 再更新状态，避免状态更新触发组件重渲染再触发状态更新的循环
      setTimeout(() => {
        updateDisk({ isPolling: false });
      }, 0);
    },
  };
};