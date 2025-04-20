import { StateCreator } from 'zustand';
import { StoreState } from '../index';
import { 
  getBootTime, 
  getCpuQueueLength, 
  getContextSwitches, 
  getExceptionDispatches, 
  getSystemCalls, 
  getDiskIO, 
  getHostname, 
  getLogicalProcessors, 
  getMemoryFree, 
  getPhysicalMemory, 
  getProcesses, 
  getProcessesLimit, 
  getServices, 
  getServiceState, 
  getSystemTime, 
  getThreads, 
  getTimezone, 
  getUsers, 
  getCollectorDuration,
  getAllSystemMetrics
} from '@/services/api/system';
import { timeRangeMs } from '@/components/metrics/constant';

// 定义系统指标数据点
export interface SystemMetricPoint {
  time: number;
  value: number;
}

export interface ServiceState {
  name: string;
  state: 'running' | 'stopped' | 'unknown';
  displayName: string;
  startType: string;
}

// 定义系统指标状态
export interface SystemMetricsState {
  // 基本系统信息
  hostname: string;
  timezone: string;
  bootTime: number;
  systemTime: number;
  uptime: number; // 计算得到的运行时间（秒）
  uptimeFormatted: string; // 格式化的运行时间

  // 资源使用
  processes: number;
  processesLimit: number;
  threads: number;
  logicalProcessors: number;
  physicalMemory: number;
  memoryFree: number;
  memoryUsagePercentage: number;
  users: number;
  
  // 系统性能指标
  cpuQueueLength: number;
  contextSwitches: number;
  exceptionDispatches: number;
  systemCalls: number;
  diskIO: number;
  
  // 服务相关
  services: ServiceState[];
  runningServicesCount: number;
  stoppedServicesCount: number;
  
  // 性能收集器
  collectorDuration: number;

  // 趋势数据
  systemTimeTrend: SystemMetricPoint[];
  processesTrend: SystemMetricPoint[];
  threadsTrend: SystemMetricPoint[];
  cpuQueueTrend: SystemMetricPoint[];
  contextSwitchesTrend: SystemMetricPoint[];
  exceptionDispatchesTrend: SystemMetricPoint[];
  systemCallsTrend: SystemMetricPoint[];
  diskIOTrend: SystemMetricPoint[];
  
  // 状态
  error: string | null;
  isLoading: boolean;
  isPolling: boolean;
}

// 定义系统指标操作
export interface SystemMetricsActions {
  fetchSystemMetrics: () => Promise<void>;
  setError: (error: string | null) => void;
  startPolling: () => void;
  stopPolling: () => void;
}

export type SystemMetricsSlice = SystemMetricsState & SystemMetricsActions;

// 通用的格式化函数，用于将字节转换为可读的大小
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

// 格式化百分比值
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

// 格式化运行时间
const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / (24 * 60 * 60));
  seconds -= days * 24 * 60 * 60;
  const hours = Math.floor(seconds / (60 * 60));
  seconds -= hours * 60 * 60;
  const minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;
  seconds = Math.floor(seconds);

  let result = '';
  if (days > 0) result += `${days}天 `;
  if (hours > 0 || days > 0) result += `${hours}小时 `;
  if (minutes > 0 || hours > 0 || days > 0) result += `${minutes}分钟 `;
  result += `${seconds}秒`;

  return result;
};

// 从指标数据中提取值
const extractMetricValue = (data: any): number => {
  if (!data || !Array.isArray(data) || data.length === 0) return 0;
  
  // 尝试从Prometheus格式的响应中提取值
  try {
    const metricValue = parseFloat(data[0]?.value?.[1] || '0');
    return isNaN(metricValue) ? 0 : metricValue;
  } catch (error) {
    console.error('Error extracting metric value:', error);
    return 0;
  }
};

