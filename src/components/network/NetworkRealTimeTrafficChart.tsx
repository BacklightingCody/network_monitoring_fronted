import { useEffect, useRef } from 'react';
import { Card } from '@/components/common/Card';
import { Activity, TrendingUp, Zap } from 'lucide-react';
import LineCharts from '@/components/common/LineCharts';
import { useTrafficMetricsData, useTrafficMetricsActions } from '@/stores';

interface NetworkRealTimeTrafficChartProps {
  className?: string;
  title?: string;
  showControls?: boolean;
}

export function NetworkRealTimeTrafficChart({ 
  className = "", 
  title = "实时网络流量", 
  showControls = true 
}: NetworkRealTimeTrafficChartProps) {
  // 使用流量指标store
  const { realtimeTraffic, isPolling } = useTrafficMetricsData();
  const actions = useTrafficMetricsActions();
  const isMounted = useRef(false);

  // 组件挂载时获取数据，不自动开始轮询
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      // 首次加载数据，但不启动轮询，由父组件控制
      if (!isPolling) {
        actions.fetchRealtimeTraffic();
      }
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [actions, isPolling]);

  // 转换实时流量数据为图表格式
  const getRealtimeChartData = () => {
    if (!realtimeTraffic?.timePoints || !Array.isArray(realtimeTraffic.timePoints)) {
      return [];
    }
    
    return [
      {
        name: '入站流量',
        data: realtimeTraffic.timePoints.map((item: any) => ({
          time: item && item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : '',
          value: item && item.inboundBps ? item.inboundBps / 1024 : 0, // 转为KB/s
        })),
        color: '#3B82F6', // 蓝色
      },
      {
        name: '出站流量',
        data: realtimeTraffic.timePoints.map((item: any) => ({
          time: item && item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : '',
          value: item && item.outboundBps ? item.outboundBps / 1024 : 0, // 转为KB/s
        })),
        color: '#10B981', // 绿色
      },
      {
        name: '总流量',
        data: realtimeTraffic.timePoints.map((item: any) => ({
          time: item && item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : '',
          value: item && item.totalBps ? item.totalBps / 1024 : 0, // 转为KB/s
        })),
        color: '#6366F1', // 靛蓝色
      },
    ];
  };

  // 转换数据包速率为图表格式
  const getPacketRateChartData = () => {
    if (!realtimeTraffic?.timePoints || !Array.isArray(realtimeTraffic.timePoints)) {
      return [];
    }
    
    return [
      {
        name: '入站数据包',
        data: realtimeTraffic.timePoints.map((item: any) => ({
          time: item && item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : '',
          value: item && item.inboundPps ? item.inboundPps : 0,
        })),
        color: '#F59E0B', // 琥珀色
      },
      {
        name: '出站数据包',
        data: realtimeTraffic.timePoints.map((item: any) => ({
          time: item && item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : '',
          value: item && item.outboundPps ? item.outboundPps : 0,
        })),
        color: '#EC4899', // 粉色
      },
      {
        name: '总数据包',
        data: realtimeTraffic.timePoints.map((item: any) => ({
          time: item && item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : '',
          value: item && item.totalPps ? item.totalPps : 0,
        })),
        color: '#8B5CF6', // 紫色
      },
    ];
  };

  // 计算当前流量数据
  const getCurrentTrafficData = () => {
    if (!realtimeTraffic?.timePoints || !realtimeTraffic.timePoints.length) {
      return { in: 0, out: 0, total: 0 };
    }
    
    const latestPoint = realtimeTraffic.timePoints[realtimeTraffic.timePoints.length - 1];
    return {
      in: latestPoint.inboundBps ? (latestPoint.inboundBps / 1024).toFixed(2) : 0,
      out: latestPoint.outboundBps ? (latestPoint.outboundBps / 1024).toFixed(2) : 0,
      total: latestPoint.totalBps ? (latestPoint.totalBps / 1024).toFixed(2) : 0,
    };
  };

  const currentTraffic = getCurrentTrafficData();

  return (
    <Card className={`p-4 ${className} shadow-lg border border-gray-100 dark:border-gray-800`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Activity className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
        </div>
        {showControls && (
          <button
            onClick={() => {
              if (isPolling) {
                actions.stopPolling();
              } else {
                actions.startPolling();
                actions.fetchRealtimeTraffic();
              }
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isPolling 
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-md' 
                : 'bg-green-500 hover:bg-green-600 text-white shadow-md'
            }`}
          >
            {isPolling ? "暂停监控" : "开始监控"}
          </button>
        )}
      </div>

      {/* 流量指标卡片 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">入站流量</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{currentTraffic.in} <span className="text-sm">KB/s</span></p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">出站流量</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{currentTraffic.out} <span className="text-sm">KB/s</span></p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">总流量</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{currentTraffic.total} <span className="text-sm">KB/s</span></p>
            </div>
            <Zap className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="h-72 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-4">带宽使用 (KB/s)</h3>
          {realtimeTraffic?.timePoints && Array.isArray(realtimeTraffic.timePoints) && realtimeTraffic.timePoints.length > 0 ? (
            <div className="h-64">
              <LineCharts
                data={getRealtimeChartData()}
                timeRange="30m"
                yAxisUnit="KB/s"
                showLegend={true}
                dot={false}
                curveType="monotone"
                syncId="network"
              />
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="text-center">
                <Activity className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                <p>暂无实时数据</p>
              </div>
            </div>
          )}
        </div>

        <div className="h-72 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-4">数据包速率 (包/秒)</h3>
          {realtimeTraffic?.timePoints && Array.isArray(realtimeTraffic.timePoints) && realtimeTraffic.timePoints.length > 0 ? (
            <div className="h-64">
              <LineCharts
                data={getPacketRateChartData()}
                timeRange="30m"
                yAxisUnit="包/秒"
                showLegend={true}
                dot={false}
                curveType="monotone"
                syncId="network"
              />
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="text-center">
                <Activity className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                <p>暂无实时数据</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 text-xs bg-gray-50 dark:bg-gray-800/50 rounded-md p-3 flex items-center justify-between">
        <span className="text-gray-500 dark:text-gray-400">
          实时更新: {isPolling ? '已开启 (5秒刷新)' : '已暂停'}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs ${isPolling ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
          {isPolling ? "活跃" : "暂停"}
        </span>
      </div>
    </Card>
  );
} 