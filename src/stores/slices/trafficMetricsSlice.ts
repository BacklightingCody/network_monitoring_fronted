import { StateCreator } from 'zustand';
import { getAllTrafficMetrics, getRealtimeTraffic } from '@/services/api/traffic';
import { StoreState } from '../index';
import { 
  getTrafficPackets, 
  getTrafficStats, 
  getTrafficAnomalies, 
  getTopSources, 
  getTopDestinations, 
  getProtocolStats, 
  getTrafficVolume, 
  getActiveConnections, 
  getGeoDistribution,
  getCommunicationPairs,
  getPacketSizeDistribution,
  getPortUsage,
  getTrafficTrend,
  getApplicationUsage,
  analyzePacket
} from '@/services/api/traffic';

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
  // 基本统计数据
  basicStats: {
    totalBytes: number;
    count: number;
    avgSize: number;
    timeRange: {
      start: string;
      end: string;
    }
  };
  
  // 摘要数据
  summary: {
    lastHourTraffic: number;
    anomalyCount: number;
    lastCaptureTime: string;
  };
  
  // 排名数据
  topSources: IPRanking[];
  topDestinations: IPRanking[];
  
  // 协议统计
  protocolStats: ProtocolStat[];
  protocols: any[]; // 兼容NetworkResource.tsx中的调用
  
  // 异常检测
  anomalies: TrafficAnomaly[];
  
  // 活跃连接
  activeConnections: ActiveConnection[];
  
  // 通信对统计
  communicationPairs: CommunicationPair[];
  
  // 包大小分布
  packetSizes: PacketSizeDistribution[];
  packetSizeDistribution: PacketSizeDistribution[]; // 兼容NetworkResource.tsx中的调用
  
  // 实时流量
  realtimeTraffic: {
    timePoints: RealtimeTraffic[];
  };
  
  // 应用使用情况
  applications: ApplicationUsage[];
  
  // 基本数据包信息
  packets: TrafficPacket[];
  totalPackets: number;
  totalPages: number;
  
  // 统计数据
  stats: any;
  
  // 流量体积趋势
  trafficVolume: any[];
  
  // 端口使用统计
  portUsage: PortUsage[];
  
  // 地理位置分布
  geoDistribution: GeoLocation[];
  
  // 状态管理
  error: string | null;
  isLoading: boolean;
  isPolling: boolean;
  pollInterval: NodeJS.Timeout | null;
}

// 定义流量操作
export interface TrafficMetricsActions {
  fetchAllTrafficMetrics: () => Promise<void>;
  fetchRealtimeTraffic: () => Promise<void>;
  
  // 独立获取各种流量数据的方法
  fetchTrafficPackets: (params?: any) => Promise<void>;
  fetchTrafficStats: (params?: any) => Promise<void>;
  fetchTrafficAnomalies: (params?: any) => Promise<void>;
  fetchTopSources: (params?: any) => Promise<void>;
  fetchTopDestinations: (params?: any) => Promise<void>;
  fetchProtocolStats: (params?: any) => Promise<void>;
  fetchTrafficVolume: (params?: any) => Promise<void>;
  fetchActiveConnections: (params?: any) => Promise<void>;
  fetchGeoDistribution: (params?: any) => Promise<void>;
  fetchCommunicationPairs: (params?: any) => Promise<void>;
  fetchPacketSizeDistribution: (params?: any) => Promise<void>;
  fetchPortUsage: (params?: any) => Promise<void>;
  fetchTrafficTrend: (params?: any) => Promise<void>;
  fetchApplicationUsage: (params?: any) => Promise<void>;
  analyzePacket: (id: string) => Promise<void>;
  
  startPolling: () => void;
  stopPolling: () => void;
  setError: (error: string | null) => void;
}

export type TrafficMetricsSlice = TrafficMetricsState & TrafficMetricsActions;

