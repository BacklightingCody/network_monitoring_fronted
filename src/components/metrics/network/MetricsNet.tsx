import { useEffect, useState, useCallback, useRef } from 'react';
import ResourceSection from '@/components/common/ResourceSection';
import ResourceCard from '@/components/common/ResourceCards';
import LineCharts from '@/components/common/LineCharts';
import { Card } from '@/components/common/Card';
import { getNetworkAllMetrics } from '@/services/network';
import { ResourceMetrics, ResourceCharts } from '@/components/common/ResourceSection';
import { Network, ArrowDown, ArrowUp, Wifi, AlertTriangle, Server } from 'lucide-react';
import { timeRangeMs } from '../constant';
import { extractMetrics } from '../utils/transformMetricsData'
// 基础接口定义
interface Metrics {
  metric: MetricInfo;
  value: [time: string | number, value: string | number];
}

interface MetricInfo {
  __name__: string;
  instance: string;
  job: string;
  interface?: string;
}

interface NicInfo {
  nic: string;
  family: string;
  friendly_name: string;
  address: string;
}

interface NetworkNicInfo {
  metric: {
    nic?: string;
    family?: string;
    friendly_name?: string;
    address?: string;
    [key: string]: string | undefined;
  };
  time: string | number;
  value: string | number;
}

// 状态数据接口
interface NetworkState {
  interface: string;
  value: number;
}

interface NetworkTrendPoint {
  time: string;
  value: number;
}

interface NetworkMetricsState {
  // 状态数据
  bytesReceived: NetworkState[];
  bytesSent: NetworkState[];
  bytesTotal: number;
  currentBandwidth: number;
  outputQueueLength: number;
  packetsReceived: NetworkState[];
  packetsSent: NetworkState[];
  packetsTotal: number;
  errors: {
    outbound: number;
    received: number;
    discardedOutbound: number;
    discardedReceived: number;
    unknown: number;
  };
  nicInfo: NetworkNicInfo[];

  // 趋势数据
  trafficTrend: {
    bytesReceived: NetworkTrendPoint[];
    bytesSent: NetworkTrendPoint[];
    bandwidth: NetworkTrendPoint[];
  };
  packetsTrend: {
    received: NetworkTrendPoint[];
    sent: NetworkTrendPoint[];
    total: NetworkTrendPoint[];
  };
  errorsTrend: {
    outbound: NetworkTrendPoint[];
    received: NetworkTrendPoint[];
    discarded: NetworkTrendPoint[];
  };
}

