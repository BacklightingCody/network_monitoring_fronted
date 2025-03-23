import { StateCreator } from 'zustand';
import { getMemoryAllMetrics } from '@/services/api/memory';
import { transformMetricsData } from '@/components/metrics/utils/transformMetricsData';
import { StoreState } from '../index';
import { timeRangeMs } from '@/components/metrics/constant';


// 定义指标数据点
export interface MemoryTrendPoint {
  time: string;
  value: number;
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
  
  // 使用率计算值
  memoryUsagePercentage: number;
  commitPercentage: number;
  
  // 趋势数据
  availableMemoryTrend: MemoryTrendPoint[];
  commitMemoryTrend: MemoryTrendPoint[];
  pageFileUsageTrend: MemoryTrendPoint[];
  
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
  
  memoryUsagePercentage: 0,
  commitPercentage: 0,
  
  availableMemoryTrend: [],
  commitMemoryTrend: [],
  pageFileUsageTrend: [],
  
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
        console.log(allMetrics,'allMetrics')
        // 从聚合数据中提取各项指标
        const {
          availableBytes,
          cacheBytes,
          commitLimit,
          committedBytes,
          physicalFreeBytes,
          physicalTotalBytes,
          poolNonpagedBytes,
          poolPagedBytes,
          cacheFaultsTotal,
          demandZeroFaultsTotal,
          pageFaultsTotal,
          swapPageOperationsTotal,
          swapPageReadsTotal,
          swapPageWritesTotal
        } = allMetrics;

        // 处理基础指标数据，使用类型断言处理可能的类型不匹配问题
        const availableMemory = transformMetricsData(availableBytes, { latestOnly: true }) as number;
        const cacheMemory = transformMetricsData(cacheBytes, { latestOnly: true }) as number;
        const commitLimitValue = transformMetricsData(commitLimit, { latestOnly: true }) as number;
        const committedMemory = transformMetricsData(committedBytes, { latestOnly: true }) as number;
        const physicalFreeMemory = transformMetricsData(physicalFreeBytes, { latestOnly: true }) as number;
        const physicalTotalMemory = transformMetricsData(physicalTotalBytes, { latestOnly: true }) as number;
        const poolNonpagedMemory = transformMetricsData(poolNonpagedBytes, { latestOnly: true }) as number;
        const poolPagedMemory = transformMetricsData(poolPagedBytes, { latestOnly: true }) as number;

        // 处理计数器数据
        const pageFaults = transformMetricsData(pageFaultsTotal, { latestOnly: true }) as number;
        const cacheFaults = transformMetricsData(cacheFaultsTotal, { latestOnly: true }) as number;
        const demandZeroFaults = transformMetricsData(demandZeroFaultsTotal, { latestOnly: true }) as number;
        const swapOperations = transformMetricsData(swapPageOperationsTotal, { latestOnly: true }) as number;
        const swapReads = transformMetricsData(swapPageReadsTotal, { latestOnly: true }) as number;
        const swapWrites = transformMetricsData(swapPageWritesTotal, { latestOnly: true }) as number;

        // 计算使用率百分比
        const memoryUsagePercentage = physicalTotalMemory > 0 
          ? 100 - (physicalFreeMemory / physicalTotalMemory * 100) 
          : 0;
        
        const commitPercentage = commitLimitValue > 0 
          ? (committedMemory / commitLimitValue * 100) 
          : 0;

        // 更新状态
        updateMemory({
          availableMemory,
          cacheMemory,
          commitLimit: commitLimitValue,
          committedMemory,
          physicalFreeMemory,
          physicalTotalMemory,
          poolNonpagedMemory,
          poolPagedMemory,
          
          memoryUsagePercentage,
          commitPercentage,
          
          pageFaults,
          cacheFaults,
          demandZeroFaults,
          swapOperations,
          swapReads,
          swapWrites,
          
          // 更新趋势数据
          availableMemoryTrend: [
            ...memoryState.availableMemoryTrend,
            { time: currentTime, value: availableMemory }
          ].slice(-timeRangeMs['7d']),
          
          commitMemoryTrend: [
            ...memoryState.commitMemoryTrend,
            { time: currentTime, value: committedMemory }
          ].slice(-timeRangeMs['7d']),
          
          pageFileUsageTrend: [
            ...memoryState.pageFileUsageTrend,
            { time: currentTime, value: committedMemory - physicalTotalMemory + physicalFreeMemory > 0 ? 
              committedMemory - physicalTotalMemory + physicalFreeMemory : 0 }
          ].slice(-timeRangeMs['7d']),
          
          pageFaultsTrend: [
            ...memoryState.pageFaultsTrend,
            { time: currentTime, value: pageFaults }
          ].slice(-timeRangeMs['7d']),
          
          cacheFaultsTrend: [
            ...memoryState.cacheFaultsTrend,
            { time: currentTime, value: cacheFaults }
          ].slice(-timeRangeMs['7d']),
          
          swapTrend: {
            operations: [
              ...memoryState.swapTrend.operations,
              { time: currentTime, value: swapOperations }
            ].slice(-timeRangeMs['7d']),
            reads: [
              ...memoryState.swapTrend.reads,
              { time: currentTime, value: swapReads }
            ].slice(-timeRangeMs['7d']),
            writes: [
              ...memoryState.swapTrend.writes,
              { time: currentTime, value: swapWrites }
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