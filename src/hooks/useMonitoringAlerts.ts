import { useEffect, useRef } from 'react';
import { monitoringLogs, logThresholdWarning } from '@/services/api/log';
import { 
  MONITORING_THRESHOLDS,
  CPU_THRESHOLDS,
  MEMORY_THRESHOLDS,
  DISK_THRESHOLDS,
  NETWORK_THRESHOLDS,
  SYSTEM_THRESHOLDS
} from '@/stores/monitoringThresholds';
import { 
  useCpuMetricsData, 
  useMemoryMetricsData,
  useDiskMetricsData,
  useNetworkMetricsData, 
  useSystemMetricsData
} from '@/stores';

/**
 * 监控告警钩子，用于检测系统指标是否超过警告阈值，并自动发送日志
 * @param enabledAlerts 启用的告警类型
 * @param checkInterval 检查间隔(毫秒)，默认30秒
 * @returns {Object} 告警状态
 */
export function useMonitoringAlerts(
  enabledAlerts: {
    cpu?: boolean;
    memory?: boolean;
    disk?: boolean;
    network?: boolean;
    system?: boolean;
  } = {
    cpu: true,
    memory: true,
    disk: true,
    network: true,
    system: true
  },
  checkInterval: number = 30000
) {
  // 获取各类系统指标数据
  const cpuData = useCpuMetricsData();
  const memoryData = useMemoryMetricsData();
  const diskData = useDiskMetricsData();
  const networkData = useNetworkMetricsData();
  const systemData = useSystemMetricsData();
  
  // 记录上次告警时间，避免重复告警
  const lastAlerts = useRef<Record<string, number>>({});
  
  // 检查指标并发送告警
  useEffect(() => {
    if (Object.values(enabledAlerts).every(v => !v)) {
      return; // 如果所有告警都未启用，则不执行检查
    }
    
    // 检查函数
    const checkThresholds = async () => {
      const now = Date.now();
      const minAlertInterval = 5 * 60 * 1000; // 同一指标最少5分钟报一次警
      
      // 检查CPU指标
      if (enabledAlerts.cpu && cpuData.cpuState) {
        // CPU使用率告警
        const cpuUsage = cpuData.cpuState ? 
          (typeof cpuData.cpuState === 'object' && 'totalUtilization' in cpuData.cpuState ? 
            cpuData.cpuState.totalUtilization : 0) : 0;
            
        if (cpuUsage > CPU_THRESHOLDS.USAGE_CRITICAL) {
          if (!lastAlerts.current['cpu_usage_critical'] || (now - lastAlerts.current['cpu_usage_critical']) > minAlertInterval) {
            await monitoringLogs.cpuUsage(cpuUsage, CPU_THRESHOLDS.USAGE_CRITICAL);
            lastAlerts.current['cpu_usage_critical'] = now;
          }
        } else if (cpuUsage > CPU_THRESHOLDS.USAGE_WARNING) {
          if (!lastAlerts.current['cpu_usage_warning'] || (now - lastAlerts.current['cpu_usage_warning']) > minAlertInterval) {
            await monitoringLogs.cpuUsage(cpuUsage, CPU_THRESHOLDS.USAGE_WARNING);
            lastAlerts.current['cpu_usage_warning'] = now;
          }
        }
        
        // CPU队列长度告警
        if (systemData.cpuQueueLength > CPU_THRESHOLDS.QUEUE_LENGTH_CRITICAL) {
          if (!lastAlerts.current['cpu_queue_critical'] || (now - lastAlerts.current['cpu_queue_critical']) > minAlertInterval) {
            await monitoringLogs.systemLoad(systemData.cpuQueueLength, CPU_THRESHOLDS.QUEUE_LENGTH_CRITICAL);
            lastAlerts.current['cpu_queue_critical'] = now;
          }
        } else if (systemData.cpuQueueLength > CPU_THRESHOLDS.QUEUE_LENGTH_WARNING) {
          if (!lastAlerts.current['cpu_queue_warning'] || (now - lastAlerts.current['cpu_queue_warning']) > minAlertInterval) {
            await monitoringLogs.systemLoad(systemData.cpuQueueLength, CPU_THRESHOLDS.QUEUE_LENGTH_WARNING);
            lastAlerts.current['cpu_queue_warning'] = now;
          }
        }
      }
      
      // 检查内存指标
      if (enabledAlerts.memory && memoryData.memoryUsagePercentage) {
        // 内存使用率告警
        const memoryUsage = memoryData.memoryUsagePercentage;
        if (memoryUsage > MEMORY_THRESHOLDS.USAGE_CRITICAL) {
          if (!lastAlerts.current['memory_usage_critical'] || (now - lastAlerts.current['memory_usage_critical']) > minAlertInterval) {
            await monitoringLogs.memoryUsage(memoryUsage, MEMORY_THRESHOLDS.USAGE_CRITICAL);
            lastAlerts.current['memory_usage_critical'] = now;
          }
        } else if (memoryUsage > MEMORY_THRESHOLDS.USAGE_WARNING) {
          if (!lastAlerts.current['memory_usage_warning'] || (now - lastAlerts.current['memory_usage_warning']) > minAlertInterval) {
            await monitoringLogs.memoryUsage(memoryUsage, MEMORY_THRESHOLDS.USAGE_WARNING);
            lastAlerts.current['memory_usage_warning'] = now;
          }
        }
        
        // 内存提交百分比告警
        if (memoryData.commitPercentage > MEMORY_THRESHOLDS.COMMIT_PERCENTAGE_WARNING) {
          if (!lastAlerts.current['memory_commit'] || (now - lastAlerts.current['memory_commit']) > minAlertInterval) {
            await logThresholdWarning('内存提交百分比', memoryData.commitPercentage, MEMORY_THRESHOLDS.COMMIT_PERCENTAGE_WARNING);
            lastAlerts.current['memory_commit'] = now;
          }
        }
      }
      
      // 检查磁盘指标
      if (enabledAlerts.disk && diskData.freeSpace && Array.isArray(diskData.freeSpace)) {
        // 计算磁盘使用率
        const diskUsagePercentage = diskData.freeSpace.map(disk => {
          const drive = typeof disk === 'object' && disk && 'drive' in disk ? disk.drive : '';
          const freeSpacePercentage = typeof disk === 'object' && disk && 'freeSpacePercentage' in disk ? 
                                      Number(disk.freeSpacePercentage) : 0;
          
          return {
            drive,
            usagePercentage: 100 - freeSpacePercentage
          };
        });
        
        // 检查每个磁盘的使用率
        for (const disk of diskUsagePercentage) {
          if (disk.usagePercentage > DISK_THRESHOLDS.USAGE_CRITICAL) {
            if (!lastAlerts.current[`disk_${disk.drive}_critical`] || (now - lastAlerts.current[`disk_${disk.drive}_critical`]) > minAlertInterval) {
              await monitoringLogs.diskUsage(disk.usagePercentage, DISK_THRESHOLDS.USAGE_CRITICAL);
              lastAlerts.current[`disk_${disk.drive}_critical`] = now;
            }
          } else if (disk.usagePercentage > DISK_THRESHOLDS.USAGE_WARNING) {
            if (!lastAlerts.current[`disk_${disk.drive}_warning`] || (now - lastAlerts.current[`disk_${disk.drive}_warning`]) > minAlertInterval) {
              await monitoringLogs.diskUsage(disk.usagePercentage, DISK_THRESHOLDS.USAGE_WARNING);
              lastAlerts.current[`disk_${disk.drive}_warning`] = now;
            }
          }
        }
        
        // 磁盘IO告警
        if (systemData.diskIO > DISK_THRESHOLDS.IO_CRITICAL) {
          if (!lastAlerts.current['disk_io_critical'] || (now - lastAlerts.current['disk_io_critical']) > minAlertInterval) {
            await monitoringLogs.diskIO(systemData.diskIO, DISK_THRESHOLDS.IO_CRITICAL);
            lastAlerts.current['disk_io_critical'] = now;
          }
        } else if (systemData.diskIO > DISK_THRESHOLDS.IO_WARNING) {
          if (!lastAlerts.current['disk_io_warning'] || (now - lastAlerts.current['disk_io_warning']) > minAlertInterval) {
            await monitoringLogs.diskIO(systemData.diskIO, DISK_THRESHOLDS.IO_WARNING);
            lastAlerts.current['disk_io_warning'] = now;
          }
        }
      }
      
      // 检查网络指标
      if (enabledAlerts.network && networkData.currentBandwidth) {
        // 网络流量告警
        const networkTraffic = networkData.currentBandwidth;
        if (networkTraffic > NETWORK_THRESHOLDS.TRAFFIC_WARNING) {
          if (!lastAlerts.current['network_traffic'] || (now - lastAlerts.current['network_traffic']) > minAlertInterval) {
            await monitoringLogs.networkTraffic(networkTraffic, NETWORK_THRESHOLDS.TRAFFIC_WARNING);
            lastAlerts.current['network_traffic'] = now;
          }
        }
        
        // 网络错误率告警
        if (networkData.errors && networkData.packetsTotal) {
          const errorRate = (Number(networkData.errors) / Number(networkData.packetsTotal)) * 100;
          if (errorRate > NETWORK_THRESHOLDS.ERROR_RATE_WARNING) {
            if (!lastAlerts.current['network_errors'] || (now - lastAlerts.current['network_errors']) > minAlertInterval) {
              await logThresholdWarning('网络错误率', errorRate, NETWORK_THRESHOLDS.ERROR_RATE_WARNING);
              lastAlerts.current['network_errors'] = now;
            }
          }
        }
        
        // 输出队列长度告警
        if (networkData.outputQueueLength > NETWORK_THRESHOLDS.OUTPUT_QUEUE_WARNING) {
          if (!lastAlerts.current['network_queue'] || (now - lastAlerts.current['network_queue']) > minAlertInterval) {
            await logThresholdWarning('网络输出队列长度', networkData.outputQueueLength, NETWORK_THRESHOLDS.OUTPUT_QUEUE_WARNING);
            lastAlerts.current['network_queue'] = now;
          }
        }
      }
      
      // 检查系统指标
      if (enabledAlerts.system && systemData.processes) {
        // 进程数告警
        if (systemData.processes > SYSTEM_THRESHOLDS.PROCESSES_WARNING) {
          if (!lastAlerts.current['system_processes'] || (now - lastAlerts.current['system_processes']) > minAlertInterval) {
            await logThresholdWarning('系统进程数', systemData.processes, SYSTEM_THRESHOLDS.PROCESSES_WARNING);
            lastAlerts.current['system_processes'] = now;
          }
        }
        
        // 线程数告警
        if (systemData.threads > SYSTEM_THRESHOLDS.THREADS_WARNING) {
          if (!lastAlerts.current['system_threads'] || (now - lastAlerts.current['system_threads']) > minAlertInterval) {
            await logThresholdWarning('系统线程数', systemData.threads, SYSTEM_THRESHOLDS.THREADS_WARNING);
            lastAlerts.current['system_threads'] = now;
          }
        }
        
        // 停止服务数告警
        if (systemData.stoppedServicesCount > SYSTEM_THRESHOLDS.STOPPED_SERVICES_WARNING) {
          if (!lastAlerts.current['system_services'] || (now - lastAlerts.current['system_services']) > minAlertInterval) {
            await logThresholdWarning('已停止服务数', systemData.stoppedServicesCount, SYSTEM_THRESHOLDS.STOPPED_SERVICES_WARNING);
            lastAlerts.current['system_services'] = now;
          }
        }
      }
    };
    
    // 立即检查一次
    checkThresholds().catch(error => console.error('监控告警检查失败:', error));
    
    // 设置定时检查
    const interval = setInterval(checkThresholds, checkInterval);
    
    return () => clearInterval(interval);
  }, [
    enabledAlerts, 
    checkInterval,
    cpuData.cpuState,
    memoryData.memoryUsagePercentage, 
    memoryData.commitPercentage,
    diskData.freeSpace,
    networkData.currentBandwidth,
    networkData.errors,
    networkData.packetsTotal,
    networkData.outputQueueLength,
    systemData.cpuQueueLength,
    systemData.processes,
    systemData.threads,
    systemData.stoppedServicesCount,
    systemData.diskIO
  ]);
  
  // 返回告警启用状态
  return { enabledAlerts };
}

export default useMonitoringAlerts; 