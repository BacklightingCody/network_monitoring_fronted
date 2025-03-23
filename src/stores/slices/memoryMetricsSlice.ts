import { StateCreator } from 'zustand';
import { getMemoryAllMetrics } from '@/services/api/memory';
import { transformMetricsData } from '@/components/metrics/utils/transformMetricsData';
import { StoreState } from '../index';
import { timeRangeMs } from '@/components/metrics/constant';


// 定义指标数据点
export interface MemoryTrendPoint {
  time: string;
  value: number | string;
}

// 定义内存指标状态
export interface MemoryMetricsState {
  // 基本指标
  availableMemory: number;
  cacheMemory: number;
  commitLimit: number;
  committedMemory: number;
  physicalFreeMemory: number;
  physicalTotalMemory: number;
  poolNonpagedMemory: number;
  poolPagedMemory: number;
  freeAndZeroPageBytes:number;
  // 使用率计算值
  memoryUsagePercentage: number;
  commitPercentage: number;

  // 趋势数据
  availableMemoryTrend: MemoryTrendPoint[];
  commitMemoryTrend: MemoryTrendPoint[];
  pageFileUsageTrend: MemoryTrendPoint[];
  pageFreeUsageTrend: MemoryTrendPoint[];
  // 计数器
  pageFaults: number;
  cacheFaults: number;
  demandZeroFaults: number;

  // 计数器趋势
  pageFaultsTrend: MemoryTrendPoint[];
  cacheFaultsTrend: MemoryTrendPoint[];

  // 交换
  swapOperations: number;
  swapReads: number;
  swapWrites: number;
  swapTrend: {
    operations: MemoryTrendPoint[];
    reads: MemoryTrendPoint[];
    writes: MemoryTrendPoint[];
  };

  // 状态
  error: string | null;
  isLoading: boolean;
  isPolling: boolean;
}

// 定义内存指标操作
export interface MemoryMetricsActions {
  fetchMemoryMetrics: () => Promise<void>;
  updateMetrics: (metrics: Partial<MemoryMetricsState>) => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  startPolling: () => void;
  stopPolling: () => void;
}

export type MemoryMetricsSlice = MemoryMetricsState & MemoryMetricsActions;

const initialState: MemoryMetricsState = {
  availableMemory: 0,
  cacheMemory: 0,
  commitLimit: 0,
  committedMemory: 0,
  physicalFreeMemory: 0,
  physicalTotalMemory: 0,
  poolNonpagedMemory: 0,
  poolPagedMemory: 0,
  freeAndZeroPageBytes: 0,
  memoryUsagePercentage: 0,
  commitPercentage: 0,

  availableMemoryTrend: [],
  commitMemoryTrend: [],
  pageFileUsageTrend: [],
  pageFreeUsageTrend: [],

  pageFaults: 0,
  cacheFaults: 0,
  demandZeroFaults: 0,

  pageFaultsTrend: [],
  cacheFaultsTrend: [],

  swapOperations: 0,
  swapReads: 0,
  swapWrites: 0,
  swapTrend: {
    operations: [],
    reads: [],
    writes: []
  },

  error: null,
  isLoading: false,
  isPolling: false
};

export const createMemoryMetricsSlice: StateCreator<
  StoreState,
  [],
  [],
  MemoryMetricsSlice