const initialState: SystemMetricsState = {
  hostname: 'Unknown',
  timezone: 'Unknown',
  bootTime: 0,
  systemTime: 0,
  uptime: 0,
  uptimeFormatted: '0秒',
  processes: 0,
  processesLimit: 0,
  threads: 0,
  logicalProcessors: 0,
  physicalMemory: 0,
  memoryFree: 0,
  memoryUsagePercentage: 0,
  users: 0,
  cpuQueueLength: 0,
  contextSwitches: 0,
  exceptionDispatches: 0,
  systemCalls: 0,
  diskIO: 0,
  services: [],
  runningServicesCount: 0,
  stoppedServicesCount: 0,
  collectorDuration: 0,
  
  systemTimeTrend: [],
  processesTrend: [],
  threadsTrend: [],
  cpuQueueTrend: [],
  contextSwitchesTrend: [],
  exceptionDispatchesTrend: [],
  systemCallsTrend: [],
  diskIOTrend: [],
  
  error: null,
  isLoading: false,
  isPolling: false,
};

export const createSystemMetricsSlice: StateCreator<
  StoreState,
  [],
  [],
  SystemMetricsSlice
> = (set, get) => {
  let pollingInterval: NodeJS.Timeout | null = null;
  const updateSystem = (newState: Partial<SystemMetricsState>) =>
    set(state => ({ system: { ...state.system, ...newState } }));

  // 处理服务状态数据
  const processServiceStates = (servicesRaw: any[], serviceStates: any[]): ServiceState[] => {
    const services: ServiceState[] = [];
    
    // 提取服务信息
    if (Array.isArray(servicesRaw) && servicesRaw.length > 0) {
      for (const serviceInfo of servicesRaw) {
        try {
          const metric = serviceInfo.metric || {};
          const name = metric.name || 'Unknown';
          const displayName = metric.display_name || name;
          const startType = metric.start_type || 'Unknown';
          
          // 查找对应的服务状态
          let state: 'running' | 'stopped' | 'unknown' = 'unknown';
          
          if (Array.isArray(serviceStates)) {
            const matchingState = serviceStates.find(
              stateInfo => stateInfo.metric?.name === name
            );
            
            if (matchingState) {
              const stateValue = parseFloat(matchingState.value?.[1] || '0');
              state = stateValue === 1 ? 'running' : 'stopped';
            }
          }
          
          services.push({
            name,
            displayName,
            startType,
            state
          });
        } catch (error) {
          console.error('Error processing service state:', error);
        }
      }
    }
    
    return services;
  };

  return {
    ...initialState,

    fetchSystemMetrics: async () => {
      const systemState = get().system;
      if (systemState.isLoading) return;

      try {
        updateSystem({ isLoading: true, error: null });

        const allMetrics = await getAllSystemMetrics();
        const currentTime = new Date().toLocaleTimeString();

        // 提取各项指标数据
        const hostname = extractMetricValue(allMetrics.hostname);
        const timezone = allMetrics.timezone?.[0]?.value?.[1] || 'Unknown';
        const bootTime = extractMetricValue(allMetrics.bootTime);
        const systemTime = extractMetricValue(allMetrics.systemTime);
        const uptime = systemTime > bootTime ? systemTime - bootTime : 0;
        const uptimeFormatted = formatUptime(uptime);

        // 处理资源使用情况
        const processes = extractMetricValue(allMetrics.processes);
        const processesLimit = extractMetricValue(allMetrics.processesLimit);
        const threads = extractMetricValue(allMetrics.threads);
        const logicalProcessors = extractMetricValue(allMetrics.logicalProcessors);
        const physicalMemory = extractMetricValue(allMetrics.physicalMemory);
        const memoryFree = extractMetricValue(allMetrics.memoryFree);
        const memoryUsagePercentage = physicalMemory > 0 ? ((physicalMemory - memoryFree) / physicalMemory) * 100 : 0;
        const users = extractMetricValue(allMetrics.users);

        // 处理系统性能指标
        const cpuQueueLength = extractMetricValue(allMetrics.cpuQueueLength);
        const contextSwitches = extractMetricValue(allMetrics.contextSwitches);
        const exceptionDispatches = extractMetricValue(allMetrics.exceptionDispatches);
        const systemCalls = extractMetricValue(allMetrics.systemCalls);
        const diskIO = extractMetricValue(allMetrics.diskIO);

        // 处理服务状态
        const services = processServiceStates(
          Array.isArray(allMetrics.services) ? allMetrics.services : [],
          Array.isArray(allMetrics.serviceState) ? allMetrics.serviceState : []
        );
        const runningServicesCount = services.filter(s => s.state === 'running').length;
        const stoppedServicesCount = services.filter(s => s.state === 'stopped').length;

        // 处理性能收集器
        // 如果收集器持续时间是数组，取最后一个值
        let collectorDuration = 0;
        if (Array.isArray(allMetrics.collectorDuration) && allMetrics.collectorDuration.length > 0) {
          const lastCollector = allMetrics.collectorDuration[allMetrics.collectorDuration.length - 1];
          if (lastCollector.value && Array.isArray(lastCollector.value) && lastCollector.value.length >= 2) {
            collectorDuration = Number(lastCollector.value[1]) || 0;
          }
        }

        // 更新状态
        updateSystem({
          hostname: hostname.toString(),
          timezone,
          bootTime,
          systemTime,
          uptime,
          uptimeFormatted,
          processes,
          processesLimit,
          threads,
          logicalProcessors,
          physicalMemory,
          memoryFree,
          memoryUsagePercentage,
          users,
          cpuQueueLength,
          contextSwitches,
          exceptionDispatches,
          systemCalls,
          diskIO,
          services,
          runningServicesCount,
          stoppedServicesCount,
          collectorDuration,
          
          // 更新趋势数据
          systemTimeTrend: [
            ...systemState.systemTimeTrend,
            { time: Date.now(), value: systemTime }
          ].slice(-20), // 仅保留最近20个数据点
          
          processesTrend: [
            ...systemState.processesTrend,
            { time: Date.now(), value: processes }
          ].slice(-20),
          
          threadsTrend: [
            ...systemState.threadsTrend,
            { time: Date.now(), value: threads }
          ].slice(-20),
          
          cpuQueueTrend: [
            ...systemState.cpuQueueTrend,
            { time: Date.now(), value: cpuQueueLength }
          ].slice(-20),
          
          contextSwitchesTrend: [
            ...systemState.contextSwitchesTrend,
            { time: Date.now(), value: contextSwitches }
          ].slice(-20),
          
          exceptionDispatchesTrend: [
            ...systemState.exceptionDispatchesTrend,
            { time: Date.now(), value: exceptionDispatches }
          ].slice(-20),
          
          systemCallsTrend: [
            ...systemState.systemCallsTrend,
            { time: Date.now(), value: systemCalls }
          ].slice(-20),
          
          diskIOTrend: [
            ...systemState.diskIOTrend,
            { time: Date.now(), value: diskIO }
          ].slice(-20),
          
          isLoading: false
        });
      } catch (error) {
        console.error('获取系统指标失败:', error);
        const errorMessage = error instanceof Error ? error.message : '获取数据失败，请稍后重试';
        updateSystem({ error: errorMessage, isLoading: false });
      }
    },

    setError: (error) => updateSystem({ error }),

    startPolling: () => {
      const currentState = get().system;
      // 如果已经在轮询中，直接返回
      if (currentState.isPolling || pollingInterval) return;

      // 先设置状态
      updateSystem({ isPolling: true });

      // 立即执行一次获取
      get().system.fetchSystemMetrics();
      
      // 设置轮询间隔
      pollingInterval = setInterval(() => {
        get().system.fetchSystemMetrics();
      }, 5000);
    },

    stopPolling: () => {
      // 先清除定时器
      if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
      }

      // 再更新状态，避免状态更新触发组件重渲染再触发状态更新的循环
      updateSystem({ isPolling: false });
    },
  };
}; 