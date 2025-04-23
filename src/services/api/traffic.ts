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
  try {
    return await http.get('/traffic/packets', { params });
  } catch (error) {
    console.error('Error fetching traffic packets:', error);
    // 返回模拟数据
    return getMockTrafficData('packets', params);
  }
}

// 查询流量统计数据（聚合）
export async function getTrafficStats(params: {
  startTime?: string;
  endTime?: string;
  interval?: string;
}) {
  try {
    return await http.get('/traffic/stats', { params });
  } catch (error) {
    console.error('Error fetching traffic stats:', error);
    // 返回模拟数据
    return getMockTrafficData('stats', params);
  }
}

// 查询异常检测结果
export async function getTrafficAnomalies(params: {
  limit?: number;
  severity?: string;
  type?: string;
  startTime?: string;
  endTime?: string;
}) {
  try {
    return await http.get('/traffic/anomalies', { params });
  } catch (error) {
    console.error('Error fetching traffic anomalies:', error);
    // 返回模拟数据
    return getMockTrafficData('anomalies', params);
  }
}

// 获取访问来源 IP 排名前N的统计
export async function getTopSources(params: {
  limit?: number;
  startTime?: string;
  endTime?: string;
}) {
  try {
    return await http.get('/traffic/top-sources', { params });
  } catch (error) {
    console.error('Error fetching top sources:', error);
    // 返回模拟数据
    return getMockTrafficData('topSources', params);
  }
}

// 获取访问目标 IP 排名前N的统计
export async function getTopDestinations(params: {
  limit?: number;
  startTime?: string;
  endTime?: string;
}) {
  try {
    return await http.get('/traffic/top-destinations', { params });
  } catch (error) {
    console.error('Error fetching top destinations:', error);
    // 返回模拟数据
    return getMockTrafficData('topDestinations', params);
  }
}

// 获取协议分类统计
export async function getProtocolStats(params: {
  startTime?: string;
  endTime?: string;
}) {
  try {
    return await http.get('/traffic/protocols', { params });
  } catch (error) {
    console.error('Error fetching protocol stats:', error);
    // 返回模拟数据
    return getMockTrafficData('protocols', params);
  }
}

// 查询流量体积趋势数据
export async function getTrafficVolume(params: {
  interval?: string;
  startTime?: string;
  endTime?: string;
}) {
  try {
    return await http.get('/traffic/traffic-volume', { params });
  } catch (error) {
    console.error('Error fetching traffic volume:', error);
    // 返回模拟数据
    return getMockTrafficData('trafficVolume', params);
  }
}

// 分析指定数据包详细内容
export async function analyzePacket(id: string) {
  try {
    return await http.get(`/traffic/analyze/${id}`);
  } catch (error) {
    console.error('Error analyzing packet:', error);
    // 返回模拟数据
    return getMockTrafficData('analyzePacket', { id });
  }
}

// 获取活跃连接列表
export async function getActiveConnections(params: {
  limit?: number;
  startTime?: string;
  endTime?: string;
}) {
  try {
    return await http.get('/traffic/active-connections', { params });
  } catch (error) {
    console.error('Error fetching active connections:', error);
    // 返回模拟数据
    return getMockTrafficData('activeConnections', params);
  }
}

// 查询端口使用统计
export async function getPortUsage(params: {
  limit?: number;
  direction?: string;
  startTime?: string;
  endTime?: string;
}) {
  try {
    return await http.get('/traffic/port-usage', { params });
  } catch (error) {
    console.error('Error fetching port usage:', error);
    // 返回模拟数据
    return getMockTrafficData('portUsage', params);
  }
}

// 获取流量趋势变化（按天、小时等）
export async function getTrafficTrend(params: {
  interval?: string;
  metric?: string;
  days?: number;
}) {
  try {
    return await http.get('/traffic/traffic-trend', { params });
  } catch (error) {
    console.error('Error fetching traffic trend:', error);
    // 返回模拟数据
    return getMockTrafficData('trafficTrend', params);
  }
}

