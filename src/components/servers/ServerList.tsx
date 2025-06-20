// import React from 'react';
import { useState, useEffect } from 'react';
import { ServerStatus } from '../../utils/types/monitoring';
import { Server, HardDrive, MemoryStick, Cpu } from 'lucide-react';
import { useSystemMetrics } from '@/stores';
import { Card } from '@/components/common/Card';
import { StatusIndicator } from '@/components/ui/StatesIndicator';

export function ServerList() {
  const { services, isLoading, error, fetchSystemMetrics } = useSystemMetrics();
  const [servers, setServers] = useState<ServerStatus[]>([]);

  useEffect(() => {
    // 初次加载时获取数据
    fetchSystemMetrics();

    // 不需要在这里设置间隔，因为Overview页面已经设置了5秒轮询
  }, [fetchSystemMetrics]);

  useEffect(() => {
    if (services && services.length > 0) {
      // 将服务数据转换为服务器状态数据
      const serverData: ServerStatus[] = services.map((service, index) => ({
        id: `service-${index}`,
        name: service.displayName || service.name,
        status: service.state === 'running' ? 'online' : service.state === 'stopped' ? 'offline' : 'warning',
        lastChecked: new Date(),
        ipAddress: 'localhost',
        cpu: Math.floor(Math.random() * 60) + 10, // 模拟CPU使用率 10%-70%
        memory: Math.floor(Math.random() * 55) + 25, // 模拟内存使用率 25%-80% 
        disk: Math.floor(Math.random() * 50) + 30, // 模拟磁盘使用率 30%-80%
      }));
      setServers(serverData);
    } else {
      // 如果没有真实数据，使用备用数据
      setServers([
        { 
          id: '1', 
          name: '生产服务器', 
          status: 'online', 
          lastChecked: new Date(),
          ipAddress: '192.168.1.100',
          cpu: 35,
          memory: 42,
          disk: 68
        },
        { 
          id: '2', 
          name: '备份服务器', 
          status: 'online', 
          lastChecked: new Date(),
          ipAddress: '192.168.1.101',
          cpu: 22,
          memory: 30,
          disk: 45
        },
        { 
          id: '3', 
          name: '开发服务器', 
          status: 'warning', 
          lastChecked: new Date(),
          ipAddress: '192.168.1.102',
          cpu: 78,
          memory: 85,
          disk: 72
        },
        { 
          id: '4', 
          name: '测试服务器', 
          status: 'offline', 
          lastChecked: new Date(),
          ipAddress: '192.168.1.103',
          cpu: 0,
          memory: 0,
          disk: 40
        },
      ]);
    }
  }, [services]);

  const getResourceUsageColor = (usage: number) => {
    if (usage > 80) return 'text-red-500';
    if (usage > 60) return 'text-yellow-500';
    return 'text-green-500';
  };

  const renderResourceBar = (value: number, icon: React.ReactNode) => {
    return (
      <div className="flex items-center gap-1.5">
        {icon}
        <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${value > 80 ? 'bg-red-500' : value > 60 ? 'bg-yellow-500' : 'bg-green-500'}`} 
            style={{ width: `${value}%` }} 
          />
        </div>
        <span className={`text-xs font-medium ${getResourceUsageColor(value)}`}>{value}%</span>
      </div>
    );
  };

  return (
    <Card className="shadow-lg border border-gray-100 dark:border-gray-800">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">服务器状态</h2>
          {isLoading && (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="text-xs text-gray-500">刷新中</span>
            </div>
          )}
        </div>
      </div>
      
      {error ? (
        <div className="p-4 text-center text-red-500">{error}</div>
      ) : (
        <div className="p-4 space-y-4">
          {servers.map((server) => (
            <div
              key={server.id}
              className="border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm"
            >
              <div className="p-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <Server className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{server.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {server.ipAddress || 'IP未知'} | 检查时间: {server.lastChecked.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <StatusIndicator 
                  status={server.status as any} 
                  size="sm"
                  pulseSpeed={server.status === 'warning' ? 'fast' : 'normal'} 
                />
              </div>
              
              {server.status !== 'offline' && server.cpu !== undefined && server.memory !== undefined && (
                <div className="p-3 space-y-2">
                  {renderResourceBar(server.cpu, <Cpu className="h-3 w-3 text-gray-400" />)}
                  {renderResourceBar(server.memory, <MemoryStick className="h-3 w-3 text-gray-400" />)}
                  {renderResourceBar(server.disk || 0, <HardDrive className="h-3 w-3 text-gray-400" />)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}