import { StateCreator } from 'zustand';
import {
  getAllTrafficMetrics,
  getTrafficPackets,
  getTrafficStats,
  getTrafficAnomalies,
  getTopSources,
  getTopDestinations,
  getProtocolStats,
  getTrafficVolume,
  getActiveConnections,
  getGeoDistribution,
  getRealtimeTraffic
} from '@/services/api/traffic';
import { StoreState } from '../index';

// 定义数据包类型
export interface TrafficPacket {
  id: string;
  timestamp: string;
  sourceIp: string;
  destinationIp: string;
  sourcePort: number;
  destinationPort: number;
  protocol: string;
  size: number;
  flags?: string;
  ttl?: number;
  payload?: string;
}

// 定义地理位置分布数据
export interface GeoLocation {
  country: string;
  latitude: number;
  longitude: number;
  count: number;
  totalBytes: number;
}

// 定义异常数据类型
export interface TrafficAnomaly {
  id: string;
  timestamp: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  sourceIp: string;
  destinationIp: string;
  details: string;
  resolved: boolean;
}

// 定义通信对类型
export interface CommunicationPair {
  sourceIp: string;
  destinationIp: string;
  packetsCount: number;
  bytesCount: number;
  startTime: string;
  lastTime: string;
}

// 定义端口使用统计
export interface PortUsage {
  port: number;
  protocol: string;
  service?: string;
  count: number;
  totalBytes: number;
  direction: 'inbound' | 'outbound';
}

// 定义活跃连接
export interface ActiveConnection {
  id: string;
  sourceIp: string;
  destinationIp: string;
  sourcePort: number;
  destinationPort: number;
  protocol: string;
  state: string;
  duration: number;
  bytesIn: number;
  bytesOut: number;
  processName?: string;
}

// 定义应用使用情况
export interface ApplicationUsage {
  application: string;
  bytesIn: number;
  bytesOut: number;
  packetsIn: number;
  packetsOut: number;
  connections: number;
}

// 定义流量趋势点
export interface TrafficPoint {
  timestamp: string;
  value: number;
}

// 定义协议统计
export interface ProtocolStat {
  name: string; 
  count: number;
  percentage: number;
  bytesTransferred: number;
}

// 定义IP排名
export interface IPRanking {
  ip: string;
  count: number;
  bytesTransferred: number;
  country?: string;
  organization?: string;
}

// 定义包大小分布
export interface PacketSizeDistribution {
  sizeRange: string;
  count: number;
  percentage: number;
}

// 定义实时流量数据
export interface RealtimeTraffic {
  timestamp: string;
  inboundBps: number;
  outboundBps: number;
  totalBps: number;
  inboundPps: number;
  outboundPps: number;
  totalPps: number;
}

// 定义流量状态
export interface TrafficMetricsState {
  // 基本流量数据
  packets: TrafficPacket[];
  totalPackets: number;
  totalPages: number;
  
  // 统计数据
  stats: {
    totalBytes: number;
    totalPackets: number;
    averagePacketSize: number;
    bytePerSecond: number;
    packetPerSecond: number;
    startTime: string;
    endTime: string;
  };
  
  // 排名数据
  topSources: IPRanking[];
  topDestinations: IPRanking[];
  
  // 协议统计
  protocols: ProtocolStat[];
  
  // 异常检测
  anomalies: TrafficAnomaly[];
  
  // 流量体积趋势
  trafficVolume: {
    inbound: TrafficPoint[];
    outbound: TrafficPoint[];
    total: TrafficPoint[];
  };
  
  // 活跃连接
  activeConnections: ActiveConnection[];
  
  // 端口使用统计
  portUsage: PortUsage[];
  
  // 通信对统计
  communicationPairs: CommunicationPair[];
  
  // 地理位置分布
  geoDistribution: GeoLocation[];
  
  // 包大小分布
  packetSizeDistribution: PacketSizeDistribution[];
  
  // 实时流量
  realtimeTraffic: RealtimeTraffic[];
  
  // 应用使用情况
  applications: ApplicationUsage[];
  
  // 状态管理
  error: string | null;
  isLoading: boolean;
  isPolling: boolean;
}

