import http from '@/lib/http';

// 节点类型定义
export interface TopologyNode {
  id: string;
  name: string;
  value: number;
  type: 'internal' | 'external';
  category: number;
  packetsSent: number;
  packetsReceived: number;
  totalBytesSent: number;
  totalBytesReceived: number;
  protocols: Record<string, number>;
  mainProtocol: string;
  // 节点坐标
  x?: number;
  y?: number;
}

// 连接线类型定义
export interface TopologyLink {
  source: string;
  target: string;
  value: number;
  protocol: string;
  packets: number;
  bytes: number;
}

// 拓扑总结信息
export interface TopologySummary {
  nodeCount: number;
  linkCount: number;
  internalNodes: number;
  externalNodes: number;
  totalPackets: number;
}

// 拓扑数据
export interface TopologyData {
  nodes: TopologyNode[];
  links: TopologyLink[];
  summary: TopologySummary;
}

// 连接的节点信息
export interface ConnectedNode {
  ip: string;
  packetsSent: number;
  packetsReceived: number;
  totalBytes: number;
}

// 协议分布信息
export interface ProtocolDistribution {
  protocol: string;
  count: number;
  percentage: number;
}

// 流量趋势信息
export interface TrafficTrend {
  time: string;
  packets: number;
  bytes: number;
}

// 节点详细信息
export interface NodeDetails {
  nodeId: string;
  totalPacketsSent: number;
  totalPacketsReceived: number;
  totalBytesSent: number;
  totalBytesReceived: number;
  connectedNodes: ConnectedNode[];
  protocolDistribution: ProtocolDistribution[];
  trafficTrend: TrafficTrend[];
}

// 请求选项类型
export interface RequestOptions {
  signal?: AbortSignal;
  timeout?: number;
}

// 是否使用模拟数据 - 已设置为禁用状态，生产环境中必须使用真实数据
const USE_MOCK_DATA: boolean = false as const; // 使用 const 断言确保值不变
// 如果需要在开发环境中临时启用，请使用环境变量控制，不要直接修改此常量
// const USE_MOCK_DATA = process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_MOCK === 'true';

/**
 * 获取网络拓扑图数据
 * @param startTime 开始时间
 * @param endTime 结束时间
 * @param options 请求选项
 * @returns 拓扑数据响应
 */
export async function getNetworkTopology(
  startTime?: string, 
  endTime?: string,
  options: RequestOptions = {}
) {
  if (USE_MOCK_DATA) {
    console.log('使用模拟拓扑数据');
    return generateMockTopologyData();
  }

  const params: Record<string, string> = {};
  if (startTime) params.startTime = startTime;
  if (endTime) params.endTime = endTime;
  
  return await getTopologyData('/topology', params, options);
}

/**
 * 获取节点详细信息
 * @param nodeId 节点ID
 * @param startTime 开始时间
 * @param endTime 结束时间
 * @param options 请求选项
 * @returns 节点详情响应
 */
export async function getNodeDetails(
  nodeId: string, 
  startTime?: string, 
  endTime?: string,
  options: RequestOptions = {}
) {
  if (!nodeId) {
    throw new Error('节点ID不能为空');
  }

  if (USE_MOCK_DATA) {
    console.log('使用模拟节点详情数据:', nodeId);
    return generateMockNodeDetails(nodeId);
  }

  const params: Record<string, string> = {};
  if (startTime) params.startTime = startTime;
  if (endTime) params.endTime = endTime;
  
  return await getTopologyData(`/topology/node/${nodeId}`, params, options);
}

/**
 * 通用的拓扑数据请求方法
 * @param endpoint API端点
 * @param params 请求参数
 * @param options 请求选项
 * @returns 响应数据
 */
async function getTopologyData(
  endpoint: string, 
  params: Record<string, string> = {}, 
  options: RequestOptions = {}
) {
  try {
    console.log('请求API:', endpoint, params);
    const response = await http.get(endpoint, { 
      params,
      signal: options.signal,
      timeout: options.timeout
    });
    return response;
  } catch (error) {
    console.error(`获取数据失败 ${endpoint}:`, error);
    throw error;
  }
}

