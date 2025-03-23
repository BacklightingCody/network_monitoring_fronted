import { StateCreator } from 'zustand';
import { getAllSystemMetrics } from '@/services/api/system';
import { StoreState } from '../index';
import { timeRangeMs } from '@/components/metrics/constant';

// 定义系统指标数据点
export interface SystemMetricPoint {
  time: string;
  value: number;
}

export interface ServiceState {
  name: string;
  state: string;
  displayName?: string;
  startType?: string;
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
  updateMetrics: (metrics: Partial<SystemMetricsState>) => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  startPolling: () => void;
  stopPolling: () => void;
}

export type SystemMetricsSlice = SystemMetricsState & SystemMetricsActions;

// 通用的格式化函数，用于将字节转换为可读的大小
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

// 格式化百分比值
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

// 格式化运行时间
const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}天`);
  if (hours > 0) parts.push(`${hours}小时`);
  if (minutes > 0) parts.push(`${minutes}分钟`);
  if (secs > 0) parts.push(`${secs}秒`);

  return parts.join(' ');
};

// 从指标数据中提取值
const extractMetricValue = (metricData: any, defaultValue: any = 0): any => {
  if (!metricData || !Array.isArray(metricData) || metricData.length === 0) {
    return defaultValue;
  }
  
  // 对于大多数指标，我们取第一个元素的值
  const item = metricData[0];
  
  if (item.value && Array.isArray(item.value) && item.value.length >= 2) {
    // 如果值是数组（如 [timestamp, value]），取第二个元素
    return isNaN(Number(item.value[1])) ? item.value[1] : Number(item.value[1]);
  } else if (item.metric && item.metric.value) {
    // 如果值存储在 metric.value 中
    return isNaN(Number(item.metric.value)) ? item.metric.value : Number(item.metric.value);
  } else if (item.metric && item.metric.__name__) {
    // 如果是文本值，如主机名
    return item.metric.__name__;
  }
  
  return defaultValue;
};

const initialState: SystemMetricsState = {
  hostname: '',
  timezone: '',
  bootTime: 0,
  systemTime: 0,
  uptime: 0,
  uptimeFormatted: '',
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
  const processServiceStates = (services: any[], serviceStates: any[]): ServiceState[] => {
    if (!Array.isArray(services) || !Array.isArray(serviceStates)) {
      return [];
    }

    const servicesMap = new Map<string, ServiceState>();
    
    // 处理服务基本信息
    services.forEach(service => {
      // 确保有metric对象
      if (!service.metric) return;
      
      const name = service.metric.name || 'unknown';
      servicesMap.set(name, {
        name,
        displayName: service.metric.display_name || name,
        startType: service.metric.start_type || 'Unknown',
        state: 'Unknown'
      });
    });
    
    // 处理服务状态信息
    serviceStates.forEach(state => {
      // 确保有metric对象和值数组
      if (!state.metric || !state.value || !Array.isArray(state.value)) return;
      
      const name = state.metric.name || 'unknown';
      const stateValue = Number(state.value[1] || 0);
      
      if (servicesMap.has(name)) {
        const service = servicesMap.get(name)!;
        service.state = stateValue === 1 ? 'Running' : 'Stopped';
      }
    });
    
    return Array.from(servicesMap.values());
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
        const hostname = extractMetricValue(allMetrics.hostname, '未知主机');
        const timezone = extractMetricValue(allMetrics.timezone, '未知时区');
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
        const runningServicesCount = services.filter(s => s.state === 'Running').length;
        const stoppedServicesCount = services.filter(s => s.state === 'Stopped').length;

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
          hostname,
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
            { time: currentTime, value: systemTime }
          ].slice(-20), // 仅保留最近20个数据点
          
          processesTrend: [
            ...systemState.processesTrend,
            { time: currentTime, value: processes }
          ].slice(-20),
          
          threadsTrend: [
            ...systemState.threadsTrend,
            { time: currentTime, value: threads }
          ].slice(-20),
          
          cpuQueueTrend: [
            ...systemState.cpuQueueTrend,
            { time: currentTime, value: cpuQueueLength }
          ].slice(-20),
          
          contextSwitchesTrend: [
            ...systemState.contextSwitchesTrend,
            { time: currentTime, value: contextSwitches }
          ].slice(-20),
          
          exceptionDispatchesTrend: [
            ...systemState.exceptionDispatchesTrend,
            { time: currentTime, value: exceptionDispatches }
          ].slice(-20),
          
          systemCallsTrend: [
            ...systemState.systemCallsTrend,
            { time: currentTime, value: systemCalls }
          ].slice(-20),
          
          diskIOTrend: [
            ...systemState.diskIOTrend,
            { time: currentTime, value: diskIO }
          ].slice(-20),
          
          isLoading: false
        });
      } catch (error) {
        console.error('获取系统指标失败:', error);
        const errorMessage = error instanceof Error ? error.message : '获取数据失败，请稍后重试';
        updateSystem({ error: errorMessage, isLoading: false });
      }
    },

    updateMetrics: (metrics) => updateSystem(metrics),
    setError: (error) => updateSystem({ error }),
    setLoading: (isLoading) => updateSystem({ isLoading }),

    startPolling: () => {
      const currentState = get().system;
      // 如果已经在轮询中，直接返回
      if (currentState.isPolling || pollingInterval) return;

      // 先设置状态
      updateSystem({ isPolling: true });

      // 定义一个不依赖闭包的函数来获取最新状态
      const fetchMetrics = () => {
        // 每次都从 store 获取最新状态
        const state = get().system;
        if (state.isPolling) {
          state.fetchSystemMetrics().catch(err =>
            console.error('轮询期间获取系统指标失败:', err)
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
      updateSystem({ isPolling: false });
    },
  };
}; 