// 定义流量操作
export interface TrafficMetricsActions {
  fetchTrafficPackets: (params?: any) => Promise<void>;
  fetchTrafficStats: (params?: any) => Promise<void>;
  fetchTrafficAnomalies: (params?: any) => Promise<void>;
  fetchTopSources: (params?: any) => Promise<void>;
  fetchTopDestinations: (params?: any) => Promise<void>;
  fetchProtocolStats: (params?: any) => Promise<void>;
  fetchTrafficVolume: (params?: any) => Promise<void>;
  fetchActiveConnections: (params?: any) => Promise<void>;
  fetchGeoDistribution: (params?: any) => Promise<void>;
  fetchAllTrafficMetrics: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
  fetchRealtimeTraffic: () => Promise<void>;
  updateTrafficMetrics: (metrics: Partial<TrafficMetricsState>) => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export type TrafficMetricsSlice = TrafficMetricsState & TrafficMetricsActions;

// 初始状态
const initialState: TrafficMetricsState = {
  packets: [],
  totalPackets: 0,
  totalPages: 0,
  stats: {
    totalBytes: 0,
    totalPackets: 0,
    averagePacketSize: 0,
    bytePerSecond: 0,
    packetPerSecond: 0,
    startTime: '',
    endTime: '',
  },
  topSources: [],
  topDestinations: [],
  protocols: [],
  anomalies: [],
  trafficVolume: {
    inbound: [],
    outbound: [],
    total: [],
  },
  activeConnections: [],
  portUsage: [],
  communicationPairs: [],
  geoDistribution: [],
  packetSizeDistribution: [],
  realtimeTraffic: [],
  applications: [],
  error: null,
  isLoading: false,
  isPolling: false,
};

export const createTrafficMetricsSlice: StateCreator<
  StoreState,
  [],
  [],
  TrafficMetricsSlice
> = (set, get) => {
  let pollingInterval: NodeJS.Timeout | null = null;
  let realtimeInterval: NodeJS.Timeout | null = null;
  
  const updateTraffic = (newState: Partial<TrafficMetricsState>) =>
    set(state => ({ traffic: { ...state.traffic, ...newState } }));
  
  return {
    ...initialState,
    
    fetchTrafficPackets: async (params = {}) => {
      try {
        updateTraffic({ isLoading: true, error: null });
        const response = await getTrafficPackets(params);
        updateTraffic({
          packets: response.data?.packets || [],
          totalPackets: response.data?.total || 0,
          totalPages: response.data?.totalPages || 0,
          isLoading: false
        });
      } catch (error) {
        console.error('获取流量数据包失败:', error);
        const errorMessage = error instanceof Error ? error.message : '获取数据失败，请稍后重试';
        updateTraffic({ error: errorMessage, isLoading: false });
      }
    },
    
    fetchTrafficStats: async (params = {}) => {
      try {
        updateTraffic({ isLoading: true, error: null });
        const response = await getTrafficStats(params);
        updateTraffic({
          stats: response.data || initialState.stats,
          isLoading: false
        });
      } catch (error) {
        console.error('获取流量统计数据失败:', error);
        const errorMessage = error instanceof Error ? error.message : '获取数据失败，请稍后重试';
        updateTraffic({ error: errorMessage, isLoading: false });
      }
    },
    
    fetchTrafficAnomalies: async (params = {}) => {
      try {
        updateTraffic({ isLoading: true, error: null });
        const response = await getTrafficAnomalies(params);
        updateTraffic({
          anomalies: response.data || [],
          isLoading: false
        });
      } catch (error) {
        console.error('获取流量异常数据失败:', error);
        const errorMessage = error instanceof Error ? error.message : '获取数据失败，请稍后重试';
        updateTraffic({ error: errorMessage, isLoading: false });
      }
    },
    
    fetchTopSources: async (params = {}) => {
      try {
        updateTraffic({ isLoading: true, error: null });
        const response = await getTopSources(params);
        updateTraffic({
          topSources: response.data || [],
          isLoading: false
        });
      } catch (error) {
        console.error('获取来源IP排名失败:', error);
        const errorMessage = error instanceof Error ? error.message : '获取数据失败，请稍后重试';
        updateTraffic({ error: errorMessage, isLoading: false });
      }
    },
    
    fetchTopDestinations: async (params = {}) => {
      try {
        updateTraffic({ isLoading: true, error: null });
        const response = await getTopDestinations(params);
        updateTraffic({
          topDestinations: response.data || [],
          isLoading: false
        });
      } catch (error) {
        console.error('获取目标IP排名失败:', error);
        const errorMessage = error instanceof Error ? error.message : '获取数据失败，请稍后重试';
        updateTraffic({ error: errorMessage, isLoading: false });
      }
    },
    
    fetchProtocolStats: async (params = {}) => {
      try {
        updateTraffic({ isLoading: true, error: null });
        const response = await getProtocolStats(params);
        updateTraffic({
          protocols: response.data || [],
          isLoading: false
        });
      } catch (error) {
        console.error('获取协议统计失败:', error);
        const errorMessage = error instanceof Error ? error.message : '获取数据失败，请稍后重试';
        updateTraffic({ error: errorMessage, isLoading: false });
      }
    },
    
    fetchTrafficVolume: async (params = {}) => {
      try {
        updateTraffic({ isLoading: true, error: null });
        const response = await getTrafficVolume(params);
        updateTraffic({
          trafficVolume: response.data || initialState.trafficVolume,
          isLoading: false
        });
      } catch (error) {
        console.error('获取流量体积趋势数据失败:', error);
        const errorMessage = error instanceof Error ? error.message : '获取数据失败，请稍后重试';
        updateTraffic({ error: errorMessage, isLoading: false });
      }
    },
    
    fetchActiveConnections: async (params = {}) => {
      try {
        updateTraffic({ isLoading: true, error: null });
        const response = await getActiveConnections(params);
        updateTraffic({
          activeConnections: response.data || [],
          isLoading: false
        });
      } catch (error) {
        console.error('获取活跃连接失败:', error);
        const errorMessage = error instanceof Error ? error.message : '获取数据失败，请稍后重试';
        updateTraffic({ error: errorMessage, isLoading: false });
      }
    },
    
    fetchGeoDistribution: async (params = {}) => {
      try {
        updateTraffic({ isLoading: true, error: null });
        const response = await getGeoDistribution(params);
        updateTraffic({
          geoDistribution: response.data || [],
          isLoading: false
        });
      } catch (error) {
        console.error('获取地理位置分布失败:', error);
        const errorMessage = error instanceof Error ? error.message : '获取数据失败，请稍后重试';
        updateTraffic({ error: errorMessage, isLoading: false });
      }
    },
    
    fetchRealtimeTraffic: async () => {
      try {
        // 实时数据不设置loading，避免UI闪烁
        const response = await getRealtimeTraffic();
        const trafficState = get().traffic;
        
        // 保持最近30个数据点
        let newRealtimeTraffic = [...trafficState.realtimeTraffic];
        if (response.data) {
          newRealtimeTraffic.push(response.data);
          if (newRealtimeTraffic.length > 30) {
            newRealtimeTraffic = newRealtimeTraffic.slice(-30);
          }
        }
        
        updateTraffic({
          realtimeTraffic: newRealtimeTraffic
        });
      } catch (error) {
        console.error('获取实时流量数据失败:', error);
        // 对于实时数据，我们不设置全局错误状态
      }
    },
    
    fetchAllTrafficMetrics: async () => {
      const trafficState = get().traffic;
      if (trafficState.isLoading) return;
      
      try {
        updateTraffic({ isLoading: true, error: null });
        
        const response = await getAllTrafficMetrics();
        const allMetrics = response.data || {};
        
        updateTraffic({
          packets: allMetrics.packets?.data || [],
          totalPackets: allMetrics.packets?.total || 0,
          stats: allMetrics.stats || initialState.stats,
          topSources: allMetrics.topSources || [],
          topDestinations: allMetrics.topDestinations || [],
          protocols: allMetrics.protocols || [],
          anomalies: allMetrics.anomalies || [],
          trafficVolume: allMetrics.trafficVolume || initialState.trafficVolume,
          activeConnections: allMetrics.activeConnections || [],
          geoDistribution: allMetrics.geoDistribution || [],
          packetSizeDistribution: allMetrics.packetSizeDistribution || [],
          applications: allMetrics.applications || [],
          isLoading: false
        });
      } catch (error) {
        console.error('获取所有流量数据失败:', error);
        const errorMessage = error instanceof Error ? error.message : '获取数据失败，请稍后重试';
        updateTraffic({ error: errorMessage, isLoading: false });
      }
    },
    
    updateTrafficMetrics: (metrics) => updateTraffic(metrics),
    setError: (error) => updateTraffic({ error }),
    setLoading: (isLoading) => updateTraffic({ isLoading }),
    
    startPolling: () => {
      const currentState = get().traffic;
      // 如果已经在轮询中，直接返回
      if (currentState.isPolling || pollingInterval) return;
      
      // 先设置状态
      updateTraffic({ isPolling: true });
      
      // 立即执行一次获取
      get().traffic.fetchAllTrafficMetrics();
      
      // 启动整体数据的轮询（每分钟一次）
      pollingInterval = setInterval(() => {
        get().traffic.fetchAllTrafficMetrics();
      }, 60000);
      
      // 启动实时数据的轮询（每秒一次）
      realtimeInterval = setInterval(() => {
        get().traffic.fetchRealtimeTraffic();
      }, 1000);
    },
    
    stopPolling: () => {
      // 清除定时器
      if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
      }
      
      if (realtimeInterval) {
        clearInterval(realtimeInterval);
        realtimeInterval = null;
      }
      
      // 更新状态
      updateTraffic({ isPolling: false });
    }
  };
}; 