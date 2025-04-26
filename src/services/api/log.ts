import http from '@/lib/http';

// 日志类型定义
export enum LogType {
  SYSTEM_START = 'SYSTEM_START',
  SYSTEM_STOP = 'SYSTEM_STOP',
  API_ACCESS = 'API_ACCESS',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO'
}

// 日志来源定义
export enum LogSource {
  SYSTEM = 'system',
  API = 'api',
  DATABASE = 'database',
  AUTH = 'auth',
  NETWORK = 'network',
  SCHEDULER = 'scheduler',
  FRONTEND = 'frontend',
  CACHE = 'cache',
  MONITORING = 'monitoring'
}

// 日志过滤参数类型
export interface LogsFilterParams {
  limit?: number;
  offset?: number;
  type?: LogType;
  source?: LogSource;
  startTime?: string;
  endTime?: string;
  search?: string;
}

// 创建日志参数类型
export interface CreateLogParams {
  logType: LogType;
  source: LogSource;
  message: string;
  metadata?: any;
}

/**
 * 获取系统日志列表
 * @param params 过滤参数
 * @returns 日志列表
 */
export async function getLogs(params: LogsFilterParams = {}) {
  try {
    console.log('获取日志，参数:', params);
    const response = await http.get('/logs', { params });
    console.log('日志获取结果:', response);
    return response;
  } catch (error) {
    console.error('Error fetching logs:', error);
    throw error;
  }
}

/**
 * 获取日志类型分布统计
 * @param params 过滤参数
 * @returns 日志类型统计
 */
export async function getLogTypeStats(params: {
  startTime?: string;
  endTime?: string;
} = {}) {
  try {
    console.log('获取日志类型统计，参数:', params);
    const response = await http.get('/logs/type-stats', { params });
    console.log('日志类型统计结果:', response);
    return response;
  } catch (error) {
    console.error('Error fetching log type stats:', error);
    throw error;
  }
}

/**
 * 获取日志来源分布统计
 * @param params 过滤参数
 * @returns 日志来源统计
 */
export async function getLogSourceStats(params: {
  startTime?: string;
  endTime?: string;
} = {}) {
  try {
    console.log('获取日志来源统计，参数:', params);
    const response = await http.get('/logs/source-stats', { params });
    console.log('日志来源统计结果:', response);
    return response;
  } catch (error) {
    console.error('Error fetching log source stats:', error);
    throw error;
  }
}

/**
 * 获取日志时间分布统计
 * @param params 过滤参数
 * @returns 时间分布统计
 */
export async function getLogTimeStats(params: {
  startTime?: string;
  endTime?: string;
  interval?: 'hour' | 'day' | 'week';
} = {}) {
  try {
    console.log('获取日志时间统计，参数:', params);
    const response = await http.get('/logs/time-stats', { params });
    console.log('日志时间统计结果:', response);
    return response;
  } catch (error) {
    console.error('Error fetching log time stats:', error);
    throw error;
  }
}

/**
 * 创建一条系统日志
 * @param params 日志参数
 * @returns 创建结果
 */
export async function createLog(params: CreateLogParams) {
  try {
    console.log('创建日志，参数:', params);
    const response = await http.post('/logs', params);
    console.log('日志创建结果:', response);
    return response;
  } catch (error) {
    console.error('Error creating log:', error);
    throw error;
  }
}

/**
 * 清除所有日志
 * @returns 操作结果
 */
export async function clearLogs() {
  try {
    console.log('清除所有日志');
    const response = await http.delete('/logs');
    console.log('日志清除结果:', response);
    return response;
  } catch (error) {
    console.error('Error clearing logs:', error);
    throw error;
  }
}

/**
 * 导出日志数据
 * @param format 导出格式 (csv, json)
 * @param params 过滤参数
 * @returns 导出文件流
 */
export async function exportLogs(format: 'csv' | 'json' = 'csv', params: LogsFilterParams = {}) {
  try {
    console.log(`导出${format}格式日志，参数:`, params);
    const response = await http.get(`/logs/export/${format}`, { 
      params,
      responseType: 'blob'
    });
    console.log('日志导出完成');
    return response;
  } catch (error) {
    console.error('Error exporting logs:', error);
    throw error;
  }
}

/**
 * 重新生成模拟日志数据
 * @param count 生成数量
 * @returns 操作结果
 */
export async function reseedLogs(count: number = 500) {
  try {
    console.log(`重新生成${count}条模拟日志`);
    const response = await http.post('/logs/reseed', null, { 
      params: { count }
    });
    console.log('模拟日志生成结果:', response);
    return response;
  } catch (error) {
    console.error('Error reseeding logs:', error);
    throw error;
  }
}

/**
 * 记录前端错误日志
 * @param error 错误对象
 * @param source 错误来源组件/模块
 * @returns 创建结果
 */
export async function logFrontendError(error: Error, source: string) {
  try {
    console.log('记录前端错误:', error.message, '来源:', source);
    return await createLog({
      logType: LogType.ERROR,
      source: LogSource.FRONTEND,
      message: `前端错误: ${error.message}`,
      metadata: {
        stack: error.stack,
        source,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      }
    });
  } catch (err) {
    console.error('Failed to log frontend error:', err);
    // 这里不需要抛出错误，避免造成循环
  }
}

/**
 * 记录系统监控阈值警告
 * @param metric 监控指标
 * @param value 当前值
 * @param threshold 阈值
 * @returns 创建结果
 */
export async function logThresholdWarning(metric: string, value: number, threshold: number) {
  try {
    console.log('记录监控阈值警告:', metric, '值:', value, '阈值:', threshold);
    return await createLog({
      logType: LogType.WARNING,
      source: LogSource.MONITORING,
      message: `监控指标超过阈值: ${metric}`,
      metadata: {
        metric,
        value,
        threshold,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to log threshold warning:', error);
    throw error;
  }
}

// 封装监控指标超阈值日志的记录方法
export const monitoringLogs = {
  cpuUsage: (value: number, threshold: number) => 
    logThresholdWarning('CPU使用率', value, threshold),
  
  memoryUsage: (value: number, threshold: number) => 
    logThresholdWarning('内存使用率', value, threshold),
  
  diskUsage: (value: number, threshold: number) => 
    logThresholdWarning('磁盘使用率', value, threshold),
  
  networkTraffic: (value: number, threshold: number) => 
    logThresholdWarning('网络流量', value, threshold),
    
  diskIO: (value: number, threshold: number) => 
    logThresholdWarning('磁盘IO', value, threshold),
    
  systemLoad: (value: number, threshold: number) => 
    logThresholdWarning('系统负载', value, threshold)
};

export default {
  getLogs,
  getLogTypeStats,
  getLogSourceStats,
  getLogTimeStats,
  createLog,
  clearLogs,
  exportLogs,
  reseedLogs,
  logFrontendError,
  logThresholdWarning,
  monitoringLogs
};
