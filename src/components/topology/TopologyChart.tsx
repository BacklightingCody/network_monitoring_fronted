import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as echarts from 'echarts';
import { TopologyData, TopologyNode, TopologyLink } from '@/services/api/topology';
import { useThemeStore } from '@/stores/theme';

interface TopologyChartProps {
  data: TopologyData | null;
  loading: boolean;
  onNodeClick?: (nodeId: string) => void;
}

export function TopologyChart({ data, loading, onNodeClick }: TopologyChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [isReady, setIsReady] = useState(false);
  const theme = useThemeStore(state => state.theme);
  
  // 主题配色
  const themeColors = {
    background: theme === 'dark' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 1)',
    text: theme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)',
    subText: theme === 'dark' ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)',
    border: theme === 'dark' ? '#303030' : '#e9e9e9',
    internalNode: theme === 'dark' ? '#1668dc' : '#1890ff',
    externalNode: theme === 'dark' ? '#dc6a16' : '#ff7a45',
    labelBg: theme === 'dark' ? 'rgba(0, 0, 0, 0.65)' : 'rgba(255, 255, 255, 0.7)',
    tooltipBg: theme === 'dark' ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.95)',
    tooltipBorder: theme === 'dark' ? '#303030' : '#e9e9e9',
    tooltipText: theme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : '#333',
  };

  // 初始化或重新创建图表
  const initChart = useCallback(() => {
    if (!chartRef.current) return;
    
    console.log('初始化或重建图表实例');
    
    try {
      // 销毁之前的实例
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
      
      // 创建新实例
      chartInstance.current = echarts.init(chartRef.current, theme);
      
      // 测试图表功能是否正常
      const testOption = {
        title: {
          text: '拓扑图加载中...',
          textStyle: {
            color: themeColors.text
          }
        },
        series: []
      };
      chartInstance.current.setOption(testOption);
      console.log('空图表测试成功');
      
      setIsReady(true);
      console.log('图表实例创建成功');
      
      // 如果数据已经存在，立即进行渲染
      if (data && data.nodes && data.links) {
        renderChart();
      }
    } catch (error) {
      console.error('图表初始化失败:', error);
      setIsReady(false);
    }
  }, [theme, data, themeColors]);

  // 初始化图表
  useEffect(() => {
    initChart();
    
    // 窗口大小改变时重新调整图表大小
    const handleResize = () => {
      console.log('调整图表大小');
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      console.log('销毁图表实例');
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [initChart]);

  // 根据协议类型获取连接颜色
  const getColorByProtocol = (protocol: string) => {
    const protocolColors: Record<string, string> = {
      'TCP': theme === 'dark' ? '#1668dc' : '#1890ff',
      'UDP': theme === 'dark' ? '#49aa19' : '#52c41a',
      'HTTP': theme === 'dark' ? '#642ab5' : '#722ed1',
      'HTTPS': theme === 'dark' ? '#cb2b83' : '#eb2f96',
      'NBNS': theme === 'dark' ? '#d89614' : '#faad14',
      'DNS': theme === 'dark' ? '#13a8a8' : '#13c2c2',
      'FTP': theme === 'dark' ? '#d32029' : '#f5222d',
      'SMTP': theme === 'dark' ? '#d87a16' : '#fa8c16',
      'DHCP': theme === 'dark' ? '#8bbb11' : '#a0d911',
      'UNKNOWN': theme === 'dark' ? '#666666' : '#8c8c8c',
      '1302': theme === 'dark' ? '#6554AF' : '#9575DE',
    };
    
    return protocolColors[protocol] || (theme === 'dark' ? '#666666' : '#8c8c8c');
  };

  // 渲染图表
  const renderChart = useCallback(() => {
    if (!chartInstance.current || !data || !data.nodes || data.nodes.length === 0) {
      console.log('无法渲染: 图表实例=', !!chartInstance.current, '数据=', !!data);
      return;
    }
    
    console.log('准备渲染拓扑图数据:', data);
    
    try {
      const { nodes, links } = data;
      
      // 准备节点分类
      const categories = [
        { name: '内部节点', itemStyle: { color: themeColors.internalNode } },
        { name: '外部节点', itemStyle: { color: themeColors.externalNode } }
      ];
      
      // 使用环形布局预先计算位置
      const centerX = 0;
      const centerY = 0;
      const radius = 300;
      const internalNodes = nodes.filter(node => node.type === 'internal');
      const externalNodes = nodes.filter(node => node.type === 'external');
      
      // 为内部节点分配固定位置（中心附近）
      const internalRadius = radius * 0.4;
      internalNodes.forEach((node, i) => {
        const angle = (i / Math.max(1, internalNodes.length)) * 2 * Math.PI;
        const x = centerX + internalRadius * Math.cos(angle);
        const y = centerY + internalRadius * Math.sin(angle);
        node.x = x;
        node.y = y;
      });
      
      // 为外部节点分配固定位置（外围）
      const externalRadius = radius;
      externalNodes.forEach((node, i) => {
        const angle = (i / Math.max(1, externalNodes.length)) * 2 * Math.PI;
        const x = centerX + externalRadius * Math.cos(angle);
        const y = centerY + externalRadius * Math.sin(angle);
        node.x = x;
        node.y = y;
      });
      
      // 格式化节点数据
      const chartNodes = nodes.map(node => ({
        id: node.id,
        name: node.name || node.id,
        value: node.value,
        symbolSize: Math.max(20, Math.min(50, 20 + Math.sqrt(node.value || 1) * 3)),
        category: node.type === 'internal' ? 0 : 1,
        x: node.x,
        y: node.y,
        fixed: true, // 固定位置
        label: {
          show: true,
          position: 'right',
          formatter: node.name || node.id,
          fontSize: 12,
          color: themeColors.text,
          backgroundColor: themeColors.labelBg,
          padding: [3, 5],
          borderRadius: 3
        },
        itemStyle: {
          color: node.type === 'internal' ? themeColors.internalNode : themeColors.externalNode,
          borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#fff',
          borderWidth: 2,
          shadowColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.3)',
          shadowBlur: 5
        },
        tooltip: {
          formatter: () => {
            return `
              <div style="padding: 5px; color: ${themeColors.tooltipText}">
                <div style="font-weight: bold; margin-bottom: 5px;">${node.name || node.id}</div>
                <div><span style="display: inline-block; width: 80px;">ID: </span>${node.id}</div>
                <div><span style="display: inline-block; width: 80px;">类型: </span>${node.type === 'internal' ? '内部节点' : '外部节点'}</div>
                <div><span style="display: inline-block; width: 80px;">发送包数: </span>${node.packetsSent}</div>
                <div><span style="display: inline-block; width: 80px;">接收包数: </span>${node.packetsReceived}</div>
                <div><span style="display: inline-block; width: 80px;">主要协议: </span>${node.mainProtocol}</div>
              </div>
            `;
          }
        }
      }));
      
      // 格式化连接数据
      const chartLinks = links.map(link => ({
        source: link.source,
        target: link.target,
        value: link.value,
        symbol: ['none', 'arrow'],
        symbolSize: [0, 8],
        lineStyle: {
          width: Math.max(1, Math.min(5, 1 + link.value / 5)),
          curveness: 0.1,
          color: getColorByProtocol(link.protocol),
          opacity: theme === 'dark' ? 0.8 : 0.7,
          shadowColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.2)',
          shadowBlur: 5
        },
        emphasis: {
          lineStyle: {
            width: Math.max(2, Math.min(7, 2 + link.value / 5)),
            opacity: 1
          }
        },
        tooltip: {
          formatter: () => {
            return `
              <div style="padding: 5px; color: ${themeColors.tooltipText}">
                <div style="font-weight: bold; margin-bottom: 5px;">${link.source} → ${link.target}</div>
                <div><span style="display: inline-block; width: 80px;">协议: </span>${link.protocol}</div>
                <div><span style="display: inline-block; width: 80px;">包数: </span>${link.packets}</div>
                <div><span style="display: inline-block; width: 80px;">流量: </span>${link.bytes?.toLocaleString?.() || 0} bytes</div>
              </div>
            `;
          }
        }
      }));

      console.log('处理后的节点数据:', chartNodes.length);
      console.log('处理后的连接数据:', chartLinks.length);

      // 设置图表选项
      const option = {
        title: {
          text: '网络拓扑图',
          subtext: `节点: ${nodes.length}, 连接: ${links.length}`,
          top: '20',
          left: 'center',
          textStyle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: themeColors.text
          },
          subtextStyle: {
            color: themeColors.subText
          }
        },
        tooltip: {
          trigger: 'item',
          enterable: true,
          backgroundColor: themeColors.tooltipBg,
          borderColor: themeColors.tooltipBorder,
          borderWidth: 1,
          padding: 10,
          textStyle: {
            color: themeColors.tooltipText
          },
          extraCssText: 'box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);'
        },
        legend: {
          data: categories.map(a => a.name),
          orient: 'horizontal',
          left: 'center',
          bottom: '20',
          textStyle: {
            color: themeColors.text
          },
          selectedMode: 'multiple',
          itemWidth: 15,
          itemHeight: 10,
          itemGap: 20
        },
        toolbox: {
          show: true,
          feature: {
            restore: {
              title: '重置'
            },
            saveAsImage: {
              title: '保存为图片',
              backgroundColor: theme === 'dark' ? '#1b1b1b' : '#ffffff'
            }
          },
          right: '20',
          top: '20',
          iconStyle: {
            color: themeColors.text,
            borderColor: themeColors.text,
            borderWidth: 1
          }
        },
        animationDuration: 1500,
        series: [{
          name: '网络拓扑',
          type: 'graph',
          layout: 'none', // 使用我们预先计算的固定布局
          data: chartNodes,
          links: chartLinks,
          categories: categories,
          roam: true,
          zoom: 1,
          center: [0, 0],
          focusNodeAdjacency: true, // 鼠标移到节点上时突出显示相邻节点
          edgeSymbol: ['none', 'arrow'],
          edgeSymbolSize: [0, 8],
          emphasis: {
            focus: 'adjacency',
            scale: true
          }
        }]
      };

      console.log('设置图表选项');
      chartInstance.current.clear();
      chartInstance.current.setOption(option);
      
      // 监听节点点击事件
      if (onNodeClick) {
        chartInstance.current.off('click');
        chartInstance.current.on('click', 'series.graph.nodes', (params: any) => {
          console.log('节点点击:', params.data);
          onNodeClick(params.data.id);
        });
      }
      
      console.log('图表渲染完成');
    } catch (error) {
      console.error('渲染拓扑图失败:', error);
    }
  }, [data, theme, themeColors, onNodeClick, getColorByProtocol]);

  // 数据更新时重新渲染图表
  useEffect(() => {
    if (data && data.nodes && data.links && chartInstance.current) {
      renderChart();
    }
  }, [data, renderChart]);

  if (loading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center bg-card border border-border rounded-md">
        <div className="text-center text-muted-foreground">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-current border-t-transparent" />
          <p className="mt-4">加载拓扑数据中...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.nodes || !data.nodes.length) {
    return (
      <div className="min-h-[600px] flex items-center justify-center bg-card border border-border rounded-md">
        <div className="text-center text-muted-foreground">
          <p>暂无拓扑数据</p>
          <p className="mt-2 text-sm">请尝试调整时间范围或刷新</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full border rounded-md bg-card border-border overflow-hidden">
      <div id="topology-chart" ref={chartRef} className="w-full h-[600px]" />
    </div>
  );
} 