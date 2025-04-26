import { StateCreator } from 'zustand';
import * as logService from '@/services/api/log';
import { LogType, LogSource, LogsFilterParams } from '@/services/api/log';

// 日志项类型定义
export interface LogItem {
  id: number;
  timestamp: string;
  logType: LogType;
  source: LogSource;
  message: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

// 日志类型统计数据
export interface LogTypeStatItem {
  type: LogType;
  count: number;
  percentage: number;
}

// 日志来源统计数据
export interface LogSourceStatItem {
  source: LogSource;
  count: number;
  percentage: number;
}

// 日志时间统计数据
export interface LogTimeStatItem {
  time: string;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  apiCount: number;
  systemCount: number;
  totalCount: number;
}

// 日志过滤状态
export interface LogsFilterState extends LogsFilterParams {
  limit: number;
  offset: number;
  pollingInterval: number;
}

// 日志状态
export interface LogsSlice {
  // 日志数据
  logs: LogItem[];
  totalLogs: number;
  logTypeStats: LogTypeStatItem[];
  logSourceStats: LogSourceStatItem[];
  logTimeStats: LogTimeStatItem[];
  
  // 过滤条件
  filter: LogsFilterState;
  
  // 状态标志
  isLoading: boolean;
  isStatsLoading: boolean;
  error: string | null;
  isPolling: boolean;
  pollingInterval: number;
  
