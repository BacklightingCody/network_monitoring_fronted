import { StateCreator } from 'zustand';
import { getCpuAllMetrics } from '@/services/api/cpu';
import { transformMetricsData, calculateAverageCpuUsage, processCpuCStateData, getCurrentCpuState } from '@/components/metrics/utils/transformMetricsData';
import { StoreState } from '../index';
import { timeRangeMs } from '@/components/metrics/constant';
// Define PrometheusMetric structure
interface PrometheusMetric {
  metric: { __name__: string;[key: string]: string };
  value: [number, string];
}

// Define expected return type of getCpuAllMetrics
interface CpuAllMetrics {
  logicalProcessor: PrometheusMetric[];
  processorPerformance: PrometheusMetric[];
  coreFrequency: PrometheusMetric[];
  cpuCState: any[]; // 使用 any 临时绕过类型检查
  clockInterrupts: PrometheusMetric[];
  dpcs: PrometheusMetric[];
  interrupts: PrometheusMetric[];
}

// Define MetricDataPoint
export interface MetricDataPoint {
  time: string;
  value: number;
  [key: string]: any;
}

export interface CpuMetricsState {
  processorCount: number;
  performanceCount: number;
  coreFrequency: number;
  cpuState: string;
  performanceTrend: MetricDataPoint[];
  clockInterruptsTrend: MetricDataPoint[];
  dpcsTrend: MetricDataPoint[];
  interruptsTrend: MetricDataPoint[];
  error: string | null;
  isLoading: boolean;
  isPolling: boolean;
}

export interface CpuMetricsActions {
  fetchCpuMetrics: () => Promise<void>;
  updateMetrics: (metrics: Partial<CpuMetricsState>) => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  startPolling: () => void;
  stopPolling: () => void;
}

export type CpuMetricsSlice = CpuMetricsState & CpuMetricsActions;

const initialState: CpuMetricsState = {
  processorCount: 0,
  performanceCount: 0,
  coreFrequency: 0,
  cpuState: '',
  performanceTrend: [],
  clockInterruptsTrend: [],
  dpcsTrend: [],
  interruptsTrend: [],
  error: null,
  isLoading: false,
  isPolling: false,
};

// 增加对 CpuCStateData 类型的处理
export interface CpuCStateData {
  metric: {
    core: string;
    state: string;
    instance: string;
    job: string;
    [key: string]: string;
  };
  value: [number, string];
}

export const createCpuMetricsSlice: StateCreator<
  StoreState,
  [],
  [],
  CpuMetricsSlice
> = (set, get) => {
  let pollingInterval: NodeJS.Timeout | null = null;
  const updateCpu = (newState: Partial<CpuMetricsState>) =>
    set(state => ({ cpu: { ...state.cpu, ...newState } }));

  return {
    ...initialState,

    fetchCpuMetrics: async () => {
      const cpuState = get().cpu;
      if (cpuState.isLoading) return;

      try {
        updateCpu({ isLoading: true, error: null });

        const allMetrics = await getCpuAllMetrics() as CpuAllMetrics;
        const currentTime = new Date().toLocaleTimeString();

        const performanceData = transformMetricsData(allMetrics.processorPerformance) as MetricDataPoint[];

        updateCpu({
          processorCount: transformMetricsData(allMetrics.logicalProcessor, { latestOnly: true }) as number,
          performanceCount: calculateAverageCpuUsage(performanceData),
          coreFrequency: transformMetricsData(allMetrics.coreFrequency, { latestOnly: true }) as number,
          cpuState: getCurrentCpuState(processCpuCStateData(allMetrics.cpuCState as any)), // 使用 as any 临时解决类型问题
          performanceTrend: [
            ...get().cpu.performanceTrend,
            { time: currentTime, value: calculateAverageCpuUsage(performanceData) },
          ].slice(-timeRangeMs['7d']),
          clockInterruptsTrend: [
            ...get().cpu.clockInterruptsTrend,
            {
              time: currentTime,
              value: transformMetricsData(allMetrics.clockInterrupts, { latestOnly: true }) as number,
            },
          ].slice(-timeRangeMs['7d']),
          dpcsTrend: [
            ...get().cpu.dpcsTrend,
            {
              time: currentTime,
              value: transformMetricsData(allMetrics.dpcs, { latestOnly: true }) as number,
            },
          ].slice(-timeRangeMs['7d']),
          interruptsTrend: [
            ...get().cpu.interruptsTrend,
            {
              time: currentTime,
              value: transformMetricsData(allMetrics.interrupts, { latestOnly: true }) as number,
            },
          ].slice(-timeRangeMs['7d']),
          isLoading: false,
        });
      } catch (error) {
        console.error('获取CPU指标失败:', error);
        const errorMessage = error instanceof Error ? error.message : '获取数据失败，请稍后重试';
        updateCpu({ error: errorMessage, isLoading: false });
      }
    },

    updateMetrics: (metrics) => updateCpu(metrics),
    setError: (error) => updateCpu({ error }),
    setLoading: (isLoading) => updateCpu({ isLoading }),

    startPolling: () => {
      const currentState = get().cpu;
      // 如果已经在轮询中，直接返回
      if (currentState.isPolling || pollingInterval) return;

      // 先设置状态
      updateCpu({ isPolling: true });

      // 定义一个不依赖闭包的函数来获取最新状态
      const fetchMetrics = () => {
        // 每次都从 store 获取最新状态
        const state = get().cpu;
        if (state.isPolling) {
          state.fetchCpuMetrics().catch(err =>
            console.error('轮询期间获取CPU指标失败:', err)
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
        updateCpu({ isPolling: false });
      }, 0);
    },
  };
};