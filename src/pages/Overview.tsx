// import React from 'react';
import { useEffect, useState } from 'react';
import { SystemMetrics } from '../components/metrics/SystemMetrics';
import { MonitoringMetrics } from '../components/metrics/MonitoringMetrics';
import { NetworkStats } from '../components/network/NetworkStats';
import { ServerList } from '../components/servers/ServerList';
import { ServiceHealthPanel } from '../components/services/ServiceHealthPanel';
import { AlertsPanel } from '../components/alerts/AlertsPanel';
import { useNetworkMetrics, useSystemMetrics, useTrafficMetrics } from '@/stores';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatusIndicator } from '@/components/ui/StatesIndicator';

export function Overview() {
  // 获取所有相关的store和加载数据方法
  const { 
    fetchNetworkMetrics, 
    isLoading: networkLoading, 
    bytesReceived,
    bytesSent,
    bytesTotal,
    trafficTrend
  } = useNetworkMetrics();
  
  const { 
    fetchSystemMetrics, 
    isLoading: systemLoading,
    hostname,
    memoryUsagePercentage,
    processes,
    threads,
    services 
  } = useSystemMetrics();
  
  const { 
    fetchTrafficVolume, 
    fetchAllTrafficMetrics,
    fetchTrafficAnomalies,
    isLoading: trafficLoading,
    trafficVolume,
    anomalies,
    protocolStats
  } = useTrafficMetrics();

  // 全局加载状态 - 仅在首次加载时显示
  const [initialLoading, setInitialLoading] = useState(true);
  // 刷新状态 - 用于后续数据刷新
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 数据是否已经加载标识
  const dataLoaded = bytesReceived?.length > 0 || 
                    services?.length > 0 || 
                    trafficVolume?.length > 0 || 
                    hostname || 
                    protocolStats?.length > 0;

  // 全局状态（仅对刷新状态显示）
  const isLoading = networkLoading || systemLoading || trafficLoading;

  // 当组件加载时初始化所有数据
  useEffect(() => {
    // 标记数据正在加载
    setInitialLoading(true);
    
    // 并行获取所有初始数据
    const promises = [
      fetchNetworkMetrics(),
      fetchSystemMetrics(),
      fetchTrafficVolume(),
      fetchAllTrafficMetrics(),
      fetchTrafficAnomalies()
    ];

    // 所有数据加载完成后，切换加载状态
    Promise.all(promises)
      .catch(error => console.error('数据加载失败:', error))
      .finally(() => {
        // 初始加载完成
        setInitialLoading(false);
      });

    // 设置5秒轮询间隔
    const POLL_INTERVAL = 5000; // 5秒

    // 轮询函数
    const refreshData = async () => {
      // 只在存在初始数据后才显示刷新状态
      if (dataLoaded) {
        setIsRefreshing(true);
      }
      
      try {
        // 并行获取最新数据
        await Promise.all([
          fetchNetworkMetrics(),
          fetchSystemMetrics(),
          fetchTrafficVolume(),
          fetchAllTrafficMetrics()
        ]);
      } catch (error) {
        console.error('数据刷新失败:', error);
      } finally {
        setIsRefreshing(false);
      }
    };

    // 开始所有数据的轮询，设置5秒间隔
    const pollId = setInterval(refreshData, POLL_INTERVAL);

    // 组件卸载时清理
    return () => {
      clearInterval(pollId);
    };
  }, [
    fetchNetworkMetrics, 
    fetchSystemMetrics, 
    fetchTrafficVolume, 
    fetchAllTrafficMetrics,
    fetchTrafficAnomalies,
    dataLoaded
  ]);

  // 初始加载中展示骨架屏或加载指示器
  if (initialLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Card className="border-none shadow-md bg-white dark:bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">系统监控概览</div>
              <div className="flex items-center gap-4">
                <StatusIndicator 
                  status="warning" 
                  label="初始化数据中" 
                  size="md"
                />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          {Array(6).fill(0).map((_, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <div className="h-6 w-1/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-4/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Card className="border-none shadow-md bg-white dark:bg-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">系统监控概览</div>
            <div className="flex items-center gap-4">
              <StatusIndicator 
                status={isRefreshing ? "warning" : "online"} 
                label={isRefreshing ? "正在更新数据" : "系统正常"} 
                size="md"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            实时监控网络流量、系统资源和服务状态，数据每5秒自动更新一次 {hostname ? `· 主机名: ${hostname}` : ''}
          </p>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">监控指标</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">监控系统各项指标实时状态</p>
        </div>
        <MonitoringMetrics />
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">系统资源</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">CPU、内存、磁盘和网络资源使用情况 {memoryUsagePercentage ? `· 内存使用率: ${memoryUsagePercentage.toFixed(1)}%` : ''}</p>
        </div>
        <SystemMetrics />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">网络流量</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              实时监控网络流量变化趋势 
              {bytesTotal ? `· 总流量: ${(bytesTotal / (1024 * 1024)).toFixed(2)} MB` : ''}
            </p>
          </div>
          <NetworkStats />
        </div>
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">服务器</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              监控服务器状态和资源使用
              {services ? `· ${services.length}个服务` : ''}
            </p>
          </div>
          <ServerList />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">服务状态</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              各服务运行状态和健康检查
              {processes ? `· ${processes}个进程 · ${threads}个线程` : ''}
            </p>
          </div>
          <ServiceHealthPanel />
        </div>
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">警报</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              系统异常和警报事件
              {anomalies?.length ? `· ${anomalies.length}个异常` : ''}
            </p>
          </div>
          <AlertsPanel />
        </div>
      </div>
    </div>
  );
}