// 生成模拟拓扑数据 (保留原有实现，但简化为只导出数据部分)
function generateMockTopologyData(): TopologyData {
  // 生成模拟节点
  const nodes: TopologyNode[] = [
    {
      id: "192.168.1.1",
      name: "路由器",
      value: 40,
      type: "internal",
      category: 0,
      packetsSent: 450,
      packetsReceived: 500,
      totalBytesSent: 120000,
      totalBytesReceived: 150000,
      protocols: {
        "TCP": 800,
        "UDP": 150
      },
      mainProtocol: "TCP"
    },
    {
      id: "192.168.1.13",
      name: "工作站1",
      value: 31,
      type: "internal",
      category: 0,
      packetsSent: 140,
      packetsReceived: 170,
      totalBytesSent: 31590,
      totalBytesReceived: 85160,
      protocols: {
        "TCP": 300,
        "NBNS": 10
      },
      mainProtocol: "TCP"
    },
    {
      id: "192.168.1.14",
      name: "工作站2",
      value: 25,
      type: "internal",
      category: 0,
      packetsSent: 120,
      packetsReceived: 150,
      totalBytesSent: 25000,
      totalBytesReceived: 65000,
      protocols: {
        "TCP": 250,
        "HTTP": 20
      },
      mainProtocol: "TCP"
    },
    {
      id: "192.168.1.15",
      name: "服务器",
      value: 50,
      type: "internal",
      category: 0,
      packetsSent: 200,
      packetsReceived: 300,
      totalBytesSent: 85000,
      totalBytesReceived: 120000,
      protocols: {
        "TCP": 400,
        "HTTP": 100
      },
      mainProtocol: "TCP"
    },
    {
      id: "20.189.173.6",
      name: "外部服务器1",
      value: 15,
      type: "external",
      category: 1,
      packetsSent: 50,
      packetsReceived: 60,
      totalBytesSent: 15000,
      totalBytesReceived: 18000,
      protocols: {
        "TCP": 110
      },
      mainProtocol: "TCP"
    },
    {
      id: "120.241.254.165",
      name: "外部服务器2",
      value: 22,
      type: "external",
      category: 1,
      packetsSent: 130,
      packetsReceived: 90,
      totalBytesSent: 82800,
      totalBytesReceived: 28390,
      protocols: {
        "TCP": 220
      },
      mainProtocol: "TCP"
    },
    {
      id: "36.151.177.28",
      name: "CDN节点",
      value: 18,
      type: "external",
      category: 1,
      packetsSent: 80,
      packetsReceived: 70,
      totalBytesSent: 28000,
      totalBytesReceived: 22000,
      protocols: {
        "TCP": 120,
        "HTTP": 30
      },
      mainProtocol: "TCP"
    },
    {
      id: "192.168.1.255",
      name: "广播地址",
      value: 8,
      type: "internal",
      category: 0,
      packetsSent: 0,
      packetsReceived: 30,
      totalBytesSent: 0,
      totalBytesReceived: 4500,
      protocols: {
        "NBNS": 30
      },
      mainProtocol: "NBNS"
    },
    {
      id: "74.125.24.100",
      name: "Google服务器",
      value: 30,
      type: "external",
      category: 1,
      packetsSent: 100,
      packetsReceived: 120,
      totalBytesSent: 40000,
      totalBytesReceived: 48000,
      protocols: {
        "TCP": 180,
        "HTTPS": 40
      },
      mainProtocol: "TCP"
    },
    {
      id: "157.240.22.35",
      name: "Facebook服务器",
      value: 25,
      type: "external",
      category: 1,
      packetsSent: 80,
      packetsReceived: 90,
      totalBytesSent: 32000,
      totalBytesReceived: 36000,
      protocols: {
        "TCP": 150,
        "HTTPS": 20
      },
      mainProtocol: "TCP"
    }
  ];

  // 生成模拟连接
  const links: TopologyLink[] = [
    // 路由器连接
    {
      source: "192.168.1.1",
      target: "192.168.1.13",
      value: 10,
      protocol: "TCP",
      packets: 300,
      bytes: 80000
    },
    {
      source: "192.168.1.1",
      target: "192.168.1.14",
      value: 8,
      protocol: "TCP",
      packets: 250,
      bytes: 65000
    },
    {
      source: "192.168.1.1",
      target: "192.168.1.15",
      value: 12,
      protocol: "TCP",
      packets: 350,
      bytes: 90000
    },
    {
      source: "192.168.1.1",
      target: "20.189.173.6",
      value: 6,
      protocol: "TCP",
      packets: 100,
      bytes: 30000
    },
    {
      source: "192.168.1.1",
      target: "120.241.254.165",
      value: 7,
      protocol: "TCP",
      packets: 180,
      bytes: 45000
    },
    {
      source: "192.168.1.1",
      target: "74.125.24.100",
      value: 9,
      protocol: "TCP",
      packets: 200,
      bytes: 70000
    },
    {
      source: "192.168.1.1",
      target: "157.240.22.35",
      value: 8,
      protocol: "TCP",
      packets: 170,
      bytes: 60000
    },
    
    // 工作站1连接
    {
      source: "192.168.1.13",
      target: "20.189.173.6",
      value: 3,
      protocol: "TCP",
      packets: 50,
      bytes: 12000
    },
    {
      source: "192.168.1.13",
      target: "120.241.254.165",
      value: 6,
      protocol: "TCP",
      packets: 90,
      bytes: 28000
    },
    {
      source: "192.168.1.13",
      target: "192.168.1.15",
      value: 8,
      protocol: "TCP",
      packets: 120,
      bytes: 35000
    },
    
    // 工作站2连接
    {
      source: "192.168.1.14",
      target: "36.151.177.28",
      value: 5,
      protocol: "TCP",
      packets: 80,
      bytes: 22000
    },
    {
      source: "192.168.1.14",
      target: "192.168.1.15",
      value: 7,
      protocol: "TCP",
      packets: 110,
      bytes: 32000
    },
    {
      source: "192.168.1.14",
      target: "74.125.24.100",
      value: 6,
      protocol: "HTTPS",
      packets: 100,
      bytes: 30000
    },
    
    // 服务器连接
    {
      source: "192.168.1.15",
      target: "120.241.254.165",
      value: 9,
      protocol: "TCP",
      packets: 160,
      bytes: 50000
    },
    {
      source: "192.168.1.15",
      target: "74.125.24.100",
      value: 7,
      protocol: "HTTPS",
      packets: 120,
      bytes: 38000
    },
    
    // 广播连接
    {
      source: "192.168.1.13",
      target: "192.168.1.255",
      value: 2,
      protocol: "NBNS",
      packets: 10,
      bytes: 2000
    },
    {
      source: "192.168.1.14",
      target: "192.168.1.255",
      value: 2,
      protocol: "NBNS",
      packets: 8,
      bytes: 1600
    }
  ];

  // 生成模拟摘要
  const summary: TopologySummary = {
    nodeCount: nodes.length,
    linkCount: links.length,
    internalNodes: nodes.filter(node => node.type === 'internal').length,
    externalNodes: nodes.filter(node => node.type === 'external').length,
    totalPackets: 5000
  };

  return { nodes, links, summary };
}

