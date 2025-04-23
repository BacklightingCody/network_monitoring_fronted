import React from 'react';
import { NodeDetails, ProtocolDistribution } from '@/services/api/topology';
import { PieChart, BarChart2, Network, X } from 'lucide-react';
import { useThemeStore } from '@/stores/theme';

interface NodeDetailsPanelProps {
  nodeDetails: NodeDetails | null;
  loading: boolean;
  onClose: () => void;
}

export function NodeDetailsPanel({ nodeDetails, loading, onClose }: NodeDetailsPanelProps) {
  const theme = useThemeStore(state => state.theme);
  
  if (!nodeDetails && !loading) {
    return null;
  }

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-card border-l border-border shadow-lg z-10 p-4 overflow-y-auto">
      <div className="flex justify-between items-center border-b border-border pb-2 mb-4">
        <h3 className="text-lg font-medium text-foreground">节点详情</h3>
        <button 
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
          aria-label="关闭"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">加载中...</p>
        </div>
      ) : nodeDetails ? (
        <div className="space-y-6">
          <div className="space-y-2">
            <h4 className="font-medium flex items-center text-foreground">
              <Network className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" />
              基本信息
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm bg-accent/30 p-3 rounded-md">
              <div className="text-muted-foreground">节点 ID:</div>
              <div className="text-foreground font-medium">{nodeDetails.nodeId}</div>
              <div className="text-muted-foreground">发送包数:</div>
              <div className="text-foreground font-medium">{nodeDetails.totalPacketsSent.toLocaleString()}</div>
              <div className="text-muted-foreground">接收包数:</div>
              <div className="text-foreground font-medium">{nodeDetails.totalPacketsReceived.toLocaleString()}</div>
              <div className="text-muted-foreground">发送字节:</div>
              <div className="text-foreground font-medium">{nodeDetails.totalBytesSent.toLocaleString()} bytes</div>
              <div className="text-muted-foreground">接收字节:</div>
              <div className="text-foreground font-medium">{nodeDetails.totalBytesReceived.toLocaleString()} bytes</div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium flex items-center text-foreground">
              <PieChart className="h-4 w-4 mr-2 text-purple-500 dark:text-purple-400" />
              协议分布
            </h4>
            <div className="bg-accent/30 p-3 rounded-md text-sm">
              {nodeDetails.protocolDistribution.slice(0, 5).map((item, index) => (
                <div key={index} className="mb-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-foreground">{item.protocol}</span>
                    <span className="text-foreground font-medium">{item.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-1.5 rounded-full" 
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
              {nodeDetails.protocolDistribution.length > 5 && (
                <div className="text-center text-xs text-muted-foreground mt-2">
                  显示前5种协议（共{nodeDetails.protocolDistribution.length}种）
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium flex items-center text-foreground">
              <BarChart2 className="h-4 w-4 mr-2 text-green-500 dark:text-green-400" />
              连接节点
            </h4>
            <div className="bg-accent/30 p-3 rounded-md">
              <div className="max-h-[200px] overflow-y-auto text-sm">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-1.5 px-2 text-muted-foreground">IP</th>
                      <th className="text-right py-1.5 px-2 text-muted-foreground">流量</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {nodeDetails.connectedNodes.slice(0, 10).map((node, index) => (
                      <tr key={index}>
                        <td className="py-1.5 px-2 text-foreground">{node.ip}</td>
                        <td className="text-right py-1.5 px-2 text-foreground font-medium">{node.totalBytes.toLocaleString()} bytes</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {nodeDetails.connectedNodes.length > 10 && (
                  <div className="text-center text-xs text-muted-foreground py-1 mt-1">
                    显示前10个连接（共{nodeDetails.connectedNodes.length}个）
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {nodeDetails.trafficTrend && nodeDetails.trafficTrend.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center text-foreground">
                <BarChart2 className="h-4 w-4 mr-2 text-orange-500 dark:text-orange-400" />
                流量趋势
              </h4>
              <div className="bg-accent/30 p-3 rounded-md text-sm">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-1.5 px-2 text-muted-foreground">时间</th>
                      <th className="text-right py-1.5 px-2 text-muted-foreground">包数</th>
                      <th className="text-right py-1.5 px-2 text-muted-foreground">字节</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {nodeDetails.trafficTrend.map((trend, index) => (
                      <tr key={index}>
                        <td className="py-1.5 px-2 text-foreground">{trend.time}</td>
                        <td className="text-right py-1.5 px-2 text-foreground">{trend.packets.toLocaleString()}</td>
                        <td className="text-right py-1.5 px-2 text-foreground font-medium">{trend.bytes.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
} 