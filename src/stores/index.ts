import { create } from 'zustand';
import { createCpuMetricsSlice, CpuMetricsSlice } from './slices/cpuMetricsSlice';
import { createDiskMetricsSlice, DiskMetricsSlice } from './slices/diskMetricsSlice';
import { createNetworkMetricsSlice, NetworkMetricsSlice } from './slices/networkMetricsSlice';
import { createMemoryMetricsSlice, MemoryMetricsSlice } from './slices/memoryMetricsSlice';
import { useCallback } from 'react';

// 定义完整的 Store 状态类型
export interface StoreState {
  cpu: CpuMetricsSlice;
  disk: DiskMetricsSlice;
  network: NetworkMetricsSlice;
  memory: MemoryMetricsSlice;
}

// 创建 store
export const useStore = create<StoreState>()((set, get) => ({
  cpu: createCpuMetricsSlice(set, get),
  disk: createDiskMetricsSlice(set, get),
  network: createNetworkMetricsSlice(set, get),
  memory: createMemoryMetricsSlice(set, get),
}));

// CPU 指标选择器
export const useCpuMetricsData = () => useStore(state => ({
  processorCount: state.cpu.processorCount,
  performanceCount: state.cpu.performanceCount,
  coreFrequency: state.cpu.coreFrequency,
  cpuState: state.cpu.cpuState,
  performanceTrend: state.cpu.performanceTrend,
  clockInterruptsTrend: state.cpu.clockInterruptsTrend,
  dpcsTrend: state.cpu.dpcsTrend,
  interruptsTrend: state.cpu.interruptsTrend,
  error: state.cpu.error,
  isLoading: state.cpu.isLoading,
  isPolling: state.cpu.isPolling,
}));

export const useCpuMetricsActions = () => {
  const store = useStore();
  
  const startPolling = useCallback(() => {
    store.cpu.startPolling();
  }, [store.cpu]);
  
  const stopPolling = useCallback(() => {
    store.cpu.stopPolling();
  }, [store.cpu]);
  
  return {
    startPolling,
    stopPolling
  };
};

// 兼容之前的用法
export const useCpuMetrics = () => {
  const data = useCpuMetricsData();
  const actions = useCpuMetricsActions();
  
  return {
    ...data,
    ...actions
  };
};

// 磁盘指标选择器
export const useDiskMetricsData = () => useStore(state => ({
  freeSpace: state.disk.freeSpace,
  totalFreeSpace: state.disk.totalFreeSpace,
  readLatency: state.disk.readLatency,
  writeLatency: state.disk.writeLatency,
  readWriteSpeedTrend: state.disk.readWriteSpeedTrend,
  latencyTrend: state.disk.latencyTrend,
  queueTrend: state.disk.queueTrend,
  error: state.disk.error,
  isLoading: state.disk.isLoading,
  isPolling: state.disk.isPolling,
}));

export const useDiskMetricsActions = () => {
  const store = useStore();
  
  const startPolling = useCallback(() => {
    store.disk.startPolling();
  }, [store.disk]);
  
  const stopPolling = useCallback(() => {
    store.disk.stopPolling();
  }, [store.disk]);
  
  return {
    startPolling,
    stopPolling,
    fetchDiskMetrics: store.disk.fetchDiskMetrics
  };
};

export const useDiskMetrics = () => {
  const data = useDiskMetricsData();
  const actions = useDiskMetricsActions();
  return { ...data, ...actions };
};

// 网络指标选择器
export const useNetworkMetricsData = () => useStore(state => ({
  // 所有网络数据状态
  bytesReceived: state.network.bytesReceived,
  bytesSent: state.network.bytesSent,
  bytesTotal: state.network.bytesTotal,
  currentBandwidth: state.network.currentBandwidth,
  errors: state.network.errors,
  nicInfo: state.network.nicInfo,
  outputQueueLength: state.network.outputQueueLength,
  packetsReceived: state.network.packetsReceived,
  packetsSent: state.network.packetsSent,
  packetsTotal: state.network.packetsTotal,
  trafficTrend: state.network.trafficTrend,
  packetsTrend: state.network.packetsTrend,
  errorsTrend: state.network.errorsTrend,
  error: state.network.error,
  isLoading: state.network.isLoading,
  isPolling: state.network.isPolling,
}));

export const useNetworkMetricsActions = () => {
  const store = useStore();
  
  const startPolling = useCallback(() => {
    store.network.startPolling();
  }, [store.network]);
  
  const stopPolling = useCallback(() => {
    store.network.stopPolling();
  }, [store.network]);
  
  return {
    startPolling,
    stopPolling,
    fetchNetworkMetrics: store.network.fetchNetworkMetrics
  };
};

export const useNetworkMetrics = () => {
  const data = useNetworkMetricsData();
  const actions = useNetworkMetricsActions();
  return { ...data, ...actions };
};

// 内存指标选择器
export const useMemoryMetricsData = () => useStore(state => ({
  availableMemory: state.memory.availableMemory,
  cacheMemory: state.memory.cacheMemory,
  commitLimit: state.memory.commitLimit,
  committedMemory: state.memory.committedMemory,
  physicalFreeMemory: state.memory.physicalFreeMemory,
  physicalTotalMemory: state.memory.physicalTotalMemory,
  poolNonpagedMemory: state.memory.poolNonpagedMemory,
  poolPagedMemory: state.memory.poolPagedMemory,
  
  memoryUsagePercentage: state.memory.memoryUsagePercentage,
  commitPercentage: state.memory.commitPercentage,
  
  availableMemoryTrend: state.memory.availableMemoryTrend,
  commitMemoryTrend: state.memory.commitMemoryTrend,
  pageFileUsageTrend: state.memory.pageFileUsageTrend,
  
  pageFaults: state.memory.pageFaults,
  cacheFaults: state.memory.cacheFaults,
  demandZeroFaults: state.memory.demandZeroFaults,
  
  pageFaultsTrend: state.memory.pageFaultsTrend,
  cacheFaultsTrend: state.memory.cacheFaultsTrend,
  
  swapOperations: state.memory.swapOperations,
  swapReads: state.memory.swapReads,
  swapWrites: state.memory.swapWrites,
  swapTrend: state.memory.swapTrend,
  
  error: state.memory.error,
  isLoading: state.memory.isLoading,
  isPolling: state.memory.isPolling,
}));

export const useMemoryMetricsActions = () => {
  const store = useStore();
  
  const startPolling = useCallback(() => {
    store.memory.startPolling();
  }, [store.memory]);
  
  const stopPolling = useCallback(() => {
    store.memory.stopPolling();
  }, [store.memory]);
  
  return {
    startPolling,
    stopPolling,
    fetchMemoryMetrics: store.memory.fetchMemoryMetrics
  };
};

export const useMemoryMetrics = () => {
  const data = useMemoryMetricsData();
  const actions = useMemoryMetricsActions();
  return { ...data, ...actions };
}; 