// 生成模拟节点详情数据 (保留原有实现，但简化为只导出数据部分)
function generateMockNodeDetails(nodeId: string): NodeDetails {
  // 创建模拟连接节点
  const connectedNodes: ConnectedNode[] = [
    { ip: "20.189.173.6", packetsSent: 6, packetsReceived: 4, totalBytes: 1132 },
    { ip: "120.241.254.165", packetsSent: 75, packetsReceived: 87, totalBytes: 66650 },
    { ip: "36.151.177.28", packetsSent: 17, packetsReceived: 10, totalBytes: 4384 },
    { ip: "192.168.1.255", packetsSent: 3, packetsReceived: 0, totalBytes: 276 },
    { ip: "120.241.254.171", packetsSent: 1, packetsReceived: 1, totalBytes: 108 }
  ];

  // 创建模拟协议分布
  const protocolDistribution: ProtocolDistribution[] = [
    { protocol: "TCP", count: 1542, percentage: 77.1 },
    { protocol: "NBNS", count: 3, percentage: 0.15 },
    { protocol: "TLSV1.3", count: 55, percentage: 2.75 },
    { protocol: "TLSV1.2", count: 320, percentage: 16 },
    { protocol: "SSL", count: 19, percentage: 0.95 }
  ];

  // 创建模拟流量趋势
  const trafficTrend: TrafficTrend[] = [
    { time: "2025-04-19 16:00", packets: 992, bytes: 390115 },
    { time: "2025-04-20 13:00", packets: 1008, bytes: 453511 }
  ];

  // 返回模拟数据
  return {
    nodeId,
    totalPacketsSent: 1000,
    totalPacketsReceived: 1000,
    totalBytesSent: 184481,
    totalBytesReceived: 659145,
    connectedNodes,
    protocolDistribution,
    trafficTrend
  };
}

