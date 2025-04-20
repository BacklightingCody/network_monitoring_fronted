import { create } from 'zustand';
import { createCpuMetricsSlice, CpuMetricsSlice } from './slices/cpuMetricsSlice';
import { createDiskMetricsSlice, DiskMetricsSlice } from './slices/diskMetricsSlice';
import { createNetworkMetricsSlice, NetworkMetricsSlice } from './slices/networkMetricsSlice';
import { createMemoryMetricsSlice, MemoryMetricsSlice } from './slices/memoryMetricsSlice';
import { createSystemMetricsSlice, SystemMetricsSlice } from './slices/systemMetricsSlice';
import { createTrafficMetricsSlice, TrafficMetricsSlice } from './slices/trafficMetricsSlice';
import { useCallback } from 'react';

// 定义完整的 Store 状态类型
export interface StoreState {
  cpu: CpuMetricsSlice;
  disk: DiskMetricsSlice;
  network: NetworkMetricsSlice;
  memory: MemoryMetricsSlice;
  system: SystemMetricsSlice;
  traffic: TrafficMetricsSlice;
}

// 创建 store
export const useStore = create<StoreState>()((set, get, api) => ({
  cpu: createCpuMetricsSlice(set, get, api),
  disk: createDiskMetricsSlice(set, get, api),
  network: createNetworkMetricsSlice(set, get, api),
  memory: createMemoryMetricsSlice(set, get, api),
  system: createSystemMetricsSlice(set, get, api),
  traffic: createTrafficMetricsSlice(set, get, api),
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
  pageFreeUsageTrend: state.memory.pageFreeUsageTrend,

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

// 添加系统指标选择器
export const useSystemMetricsData = () => useStore(state => ({
  hostname: state.system.hostname,
  timezone: state.system.timezone,
  bootTime: state.system.bootTime,
  systemTime: state.system.systemTime,
  uptime: state.system.uptime,
  uptimeFormatted: state.system.uptimeFormatted,
  processes: state.system.processes,
  processesLimit: state.system.processesLimit,
  threads: state.system.threads,
  logicalProcessors: state.system.logicalProcessors,
  physicalMemory: state.system.physicalMemory,
  memoryFree: state.system.memoryFree,
  memoryUsagePercentage: state.system.memoryUsagePercentage,
  users: state.system.users,
  cpuQueueLength: state.system.cpuQueueLength,
  contextSwitches: state.system.contextSwitches,
  exceptionDispatches: state.system.exceptionDispatches,
  systemCalls: state.system.systemCalls,
  diskIO: state.system.diskIO,
  services: state.system.services,
  runningServicesCount: state.system.runningServicesCount,
  stoppedServicesCount: state.system.stoppedServicesCount,
  collectorDuration: state.system.collectorDuration,
  
  systemTimeTrend: state.system.systemTimeTrend,
  processesTrend: state.system.processesTrend,
  threadsTrend: state.system.threadsTrend,
  cpuQueueTrend: state.system.cpuQueueTrend,
  contextSwitchesTrend: state.system.contextSwitchesTrend,
  exceptionDispatchesTrend: state.system.exceptionDispatchesTrend,
  systemCallsTrend: state.system.systemCallsTrend,
  diskIOTrend: state.system.diskIOTrend,
  
  error: state.system.error,
  isLoading: state.system.isLoading,
  isPolling: state.system.isPolling,
}));

export const useSystemMetricsActions = () => {
  const store = useStore();
  
  const startPolling = useCallback(() => {
    store.system.startPolling();
  }, [store.system]);
  
  const stopPolling = useCallback(() => {
    store.system.stopPolling();
  }, [store.system]);
  
  return {
    startPolling,
    stopPolling,
    fetchSystemMetrics: store.system.fetchSystemMetrics
  };
};

export const useSystemMetrics = () => {
  const data = useSystemMetricsData();
  const actions = useSystemMetricsActions();
  return { ...data, ...actions };
};

// 流量指标选择器
export const useTrafficMetricsData = () => useStore(state => ({
  // 基本流量数据
  packets: state.traffic.packets,
  totalPackets: state.traffic.totalPackets,
  totalPages: state.traffic.totalPages,
  
  // 统计数据
  stats: state.traffic.stats,
  
  // 基本统计数据
  basicStats: state.traffic.basicStats,
  
  // 摘要数据
  summary: state.traffic.summary,
  
  // 排名数据
  topSources: state.traffic.topSources,
  topDestinations: state.traffic.topDestinations,
  
  // 协议统计
  protocols: state.traffic.protocols,
  protocolStats: state.traffic.protocolStats,
  
  // 异常检测
  anomalies: state.traffic.anomalies,
  
  // 流量体积趋势
  trafficVolume: state.traffic.trafficVolume,
  
  // 活跃连接
  activeConnections: state.traffic.activeConnections,
  
  // 端口使用统计
  portUsage: state.traffic.portUsage,
  
  // 通信对统计
  communicationPairs: state.traffic.communicationPairs,
  
  // 地理位置分布
  geoDistribution: state.traffic.geoDistribution,
  
  // 包大小分布
  packetSizeDistribution: state.traffic.packetSizeDistribution,
  packetSizes: state.traffic.packetSizes,
  
  // 实时流量
  realtimeTraffic: state.traffic.realtimeTraffic,
  
  // 应用使用情况
  applications: state.traffic.applications,
  
  error: state.traffic.error,
  isLoading: state.traffic.isLoading,
  isPolling: state.traffic.isPolling,
}));

export const useTrafficMetricsActions = () => {
  const store = useStore();
  
  const startPolling = useCallback(() => {
    store.traffic.startPolling();
  }, [store.traffic]);
  
  const stopPolling = useCallback(() => {
    store.traffic.stopPolling();
  }, [store.traffic]);
  
  return {
    startPolling,
    stopPolling,
    fetchTrafficPackets: store.traffic.fetchTrafficPackets,
    fetchTrafficStats: store.traffic.fetchTrafficStats,
    fetchTrafficAnomalies: store.traffic.fetchTrafficAnomalies,
    fetchTopSources: store.traffic.fetchTopSources,
    fetchTopDestinations: store.traffic.fetchTopDestinations,
    fetchProtocolStats: store.traffic.fetchProtocolStats,
    fetchTrafficVolume: store.traffic.fetchTrafficVolume,
    fetchActiveConnections: store.traffic.fetchActiveConnections,
    fetchGeoDistribution: store.traffic.fetchGeoDistribution,
    fetchAllTrafficMetrics: store.traffic.fetchAllTrafficMetrics,
    fetchRealtimeTraffic: store.traffic.fetchRealtimeTraffic
  };
};

export const useTrafficMetrics = () => {
  const data = useTrafficMetricsData();
  const actions = useTrafficMetricsActions();
  return { ...data, ...actions };
}; 