> = (set, get) => {
  let pollingInterval: NodeJS.Timeout | null = null;
  const updateMemory = (newState: Partial<MemoryMetricsState>) =>
    set(state => ({ memory: { ...state.memory, ...newState } }));

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

  return {
    ...initialState,

    fetchMemoryMetrics: async () => {
      const memoryState = get().memory;
      if (memoryState.isLoading) return;

      try {
        updateMemory({ isLoading: true, error: null });

        // 使用聚合 API 获取所有内存指标
        const allMetrics = await getMemoryAllMetrics();
        const currentTime = new Date().toLocaleTimeString();

        // 从聚合数据中提取各项指标 - 使用正确的字段名
        const {
          availableMemory,         // 可用内存
          cacheBytes,              // 缓存内存
          cacheFaults,             // 缓存错误
          commitLimit,             // 提交限制
          committedBytes,          // 已提交内存
          demandZeroFaults,        // 零页错误
          freeAndZeroPageListBytes, // 空闲和零页列表
          physicalFreeBytes,       // 物理空闲内存
          physicalTotalBytes,      // 物理总内存
          poolNonpagedBytes,       // 非分页池内存
          poolPagedBytes,          // 分页池内存
          pageFaults,              // 页面错误
          swapPageOperations,      // 交换操作
          swapPageReads,           // 交换读取
          swapPageWrites,          // 交换写入
        } = allMetrics;
        // console.log(freeAndZeroPageListBytes, '1')
        // 处理基础指标数据，使用类型断言处理可能的类型不匹配问题
        const availableMemoryValue = transformMetricsData(availableMemory, { latestOnly: true }) as number;
        const cacheMemoryValue = transformMetricsData(cacheBytes, { latestOnly: true }) as number;
        const commitLimitValue = transformMetricsData(commitLimit, { latestOnly: true }) as number;
        const committedMemoryValue = transformMetricsData(committedBytes, { latestOnly: true }) as number;
        const physicalFreeMemoryValue = transformMetricsData(physicalFreeBytes, { latestOnly: true }) as number;
        const physicalTotalMemoryValue = transformMetricsData(physicalTotalBytes, { latestOnly: true }) as number;
        const poolNonpagedMemoryValue = transformMetricsData(poolNonpagedBytes, { latestOnly: true }) as number;
        const poolPagedMemoryValue = transformMetricsData(poolPagedBytes, { latestOnly: true }) as number;

        // 处理计数器数据
        const pageFaultsValue = transformMetricsData(pageFaults, { latestOnly: true }) as number;
        const pageFreeValue = transformMetricsData(freeAndZeroPageListBytes, { latestOnly: true }) as number;
        const cacheFaultsValue = transformMetricsData(cacheFaults, { latestOnly: true }) as number;
        const demandZeroFaultsValue = transformMetricsData(demandZeroFaults, { latestOnly: true }) as number;
        const swapOperationsValue = transformMetricsData(swapPageOperations, { latestOnly: true }) as number;
        const swapReadsValue = transformMetricsData(swapPageReads, { latestOnly: true }) as number;
        const swapWritesValue = transformMetricsData(swapPageWrites, { latestOnly: true }) as number;

        // 计算使用率百分比
        const memoryUsagePercentage = physicalTotalMemoryValue > 0
          ? 100 - (physicalFreeMemoryValue / physicalTotalMemoryValue * 100)
          : 0;

        const commitPercentage = commitLimitValue > 0
          ? (committedMemoryValue / commitLimitValue * 100)
          : 0;

        // 更新状态
        updateMemory({
          availableMemory: availableMemoryValue,
          cacheMemory: cacheMemoryValue,
          commitLimit: commitLimitValue,
          committedMemory: committedMemoryValue,
          physicalFreeMemory: physicalFreeMemoryValue,
          physicalTotalMemory: physicalTotalMemoryValue,
          poolNonpagedMemory: poolNonpagedMemoryValue,
          poolPagedMemory: poolPagedMemoryValue,

          memoryUsagePercentage,
          commitPercentage,

          pageFaults: pageFaultsValue,
          cacheFaults: cacheFaultsValue,
          demandZeroFaults: demandZeroFaultsValue,
          swapOperations: swapOperationsValue,
          swapReads: swapReadsValue,
          swapWrites: swapWritesValue,

          // 更新趋势数据
          availableMemoryTrend: [
            ...memoryState.availableMemoryTrend,
            { time: currentTime, value: memoryUsagePercentage }
          ].slice(-timeRangeMs['7d']),

          commitMemoryTrend: [
            ...memoryState.commitMemoryTrend,
            { time: currentTime, value: formatBytes(committedMemoryValue) }
          ].slice(-timeRangeMs['7d']),

          pageFileUsageTrend: [
            ...memoryState.pageFileUsageTrend,
            {
              time: currentTime, value: committedMemoryValue - physicalTotalMemoryValue + physicalFreeMemoryValue > 0 ?
                committedMemoryValue - physicalTotalMemoryValue + physicalFreeMemoryValue : 0
            }
          ].slice(-timeRangeMs['7d']),

          pageFreeUsageTrend: [
            ...memoryState.pageFreeUsageTrend,
            {
              time: currentTime, value: formatBytes(Number(pageFreeValue))
            }
          ].slice(-timeRangeMs['7d']),

          pageFaultsTrend: [
            ...memoryState.pageFaultsTrend,
            { time: currentTime, value: pageFaultsValue }
          ].slice(-timeRangeMs['7d']),

          cacheFaultsTrend: [
            ...memoryState.cacheFaultsTrend,
            { time: currentTime, value: cacheFaultsValue }
          ].slice(-timeRangeMs['7d']),

          swapTrend: {
            operations: [
              ...memoryState.swapTrend.operations,
              { time: currentTime, value: swapOperationsValue }
            ].slice(-timeRangeMs['7d']),
            reads: [
              ...memoryState.swapTrend.reads,
              { time: currentTime, value: swapReadsValue }
            ].slice(-timeRangeMs['7d']),
            writes: [
              ...memoryState.swapTrend.writes,
              { time: currentTime, value: swapWritesValue }
            ].slice(-timeRangeMs['7d'])
          },

          isLoading: false
        });
      } catch (error) {
        console.error('获取内存指标失败:', error);
        const errorMessage = error instanceof Error ? error.message : '获取数据失败，请稍后重试';
        updateMemory({ error: errorMessage, isLoading: false });
      }
    },

    updateMetrics: (metrics) => updateMemory(metrics),
    setError: (error) => updateMemory({ error }),
    setLoading: (isLoading) => updateMemory({ isLoading }),

    startPolling: () => {
      const currentState = get().memory;
      // 如果已经在轮询中，直接返回
      if (currentState.isPolling || pollingInterval) return;

      // 先设置状态
      updateMemory({ isPolling: true });

      // 定义一个不依赖闭包的函数来获取最新状态
      const fetchMetrics = () => {
        // 每次都从 store 获取最新状态
        const state = get().memory;
        if (state.isPolling) {
          state.fetchMemoryMetrics().catch(err =>
            console.error('轮询期间获取内存指标失败:', err)
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
        updateMemory({ isPolling: false });
      }, 0);
    },
  };
}; 