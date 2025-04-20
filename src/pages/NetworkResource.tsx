// import React from 'react';
import { useRef, useEffect, useState } from 'react';
import { useTrafficMetrics } from '../stores';
import { Card } from '@/components/common/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/Badge';
import {
  BarChart, PieChart, LineChart,
  Globe, Activity, AlertTriangle, Network, Database,
  Server, Layers, Radio, Clock
} from 'lucide-react';
import LineCharts from '@/components/common/LineCharts';
import PieCharts from '@/components/common/PieCharts';
import BarCharts from '@/components/common/BarCharts';
import { useTrafficMetricsData, useTrafficMetricsActions } from '@/stores';
import {
  getAllTrafficMetrics,
} from '@/services/api/traffic';

export function NetworkResource() {
  // 使用流量指标store
  const {
    stats,
    topSources,
    topDestinations,
    protocols,
    anomalies,
    trafficVolume,
    activeConnections,
    realtimeTraffic,
    isLoading,
    error,
    isPolling,
    startPolling,
    stopPolling,
    fetchAllTrafficMetrics
  } = useTrafficMetrics();

  const metrics = useTrafficMetricsData();
  const actions = useTrafficMetricsActions();
  const isMounted = useRef(false);
  const [allData, setAllData] = useState<any>({
    basicStats: { timeSeries: [], count: 0, totalBytes: 0, avgSize: 0, timeRange: {} },
    topSources: [],
    topDestinations: [],
    protocolStats: [],
    activeConnections: [],
    realtimeTraffic: { timePoints: [] },
    packetSizes: [],
    communicationPairs: [],
    applications: [],
    summary: { anomalyCount: 0, lastHourTraffic: 0 }
  });

  // 组件挂载时获取数据并开始轮询
  useEffect(() => {
    async function getInitialData() {
      try {
        const response = await getAllTrafficMetrics();
        console.log('获取所有流量数据:', response);
        if (response) {
          setAllData(response);
        }
      } catch (error) {
        console.error('❌ 接口请求失败:', error);
      }
    }
    
    getInitialData();
    
    if (!isMounted.current) {
      isMounted.current = true;
      actions.startPolling(); // 启动轮询
    }
    
    const intervalId = setInterval(async () => {
      try {
        const response = await getAllTrafficMetrics();
        if (response) {
          setAllData(response);
        }
      } catch (error) {
        console.error('轮询请求失败:', error);
      }
    }, 5000);

    // 组件卸载时停止轮询
    return () => {
      clearInterval(intervalId); // 清除轮询间隔
      if (isMounted.current) {
        actions.stopPolling(); // 停止轮询
        isMounted.current = false;
      }
    };
  }, []);

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

  // 转换实时流量数据为图表格式
  const getRealtimeChartData = () => {
    if (!allData?.realtimeTraffic?.timePoints || !Array.isArray(allData.realtimeTraffic.timePoints)) {
      return [];
    }
    
    return [
      {
        name: '入站流量',
        data: allData.realtimeTraffic.timePoints.map((item: any) => ({
          time: item && item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : '',
          value: item && item.inboundBps ? item.inboundBps / 1024 : 0, // 转为KB/s
        })),
      },
      {
        name: '出站流量',
        data: allData.realtimeTraffic.timePoints.map((item: any) => ({
          time: item && item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : '',
          value: item && item.outboundBps ? item.outboundBps / 1024 : 0, // 转为KB/s
        })),
      },
    ];
  };

  // 转换协议数据为饼图格式
  const getProtocolChartData = () => {
    if (!allData?.protocolStats || !Array.isArray(allData.protocolStats)) {
      return [];
    }
    
    return allData.protocolStats.slice(0, 7).map((protocol: any) => ({
      name: protocol && protocol.protocol ? protocol.protocol : 'Unknown',
      value: protocol && protocol.count ? protocol.count : 0,
    }));
  };

  // 转换流量趋势数据为图表格式
  const getTrafficVolumeChartData = () => {
    if (!allData?.basicStats?.timeSeries || !Array.isArray(allData.basicStats.timeSeries)) {
      return [];
    }
    
    const timeSeries = allData.basicStats.timeSeries.slice(-20);
    
    return [
      {
        name: '流量',
        data: timeSeries.map((item: any) => ({
          time: item && item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : '',
          value: item && item.bytes ? item.bytes / (1024 * 1024) : 0, // 转为MB
        })),
      },
    ];
  };

  // 转换IP来源数据为柱状图格式
  const getTopSourcesChartData = () => {
    if (!allData?.topSources || !Array.isArray(allData.topSources)) {
      return [];
    }
    
    return allData.topSources
      .filter((source: any) => source && source.ip !== '0.0.0.0')
      .slice(0, 10)
      .map((source: any) => ({
        name: source.ip || 'Unknown',
        流量: source.count || 0,
      }));
  };

  // 如果正在加载并且没有数据
  if (isLoading && !allData) {
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
            onClick={async () => {
              if (isPolling) {
                stopPolling();
              } else {
                startPolling();
                try {
                  const response = await getAllTrafficMetrics();
                  if (response) {
                    setAllData(response);
                  }
                } catch (error) {
                  console.error('获取流量数据失败:', error);
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
          <p className="text-2xl font-bold">{formatBytes(allData?.basicStats?.totalBytes || 0)}</p>
          <p className="text-sm text-gray-500 mt-2">
            {formatDateTime(allData?.basicStats?.timeRange?.start || '')} - {formatDateTime(allData?.basicStats?.timeRange?.end || '')}
          </p>
        </Card>

        <Card className="p-4 flex flex-col">
          <div className="flex items-center mb-2">
            <Layers className="w-5 h-5 mr-2 text-purple-500" />
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">数据包总数</h3>
          </div>
          <p className="text-2xl font-bold">{(allData?.basicStats?.count || 0).toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-2">平均大小: {formatBytes(allData?.basicStats?.avgSize || 0)}</p>
        </Card>

        <Card className="p-4 flex flex-col">
          <div className="flex items-center mb-2">
            <LineChart className="w-5 h-5 mr-2 text-green-500" />
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">最新统计</h3>
          </div>
          <p className="text-2xl font-bold">{formatBytes(allData?.summary?.lastHourTraffic || 0)}</p>
          <p className="text-sm text-gray-500 mt-2">最近一小时流量</p>
        </Card>

        <Card className="p-4 flex flex-col">
          <div className="flex items-center mb-2">
            <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">异常数量</h3>
          </div>
          <p className="text-2xl font-bold">{allData?.summary?.anomalyCount || 0}</p>
          <p className="text-sm text-gray-500 mt-2">上次捕获: {formatDateTime(allData?.summary?.lastCaptureTime || '')}</p>
        </Card>
      </div>

      {/* 实时流量图表 */}
      <Card className="p-4 mb-6">
        <div className="flex items-center mb-4">
          <Activity className="w-5 h-5 mr-2 text-blue-500" />
          <h2 className="text-lg font-medium">流量趋势</h2>
        </div>
        <div className="h-64">
          {allData?.basicStats?.timeSeries && Array.isArray(allData.basicStats.timeSeries) && allData.basicStats.timeSeries.length > 0 ? (
            <LineCharts
              data={getTrafficVolumeChartData()}
              timeRange="1h"
              yAxisUnit="MB"
              showLegend={true}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              暂无实时数据
            </div>
          )}
        </div>
      </Card>

      {/* 主要内容区域 */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">总览</TabsTrigger>
          <TabsTrigger value="connections">连接</TabsTrigger>
          <TabsTrigger value="protocols">协议</TabsTrigger>
          <TabsTrigger value="applications">应用</TabsTrigger>
        </TabsList>

        {/* 总览标签页 */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 协议分布图 */}
            <Card className="p-4">
              <div className="flex items-center mb-4">
                <PieChart className="w-5 h-5 mr-2 text-purple-500" />
                <h3 className="text-lg font-medium">协议分布</h3>
              </div>
              <div className="h-80">
                {allData?.protocolStats && Array.isArray(allData.protocolStats) && allData.protocolStats.length > 0 ? (
                  <PieCharts
                    data={getProtocolChartData()}
                    donut={true}
                    innerRadius={60}
                    paddingAngle={4}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">
                    暂无协议数据
                  </div>
                )}
              </div>
            </Card>

            {/* 来源IP统计 */}
            <Card className="p-4">
              <div className="flex items-center mb-4">
                <BarChart className="w-5 h-5 mr-2 text-green-500" />
                <h3 className="text-lg font-medium">来源IP统计</h3>
              </div>
              <div className="h-80">
                {allData?.topSources && Array.isArray(allData.topSources) && allData.topSources.length > 0 ? (
                  <BarCharts
                    data={getTopSourcesChartData()}
                    xAxisKey="name"
                    layout="vertical"
                    barSize={20}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">
                    暂无来源IP数据
                  </div>
                )}
              </div>
            </Card>

            {/* 目标IP统计 */}
            <Card className="p-4">
              <div className="flex items-center mb-4">
                <Globe className="w-5 h-5 mr-2 text-teal-500" />
                <h3 className="text-lg font-medium">目标IP TOP 10</h3>
              </div>
              <div className="overflow-auto h-80">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>IP地址</TableHead>
                      <TableHead>数据包数</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allData?.topDestinations?.filter((dest: any) => dest.ip !== '0.0.0.0').slice(0, 10).map((dest: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{dest.ip}</TableCell>
                        <TableCell>{dest.count.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    {!allData?.topDestinations?.length && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-4 text-gray-400">
                          暂无目标IP数据
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>

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
                    {allData?.packetSizes?.map((size: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{size.label}</TableCell>
                        <TableCell>{size.count.toLocaleString()}</TableCell>
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
                    {!allData?.packetSizes?.length && (
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
                    <TableHead>首次见</TableHead>
                    <TableHead>最后见</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allData?.activeConnections?.map((conn: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{conn.sourceIp}:{conn.sourcePort || 'N/A'}</TableCell>
                      <TableCell>{conn.destinationIp}:{conn.destinationPort || 'N/A'}</TableCell>
                      <TableCell>{conn.protocol}</TableCell>
                      <TableCell>{formatDateTime(conn.firstSeen)}</TableCell>
                      <TableCell>{formatDateTime(conn.lastSeen)}</TableCell>
                    </TableRow>
                  ))}
                  {!allData?.activeConnections?.length && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-gray-400">
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
                    <TableHead>主要协议</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allData?.communicationPairs?.filter((pair: any) => !(pair.sourceIp === '0.0.0.0' && pair.destinationIp === '0.0.0.0')).map((pair: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{pair.sourceIp}</TableCell>
                      <TableCell>{pair.destinationIp}</TableCell>
                      <TableCell>{pair.packetCount.toLocaleString()}</TableCell>
                      <TableCell>{formatBytes(pair.totalBytes)}</TableCell>
                      <TableCell>
                        {pair.protocolStats?.length > 0 ? pair.protocolStats[0].protocol : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!allData?.communicationPairs?.length && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-gray-400">
                        暂无通信对数据
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* 协议标签页 */}
        <TabsContent value="protocols" className="space-y-6">
          <Card className="p-4">
            <div className="flex items-center mb-4">
              <Radio className="w-5 h-5 mr-2 text-purple-500" />
              <h3 className="text-lg font-medium">协议统计</h3>
            </div>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>协议</TableHead>
                    <TableHead>数据包数</TableHead>
                    <TableHead>比例</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allData?.protocolStats?.map((protocol: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{protocol.protocol}</TableCell>
                      <TableCell>{protocol.count.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${protocol.percentage}%` }}>
                            </div>
                          </div>
                          <span>{protocol.percentage.toFixed(2)}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!allData?.protocolStats?.length && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-gray-400">
                        暂无协议统计数据
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
                    <TableHead>数据包数</TableHead>
                    <TableHead>字节数</TableHead>
                    <TableHead>占比</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allData?.applications?.map((app: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{app.name}</TableCell>
                      <TableCell>{app.packetCount.toLocaleString()}</TableCell>
                      <TableCell>{formatBytes(app.byteCount)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${app.percentage}%` }}>
                            </div>
                          </div>
                          <span>{app.percentage.toFixed(2)}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!allData?.applications?.length && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-gray-400">
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