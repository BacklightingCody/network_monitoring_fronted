import { useEffect, useRef, useCallback } from 'react';
import ResourceSection from '@/components/common/ResourceSection';
import ResourceCard from '@/components/common/ResourceCards';
import LineCharts from '@/components/common/LineCharts';
import { Card } from '@/components/common/Card';
import { ResourceMetrics, ResourceCharts } from '@/components/common/ResourceSection';
import { Network, ArrowDown, ArrowUp, Wifi, AlertTriangle, Server } from 'lucide-react';
import { useNetworkMetrics } from '@/stores';

export function NetworkMetrics() {
  const mounted = useRef(true);
  const metrics = useNetworkMetrics();
  console.log(metrics,'metrics')
  const actions = useNetworkMetrics();

  const fetchData = useCallback(() => {
    if (mounted.current) {
      metrics.fetchNetworkMetrics();
    }
  }, [metrics]);

  useEffect(() => {
    mounted.current = true;
    fetchData(); // 立即获取一次数据

     const intervalId = setInterval(() => {
      actions.startPolling();
    }, 5000);

    return () => {
      clearInterval(intervalId);
      mounted.current = false;
      clearInterval(intervalId); // 清理定时器
    };
  }, []);

  if (metrics.error) {
    return <div className="text-red-500 text-center p-4">{metrics.error}</div>;
  }

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


  return (
    <div className="space-y-6">
      <ResourceSection title="网络性能监控">
        <ResourceMetrics>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <ResourceCard
              title="当前带宽"
              value={formatBandwidth(metrics.currentBandwidth)}
              unit=""
              showProgress={true}
              icon={<Network className="h-6 w-6" />}
              colorScheme='cyan'
            />
            <ResourceCard
              title="总流量"
              value={formatBytes(metrics.bytesTotal)}
              unit=""
              showProgress={false}
              icon={<Wifi className="h-6 w-6" />}
              colorScheme='cyan'
            />
            <ResourceCard
              title="接收流量"
              value={formatBytes(metrics.bytesReceived.reduce((sum, m) => sum + m.value, 0))}
              unit=""
              showProgress={false}
              icon={<ArrowDown className="h-6 w-6" />}
              colorScheme='cyan'
            />
            <ResourceCard
              title="发送流量"
              value={formatBytes(metrics.bytesSent.reduce((sum, m) => sum + m.value, 0))}
              unit=""
              showProgress={false}
              icon={<ArrowUp className="h-6 w-6" />}
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
              icon={<Server className="h-6 w-6" />}
              colorScheme='cyan'
            />
            <ResourceCard
              title="接收数据包"
              value={metrics.packetsReceived.reduce((sum, m) => sum + m.value, 0).toLocaleString()}
              unit="个"
              showProgress={false}
              icon={<ArrowDown className="h-6 w-6" />}
              colorScheme='cyan'
            />
            <ResourceCard
              title="发送数据包"
              value={metrics.packetsSent.reduce((sum, m) => sum + m.value, 0).toLocaleString()}
              unit="个"
              showProgress={false}
              icon={<ArrowUp className="h-6 w-6" />}
              colorScheme='cyan'
            />
            <ResourceCard
              title="输出队列长度"
              value={metrics.outputQueueLength.toLocaleString()}
              unit=""
              showProgress={true}
              icon={<Server className="h-6 w-6" />}
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
              icon={<AlertTriangle className="h-6 w-6" />}
              colorScheme='cyan'
            />
            <ResourceCard
              title="接收错误"
              value={metrics.errors.received.toLocaleString()}
              unit="个"
              showProgress={false}
              icon={<AlertTriangle className="h-6 w-6" />}
              colorScheme='cyan'
            />
            <ResourceCard
              title="未知协议包"
              value={metrics.errors.unknown.toLocaleString()}
              unit="个"
              showProgress={false}
              icon={<AlertTriangle className="h-6 w-6" />}
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
                      <Network className="h-5 w-5" />
                      <h4 className="font-medium">{nic.metric.nic || '未知接口'}</h4>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm">
                        名称: {nic.metric.friendly_name || '-'}
                      </div>
                      <div className="text-sm">
                        地址: {nic.metric.address || '-'}
                      </div>
                      <div className="text-sm">
                        类型: {nic.metric.family || '-'}
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
