/**
 * 系统监控阈值配置
 * 当系统指标超过这些阈值时，将自动记录警告日志
 */

// CPU相关监控阈值
export const CPU_THRESHOLDS = {
  // CPU使用率警告阈值（百分比）
  USAGE_WARNING: 80,
  // CPU使用率危险阈值（百分比）
  USAGE_CRITICAL: 90,
  // CPU队列长度警告阈值
  QUEUE_LENGTH_WARNING: 5,
  // CPU队列长度危险阈值
  QUEUE_LENGTH_CRITICAL: 10,
  // CPU中断数警告阈值（每秒）
  INTERRUPTS_WARNING: 10000,
  // CPU上下文切换警告阈值（每秒）
  CONTEXT_SWITCHES_WARNING: 50000
};

// 内存相关监控阈值
export const MEMORY_THRESHOLDS = {
  // 内存使用率警告阈值（百分比）
  USAGE_WARNING: 80,
  // 内存使用率危险阈值（百分比）
  USAGE_CRITICAL: 90,
  // 提交内存百分比警告阈值
  COMMIT_PERCENTAGE_WARNING: 85,
  // 页面错误率警告阈值（每秒）
  PAGE_FAULTS_WARNING: 5000,
  // 交换操作警告阈值（每秒）
  SWAP_OPERATIONS_WARNING: 100
};

// 磁盘相关监控阈值
export const DISK_THRESHOLDS = {
  // 磁盘使用率警告阈值（百分比）
  USAGE_WARNING: 85,
  // 磁盘使用率危险阈值（百分比）
  USAGE_CRITICAL: 95,
  // 磁盘I/O警告阈值（MB/s）
  IO_WARNING: 80,
  // 磁盘I/O危险阈值（MB/s）
  IO_CRITICAL: 100,
  // 磁盘读取延迟警告阈值（毫秒）
  READ_LATENCY_WARNING: 20,
  // 磁盘写入延迟警告阈值（毫秒）
  WRITE_LATENCY_WARNING: 20,
  // 磁盘队列长度警告阈值
  QUEUE_LENGTH_WARNING: 5
};

// 网络相关监控阈值
export const NETWORK_THRESHOLDS = {
  // 网络带宽使用率警告阈值（百分比）
  BANDWIDTH_USAGE_WARNING: 70,
  // 网络带宽使用率危险阈值（百分比）
  BANDWIDTH_USAGE_CRITICAL: 90,
  // 网络流量警告阈值（MB/s）
  TRAFFIC_WARNING: 100,
  // 网络错误率警告阈值（百分比）
  ERROR_RATE_WARNING: 1.0,
  // 网络包丢失率警告阈值（百分比）
  PACKET_LOSS_WARNING: 0.5,
  // 输出队列长度警告阈值
  OUTPUT_QUEUE_WARNING: 10
};

// 系统相关监控阈值
export const SYSTEM_THRESHOLDS = {
  // 系统进程数警告阈值
  PROCESSES_WARNING: 500,
  // 系统线程数警告阈值
  THREADS_WARNING: 5000,
  // 服务停止警告阈值（停止服务数）
  STOPPED_SERVICES_WARNING: 5,
  // 系统调用率警告阈值（每秒）
  SYSTEM_CALLS_WARNING: 20000,
  // 异常分派率警告阈值（每秒）
  EXCEPTION_DISPATCHES_WARNING: 100
};

// 流量相关监控阈值
export const TRAFFIC_THRESHOLDS = {
  // 每秒请求数警告阈值
  REQUESTS_PER_SECOND_WARNING: 1000,
  // 每秒连接数警告阈值
  CONNECTIONS_PER_SECOND_WARNING: 500,
  // 单一IP访问频率警告阈值（每分钟）
  IP_FREQUENCY_WARNING: 1000,
  // 单一目标IP访问频率警告阈值（每分钟）
  DESTINATION_FREQUENCY_WARNING: 5000
};

// 综合所有阈值配置
export const MONITORING_THRESHOLDS = {
  CPU: CPU_THRESHOLDS,
  MEMORY: MEMORY_THRESHOLDS,
  DISK: DISK_THRESHOLDS,
  NETWORK: NETWORK_THRESHOLDS,
  SYSTEM: SYSTEM_THRESHOLDS,
  TRAFFIC: TRAFFIC_THRESHOLDS
};

export default MONITORING_THRESHOLDS; 