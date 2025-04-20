import { Card } from '@/components/common/Card';
import { BarChart, Globe, Activity, Server, MapPin } from 'lucide-react';
import BarCharts from '@/components/common/BarCharts';
import { useTrafficMetricsData } from '@/stores';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/Badge';

interface NetworkTopTrafficSourcesProps {
  className?: string;
  title?: string;
  maxDisplay?: number;
}

export function NetworkTopTrafficSources({ 
  className = "", 
  title = "流量来源统计", 
  maxDisplay = 10
}: NetworkTopTrafficSourcesProps) {
  // 使用流量指标store
  const { topSources } = useTrafficMetricsData();

  // 格式化流量大小
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  // 转换IP来源数据为柱状图格式
  const getTopSourcesChartData = () => {
    if (!topSources || !Array.isArray(topSources)) {
      return [];
    }
    
    return topSources
      .filter((source: any) => source && source.ip && source.ip !== '0.0.0.0')
      .slice(0, maxDisplay)
      .map((source: any) => ({
        name: source.ip || 'Unknown',
        '数据包数': source.count || 0,
        '流量(KB)': source.bytesTransferred ? Math.round(source.bytesTransferred / 1024) : 0, // 转为KB并四舍五入
      }));
  };
  
  // 计算所有源IP的总流量
  const getTotalTraffic = () => {
    if (!topSources || !Array.isArray(topSources)) {
      return 0;
    }
    
    return topSources.reduce((total, source: any) => {
      return total + (source.bytesTransferred || 0);
    }, 0);
  };
  
  // 计算有多少个不同的国家/地区
  const getUniqueCountries = () => {
    if (!topSources || !Array.isArray(topSources)) {
      return [];
    }
    
    const countries = new Set();
    topSources.forEach((source: any) => {
      if (source.country) {
        countries.add(source.country);
      }
    });
    
    return Array.from(countries);
  };
  
  // 获取流量最大的IP
  const getTopIP = () => {
    if (!topSources || !Array.isArray(topSources) || topSources.length === 0) {
      return null;
    }
    
    return [...topSources]
      .filter(source => source.ip && source.ip !== '0.0.0.0')
      .sort((a, b) => (b.bytesTransferred || 0) - (a.bytesTransferred || 0))[0];
  };
  
  const totalTraffic = getTotalTraffic();
  const uniqueCountries = getUniqueCountries();
  const topIP = getTopIP();

  return (
    <Card className={`p-4 ${className} shadow-lg border border-gray-100 dark:border-gray-800`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Globe className="w-6 h-6 mr-2 text-green-600 dark:text-green-400" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <span className="text-sm font-medium">{topSources?.length || 0} 个来源</span>
        </Badge>
      </div>
      
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">总流量</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{formatBytes(totalTraffic)}</p>
            </div>
            <Activity className="w-10 h-10 text-green-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">IP数量</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{topSources?.length || 0}</p>
            </div>
            <Server className="w-10 h-10 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">国家/地区</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{uniqueCountries.length}</p>
            </div>
            <Globe className="w-10 h-10 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">最大流量IP</p>
              <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{topIP?.ip || '无数据'}</p>
              {topIP?.country && (
                <p className="text-xs text-orange-500 dark:text-orange-300 mt-1">{topIP.country}</p>
              )}
            </div>
            <MapPin className="w-10 h-10 text-orange-500" />
          </div>
        </div>
      </div>
      
      {/* 流量分布图 - 单独一行 */}
      <div className="mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-4">IP流量分布</h3>
          {topSources && Array.isArray(topSources) && topSources.length > 0 ? (
            <div className="h-80">
              <BarCharts
                data={getTopSourcesChartData()}
                xAxisKey="name"
                barSize={30}
                layout="vertical"
              />
            </div>
          ) : (
            <div className="flex h-80 items-center justify-center text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="text-center">
                <BarChart className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                <p>暂无来源IP数据</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* IP详情表格 - 单独一行 */}
      <div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-4">来源IP详情</h3>
          <div className="overflow-auto max-h-80">
            <Table>
              <TableHeader className="sticky top-0 bg-white dark:bg-gray-800 z-10">
                <TableRow>
                  <TableHead className="w-2/5">IP地址</TableHead>
                  <TableHead className="w-1/5">数据包数</TableHead>
                  <TableHead className="w-1/5">传输流量</TableHead>
                  <TableHead className="w-1/5">占总流量比例</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topSources?.filter((source: any) => source.ip !== '0.0.0.0').slice(0, maxDisplay).map((source: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{source.ip}</span>
                        {source.country && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {source.country}
                            {source.organization && ` - ${source.organization}`}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{(source.count || 0).toLocaleString()}</TableCell>
                    <TableCell>{formatBytes(source.bytesTransferred || 0)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                          <div
                            className="bg-green-500 h-2.5 rounded-full"
                            style={{ width: `${totalTraffic ? ((source.bytesTransferred || 0) / totalTraffic * 100).toFixed(1) : 0}%` }}
                          ></div>
                        </div>
                        <span>{totalTraffic ? ((source.bytesTransferred || 0) / totalTraffic * 100).toFixed(1) : 0}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!topSources?.length && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-gray-400">
                      暂无来源IP数据
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