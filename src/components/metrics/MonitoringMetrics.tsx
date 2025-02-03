import React from 'react';
import { Activity, Database, Container, Network, Terminal, FileText } from 'lucide-react';

interface MetricCardProps {
  title: string;
  subtitle: string;
  total: number;
  current: number;
  percentage: number;
  icon: React.ReactNode;
  color: string;
}

function MetricCard({ title, subtitle, total, current, percentage, icon, color }: MetricCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${color}`}>
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-xl font-bold">{total}</h3>
          </div>
          <div className="mt-2">
            <p className="text-sm font-medium text-gray-900">{title}</p>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm font-medium">{current}</span>
          <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full  ${color.replace('border-', 'bg-')} bg-green-500`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">{percentage.toFixed(2)}%</span>
        </div>
      </div>
    </div>
  );
}

export function MonitoringMetrics() {
  const metrics = [
    {
      title: '进程',
      subtitle: '监控业务进程、中间件',
      total: 31,
      current: 8,
      percentage: 25.81,
      icon: <Activity className="h-5 w-5 text-emerald-500" />,
      color: 'border-emerald-500'
    },
    {
      title: 'DOCKER',
      subtitle: '容器监测',
      total: 4,
      current: 1,
      percentage: 25,
      icon: <Container className="h-5 w-5 text-blue-500" />,
      color: 'border-blue-500'
    },
    {
      title: '数据库',
      subtitle: '数据监测',
      total: 2,
      current: 1,
      percentage: 50,
      icon: <Database className="h-5 w-5 text-indigo-500" />,
      color: 'border-indigo-500'
    },
    {
      title: 'PING',
      subtitle: '网络设备、网关链路监测',
      total: 4,
      current: 2,
      percentage: 50,
      icon: <Network className="h-5 w-5 text-cyan-500" />,
      color: 'border-cyan-500'
    },
    {
      title: '端口',
      subtitle: 'Telnet监控端口',
      total: 34,
      current: 6,
      percentage: 17.65,
      icon: <Terminal className="h-5 w-5 text-sky-500" />,
      color: 'border-sky-500'
    },
    {
      title: '服务接口',
      subtitle: '监控服务API接口',
      total: 9,
      current: 5,
      percentage: 55.56,
      icon: <Activity className="h-5 w-5 text-pink-500" />,
      color: 'border-pink-500'
    },
    {
      title: '主机',
      subtitle: '监控主机/服务器',
      total: 4,
      current: 1,
      percentage: 25,
      icon: <Terminal className="h-5 w-5 text-green-500" />,
      color: 'border-green-500'
    },
    {
      title: '日志监控',
      subtitle: '日志文件监控',
      total: 10,
      current: 10,
      percentage: 100,
      icon: <FileText className="h-5 w-5 text-purple-500" />,
      color: 'border-purple-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
}