import http from '@/lib/http';

// 查询流量数据包，支持分页、筛选
export async function getTrafficPackets(params: {
  page?: number;
  limit?: number;
  sourceIp?: string;
  destinationIp?: string;
  protocol?: string;
  startTime?: string;
  endTime?: string;
}) {
  return await http.get('/traffic/packets', { params });
}

// 查询流量统计数据（聚合）
export async function getTrafficStats(params: {
  startTime?: string;
  endTime?: string;
  interval?: string;
}) {
  return await http.get('/traffic/stats', { params });
}

// 查询异常检测结果
export async function getTrafficAnomalies(params: {
  limit?: number;
  severity?: string;
  type?: string;
  startTime?: string;
  endTime?: string;
}) {
  return await http.get('/traffic/anomalies', { params });
}

// 获取访问来源 IP 排名前N的统计
export async function getTopSources(params: {
  limit?: number;
  startTime?: string;
  endTime?: string;
}) {
  return await http.get('/traffic/top-sources', { params });
}

// 获取访问目标 IP 排名前N的统计
export async function getTopDestinations(params: {
  limit?: number;
  startTime?: string;
  endTime?: string;
}) {
  return await http.get('/traffic/top-destinations', { params });
}

// 获取协议分类统计
export async function getProtocolStats(params: {
  startTime?: string;
  endTime?: string;
}) {
  return await http.get('/traffic/protocols', { params });
}

// 查询流量体积趋势数据
export async function getTrafficVolume(params: {
  interval?: string;
  startTime?: string;
  endTime?: string;
}) {
  return await http.get('/traffic/traffic-volume', { params });
}

// 分析指定数据包详细内容
export async function analyzePacket(id: string) {
  return await http.get(`/traffic/analyze/${id}`);
}

// 获取活跃连接列表
export async function getActiveConnections(params: {
  limit?: number;
  startTime?: string;
  endTime?: string;
}) {
  return await http.get('/traffic/active-connections', { params });
}

// 查询端口使用统计
export async function getPortUsage(params: {
  limit?: number;
  direction?: string;
  startTime?: string;
  endTime?: string;
}) {
  return await http.get('/traffic/port-usage', { params });
}

// 获取流量趋势变化（按天、小时等）
export async function getTrafficTrend(params: {
  interval?: string;
  metric?: string;
  days?: number;
}) {
  return await http.get('/traffic/traffic-trend', { params });
}

// 获取流量的地理位置分布
export async function getGeoDistribution(params: {
  startTime?: string;
  endTime?: string;
}) {
  return await http.get('/traffic/geo-distribution', { params });
}

// 获取通信对统计（源IP-目的IP）
export async function getCommunicationPairs(params: {
  limit?: number;
  startTime?: string;
  endTime?: string;
}) {
  return await http.get('/traffic/communication-pairs', { params });
}

// 获取数据包大小分布
export async function getPacketSizeDistribution(params: {
  startTime?: string;
  endTime?: string;
}) {
  return await http.get('/traffic/packet-size-distribution', { params });
}

// 获取实时流量监控数据
export async function getRealtimeTraffic() {
  return await http.get('/traffic/realtime');
}

// 获取网络应用的使用情况
export async function getApplicationUsage(params: {
  limit?: number;
  startTime?: string;
  endTime?: string;
}) {
  return await http.get('/traffic/applications', { params });
}

// 获取所有流量数据（聚合API，一次获取多种数据）
export async function getAllTrafficMetrics() {
  return await http.get('/traffic/all');
}