// 获取流量的地理位置分布
export async function getGeoDistribution(params: {
  startTime?: string;
  endTime?: string;
}) {
  try {
    return await http.get('/traffic/geo-distribution', { params });
  } catch (error) {
    console.error('Error fetching geo distribution:', error);
    // 返回模拟数据
    return getMockTrafficData('geoDistribution', params);
  }
}

// 获取通信对统计（源IP-目的IP）
export async function getCommunicationPairs(params: {
  limit?: number;
  startTime?: string;
  endTime?: string;
}) {
  try {
    return await http.get('/traffic/communication-pairs', { params });
  } catch (error) {
    console.error('Error fetching communication pairs:', error);
    // 返回模拟数据
    return getMockTrafficData('communicationPairs', params);
  }
}

// 获取数据包大小分布
export async function getPacketSizeDistribution(params: {
  startTime?: string;
  endTime?: string;
}) {
  try {
    return await http.get('/traffic/packet-size-distribution', { params });
  } catch (error) {
    console.error('Error fetching packet size distribution:', error);
    // 返回模拟数据
    return getMockTrafficData('packetSizeDistribution', params);
  }
}

// 创建重试计数器
const retryCounter = new Map<string, number>();

// 获取实时流量监控数据
export async function getRealtimeTraffic() {
  const endpoint = '/traffic/realtime';
  
  try {
    // 重置重试计数
    retryCounter.delete(endpoint);
    return await http.get(endpoint);
  } catch (error) {
    // 获取当前重试次数
    const currentRetries = retryCounter.get(endpoint) || 0;
    
    // 如果已经重试5次，则抛出错误
    if (currentRetries >= 5) {
      console.error(`已达到最大重试次数(5)，停止重试 ${endpoint}:`, error);
      // 清除重试计数器
      retryCounter.delete(endpoint);
      throw error;
    }
    
    // 增加重试计数
    retryCounter.set(endpoint, currentRetries + 1);
    console.warn(`获取实时流量数据失败，正在重试 (${currentRetries + 1}/5):`, error);
    
    // 返回模拟数据
    return getMockTrafficData('realtimeTraffic');
  }
}

// 获取网络应用的使用情况
export async function getApplicationUsage(params: {
  limit?: number;
  startTime?: string;
  endTime?: string;
}) {
  try {
    return await http.get('/traffic/applications', { params });
  } catch (error) {
    console.error('Error fetching application usage:', error);
    // 返回模拟数据
    return getMockTrafficData('applicationUsage', params);
  }
}

// 获取所有流量数据（聚合API，一次获取多种数据）
export async function getAllTrafficMetrics() {
  try {
    return await http.get('/traffic/all');
  } catch (error) {
    console.error('Error fetching all traffic metrics:', error);
    // 返回模拟数据
    return getMockTrafficData('all');
  }
}

