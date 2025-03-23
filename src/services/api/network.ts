import http from '@/lib/http';

// 获取接收的字节数
export async function getBytesReceived() {
  return await getNetworkUsage('/metrics/network/bytes-received');
}

// 获取发送的字节数
export async function getBytesSent() {
  return await getNetworkUsage('/metrics/network/bytes-sent');
}

// 获取总字节数
export async function getBytesTotal() {
  return await getNetworkUsage('/metrics/network/bytes-total');
}

// 获取当前带宽
export async function getCurrentBandwidth() {
  return await getNetworkUsage('/metrics/network/current-bandwidth');
}

// 获取输出队列长度
export async function getOutputQueueLength() {
  return await getNetworkUsage('/metrics/network/output-queue-length');
}

// 获取接收的数据包数
export async function getPacketsReceived() {
  return await getNetworkUsage('/metrics/network/packets-received');
}

// 获取发送的数据包数
export async function getPacketsSent() {
  return await getNetworkUsage('/metrics/network/packets-sent');
}

// 获取总数据包数
export async function getPacketsTotal() {
  return await getNetworkUsage('/metrics/network/packets-total');
}

// 获取网卡地址信息
export async function getNicAddressInfo() {
  return await getNetworkUsage('/metrics/network/nic-address-info');
}

// 获取发送数据包错误数
export async function getPacketsOutboundErrors() {
  return await getNetworkUsage('/metrics/network/packets-outbound-errors');
}

// 获取接收数据包错误数
export async function getPacketsReceivedErrors() {
  return await getNetworkUsage('/metrics/network/packets-received-errors');
}

// 获取被丢弃的接收数据包数
export async function getPacketsReceivedDiscarded() {
  return await getNetworkUsage('/metrics/network/packets-received-discarded');
}

// 获取被丢弃的发送数据包数
export async function getPacketsOutboundDiscarded() {
  return await getNetworkUsage('/metrics/network/packets-outbound-discarded');
}

// 获取未知协议的接收数据包数
export async function getPacketsReceivedUnknown() {
  return await getNetworkUsage('/metrics/network/packets-received-unknown');
}

// 获取所有网络相关的指标
export async function getNetworkAllMetrics() {
  return await getNetworkUsage('/metrics/network/all');
}

// 通用的网络数据请求方法
async function getNetworkUsage(endpoint) {
  try {
    const response = await http.get(endpoint);
    return response;
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    throw error;
  }
}