// 初始状态
const initialState: TrafficMetricsState = {
  basicStats: {
    totalBytes: 0,
    count: 0,
    avgSize: 0,
    timeRange: {
      start: '',
      end: ''
    }
  },
  summary: {
    lastHourTraffic: 0,
    anomalyCount: 0,
    lastCaptureTime: ''
  },
  topSources: [],
  topDestinations: [],
  protocolStats: [],
  protocols: [], // 兼容NetworkResource.tsx中的调用
  anomalies: [],
  activeConnections: [],
  communicationPairs: [],
  packetSizes: [],
  packetSizeDistribution: [], // 兼容NetworkResource.tsx中的调用
  realtimeTraffic: {
    timePoints: []
  },
  applications: [],
  
  // 新增的字段
  packets: [],
  totalPackets: 0,
  totalPages: 0,
  stats: {},
  trafficVolume: [],
  portUsage: [],
  geoDistribution: [],
  
  error: null,
  isLoading: false,
  isPolling: false,
  pollInterval: null,
};

export const createTrafficMetricsSlice: StateCreator<
  StoreState,
  [],
  [],
  TrafficMetricsSlice
> = (set, get, api) => {
  let pollingInterval: NodeJS.Timeout | null = null;
  let realtimeInterval: NodeJS.Timeout | null = null;
  
  const updateTraffic = (newState: Partial<TrafficMetricsState>) =>
    set(state => ({ traffic: { ...state.traffic, ...newState } }));
  
  return {
    ...initialState,
    
    fetchAllTrafficMetrics: async () => {
      const trafficState = get().traffic;
      if (trafficState.isLoading) return;
      
      try {
        // 使用直接set而不是updateTraffic以避免嵌套更新
        set(state => ({ 
          traffic: { 
            ...state.traffic, 
            isLoading: true, 
            error: null
          } 
        }));
        
        const response = await getAllTrafficMetrics();
        console.log(response,'response')
        // 确保响应数据存在
        if (response) {
          const data = response as any; // 将响应转为any类型以访问属性
          
          // 使用直接set而不是updateTraffic以避免嵌套更新
          set(state => ({ 
            traffic: { 
              ...state.traffic,
              basicStats: data.basicStats || initialState.basicStats,
              summary: data.summary || initialState.summary,
              topSources: data.topSources || [],
              topDestinations: data.topDestinations || [],
              protocolStats: data.protocolStats || [],
              protocols: data.protocolStats || [], // 兼容NetworkResource.tsx中的调用
              anomalies: data.anomalies || [],
              activeConnections: data.activeConnections || [],
              communicationPairs: data.communicationPairs || [],
              packetSizes: data.packetSizes || [],
              packetSizeDistribution: data.packetSizes || [], // 兼容NetworkResource.tsx中的调用
              applications: data.applications || [],
              
              // 处理其他可能的数据
              packets: data.packets || [],
              totalPackets: data.totalPackets || 0,
              totalPages: data.totalPages || 0,
              stats: data.stats || {},
              trafficVolume: data.trafficVolume || [],
              portUsage: data.portUsage || [],
              geoDistribution: data.geoDistribution || [],
              
              isLoading: false
            } 
          }));
        } else {
          throw new Error('获取流量数据失败: 响应为空');
        }
      } catch (error) {
        console.error('获取所有流量数据失败:', error);
        const errorMessage = error instanceof Error ? error.message : '获取数据失败，请稍后重试';
        set(state => ({ 
          traffic: { 
            ...state.traffic, 
            error: errorMessage, 
            isLoading: false
          } 
        }));
      }
    },
    
    fetchRealtimeTraffic: async () => {
      try {
        // 实时数据不设置loading，避免UI闪烁
        const response = await getRealtimeTraffic();
        
        if (response) {
          const data = response as any; // 将响应转为any类型
          const trafficState = get().traffic;
          
          // 更新实时流量数据，保持最新的30个数据点
          const timePoints = [...(trafficState.realtimeTraffic.timePoints || [])];
          
          if (data.timePoints && Array.isArray(data.timePoints)) {
            timePoints.push(...data.timePoints);
            // 最多保留30个数据点
            if (timePoints.length > 30) {
              timePoints.splice(0, timePoints.length - 30);
            }
          }
          
          // 使用直接set而不是updateTraffic避免嵌套更新
          set(state => ({ 
            traffic: { 
              ...state.traffic, 
              realtimeTraffic: { timePoints }
            } 
          }));
        }
      } catch (error) {
        console.error('获取实时流量数据失败:', error);
        // 对于实时数据错误，我们不修改全局错误状态，以免影响UI体验
      }
    },
    
    // 添加兼容NetworkResource.tsx的方法
    fetchTrafficPackets: async (params = {}) => {
      try {
        set(state => ({ traffic: { ...state.traffic, isLoading: true } }));
        
        const response = await getTrafficPackets(params);
        if (response && typeof response === 'object') {
          const data = response as any;
          set(state => ({ 
            traffic: { 
              ...state.traffic,
              packets: data.data?.packets || [],
              totalPackets: data.data?.total || 0,
              totalPages: Math.ceil((data.data?.total || 0) / (params.limit || 10)),
              isLoading: false
            } 
          }));
        }
      } catch (error) {
        console.error('获取流量数据包失败:', error);
        set(state => ({ 
          traffic: { 
            ...state.traffic, 
            error: '获取流量数据包失败',
            isLoading: false
          } 
        }));
      }
    },
    
    fetchTrafficStats: async (params = {}) => {
      try {
        set(state => ({ traffic: { ...state.traffic, isLoading: true } }));
        
        const response = await getTrafficStats(params);
        if (response && typeof response === 'object') {
          const data = response as any;
          set(state => ({ 
            traffic: { 
              ...state.traffic,
              stats: data.data || {},
              isLoading: false
            } 
          }));
        }
      } catch (error) {
        console.error('获取流量统计数据失败:', error);
        set(state => ({ 
          traffic: { 
            ...state.traffic, 
            error: '获取流量统计数据失败',
            isLoading: false
          } 
        }));
      }
    },
    
    fetchTrafficAnomalies: async (params = {}) => {
      try {
        set(state => ({ traffic: { ...state.traffic, isLoading: true } }));
        
        const response = await getTrafficAnomalies(params);
        if (response && typeof response === 'object') {
          const data = response as any;
          set(state => ({ 
            traffic: { 
              ...state.traffic,
              anomalies: data.data || [],
              isLoading: false
            } 
          }));
        }
      } catch (error) {
        console.error('获取流量异常数据失败:', error);
        set(state => ({ 
          traffic: { 
            ...state.traffic, 
            error: '获取流量异常数据失败',
            isLoading: false
          } 
        }));
      }
    },
    
    fetchTopSources: async (params = {}) => {
      try {
        set(state => ({ traffic: { ...state.traffic, isLoading: true } }));
        
        const response = await getTopSources(params);
        if (response && typeof response === 'object') {
          const data = response as any;
          set(state => ({ 
            traffic: { 
              ...state.traffic,
              topSources: data.data || [],
              isLoading: false
            } 
          }));
        }
      } catch (error) {
        console.error('获取顶级源IP数据失败:', error);
        set(state => ({ 
          traffic: { 
            ...state.traffic, 
            error: '获取顶级源IP数据失败',
            isLoading: false
          } 
        }));
      }
    },
    
    fetchTopDestinations: async (params = {}) => {
      try {
        set(state => ({ traffic: { ...state.traffic, isLoading: true } }));
        
        const response = await getTopDestinations(params);
        if (response && typeof response === 'object') {
          const data = response as any;
          set(state => ({ 
            traffic: { 
              ...state.traffic,
              topDestinations: data.data || [],
              isLoading: false
            } 
          }));
        }
      } catch (error) {
        console.error('获取顶级目标IP数据失败:', error);
        set(state => ({ 
          traffic: { 
            ...state.traffic, 
            error: '获取顶级目标IP数据失败',
            isLoading: false
          } 
        }));
      }
    },
    
    fetchProtocolStats: async (params = {}) => {
      try {
        set(state => ({ traffic: { ...state.traffic, isLoading: true } }));
        
        const response = await getProtocolStats(params);
        if (response && typeof response === 'object') {
          const data = response as any;
          set(state => ({ 
            traffic: { 
              ...state.traffic,
              protocolStats: data.data?.stats || [],
              protocols: data.data?.stats || [], // 兼容处理
              isLoading: false
            } 
          }));
        }
      } catch (error) {
        console.error('获取协议统计数据失败:', error);
        set(state => ({ 
          traffic: { 
            ...state.traffic, 
            error: '获取协议统计数据失败',
            isLoading: false
          } 
        }));
      }
    },
    
    fetchTrafficVolume: async (params = {}) => {
      try {
        set(state => ({ traffic: { ...state.traffic, isLoading: true } }));
        
        const response = await getTrafficVolume(params);
        if (response && typeof response === 'object') {
          const data = response as any;
          set(state => ({ 
            traffic: { 
              ...state.traffic,
              trafficVolume: data.data || [],
              isLoading: false
            } 
          }));
        }
      } catch (error) {
        console.error('获取流量体积数据失败:', error);
        set(state => ({ 
          traffic: { 
            ...state.traffic, 
            error: '获取流量体积数据失败',
            isLoading: false
          } 
        }));
      }
    },
    
    fetchActiveConnections: async (params = {}) => {
      try {
        set(state => ({ traffic: { ...state.traffic, isLoading: true } }));
        
        const response = await getActiveConnections(params);
        if (response && typeof response === 'object') {
          const data = response as any;
          set(state => ({ 
            traffic: { 
              ...state.traffic,
              activeConnections: data.data?.connections || [],
              isLoading: false
            } 
          }));
        }
      } catch (error) {
        console.error('获取活跃连接数据失败:', error);
        set(state => ({ 
          traffic: { 
            ...state.traffic, 
            error: '获取活跃连接数据失败',
            isLoading: false
          } 
        }));
      }
    },
    
    fetchGeoDistribution: async (params = {}) => {
      try {
        set(state => ({ traffic: { ...state.traffic, isLoading: true } }));
        
        const response = await getGeoDistribution(params);
        if (response && typeof response === 'object') {
          const data = response as any;
          
          // 转换地理分布数据为扁平数组
          let geoDistribution: GeoLocation[] = [];
          if (data.data) {
            // 处理国内地区
            if (data.data.domestic && data.data.domestic.regions) {
              data.data.domestic.regions.forEach((region: any) => {
                geoDistribution.push({
                  country: `中国-${region.name}`,
                  latitude: 0, // 需要实际坐标
                  longitude: 0, // 需要实际坐标
                  count: region.count,
                  totalBytes: region.bytes || 0
                });
              });
            }
            
            // 处理国际国家
            if (data.data.international && data.data.international.countries) {
              data.data.international.countries.forEach((country: any) => {
                geoDistribution.push({
                  country: country.name,
                  latitude: 0, // 需要实际坐标
                  longitude: 0, // 需要实际坐标
                  count: country.count,
                  totalBytes: country.bytes || 0
                });
              });
            }
          }
          
          set(state => ({ 
            traffic: { 
              ...state.traffic,
              geoDistribution,
              isLoading: false
            } 
          }));
        }
      } catch (error) {
        console.error('获取地理分布数据失败:', error);
        set(state => ({ 
          traffic: { 
            ...state.traffic, 
            error: '获取地理分布数据失败',
            isLoading: false
          } 
        }));
      }
    },
    
    // 新增加的API方法
    fetchCommunicationPairs: async (params = {}) => {
      try {
        set(state => ({ traffic: { ...state.traffic, isLoading: true } }));
        
        const response = await getCommunicationPairs(params);
        if (response && typeof response === 'object') {
          const data = response as any;
          set(state => ({ 
            traffic: { 
              ...state.traffic,
              communicationPairs: data.data?.pairs || [],
              isLoading: false
            } 
          }));
        }
      } catch (error) {
        console.error('获取通信对数据失败:', error);
        set(state => ({ 
          traffic: { 
            ...state.traffic, 
            error: '获取通信对数据失败',
            isLoading: false
          } 
        }));
      }
    },
    
    fetchPacketSizeDistribution: async (params = {}) => {
      try {
        set(state => ({ traffic: { ...state.traffic, isLoading: true } }));
        
        const response = await getPacketSizeDistribution(params);
        if (response && typeof response === 'object') {
          const data = response as any;
          
          const packetSizes = (data.data?.distribution || []).map((item: any) => ({
            sizeRange: item.label,
            count: item.count,
            percentage: item.percentage
          }));
          
          set(state => ({ 
            traffic: { 
              ...state.traffic,
              packetSizes,
              packetSizeDistribution: packetSizes, // 兼容处理
              isLoading: false
            } 
          }));
        }
      } catch (error) {
        console.error('获取数据包大小分布失败:', error);
        set(state => ({ 
          traffic: { 
            ...state.traffic, 
            error: '获取数据包大小分布失败',
            isLoading: false
          } 
        }));
      }
    },
    
    fetchPortUsage: async (params = {}) => {
      try {
        set(state => ({ traffic: { ...state.traffic, isLoading: true } }));
        
        const response = await getPortUsage(params);
        if (response && typeof response === 'object') {
          const data = response as any;
          set(state => ({ 
            traffic: { 
              ...state.traffic,
              portUsage: data.data?.ports || [],
              isLoading: false
            } 
          }));
        }
      } catch (error) {
        console.error('获取端口使用数据失败:', error);
        set(state => ({ 
          traffic: { 
            ...state.traffic, 
            error: '获取端口使用数据失败',
            isLoading: false
          } 
        }));
      }
    },
    
    fetchTrafficTrend: async (params = {}) => {
      try {
        set(state => ({ traffic: { ...state.traffic, isLoading: true } }));
        
        const response = await getTrafficTrend(params);
        if (response && typeof response === 'object') {
          const data = response as any;
          // 处理趋势数据
          const trafficPoints = (data.data?.data || []).map((point: any) => ({
            timestamp: point.time,
            value: params.metric === 'bytes' ? point.bytes : point.packets
          }));
          
          set(state => ({ 
            traffic: { 
              ...state.traffic,
              trafficPoints,
              isLoading: false
            } 
          }));
        }
      } catch (error) {
        console.error('获取流量趋势数据失败:', error);
        set(state => ({ 
          traffic: { 
            ...state.traffic, 
            error: '获取流量趋势数据失败',
            isLoading: false
          } 
        }));
      }
    },
    
    fetchApplicationUsage: async (params = {}) => {
      try {
        set(state => ({ traffic: { ...state.traffic, isLoading: true } }));
        
        const response = await getApplicationUsage(params);
        if (response && typeof response === 'object') {
          const data = response as any;
          
          // 处理应用使用数据
          const applications = (data.data?.applications || []).map((app: any) => ({
            application: app.name,
            bytesIn: app.byteCount / 2, // 假设均分
            bytesOut: app.byteCount / 2, // 假设均分
            packetsIn: app.packetCount / 2, // 假设均分
            packetsOut: app.packetCount / 2, // 假设均分
            connections: app.connections || 0
          }));
          
          set(state => ({ 
            traffic: { 
              ...state.traffic,
              applications,
              isLoading: false
            } 
          }));
        }
      } catch (error) {
        console.error('获取应用使用数据失败:', error);
        set(state => ({ 
          traffic: { 
            ...state.traffic, 
            error: '获取应用使用数据失败',
            isLoading: false
          } 
        }));
      }
    },
    
    analyzePacket: async (id: string) => {
      try {
        set(state => ({ traffic: { ...state.traffic, isLoading: true } }));
        
        const response = await analyzePacket(id);
        if (response && typeof response === 'object') {
          const data = response as any;
          
          // 暂时不设置状态，因为可能是弹窗展示详情
          console.log('数据包分析结果:', data);
          
          set(state => ({ 
            traffic: { 
              ...state.traffic,
              isLoading: false
            } 
          }));
          
          return data; // 返回分析结果
        }
      } catch (error) {
        console.error('分析数据包失败:', error);
        set(state => ({ 
          traffic: { 
            ...state.traffic, 
            error: '分析数据包失败',
            isLoading: false
          } 
        }));
      }
    },
    
    setError: (error) => updateTraffic({ error }),
    
    startPolling: () => {
      // 先检查当前状态，避免重复启动轮询
      const isCurrentlyPolling = get().traffic.isPolling;
      if (isCurrentlyPolling || pollingInterval) return;
      
      // 确保在启动新轮询前清除任何现有的轮询
      const existingInterval = get().traffic.pollInterval;
      if (existingInterval) {
        clearInterval(existingInterval);
      }
      
      // 设置最大重试次数
      let errorCount = 0;
      const MAX_RETRIES = 5;
      
      // 开始轮询
      pollingInterval = setInterval(() => {
        try {
          // 获取所有指标数据
          get().traffic.fetchAllTrafficMetrics().catch(err => {
            errorCount++;
            console.error(`轮询期间获取指标失败 (${errorCount}/${MAX_RETRIES}):`, err);
            
            // 如果错误次数达到上限，停止轮询
            if (errorCount >= MAX_RETRIES) {
              console.warn('错误次数达到上限，停止轮询');
              if (pollingInterval) {
                clearInterval(pollingInterval);
                pollingInterval = null;
                
                // 更新状态
                set(state => ({ 
                  traffic: { 
                    ...state.traffic, 
                    isPolling: false,
                    pollInterval: null,
                    error: '轮询已停止：连续出错超过限制'
                  } 
                }));
              }
            }
          });
          
          // 如果成功获取数据，重置错误计数
          errorCount = 0;
        } catch (error) {
          errorCount++;
          console.error(`轮询操作出错 (${errorCount}/${MAX_RETRIES}):`, error);
          
          // 如果错误次数达到上限，停止轮询
          if (errorCount >= MAX_RETRIES) {
            console.warn('错误次数达到上限，停止轮询');
            if (pollingInterval) {
              clearInterval(pollingInterval);
              pollingInterval = null;
              
              // 更新状态
              set(state => ({ 
                traffic: { 
                  ...state.traffic, 
                  isPolling: false,
                  pollInterval: null,
                  error: '轮询已停止：连续出错超过限制'
                } 
              }));
            }
          }
        }
      }, 5000); // 每5秒更新一次
      
      // 更新状态，使用直接set而不是updateTraffic
      set(state => ({ 
        traffic: { 
          ...state.traffic, 
          isPolling: true,
          pollInterval: pollingInterval,
          error: null // 清除之前的错误
        } 
      }));
    },
    
    stopPolling: () => {
      // 直接从state中读取轮询间隔
      const pollIntervalFromState = get().traffic.pollInterval;
      
      // 如果存在来自状态的轮询间隔，先清除它
      if (pollIntervalFromState) {
        clearInterval(pollIntervalFromState);
      }
      
      // 如果存在模块级变量轮询间隔，也清除它
      if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
      }
      
      // 只进行一次状态更新，而不是在更新中再次调用自己
      set(state => ({ 
        traffic: { 
          ...state.traffic, 
          isPolling: false,
          pollInterval: null
        } 
      }));
    }
  };
}; 