import http from '@/lib/http'

interface DiskAllMetrics {
  avgReadRequestsQueued: any[];
  avgWriteRequestsQueued: any[];
  freeBytes: any[];
  idleSeconds: any[];
  readBytesTotal: any[];
  readLatencySeconds: any[];
  readSeconds: any[];
  writeBytesTotal: any[];
  writeLatencySeconds: any[];
  writeSeconds: any[];
}

// 获取磁盘平均读取请求队列
export async function getAvgReadRequestsQueued() {
  return await getDiskMetric('/metrics/disk/avg-read-requests-queued');
}

// 获取磁盘平均写入请求队列
export async function getAvgWriteRequestsQueued() {
  return await getDiskMetric('/metrics/disk/avg-write-requests-queued');
}

// 获取磁盘剩余空间
export async function getFreeBytes() {
  return await getDiskMetric('/metrics/disk/free-bytes');
}

// 获取磁盘空闲时间
export async function getIdleSeconds() {
  return await getDiskMetric('/metrics/disk/idle-seconds');
}

// 获取磁盘读取的总字节数
export async function getReadBytesTotal() {
  return await getDiskMetric('/metrics/disk/read-bytes-total');
}

// 获取磁盘读取延迟
export async function getReadLatencySeconds() {
  return await getDiskMetric('/metrics/disk/read-latency-seconds');
}

// 获取磁盘读取总时间
export async function getReadSeconds() {
  return await getDiskMetric('/metrics/disk/read-seconds');
}

// 获取磁盘写入的总字节数
export async function getWriteBytesTotal() {
  return await getDiskMetric('/metrics/disk/write-bytes-total');
}

// 获取磁盘写入延迟
export async function getWriteLatencySeconds() {
  return await getDiskMetric('/metrics/disk/write-latency-seconds');
}

// 获取磁盘写入总时间
export async function getWriteSeconds() {
  return await getDiskMetric('/metrics/disk/write-seconds');
}

// 获取所有磁盘指标
export async function getDiskAllMetrics(): Promise<DiskAllMetrics> {
  try {
    const response = await http.get('/metrics/disk/all');
    return response;
  } catch (error) {
    console.error('Failed to fetch all disk metrics:', error);
    throw error;
  }
}

// 通用的磁盘数据请求方法
async function getDiskMetric(endpoint: string) {
  try {
    const response = await http.get(endpoint);
    return response;
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    throw error;
  }
}
