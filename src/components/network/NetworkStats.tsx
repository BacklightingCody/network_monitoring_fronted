// import React from 'react';
import { useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/ui/Badge';
import { Activity, Clock, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useTrafficMetricsData } from '@/stores';

export function NetworkStats() {
  const { trafficVolume, summary, basicStats } = useTrafficMetricsData();
  
  // 使用真实数据或回退到模拟数据
  const chartData = trafficVolume && trafficVolume.length > 0 
    ? trafficVolume.map((item: any) => ({
        time: new Date(item.timestamp).toLocaleTimeString(),
        download: item.inbound || Math.floor(Math.random() * 600 + 100),
        upload: item.outbound || Math.floor(Math.random() * 400 + 50),
      }))
    : Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        download: Math.floor(Math.random() * 600 + 100),
        upload: Math.floor(Math.random() * 400 + 50),
      }));
  
  // 格式化流量
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };
  
  // 格式化时间
  const formatTime = (dateStr: string): string => {
    if (!dateStr) return '无数据';
    return new Date(dateStr).toLocaleString();
  };
  
  // 计算当前的下载和上传速率
  const getCurrentRates = () => {
    if (!chartData || chartData.length === 0) {
      return { download: 0, upload: 0 };
    }
    
    const latest = chartData[chartData.length - 1];
    return {
      download: latest.download,
      upload: latest.upload
    };
  };
  
  const currentRates = getCurrentRates();

  return (
    <Card className="p-6 shadow-lg border border-gray-100 dark:border-gray-800">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center">
          <Activity className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">网络流量趋势</h2>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Badge variant="outline" className="flex items-center gap-2 px-2.5 py-1">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-medium">更新时间: {formatTime(summary?.lastCaptureTime || '')}</span>
          </Badge>
          
          <div className="flex gap-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
              <span className="text-sm text-gray-600 dark:text-gray-400">下载</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
              <span className="text-sm text-gray-600 dark:text-gray-400">上传</span>
            </div>
          </div>
        </div>
      </div>

      {/* 流量统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">当前下载速率</p>
              <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{currentRates.download} <span className="text-sm">KB/s</span></p>
            </div>
            <ArrowDownCircle className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">当前上传速率</p>
              <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{currentRates.upload} <span className="text-sm">KB/s</span></p>
            </div>
            <ArrowUpCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">总流量</p>
              <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{formatBytes(basicStats?.totalBytes || 0)}</p>
            </div>
            <Activity className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">最近一小时流量</p>
              <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{formatBytes(summary?.lastHourTraffic || 0)}</p>
            </div>
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
        </div>
      </div>

      <div className="h-[300px] bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="download" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="upload" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              stroke="#9CA3AF" 
              fontSize={12} 
              tickFormatter={(value) => value.substring(0, 5)}
            />
            <YAxis 
              stroke="#9CA3AF" 
              fontSize={12} 
              tickFormatter={(value) => `${value} KB/s`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number) => [`${value} KB/s`, '']}
              labelFormatter={(label) => `时间: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="download"
              stroke="#3B82F6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#download)"
              name="下载"
            />
            <Area
              type="monotone"
              dataKey="upload"
              stroke="#22C55E"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#upload)"
              name="上传"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
        <span>时间范围: {formatTime(basicStats?.timeRange?.start || '')} - {formatTime(basicStats?.timeRange?.end || '')}</span>
        <Badge variant="outline">数据点: {chartData.length || 0}</Badge>
      </div>
    </Card>
  );
}