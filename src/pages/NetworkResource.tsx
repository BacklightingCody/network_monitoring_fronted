// import React from 'react';
import { useEffect, useRef } from 'react';
import { Card } from '@/components/common/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/Badge';
import {
  Activity, AlertTriangle, Network, Database,
  Server, Layers, Clock
} from 'lucide-react';
import { NetworkRealTimeTrafficChart } from '@/components/network/NetworkRealTimeTrafficChart';
import { NetworkProtocolDistribution } from '@/components/network/NetworkProtocolDistribution';
import { NetworkTopTrafficSources } from '@/components/network/NetworkTopTrafficSources';
import { useTrafficMetricsData, useTrafficMetricsActions } from '@/stores';

export function NetworkResource() {
  // 使用流量指标store
  const {
    basicStats,
    summary,
    activeConnections,
    packetSizes,
    communicationPairs,
    applications,
    anomalies,
    isLoading,
    isPolling,
  } = useTrafficMetricsData() || {};

  const actions = useTrafficMetricsActions();
  const isMounted = useRef(false);

  // 组件挂载时获取数据
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      // 首次加载数据
      actions.fetchAllTrafficMetrics();
    }
    
    // 组件卸载时重置标志
    return () => {
      isMounted.current = false;
    };
  }, [actions]);
  
  // 单独处理轮询逻辑
  useEffect(() => {
    // 开始轮询
    if (!isPolling) {
      actions.startPolling();
    }
    
    // 组件卸载时停止轮询
    return () => {
      if (isPolling) {
        actions.stopPolling();
      }
    };
  }, [actions, isPolling]);

  // 格式化流量大小
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  // 格式化日期时间
  const formatDateTime = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  // 如果正在加载并且没有数据
  if (isLoading && (!basicStats || !basicStats.totalBytes)) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">网络流量监控</h1>
        <div className="flex items-center space-x-2 mt-2 md:mt-0">
          <Badge variant={isPolling ? "success" : "warning"}>
            {isPolling ? "实时监控中" : "监控已暂停"}
          </Badge>
          <button
            onClick={() => {
              if (isPolling) {
                actions.stopPolling();
              } else {
                // 只在未轮询状态下启动轮询和获取数据
                actions.startPolling();
                // 只在初始加载时获取数据，避免多余的API调用
                if (!isLoading && (!basicStats || !basicStats.totalBytes)) {
                  actions.fetchAllTrafficMetrics();
                }
              }
            }}
            className={`px-4 py-2 rounded-md text-sm ${isPolling ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
          >
            {isPolling ? "暂停监控" : "开始监控"}
          </button>
        </div>
      </div>

      {/* 流量统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 flex flex-col">
          <div className="flex items-center mb-2">
            <Activity className="w-5 h-5 mr-2 text-blue-500" />
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">总流量</h3>
          </div>
          <p className="text-2xl font-bold">{formatBytes(basicStats?.totalBytes || 0)}</p>
          <p className="text-sm text-gray-500 mt-2">
            {formatDateTime(basicStats?.timeRange?.start || '')} - {formatDateTime(basicStats?.timeRange?.end || '')}
          </p>
        </Card>

        <Card className="p-4 flex flex-col">
          <div className="flex items-center mb-2">
            <Layers className="w-5 h-5 mr-2 text-purple-500" />
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">数据包总数</h3>
          </div>
          <p className="text-2xl font-bold">{(basicStats?.count || 0).toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-2">平均大小: {formatBytes(basicStats?.avgSize || 0)}</p>
        </Card>

        <Card className="p-4 flex flex-col">
          <div className="flex items-center mb-2">
            <Activity className="w-5 h-5 mr-2 text-green-500" />
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">最新统计</h3>
          </div>
          <p className="text-2xl font-bold">{formatBytes(summary?.lastHourTraffic || 0)}</p>
          <p className="text-sm text-gray-500 mt-2">最近一小时流量</p>
        </Card>

        <Card className="p-4 flex flex-col">
          <div className="flex items-center mb-2">
            <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">异常数量</h3>
          </div>
          <p className="text-2xl font-bold">{summary?.anomalyCount || 0}</p>
          <p className="text-sm text-gray-500 mt-2">上次捕获: {formatDateTime(summary?.lastCaptureTime || '')}</p>
        </Card>
      </div>

      {/* 实时流量图表 */}
      <NetworkRealTimeTrafficChart showControls={false} />

      {/* 主要内容区域 */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">总览</TabsTrigger>
          <TabsTrigger value="connections">连接</TabsTrigger>
          <TabsTrigger value="anomalies">异常</TabsTrigger>
          <TabsTrigger value="applications">应用</TabsTrigger>
        </TabsList>

        {/* 总览标签页 */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 协议分布图 */}
            <NetworkProtocolDistribution />
            
            {/* 来源IP统计 */}
            <NetworkTopTrafficSources />

            {/* 数据包大小分布 */}
            <Card className="p-4">
              <div className="flex items-center mb-4">
                <Database className="w-5 h-5 mr-2 text-blue-500" />
                <h3 className="text-lg font-medium">数据包大小分布</h3>
              </div>
              <div className="overflow-auto h-80">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>大小范围</TableHead>
                      <TableHead>数量</TableHead>
                      <TableHead>占比</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {packetSizes?.map((size: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{size.sizeRange}</TableCell>
                        <TableCell>{size?.count ? size.count.toLocaleString() : '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                              <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${size.percentage}%` }}>
                              </div>
                            </div>
                            <span>{size.percentage.toFixed(1)}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!packetSizes?.length && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4 text-gray-400">
                          暂无数据包大小分布数据
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* 连接标签页 */}
        <TabsContent value="connections" className="space-y-6">
          <Card className="p-4">
            <div className="flex items-center mb-4">
              <Network className="w-5 h-5 mr-2 text-blue-500" />
              <h3 className="text-lg font-medium">活跃连接</h3>
            </div>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>源IP:端口</TableHead>
                    <TableHead>目标IP:端口</TableHead>
                    <TableHead>协议</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>持续时间</TableHead>
                    <TableHead>流量</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeConnections?.map((conn: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{conn.sourceIp}:{conn.sourcePort || 'N/A'}</TableCell>
                      <TableCell>{conn.destinationIp}:{conn.destinationPort || 'N/A'}</TableCell>
                      <TableCell>{conn.protocol}</TableCell>
                      <TableCell>{conn.state}</TableCell>
                      <TableCell>{conn.duration}秒</TableCell>
                      <TableCell>{formatBytes(conn.bytesIn + conn.bytesOut)}</TableCell>
                    </TableRow>
                  ))}
                  {!activeConnections?.length && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-gray-400">
                        暂无活跃连接数据
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* 通信对 */}
          <Card className="p-4">
            <div className="flex items-center mb-4">
              <Server className="w-5 h-5 mr-2 text-purple-500" />
              <h3 className="text-lg font-medium">通信对统计</h3>
            </div>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>源IP</TableHead>
                    <TableHead>目标IP</TableHead>
                    <TableHead>数据包数</TableHead>
                    <TableHead>总流量</TableHead>
                    <TableHead>开始时间</TableHead>
                    <TableHead>最后时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {communicationPairs?.filter((pair: any) => !(pair.sourceIp === '0.0.0.0' && pair.destinationIp === '0.0.0.0')).map((pair: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{pair.sourceIp}</TableCell>
                      <TableCell>{pair.destinationIp}</TableCell>
                      <TableCell>{pair.packetsCount?pair.packetsCount.toLocaleString():'-'}</TableCell>
                      <TableCell>{formatBytes(pair.bytesCount)}</TableCell>
                      <TableCell>{formatDateTime(pair.startTime)}</TableCell>
                      <TableCell>{formatDateTime(pair.lastTime)}</TableCell>
                    </TableRow>
                  ))}
                  {!communicationPairs?.length && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-gray-400">
                        暂无通信对数据
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* 异常标签页 */}
        <TabsContent value="anomalies" className="space-y-6">
          <Card className="p-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
              <h3 className="text-lg font-medium">异常检测</h3>
            </div>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>时间</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>严重程度</TableHead>
                    <TableHead>源IP</TableHead>
                    <TableHead>目标IP</TableHead>
                    <TableHead>详情</TableHead>
                    <TableHead>状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {anomalies?.map((anomaly: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{formatDateTime(anomaly.timestamp)}</TableCell>
                      <TableCell>{anomaly.type}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            anomaly.severity === 'critical' ? 'destructive' :
                            anomaly.severity === 'high' ? 'destructive' :
                            anomaly.severity === 'medium' ? 'warning' : 'outline'
                          }
                        >
                          {anomaly.severity === 'critical' ? '严重' :
                           anomaly.severity === 'high' ? '高危' :
                           anomaly.severity === 'medium' ? '中等' : '低危'}
                        </Badge>
                      </TableCell>
                      <TableCell>{anomaly.sourceIp}</TableCell>
                      <TableCell>{anomaly.destinationIp}</TableCell>
                      <TableCell className="max-w-xs truncate" title={anomaly.details}>
                        {anomaly.details}
                      </TableCell>
                      <TableCell>
                        <Badge variant={anomaly.resolved ? 'success' : 'outline'}>
                          {anomaly.resolved ? '已解决' : '未解决'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!anomalies?.length && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-gray-400">
                        暂无异常检测数据
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* 应用标签页 */}
        <TabsContent value="applications" className="space-y-6">
          <Card className="p-4">
            <div className="flex items-center mb-4">
              <Clock className="w-5 h-5 mr-2 text-blue-500" />
              <h3 className="text-lg font-medium">应用统计</h3>
            </div>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>应用名称</TableHead>
                    <TableHead>入站流量</TableHead>
                    <TableHead>出站流量</TableHead>
                    <TableHead>入站包数</TableHead>
                    <TableHead>出站包数</TableHead>
                    <TableHead>连接数</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications?.map((app: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{app.application}</TableCell>
                      <TableCell>{formatBytes(app.bytesIn)}</TableCell>
                      <TableCell>{formatBytes(app.bytesOut)}</TableCell>
                      <TableCell>{app.packetsIn?app.packetsIn.toLocaleString():'-'}</TableCell>
                      <TableCell>{app.packetsOut?app.packetsOut.toLocaleString():'-'}</TableCell>
                      <TableCell>{app.connections?app.connections.toLocaleString():'-'}</TableCell>
                    </TableRow>
                  ))}
                  {!applications?.length && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-gray-400">
                        暂无应用统计数据
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}