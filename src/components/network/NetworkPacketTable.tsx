import { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/Badge';
import { Database, ArrowLeft, ArrowRight, Filter } from 'lucide-react';
import { getTrafficPackets } from '@/services/api/traffic';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import dayjs from 'dayjs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/Select';

// 数据包类型
interface Packet {
  id: number;
  timestamp: string;
  sourceMac?: string;
  destinationMac?: string;
  sourceIp: string;
  destinationIp: string;
  protocol: string;
  sourcePort: number;
  destinationPort: number;
  length: number;
  tcpFlags?: string;
  payload?: string | null;
  applicationData?: any;
  rawData?: string;
  createdAt?: string;
  updatedAt?: string;
}

// API响应类型
interface PacketsResponse {
  total: number;
  page: number;
  limit: number;
  packets: Packet[];
}

// 组件属性
interface NetworkPacketTableProps {
  className?: string;
  title?: string;
  initialLimit?: number;
}

export function NetworkPacketTable({ 
  className = "",
  title = "数据包捕获",
  initialLimit = 10 
}: NetworkPacketTableProps) {
  // 状态管理
  const [packets, setPackets] = useState<Packet[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(initialLimit);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // 筛选条件
  const [sourceIp, setSourceIp] = useState<string>('');
  const [destinationIp, setDestinationIp] = useState<string>('');
  const [protocol, setProtocol] = useState<string>('');
  
  // 加载数据
  const fetchPackets = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params: any = {
        page,
        limit,
      };
      
      // 添加筛选条件
      if (sourceIp) params.sourceIp = sourceIp;
      if (destinationIp) params.destinationIp = destinationIp;
      if (protocol) params.protocol = protocol;
      
      const response = await getTrafficPackets(params);
      
      if (response && typeof response === 'object') {
        const data = response as unknown as { data: PacketsResponse };
        if (data.data) {
          setPackets(data.data.packets || []);
          setTotal(data.data.total || 0);
        }
      }
    } catch (err) {
      console.error('获取数据包数据失败:', err);
      setError('获取数据包数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  
  // 首次加载和筛选条件、分页变化时刷新数据
  useEffect(() => {
    fetchPackets();
  }, [page, limit]);
  
  // 应用筛选
  const applyFilters = () => {
    setPage(1); // 重置到第一页
    fetchPackets();
  };
  
  // 清除筛选
  const clearFilters = () => {
    setSourceIp('');
    setDestinationIp('');
    setProtocol('');
    setPage(1);
    fetchPackets();
  };
  
  // 格式化时间
  const formatDateTime = (timestamp: string): string => {
    try {
      return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
    } catch {
      return timestamp;
    }
  };
  
  // 获取可用的协议类型
  const getProtocolOptions = () => {
    const protocols = new Set<string>();
    packets.forEach(packet => {
      if (packet.protocol) {
        protocols.add(packet.protocol);
      }
    });
    return Array.from(protocols);
  };
  
  // 获取TCP标志位描述
  const getTcpFlagsDescription = (flags?: string): string => {
    if (!flags) return '';
    
    const descriptions: {[key: string]: string} = {
      '0x0001': 'FIN',
      '0x0002': 'SYN',
      '0x0004': 'RST',
      '0x0008': 'PSH',
      '0x0010': 'ACK',
      '0x0020': 'URG',
      '0x0040': 'ECE',
      '0x0080': 'CWR',
      '0x0018': 'PSH, ACK',
      '0x0012': 'SYN, ACK'
    };
    
    return descriptions[flags] || flags;
  };
  
  // 最大页数
  const maxPage = Math.max(1, Math.ceil(total / limit));
  
  // 页码选项
  const pageSizes = [10, 20, 50, 100];
  
  return (
    <Card className={`p-4 ${className} shadow-lg border border-gray-100 dark:border-gray-800`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Database className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
        </div>
        <Badge variant="outline" className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20">
          <span className="text-sm font-medium">已捕获 {total.toLocaleString()} 个数据包</span>
        </Badge>
      </div>
      
      {/* 筛选条件 */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col space-y-1 flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">源 IP</label>
            <Input 
              placeholder="输入源IP地址" 
              value={sourceIp} 
              onChange={(e) => setSourceIp(e.target.value)}
              className="h-9"
            />
          </div>
          
          <div className="flex flex-col space-y-1 flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">目标 IP</label>
            <Input 
              placeholder="输入目标IP地址" 
              value={destinationIp} 
              onChange={(e) => setDestinationIp(e.target.value)}
              className="h-9"
            />
          </div>
          
          <div className="flex flex-col space-y-1 w-32">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">协议</label>
            <Select value={protocol} onValueChange={setProtocol}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="选择协议" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部</SelectItem>
                {getProtocolOptions().map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              className="bg-blue-500 hover:bg-blue-600 text-white flex items-center" 
              onClick={applyFilters}
            >
              <Filter className="h-4 w-4 mr-1" />
              筛选
            </Button>
            
            <Button 
              size="sm" 
              variant="outline" 
              className="border-gray-300 text-gray-700 dark:text-gray-300" 
              onClick={clearFilters}
            >
              清除
            </Button>
          </div>
        </div>
      </div>
      
      {/* 数据包表格 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-0 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-10 text-red-500">
            {error}
          </div>
        ) : (
          <div className="overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-white dark:bg-gray-800 z-10">
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead className="w-40">时间</TableHead>
                  <TableHead className="w-32">源 IP</TableHead>
                  <TableHead className="w-20">源端口</TableHead>
                  <TableHead className="w-32">目标 IP</TableHead>
                  <TableHead className="w-20">目标端口</TableHead>
                  <TableHead className="w-24">协议</TableHead>
                  <TableHead className="w-20">长度</TableHead>
                  <TableHead className="w-32">TCP 标志</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packets.length > 0 ? (
                  packets.map((packet) => (
                    <TableRow key={packet.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                      <TableCell className="font-medium">{packet.id}</TableCell>
                      <TableCell>{formatDateTime(packet.timestamp)}</TableCell>
                      <TableCell className="font-mono text-xs">{packet.sourceIp}</TableCell>
                      <TableCell>{packet.sourcePort}</TableCell>
                      <TableCell className="font-mono text-xs">{packet.destinationIp}</TableCell>
                      <TableCell>{packet.destinationPort}</TableCell>
                      <TableCell>
                        <Badge
                          variant={packet.protocol === 'TCP' ? 'default' : 
                                 packet.protocol === 'UDP' ? 'secondary' : 
                                 packet.protocol.includes('SSL') ? 'success' : 'outline'}
                          className="text-xs"
                        >
                          {packet.protocol}
                        </Badge>
                      </TableCell>
                      <TableCell>{packet.length}</TableCell>
                      <TableCell className="text-xs">
                        {packet.tcpFlags ? (
                          <Badge variant="outline" className="bg-gray-50 dark:bg-gray-700">
                            {getTcpFlagsDescription(packet.tcpFlags)}
                          </Badge>
                        ) : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-400">
                      暂无数据包数据
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      
      {/* 分页控制 */}
      <div className="mt-4 flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">每页显示</span>
          <Select value={limit.toString()} onValueChange={(value) => { setLimit(Number(value)); setPage(1); }}>
            <SelectTrigger className="h-8 w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizes.map(size => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            显示 {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} 共 {total} 条
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={page <= 1}
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center space-x-1">
            {page > 3 && (
              <>
                <Button variant="ghost" size="sm" onClick={() => setPage(1)}>1</Button>
                {page > 4 && <span className="text-gray-500">...</span>}
              </>
            )}
            
            {Array.from({ length: Math.min(5, maxPage) }).map((_, i) => {
              const pageNum = Math.max(1, page - 2) + i;
              if (pageNum > maxPage) return null;
              
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            
            {page < maxPage - 2 && (
              <>
                {page < maxPage - 3 && <span className="text-gray-500">...</span>}
                <Button variant="ghost" size="sm" onClick={() => setPage(maxPage)}>
                  {maxPage}
                </Button>
              </>
            )}
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            disabled={page >= maxPage}
            onClick={() => setPage(prev => Math.min(prev + 1, maxPage))}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
} 