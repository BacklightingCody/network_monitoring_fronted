import React, { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTheme } from 'next-themes';

export interface AreaChartData {
  name: string;
  data: {
    time: string;
    value: number;
  }[];
}

interface AreaChartsProps {
  data: AreaChartData[] | any[];
  timeRange?: string;
  yAxisUnit?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  xAxisKey?: string;
  yAxisDomain?: [number, number];
  customColors?: string[];
  stackAreas?: boolean;
  gradientColors?: boolean;
  curveType?: 'linear' | 'monotone' | 'step' | 'stepAfter' | 'stepBefore' | 'natural';
}

const defaultColors = [
  'rgb(59, 130, 246)', // blue-500
  'rgb(168, 85, 247)', // purple-500
  'rgb(236, 72, 153)', // pink-500
  'rgb(6, 182, 212)',  // cyan-500
  'rgb(34, 197, 94)',  // green-500
  'rgb(245, 158, 11)', // amber-500
  'rgb(239, 68, 68)',  // red-500
  'rgb(20, 184, 166)', // teal-500
];

const darkModeColors = [
  'rgb(96, 165, 250)',  // blue-400
  'rgb(192, 132, 252)', // purple-400
  'rgb(244, 114, 182)', // pink-400
  'rgb(34, 211, 238)',  // cyan-400
  'rgb(74, 222, 128)',  // green-400
  'rgb(251, 191, 36)',  // amber-400
  'rgb(248, 113, 113)', // red-400
  'rgb(45, 212, 191)',  // teal-400
];

const AreaCharts: React.FC<AreaChartsProps> = ({
  data,
  timeRange = '1h',
  yAxisUnit = '',
  showLegend = true,
  showGrid = true,
  xAxisKey = 'time',
  yAxisDomain,
  customColors,
  stackAreas = false,
  gradientColors = true,
  curveType = 'monotone',
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  // 获取颜色数组
  const colorPalette = useMemo(() => {
    if (customColors && customColors.length > 0) return customColors;
    return isDark ? darkModeColors : defaultColors;
  }, [customColors, isDark]);
  
  // 格式化数据以适合 recharts
  const chartData = useMemo(() => {
    // 如果数据已经是扁平的时间序列格式，直接返回
    if (data.length > 0 && 'time' in data[0]) {
      return data;
    }
    
    // 假设数据是多个序列的集合，需要转换为扁平格式
    if (data.length === 0) return [];
    
    // 使用第一个序列的时间点作为基准
    const timePoints = data[0].data?.map(d => d.time) || [];
    
    return timePoints.map((time, timeIdx) => {
      const point: any = { [xAxisKey]: time };
      
      data.forEach((series, seriesIdx) => {
        const seriesName = series.name || `系列${seriesIdx + 1}`;
        // 确保数据点存在，否则设为0以避免图表中断
        const value = timeIdx < series.data?.length ? series.data[timeIdx]?.value || 0 : 0;
        point[seriesName] = value;
      });
      
      return point;
    });
  }, [data, xAxisKey]);
  
  // 获取所有系列的名称
  const seriesNames = useMemo(() => {
    if (data.length > 0 && 'time' in data[0]) {
      // 扁平数据，排除时间字段
      return Object.keys(data[0]).filter(key => key !== xAxisKey);
    }
    
    // 多系列数据
    return data.map(series => series.name || '未命名系列');
  }, [data, xAxisKey]);
  
  // 格式化工具提示和轴标签
  const formatValue = (value: number) => {
    if (value === 0) return `0 ${yAxisUnit}`;
    
    // 针对大数据的格式化
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(2)} G${yAxisUnit}`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)} M${yAxisUnit}`;
    if (value >= 1000) return `${(value / 1000).toFixed(2)} K${yAxisUnit}`;
    
    return `${value.toFixed(2)} ${yAxisUnit}`;
  };
  
  // 创建渐变色ID
  const getGradientId = (index: number) => `areaColorGradient-${index}`;
  
  // 生成渐变色定义
  const gradientDefs = useMemo(() => {
    if (!gradientColors) return null;
    
    return (
      <defs>
        {seriesNames.map((seriesName, index) => {
          const color = colorPalette[index % colorPalette.length];
          return (
            <linearGradient 
              key={`gradient-${index}`} 
              id={getGradientId(index)} 
              x1="0" y1="0" x2="0" y2="1"
            >
              <stop offset="5%" stopColor={color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={color} stopOpacity={0.1} />
            </linearGradient>
          );
        })}
      </defs>
    );
  }, [seriesNames, colorPalette, gradientColors]);
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 40 }}
      >
        {gradientDefs}
        
        {showGrid && (
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'} 
            vertical={false}
          />
        )}
        
        <XAxis 
          dataKey={xAxisKey} 
          tick={{ fill: isDark ? '#e5e7eb' : '#4b5563' }}
          axisLine={{ stroke: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)' }}
          tickLine={{ stroke: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)' }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        
        <YAxis 
          tickFormatter={formatValue}
          domain={yAxisDomain || ['auto', 'auto']}
          tick={{ fill: isDark ? '#e5e7eb' : '#4b5563' }}
          axisLine={{ stroke: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)' }}
          tickLine={{ stroke: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)' }}
          width={100}
        />
        
        <Tooltip
          formatter={(value: number, name: string) => [formatValue(value), name]}
          labelFormatter={(label) => `时间: ${label}`}
          contentStyle={{
            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            borderColor: isDark ? 'rgba(100, 116, 139, 0.5)' : 'rgba(203, 213, 225, 0.8)',
            borderRadius: '8px',
            color: isDark ? '#e5e7eb' : '#1f2937',
            padding: '10px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        />
        
        {showLegend && (
          <Legend 
            wrapperStyle={{ 
              paddingTop: '20px',
              color: isDark ? '#e5e7eb' : '#4b5563'
            }}
          />
        )}
        
        {seriesNames.map((seriesName, index) => (
          <Area
            key={seriesName}
            type={curveType}
            dataKey={seriesName}
            fill={gradientColors ? `url(#${getGradientId(index)})` : colorPalette[index % colorPalette.length]}
            stroke={colorPalette[index % colorPalette.length]}
            strokeWidth={2}
            stackId={stackAreas ? 'stack' : undefined}
            fillOpacity={0.6}
            activeDot={{ r: 6, strokeWidth: 0 }}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default AreaCharts;