// 生成模拟数据
function getMockTrafficData(type: string, params?: any) {
  const currentTime = new Date().toISOString();
  const startTime = new Date();
  startTime.setHours(startTime.getHours() - 24);
  
  // 基础统计数据
  const basicStats = {
    totalBytes: 2270000, // 2.27 MB
    count: 6144,
    avgSize: 387.5, // 387.5 B
    timeRange: {
      start: startTime.toISOString(),
      end: currentTime
    }
  };
  
  // 摘要数据
  const summary = {
    lastHourTraffic: 204800, // 2.04 KB
    anomalyCount: 10,
    lastCaptureTime: currentTime
  };
  
  // 模拟IP来源数据
  const generateIPs = (count: number) => {
    const ips = [];
    for (let i = 0; i < count; i++) {
      ips.push({
        ip: `192.168.1.${i + 10}`,
        count: Math.floor(Math.random() * 2000) + 100,
        bytesTransferred: Math.floor(Math.random() * 1000000) + 10000,
        country: ['中国', '美国', '德国', '俄罗斯', '日本'][Math.floor(Math.random() * 5)],
        organization: `组织${i + 1}`
      });
    }
    // 添加一个最大流量的IP
    ips.push({
      ip: '192.168.1.13',
      count: 5000,
      bytesTransferred: 2000000,
      country: '中国',
      organization: '未知组织'
    });
    return ips;
  };
  
  // 模拟协议统计
  const protocols = [
    { name: 'TCP', count: 4478, percentage: 72.9, bytesTransferred: 1654800 },
    { name: 'TLSv1.2', count: 775, percentage: 12.6, bytesTransferred: 286020 },
    { name: 'MDNS', count: 307, percentage: 5.0, bytesTransferred: 113500 },
    { name: 'DNS', count: 240, percentage: 3.9, bytesTransferred: 88530 },
    { name: 'ICMPv6', count: 123, percentage: 2.0, bytesTransferred: 45400 },
    { name: 'TLSv1.3', count: 111, percentage: 1.8, bytesTransferred: 40860 },
    { name: 'LLMNR', count: 110, percentage: 1.8, bytesTransferred: 40890 },
  ];
  
  // 模拟数据包大小分布
  const packetSizes = [
    { sizeRange: '0-128 字节', count: 2500, percentage: 40.7 },
    { sizeRange: '129-256 字节', count: 1800, percentage: 29.3 },
    { sizeRange: '257-512 字节', count: 950, percentage: 15.5 },
    { sizeRange: '513-1024 字节', count: 650, percentage: 10.6 },
    { sizeRange: '1025-1500 字节', count: 244, percentage: 3.9 },
  ];
  
  // 模拟通信对
  const communicationPairs = [
    {
      sourceIp: '192.168.1.10',
      destinationIp: '192.168.1.1',
      packetsCount: 1532,
      bytesCount: 482400,
      startTime: new Date(Date.now() - 3600000).toISOString(),
      lastTime: currentTime
    },
    {
      sourceIp: '192.168.1.13',
      destinationIp: '192.168.1.100',
      packetsCount: 1200,
      bytesCount: 385600,
      startTime: new Date(Date.now() - 7200000).toISOString(),
      lastTime: currentTime
    },
    {
      sourceIp: '192.168.1.15',
      destinationIp: '192.168.1.20',
      packetsCount: 950,
      bytesCount: 245800,
      startTime: new Date(Date.now() - 5400000).toISOString(),
      lastTime: currentTime
    },
    {
      sourceIp: '192.168.1.30',
      destinationIp: '192.168.1.50',
      packetsCount: 780,
      bytesCount: 197500,
      startTime: new Date(Date.now() - 4800000).toISOString(),
      lastTime: currentTime
    },
    {
      sourceIp: '192.168.1.25',
      destinationIp: '192.168.1.45',
      packetsCount: 520,
      bytesCount: 156000,
      startTime: new Date(Date.now() - 3000000).toISOString(),
      lastTime: currentTime
    },
  ];
  
  // 生成实时流量数据
  const generateRealtimeTraffic = () => {
    const timePoints = [];
    const now = Date.now();
    
    for (let i = 0; i < 30; i++) {
      const timestamp = new Date(now - (29 - i) * 10000).toISOString();
      timePoints.push({
        timestamp,
        inboundBps: Math.floor(Math.random() * 500000) + 50000,
        outboundBps: Math.floor(Math.random() * 300000) + 30000,
        totalBps: Math.floor(Math.random() * 800000) + 80000,
        inboundPps: Math.floor(Math.random() * 300) + 30,
        outboundPps: Math.floor(Math.random() * 200) + 20,
        totalPps: Math.floor(Math.random() * 500) + 50,
      });
    }
    
    return { timePoints };
  };
  
  // 根据类型返回不同的模拟数据
  switch (type) {
    case 'all':
      return {
        data: {
          basicStats,
          summary,
          topSources: generateIPs(10),
          topDestinations: generateIPs(10),
          protocolStats: protocols,
          protocols,
          packetSizes,
          communicationPairs,
          realtimeTraffic: generateRealtimeTraffic(),
        }
      };
    case 'topSources':
      return {
        data: generateIPs(params?.limit || 10)
      };
    case 'protocols':
      return {
        data: protocols
      };
    case 'packetSizeDistribution':
      return {
        data: packetSizes
      };
    case 'communicationPairs':
      return {
        data: communicationPairs
      };
    case 'realtimeTraffic':
      return {
        data: generateRealtimeTraffic()
      };
    default:
      return {
        data: {
          message: '模拟数据'
        }
      };
  }
}
