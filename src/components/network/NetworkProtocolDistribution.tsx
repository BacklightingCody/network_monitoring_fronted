import { Card } from '@/components/common/Card';
import { PieChart, Layers, BarChart3, Cpu } from 'lucide-react';
import PieCharts from '@/components/common/PieCharts';
import { useTrafficMetricsData } from '@/stores';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/Badge';

interface NetworkProtocolDistributionProps {
  className?: string;
  title?: string;
  maxDisplay?: number;
}

export function NetworkProtocolDistribution({ 
  className = "", 
  title = "协议分布分析", 
  maxDisplay = 7
}: NetworkProtocolDistributionProps) {
  // 使用流量指标store
  const { protocolStats } = useTrafficMetricsData();

  // 格式化流量大小
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  // 转换协议数据为饼图格式
  const getProtocolChartData = () => {
    if (!protocolStats || !Array.isArray(protocolStats)) {
      return [];
    }
    
    return protocolStats
      .slice(0, maxDisplay)
      .map((protocol: any) => ({
        name: protocol.name || protocol.protocol || 'Unknown',
        value: protocol.count || 0,
        fill: getProtocolColor(protocol.name || protocol.protocol || 'Unknown'),
      }));
  };
  
  // 获取主要协议（选择包类型最大的）
  const getMainProtocol = () => {
    if (!protocolStats || !Array.isArray(protocolStats) || protocolStats.length === 0) {
      return null;
    }
    
    // 按数据包数量排序，找出最大的
    return [...protocolStats].sort((a, b) => (b.count || 0) - (a.count || 0))[0];
  };
  
  // 计算协议总数量和总流量
  const getTotalStats = () => {
    if (!protocolStats || !Array.isArray(protocolStats)) {
      return { totalCount: 0, totalBytes: 0 };
    }
    
    return protocolStats.reduce((acc, protocol: any) => {
      return {
        totalCount: acc.totalCount + (protocol.count || 0),
        totalBytes: acc.totalBytes + (protocol.bytesTransferred || 0)
      };
    }, { totalCount: 0, totalBytes: 0 });
  };
  
  // 为不同协议分配不同颜色
  const getProtocolColor = (protocol: string) => {
    const colorMap: {[key: string]: string} = {
      'TCP': '#4f46e5', // 靛蓝色
      'UDP': '#10b981', // 绿色
      'ICMP': '#f59e0b', // 琥珀色
      'HTTP': '#ef4444', // 红色
      'HTTPS': '#8b5cf6', // 紫色
      'DNS': '#06b6d4', // 青色
      'SSH': '#ec4899', // 粉色
      'FTP': '#14b8a6', // 青色
      'SMTP': '#6366f1', // 靛蓝色
      'POP3': '#f43f5e', // 玫瑰色
      'IMAP': '#0ea5e9', // 天蓝色
      'RDP': '#a78bfa', // 亮紫色
      'SNMP': '#84cc16', // 酸橙色
      'NTP': '#facc15', // 黄色
      'TLS': '#3b82f6', // 蓝色
      'SMB': '#fb7185', // 玫瑰色
    };
    
    return colorMap[protocol] || '#64748b'; // 默认浅灰色
  };
  
  const mainProtocol = getMainProtocol();
  const { totalCount, totalBytes } = getTotalStats();

  return (
    <Card className={`p-4 ${className} shadow-lg border border-gray-100 dark:border-gray-800`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Cpu className="w-6 h-6 mr-2 text-purple-600 dark:text-purple-400" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <span className="text-sm font-medium">{protocolStats?.length || 0} 种协议</span>
        </Badge>
      </div>
      
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">主要协议</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{mainProtocol?.name || '无数据'}</p>
              <p className="text-sm text-purple-500 dark:text-purple-300 mt-1">{(mainProtocol?.count || 0).toLocaleString()} 个数据包</p>
            </div>
            <Cpu className="w-10 h-10 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">数据包总数</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{totalCount.toLocaleString()}</p>
              <p className="text-sm text-blue-500 dark:text-blue-300 mt-1">{protocolStats?.length || 0} 种不同协议</p>
            </div>
            <Layers className="w-10 h-10 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">总流量</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{formatBytes(totalBytes)}</p>
              <p className="text-sm text-green-500 dark:text-green-300 mt-1">平均 {formatBytes(totalBytes / (totalCount || 1))} / 包</p>
            </div>
            <BarChart3 className="w-10 h-10 text-green-500" />
          </div>
        </div>
      </div>
      
      {/* 协议占比图 - 单独一行 */}
      <div className="mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-4">协议占比分布</h3>
          {protocolStats && Array.isArray(protocolStats) && protocolStats.length > 0 ? (
            <div className="h-80">
              <PieCharts
                data={getProtocolChartData()}
                donut={true}
                innerRadius={80}
                paddingAngle={4}
                labelVisible={true}
                valueUnit="个"
              />
            </div>
          ) : (
            <div className="flex h-80 items-center justify-center text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="text-center">
                <PieChart className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                <p>暂无协议数据</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 协议详情表格 - 单独一行 */}
      <div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-4">协议详情统计</h3>
          <div className="overflow-auto max-h-80">
            <Table>
              <TableHeader className="sticky top-0 bg-white dark:bg-gray-800 z-10">
                <TableRow>
                  <TableHead className="w-1/4">协议</TableHead>
                  <TableHead className="w-1/6">数量</TableHead>
                  <TableHead className="w-2/5">占比</TableHead>
                  <TableHead className="w-1/6">流量</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {protocolStats?.slice(0, 15).map((protocol: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: getProtocolColor(protocol.name || protocol.protocol || 'Unknown') }}
                        ></div>
                        <span className="font-medium">{protocol.name || protocol.protocol || 'Unknown'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{(protocol.count || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                          <div
                            className="h-2.5 rounded-full"
                            style={{ 
                              width: `${protocol.percentage || 0}%`,
                              backgroundColor: getProtocolColor(protocol.name || protocol.protocol || 'Unknown') 
                            }}
                          >
                          </div>
                        </div>
                        <span>{(protocol.percentage || 0).toFixed(1)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatBytes(protocol.bytesTransferred || 0)}</TableCell>
                  </TableRow>
                ))}
                {!protocolStats?.length && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-gray-400">
                      暂无协议统计数据
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Card>
  );
} 