// import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Bell, AlertTriangle, AlertCircle, Settings, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTrafficMetrics, useSystemMetrics, useNetworkMetrics } from '@/stores';
import { Card } from '@/components/common/Card';
import { Alert } from '@/utils/types/monitoring';

export function AlertsPanel() {
  const { anomalies, fetchTrafficAnomalies } = useTrafficMetrics();
  const { error: systemError } = useSystemMetrics();
  const { error: networkError } = useNetworkMetrics();
  
  // 存储最后有效的警报数据
  const anomaliesRef = useRef<any[]>([]);
  const systemErrorRef = useRef<string | null>(null);
  const networkErrorRef = useRef<string | null>(null);
  
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // 数据是否正在刷新
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 更新有效数据引用
  useEffect(() => {
    let updated = false;
    
    if (anomalies?.length > 0) {
      anomaliesRef.current = anomalies;
      updated = true;
    }
    
    if (systemError && systemError !== systemErrorRef.current) {
      systemErrorRef.current = systemError;
      updated = true;
    }
    
    if (networkError && networkError !== networkErrorRef.current) {
      networkErrorRef.current = networkError;
      updated = true;
    }
    
    // 如果有数据更新或已经初始化过，则更新警报列表
    if (updated || isInitialized) {
      updateAlerts();
      
      if (!isInitialized) {
        setIsInitialized(true);
      }
    }
  }, [anomalies, systemError, networkError, isInitialized]);

  // 更新警报列表
  const updateAlerts = () => {
    // 显示短暂的刷新状态，但不清空数据
    setIsRefreshing(true);
    
    const allAlerts: Alert[] = [];
    
    // 添加流量异常警报
    if (anomaliesRef.current && anomaliesRef.current.length > 0) {
      anomaliesRef.current.slice(0, 4).forEach((anomaly, index) => {
        // 为异常生成固定ID
        const anomalyId = `traffic-${anomaly.sourceIp}-${anomaly.destinationIp}-${anomaly.type}`;
        
        allAlerts.push({
          id: anomalyId,
          message: `检测到${anomaly.type}：${anomaly.details}`,
          severity: anomaly.severity === 'high' || anomaly.severity === 'critical' ? 'critical' : 'warning',
          time: getRelativeTime(new Date(anomaly.timestamp)),
          source: `${anomaly.sourceIp} → ${anomaly.destinationIp}`,
          details: anomaly.details,
          isRead: false
        });
      });
    }
    
    // 添加系统错误警报
    if (systemErrorRef.current) {
      allAlerts.push({
        id: 'system-error',
        message: `系统指标异常`,
        severity: 'warning',
        time: getRelativeTime(new Date()),
        source: '系统监控',
        details: systemErrorRef.current,
        isRead: false
      });
    }
    
    // 添加网络错误警报
    if (networkErrorRef.current) {
      allAlerts.push({
        id: 'network-error',
        message: `网络指标异常`,
        severity: 'warning',
        time: getRelativeTime(new Date()),
        source: '网络监控',
        details: networkErrorRef.current,
        isRead: false
      });
    }
    
    // 如果没有足够的警报数据，添加一些模拟数据（保持ID固定）
    if (allAlerts.length < 3) {
      const mockAlerts: Alert[] = [
        { 
          id: 'cpu-warning', 
          message: 'CPU使用率超过80%', 
          severity: 'warning', 
          time: '5分钟前',
          source: '系统监控',
          details: 'CPU使用率持续超过阈值，可能导致系统性能下降',
          isRead: false 
        },
        { 
          id: 'db-critical', 
          message: '数据库服务器无响应', 
          severity: 'critical', 
          time: '10分钟前',
          source: '服务监控',
          details: '数据库连接超时，请检查数据库服务是否正常运行',
          isRead: false 
        },
        { 
          id: 'memory-warning', 
          message: '内存使用率超过85%', 
          severity: 'warning', 
          time: '15分钟前',
          source: '系统监控',
          details: '系统内存使用量接近阈值，可能影响应用性能',
          isRead: true
        },
        { 
          id: 'disk-warning', 
          message: '磁盘空间不足', 
          severity: 'warning', 
          time: '30分钟前',
          source: '系统监控',
          details: '磁盘剩余空间低于20%，请及时清理',
          isRead: true
        }
      ];
      
      // 只添加足够的模拟数据，以达到至少3个警报
      for (let i = 0; i < mockAlerts.length && allAlerts.length < 3; i++) {
        const mockAlert = mockAlerts[i];
        if (!allAlerts.some(alert => alert.id === mockAlert.id)) {
          allAlerts.push(mockAlert);
        }
      }
    }
    
    // 更新状态
    setAlerts(allAlerts);
    
    // 300ms后取消刷新状态
    setTimeout(() => {
      setIsRefreshing(false);
    }, 300);
  };
  
  // 转换时间戳为相对时间
  function getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 60) return `${diffSec}秒前`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}分钟前`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}小时前`;
    return `${Math.floor(diffSec / 86400)}天前`;
  }

  const getAlertIcon = (severity: Alert['severity'], isRead: boolean = false) => {
    const opacity = isRead ? 'opacity-50' : '';
    
    switch (severity) {
      case 'critical':
        return <AlertCircle className={`h-5 w-5 text-red-500 ${opacity}`} />;
      case 'warning':
        return <AlertTriangle className={`h-5 w-5 text-yellow-500 ${opacity}`} />;
      case 'info':
        return <Bell className={`h-5 w-5 text-blue-500 ${opacity}`} />;
      default:
        return <Bell className={`h-5 w-5 text-gray-500 ${opacity}`} />;
    }
  };

  const getAlertClass = (severity: Alert['severity'], isRead: boolean = false) => {
    const baseClasses = isRead ? 'opacity-75 ' : '';
    
    switch (severity) {
      case 'critical':
        return `${baseClasses}bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/30`;
      case 'warning':
        return `${baseClasses}bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-800/30`;
      case 'info':
        return `${baseClasses}bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30`;
      default:
        return `${baseClasses}bg-gray-50 dark:bg-gray-900/20 border-gray-100 dark:border-gray-800/30`;
    }
  };

  // 标记警报为已读
  const markAsRead = (id: string) => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        alert.id === id ? { ...alert, isRead: true } : alert
      )
    );
  };

  return (
    <Card className="shadow-lg border border-gray-100 dark:border-gray-800">
      <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">最近警报</h2>
          {isRefreshing && (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
        <Link
          to="/settings/alerts"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
        >
          <Settings className="h-5 w-5" />
        </Link>
      </div>
      
      <div className="p-4 space-y-3">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border ${getAlertClass(alert.severity, alert.isRead)} cursor-pointer transition-opacity`}
              onClick={() => markAsRead(alert.id)}
            >
              <div className="flex items-start space-x-3">
                {getAlertIcon(alert.severity, alert.isRead)}
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{alert.message}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">{alert.time}</span>
                  </div>
                  {alert.source && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      来源: {alert.source}
                    </p>
                  )}
                  {alert.details && !alert.isRead && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {alert.details}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
            <XCircle className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">当前没有警报</p>
          </div>
        )}
      </div>
    </Card>
  );
}