export function NetworkMetrics() {
  const [metrics, setMetrics] = useState<NetworkMetricsState>({
    bytesReceived: [],
    bytesSent: [],
    bytesTotal: 0,
    currentBandwidth: 0,
    outputQueueLength: 0,
    packetsReceived: [],
    packetsSent: [],
    packetsTotal: 0,
    errors: {
      outbound: 0,
      received: 0,
      discardedOutbound: 0,
      discardedReceived: 0,
      unknown: 0
    },
    nicInfo: [],
    trafficTrend: {
      bytesReceived: [],
      bytesSent: [],
      bandwidth: []
    },
    packetsTrend: {
      received: [],
      sent: [],
      total: []
    },
    errorsTrend: {
      outbound: [],
      received: [],
      discarded: []
    }
  });

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const mounted = useRef(true);

  // 使用 useRef 存储历史数据
  const metricsHistory = useRef<{
    bytesReceived: NetworkTrendPoint[];
    bytesSent: NetworkTrendPoint[];
    bandwidth: NetworkTrendPoint[];
    packetsReceived: NetworkTrendPoint[];
    packetsSent: NetworkTrendPoint[];
    errorsOutbound: NetworkTrendPoint[];
    errorsReceived: NetworkTrendPoint[];
    errorsDiscarded: NetworkTrendPoint[];
  }>({
    bytesReceived: [],
    bytesSent: [],
    bandwidth: [],
    packetsReceived: [],
    packetsSent: [],
    errorsOutbound: [],
    errorsReceived: [],
    errorsDiscarded: []
  });

  // 格式化字节数
  const formatBytes = (bytes: number, decimals = 2): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  // 格式化带宽
  const formatBandwidth = (bps: number): string => {
    if (bps < 1000) return `${bps.toFixed(2)} bps`;
    if (bps < 1000000) return `${(bps / 1000).toFixed(2)} Kbps`;
    if (bps < 1000000000) return `${(bps / 1000000).toFixed(2)} Mbps`;
    return `${(bps / 1000000000).toFixed(2)} Gbps`;
  };

  // 处理状态指标数据
  const processStateMetrics = (metrics: any[]): NetworkState[] => {
    if (!Array.isArray(metrics)) {
      // console.warn('Invalid metric data:', metrics);
      return [];
    }
    return metrics.map(item => ({
      interface: item.metric.interface || '',
      value: parseFloat(item.value[1] as string) || 0
    }));
  };



  const fetchData = useCallback(async () => {
    if (!mounted.current || isLoading) return;

    try {
      setIsLoading(true);
      setError(null);

      const allMetrics = await getNetworkAllMetrics();
      console.log(allMetrics)
      if (!mounted.current) return;

      const {
        bytesReceived,
        bytesSent,
        bytesTotal,
        currentBandwidth,
        outputQueueLength,
        packetsReceived,
        packetsSent,
        packetsTotal,
        packetsOutboundErrors,
        packetsReceivedErrors,
        packetsOutboundDiscarded,
        packetsReceivedDiscarded,
        packetsReceivedUnknown,
        nicAddressInfo
      } = allMetrics;
      console.log(allMetrics, 'kxc')
      // 处理当前时间点的指标
      const currentTime = new Date().toLocaleTimeString();
      const currentMetrics = {
        bytesReceived: {
          time: currentTime,
          value: processStateMetrics(bytesReceived).reduce((sum, m) => sum + m.value, 0)
        },
        bytesSent: {
          time: currentTime,
          value: processStateMetrics(bytesSent).reduce((sum, m) => sum + m.value, 0)
        },
        bandwidth: {
          time: currentTime,
          value: processStateMetrics(currentBandwidth).reduce((sum, m) => sum + m.value, 0)
        },
        packetsReceived: {
          time: currentTime,
          value: processStateMetrics(packetsReceived).reduce((sum, m) => sum + m.value, 0)
        },
        packetsSent: {
          time: currentTime,
          value: processStateMetrics(packetsSent).reduce((sum, m) => sum + m.value, 0)
        },
        errorsOutbound: {
          time: currentTime,
          value: processStateMetrics(packetsOutboundErrors).reduce((sum, m) => sum + m.value, 0)
        },
        errorsReceived: {
          time: currentTime,
          value: processStateMetrics(packetsReceivedErrors).reduce((sum, m) => sum + m.value, 0)
        },
        errorsDiscarded: {
          time: currentTime,
          value: processStateMetrics(packetsOutboundDiscarded).reduce((sum, m) => sum + m.value, 0) +
            processStateMetrics(packetsReceivedDiscarded).reduce((sum, m) => sum + m.value, 0)
        }
      };

      // 更新历史数据
      metricsHistory.current = {
        bytesReceived: [...metricsHistory.current.bytesReceived, currentMetrics.bytesReceived].slice(-timeRangeMs['7d']),
        bytesSent: [...metricsHistory.current.bytesSent, currentMetrics.bytesSent].slice(-timeRangeMs['7d']),
        bandwidth: [...metricsHistory.current.bandwidth, currentMetrics.bandwidth].slice(-timeRangeMs['7d']),
        packetsReceived: [...metricsHistory.current.packetsReceived, currentMetrics.packetsReceived].slice(-timeRangeMs['7d']),
        packetsSent: [...metricsHistory.current.packetsSent, currentMetrics.packetsSent].slice(-timeRangeMs['7d']),
        errorsOutbound: [...metricsHistory.current.errorsOutbound, currentMetrics.errorsOutbound].slice(-timeRangeMs['7d']),
        errorsReceived: [...metricsHistory.current.errorsReceived, currentMetrics.errorsReceived].slice(-timeRangeMs['7d']),
        errorsDiscarded: [...metricsHistory.current.errorsDiscarded, currentMetrics.errorsDiscarded].slice(-timeRangeMs['7d'])
      };
      console.log(nicAddressInfo, 'sss')
      // 更新状态
      setMetrics(prev => ({
        ...prev,
        bytesReceived: processStateMetrics(bytesReceived),
        bytesSent: processStateMetrics(bytesSent),
        bytesTotal: processStateMetrics(bytesTotal).reduce((sum, m) => sum + m.value, 0),
        currentBandwidth: processStateMetrics(currentBandwidth).reduce((sum, m) => sum + m.value, 0),
        outputQueueLength: processStateMetrics(outputQueueLength).reduce((sum, m) => sum + m.value, 0),
        packetsReceived: processStateMetrics(packetsReceived),
        packetsSent: processStateMetrics(packetsSent),
        packetsTotal: processStateMetrics(packetsTotal).reduce((sum, m) => sum + m.value, 0),
        errors: {
          outbound: processStateMetrics(packetsOutboundErrors).reduce((sum, m) => sum + m.value, 0),
          received: processStateMetrics(packetsReceivedErrors).reduce((sum, m) => sum + m.value, 0),
          discardedOutbound: processStateMetrics(packetsOutboundDiscarded).reduce((sum, m) => sum + m.value, 0),
          discardedReceived: processStateMetrics(packetsReceivedDiscarded).reduce((sum, m) => sum + m.value, 0),
          unknown: processStateMetrics(packetsReceivedUnknown).reduce((sum, m) => sum + m.value, 0)
        },
        nicInfo: extractMetrics(nicAddressInfo, ['nic', 'friendly_name', 'family', 'address']).map(item => ({
          metric: item.metric,
          time: item.time,
          value: item.value
        })),
        trafficTrend: {
          bytesReceived: metricsHistory.current.bytesReceived,
          bytesSent: metricsHistory.current.bytesSent,
          bandwidth: metricsHistory.current.bandwidth
        },
        packetsTrend: {
          received: metricsHistory.current.packetsReceived,
          sent: metricsHistory.current.packetsSent,
          total: metricsHistory.current.packetsReceived.map((point, index) => ({
            time: point.time,
            value: point.value + (metricsHistory.current.packetsSent[index]?.value || 0)
          }))
        },
        errorsTrend: {
          outbound: metricsHistory.current.errorsOutbound,
          received: metricsHistory.current.errorsReceived,
          discarded: metricsHistory.current.errorsDiscarded
        }
      }));

    } catch (error) {
      // console.error('获取网络指标失败:', error);
      if (mounted.current) {
        setError('获取数据失败，请稍后重试');
      }
    } finally {
      if (mounted.current) {
        setIsLoading(false);
      }
    }
  }, [isLoading]);

  useEffect(() => {
    mounted.current = true;
    // console.log('网络指标组件已挂载');

    // 立即获取一次数据
    fetchData();

    // 设置定时器
    const intervalId = window.setInterval(() => {
      // console.log('定时获取网络指标...');
      fetchData();
    }, 5000);

    // 清理函数
    return () => {
      mounted.current = false;
      if (intervalId) {
        clearInterval(intervalId);
        // console.log('网络指标定时器已清除');
      }
    };
  }, []);

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <ResourceSection title="网络性能监控">
        <ResourceMetrics>
          {/* 基础网络状态 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <ResourceCard
              title="当前带宽"
              value={formatBandwidth(metrics.currentBandwidth)}
              unit=""
              showProgress={true}
              icon={<Network className="h-6 w-6 text-blue-500" />}
              colorScheme='cyan'
            />
            <ResourceCard
              title="总流量"
              value={formatBytes(metrics.bytesTotal)}
              unit=""
              showProgress={false}
              icon={<Wifi className="h-6 w-6 text-green-500" />}
              colorScheme='cyan'
            />
            <ResourceCard
              title="接收流量"
              value={formatBytes(metrics.bytesReceived.reduce((sum, m) => sum + m.value, 0))}
              unit=""
              showProgress={false}
              icon={<ArrowDown className="h-6 w-6 text-cyan-500" />}
              colorScheme='cyan'
            />
            <ResourceCard
              title="发送流量"
              value={formatBytes(metrics.bytesSent.reduce((sum, m) => sum + m.value, 0))}
              unit=""
              showProgress={false}
              icon={<ArrowUp className="h-6 w-6 text-purple-500" />}
              colorScheme='cyan'
            />
          </div>

          {/* 数据包统计 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <ResourceCard
              title="数据包总数"
              value={metrics.packetsTotal.toLocaleString()}
              unit="个"
              showProgress={false}
              icon={<Server className="h-6 w-6 text-indigo-500" />}
              colorScheme='cyan'
            />
            <ResourceCard
              title="接收数据包"
              value={metrics.packetsReceived.reduce((sum, m) => sum + m.value, 0).toLocaleString()}
              unit="个"
              showProgress={false}
              icon={<ArrowDown className="h-6 w-6 text-green-500" />}
              colorScheme='cyan'
            />
            <ResourceCard
              title="发送数据包"
              value={metrics.packetsSent.reduce((sum, m) => sum + m.value, 0).toLocaleString()}
              unit="个"
              showProgress={false}
              icon={<ArrowUp className="h-6 w-6 text-blue-500" />}
              colorScheme='cyan'
            />
            <ResourceCard
              title="输出队列长度"
              value={metrics.outputQueueLength.toLocaleString()}
              unit=""
              showProgress={true}
              icon={<Server className="h-6 w-6 text-yellow-500" />}
              colorScheme='cyan'
            />
          </div>

          {/* 错误统计 */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <ResourceCard
              title="发送错误"
              value={metrics.errors.outbound.toLocaleString()}
              unit="个"
              showProgress={false}
              icon={<AlertTriangle className="h-6 w-6 text-red-500" />}
              colorScheme='cyan'
            />
            <ResourceCard
              title="接收错误"
              value={metrics.errors.received.toLocaleString()}
              unit="个"
              showProgress={false}
              icon={<AlertTriangle className="h-6 w-6 text-orange-500" />}
              colorScheme='cyan'
            />
            <ResourceCard
              title="未知协议包"
              value={metrics.errors.unknown.toLocaleString()}
              unit="个"
              showProgress={false}
              icon={<AlertTriangle className="h-6 w-6 text-yellow-500" />}
              colorScheme='cyan'
            />
            <ResourceCard
              title="发送丢包"
              value={metrics.errors.discardedOutbound.toLocaleString()}
              unit="个"
              showProgress={false}
              icon={<AlertTriangle className="h-6 w-6 text-pink-500" />}
              colorScheme='cyan'
            />
            <ResourceCard
              title="接收丢包"
              value={metrics.errors.discardedReceived.toLocaleString()}
              unit="个"
              showProgress={false}
              icon={<AlertTriangle className="h-6 w-6 text-purple-500" />}
              colorScheme='cyan'
            />
            <ResourceCard
              title="总错误数"
              value={(
                metrics.errors.outbound +
                metrics.errors.received +
                metrics.errors.discardedOutbound +
                metrics.errors.discardedReceived +
                metrics.errors.unknown
              ).toLocaleString()}
              unit="个"
              showProgress={false}
              icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
              colorScheme='cyan'
            />
          </div>

          {/* 网卡信息 */}
          {metrics.nicInfo.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">网络接口信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metrics.nicInfo.map((nic, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Network className="h-5 w-5 text-blue-500" />
                      <h4 className="font-medium">{nic.metric.nic || '未知接口'}</h4>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-600">
                        名称: {nic.metric.friendly_name || '-'}
                      </div>
                      <div className="text-sm text-gray-600">
                        地址: {nic.metric.address || '-'}
                      </div>
                      <div className="text-sm text-gray-600">
                        类型: {nic.metric.family || '-'}
                      </div>
                      <div className="text-sm text-gray-600">
                        类型: {nic.value || '-'}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </ResourceMetrics>

        <ResourceCharts>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <Card className="p-4 min-h-[400px] z-10">
              <h3 className="text-lg font-semibold mb-2">网络流量趋势</h3>
              <LineCharts
                data={[
                  { name: '接收流量', data: metrics.trafficTrend.bytesReceived },
                  { name: '发送流量', data: metrics.trafficTrend.bytesSent }
                ]}
                timeRange="1h"
                yAxisUnit="B/s"
                showLegend={true}
              />
            </Card>
            <Card className="p-4 min-h-[400px] z-10">
              <h3 className="text-lg font-semibold mb-2">带宽使用趋势</h3>
              <LineCharts
                data={metrics.trafficTrend.bandwidth}
                timeRange="1h"
                yAxisUnit="bps"
                showLegend={false}
              />
            </Card>
            <Card className="p-4 min-h-[400px] z-10">
              <h3 className="text-lg font-semibold mb-2">数据包趋势</h3>
              <LineCharts
                data={[
                  { name: '接收包数', data: metrics.packetsTrend.received },
                  { name: '发送包数', data: metrics.packetsTrend.sent }
                ]}
                timeRange="1h"
                yAxisUnit="个"
                showLegend={true}
              />
            </Card>
            <Card className="p-4 min-h-[400px] z-10">
              <h3 className="text-lg font-semibold mb-2">错误趋势</h3>
              <LineCharts
                data={[
                  { name: '发送错误', data: metrics.errorsTrend.outbound },
                  { name: '接收错误', data: metrics.errorsTrend.received },
                  { name: '丢弃包数', data: metrics.errorsTrend.discarded }
                ]}
                timeRange="1h"
                yAxisUnit="个"
                showLegend={true}
              />
            </Card>
          </div>
        </ResourceCharts>
      </ResourceSection>
    </div>
  );
}