  // 操作方法
  fetchLogs: () => Promise<void>;
  fetchLogStats: () => Promise<void>;
  setFilter: (filter: Partial<LogsFilterState>) => void;
  resetFilter: () => void;
  refreshLogs: () => Promise<void>;
  clearAllLogs: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
  setPollingInterval: (interval: number) => void;
}

// 默认过滤条件
const defaultFilter: LogsFilterState = {
  limit: 50,
  offset: 0,
  type: undefined,
  source: undefined,
  search: undefined,
  startTime: undefined,
  endTime: undefined,
  pollingInterval: 5000,
};

// 创建日志状态切片
export const createLogsSlice: StateCreator<
  { logs: LogsSlice },
  [],
  [],
  LogsSlice
> = (set, get) => {
  // 轮询定时器
  let pollingInterval: NodeJS.Timeout | null = null;
  
  const updateLogs = (newState: Partial<LogsSlice>) =>
    set(state => ({ logs: { ...state.logs, ...newState } }));
  
  return {
    // 初始状态
    logs: [],
    totalLogs: 0,
    logTypeStats: [],
    logSourceStats: [],
    logTimeStats: [],
    filter: { ...defaultFilter },
    isLoading: false,
    isStatsLoading: false,
    error: null,
    isPolling: false,
    pollingInterval: 5000,
    
    // 获取日志列表
    fetchLogs: async () => {
      const logsState = get().logs;
      if (logsState.isLoading) {
        console.log('🔄 正在加载中，跳过此次获取');
        return;
      }
      
      console.log('🔄 开始获取日志列表, 参数:', logsState.filter);
      updateLogs({ isLoading: true, error: null });
      
      try {
        const response = await logService.getLogs(logsState.filter);
        console.log('📊 日志数据响应:', response);
        
        // 使用类型断言处理返回数据
        type ApiResponse = { code: number; data: any; total: number; message?: string };
        const typedResponse = response as ApiResponse;
        
        if (typedResponse && typedResponse.code === 0) {
          console.log(`✅ 获取日志成功，共 ${typedResponse.total} 条`);
          updateLogs({ 
            logs: typedResponse.data,
            totalLogs: typedResponse.total,
            isLoading: false 
          });
        } else {
          console.error('❌ 获取日志失败:', typedResponse?.message);
          updateLogs({ 
            error: typedResponse?.message || '获取日志失败',
            isLoading: false 
          });
        }
      } catch (error) {
        console.error('❌ 获取日志列表出错:', error);
        updateLogs({ 
          error: error instanceof Error ? error.message : '获取日志失败',
          isLoading: false 
        });
      }
    },
    
    // 获取日志统计数据
    fetchLogStats: async () => {
      const logsState = get().logs;
      if (logsState.isStatsLoading) {
        console.log('🔄 统计数据正在加载中，跳过此次获取');
        return;
      }
      
      const { startTime, endTime } = logsState.filter;
      console.log('🔄 开始获取日志统计数据, 时间范围:', { startTime, endTime });
      updateLogs({ isStatsLoading: true, error: null });
      
      try {
        // 并行获取各种统计数据
        console.log('📊 并行请求三种统计数据...');
        const [typeStatsRes, sourceStatsRes, timeStatsRes] = await Promise.all([
          logService.getLogTypeStats({ startTime, endTime }),
          logService.getLogSourceStats({ startTime, endTime }),
          logService.getLogTimeStats({ 
            startTime, 
            endTime,
            interval: 'hour'  // 默认按小时统计
          })
        ]);
        
        console.log('📊 统计数据响应:', {
          typeStats: typeStatsRes,
          sourceStats: sourceStatsRes,
          timeStats: timeStatsRes
        });
        
        // 使用类型断言处理返回数据
        type StatsResponse = { code: number; data: any; message?: string };
        const typedTypeStats = typeStatsRes as StatsResponse;
        const typedSourceStats = sourceStatsRes as StatsResponse;
        const typedTimeStats = timeStatsRes as StatsResponse;
        
        if (typedTypeStats?.code === 0 && typedSourceStats?.code === 0 && typedTimeStats?.code === 0) {
          console.log('✅ 获取统计数据成功');
          updateLogs({
            logTypeStats: typedTypeStats.data,
            logSourceStats: typedSourceStats.data,
            logTimeStats: typedTimeStats.data,
            isStatsLoading: false
          });
        } else {
          console.error('❌ 获取统计数据失败:', { 
            typeStats: typedTypeStats?.message, 
            sourceStats: typedSourceStats?.message, 
            timeStats: typedTimeStats?.message 
          });
          updateLogs({
            error: '获取日志统计数据失败',
            isStatsLoading: false
          });
        }
      } catch (error) {
        console.error('❌ 获取日志统计数据出错:', error);
        updateLogs({
          error: error instanceof Error ? error.message : '获取日志统计数据失败',
          isStatsLoading: false
        });
      }
    },
    
    // 设置过滤条件
    setFilter: (newFilter) => {
      console.log('🔍 更新过滤条件:', newFilter);
      
      // 使用更新函数直接修改内部状态
      set((state) => ({
        logs: {
          ...state.logs,
          filter: { ...state.logs.filter, ...newFilter }
        }
      }));
      
      // 如果修改了分页或过滤条件，自动重新获取数据
      if (
        newFilter.limit !== undefined || 
        newFilter.offset !== undefined ||
        newFilter.type !== undefined ||
        newFilter.source !== undefined ||
        newFilter.search !== undefined ||
        newFilter.startTime !== undefined ||
        newFilter.endTime !== undefined
      ) {
        console.log('🔄 过滤条件变更，自动刷新数据');
        setTimeout(() => {
          get().logs.fetchLogs();
        }, 0);
      }
    },
    
    // 重置过滤条件
    resetFilter: () => {
      console.log('🔄 重置过滤条件');
      
      // 直接修改state而不是使用函数
      set((state) => ({
        logs: {
          ...state.logs,
          filter: { ...defaultFilter }
        }
      }));
      
      setTimeout(() => {
        get().logs.fetchLogs();
      }, 0);
    },
    
    // 刷新日志数据
    refreshLogs: async () => {
      console.log('🔄 刷新日志数据 - 同时获取日志列表和统计数据');
      try {
        await Promise.all([
          get().logs.fetchLogs(),
          get().logs.fetchLogStats()
        ]);
        console.log('✅ 刷新日志数据完成');
      } catch (error) {
        console.error('❌ 刷新日志数据出错:', error);
      }
    },
    
    // 清空所有日志
    clearAllLogs: async () => {
      console.log('🗑️ 开始清空所有日志');
      updateLogs({ isLoading: true, error: null });
      
      try {
        const response = await logService.clearLogs();
        console.log('🗑️ 清空日志响应:', response);
        
        // 使用类型断言处理返回数据
        type ApiResponse = { code: number; message?: string };
        const typedResponse = response as ApiResponse;
        
        if (typedResponse && typedResponse.code === 0) {
          console.log('✅ 清空日志成功');
          updateLogs({
            logs: [],
            totalLogs: 0,
            logTypeStats: [],
            logSourceStats: [],
            logTimeStats: [],
            isLoading: false
          });
        } else {
          console.error('❌ 清空日志失败:', typedResponse?.message);
          updateLogs({
            error: typedResponse?.message || '清空日志失败',
            isLoading: false
          });
        }
      } catch (error) {
        console.error('❌ 清空日志出错:', error);
        updateLogs({
          error: error instanceof Error ? error.message : '清空日志失败',
          isLoading: false
        });
      }
    },
    
    // 开始轮询
    startPolling: () => {
      console.log('🔄 开始轮询');
      const logsState = get().logs;
      
      // 如果已经在轮询中，直接返回
      if (logsState.isPolling || pollingInterval) {
        console.log('⚠️ 已经在轮询中，不重复启动');
        return;
      }
      
      // 先设置状态
      updateLogs({ isPolling: true });
      
      // 定义一个不依赖闭包的函数来获取最新状态
      const fetchData = () => {
        // 每次都从 store 获取最新状态
        console.log('⏰ 轮询定时器触发，准备获取日志');
        const { logs } = get();
        
        // 检查并确保fetchLogs是函数
        if (logs && typeof logs.fetchLogs === 'function' && logs.isPolling) {
          console.log('⏰ 执行fetchLogs函数');
          logs.fetchLogs().catch(err => {
            console.error('❌ 轮询获取日志数据失败:', err);
          });
        } else {
          console.error('❌ 轮询错误: fetchLogs不是函数或轮询已停止', {
            isFetchLogsFunction: typeof logs.fetchLogs === 'function',
            isPolling: logs.isPolling
          });
        }
      };
      
      // 立即执行一次获取
      fetchData();
      
      console.log(`⏱️ 设置轮询间隔: ${logsState.pollingInterval}ms`);
      // 设置轮询间隔
      pollingInterval = setInterval(fetchData, logsState.pollingInterval);
      console.log('✅ 轮询已启动');
    },
    
    // 停止轮询
    stopPolling: () => {
      console.log('🛑 停止轮询');
      
      // 先清除定时器
      if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
        console.log('✅ 轮询定时器已清除');
      }
      
      // 再更新状态，避免状态更新触发组件重渲染再触发状态更新的循环
      setTimeout(() => {
        updateLogs({ isPolling: false });
        console.log('✅ 轮询状态已更新');
      }, 0);
    },
    
    // 设置轮询间隔
    setPollingInterval: (interval) => {
      console.log(`⏱️ 设置轮询间隔: ${interval}ms`);
      updateLogs({ pollingInterval: interval });
      
      // 如果正在轮询，重新启动轮询以应用新间隔
      const { isPolling } = get().logs;
      if (isPolling) {
        console.log('🔄 轮询已启动，重新设置轮询间隔');
        get().logs.stopPolling();
        setTimeout(() => {
          get().logs.startPolling();
        }, 0);
      }
    }
  };
}; 