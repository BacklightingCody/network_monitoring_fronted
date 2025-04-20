import React, { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTheme } from 'next-themes';

export interface BarChartData {
  name: string;
  data: {
    time: string;
    value: number;
  }[];
}

interface BarChartsProps {
  data: BarChartData[] | any[];
  timeRange?: string;
  yAxisUnit?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  barSize?: number;
  xAxisKey?: string;
  yAxisDomain?: [number, number];
  customColors?: string[];
  stackBars?: boolean;
  layout?: 'horizontal' | 'vertical';
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

const BarCharts: React.FC<BarChartsProps> = ({
  data,
  timeRange = '1h',
  yAxisUnit = '',
  showLegend = true,
  showGrid = true,
  barSize = 20,
  xAxisKey = 'time',
  yAxisDomain,
  customColors,
  stackBars = false,
  layout = 'horizontal',
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  // 获取颜色数组
  const colorPalette = useMemo(() => {
    if (customColors && customColors.length > 0) return customColors;
    return isDark ? darkModeColors : defaultColors;
  }, [customColors, isDark]);
  
  // 确保数据存在且是数组
  const safeData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }
    return data;
  }, [data]);

  // 格式化数据以适合 recharts
  const chartData = useMemo(() => {
    // 如果没有数据，返回空数组
    if (safeData.length === 0) return [];
    
    // 如果数据已经是扁平的时间序列格式，直接返回
    if ('time' in safeData[0] || xAxisKey in safeData[0]) {
      return safeData;
    }
    
    // 假设数据是多个序列的集合，需要转换为扁平格式
    try {
      // 使用第一个序列的时间点作为基准（确保data[0].data存在且是数组）
      if (!safeData[0].data || !Array.isArray(safeData[0].data) || safeData[0].data.length === 0) {
        return [];
      }
      
      const timePoints = safeData[0].data.map(d => d.time);
      
      return timePoints.map((time, timeIdx) => {
        const point: any = { [xAxisKey]: time };
        
        safeData.forEach((series, seriesIdx) => {
          if (series && series.data && Array.isArray(series.data) && timeIdx < series.data.length) {
            const seriesName = series.name || `系列${seriesIdx + 1}`;
            const value = series.data[timeIdx]?.value || 0;
            point[seriesName] = value;
          }
        });
        
        return point;
      });
    } catch (error) {
      console.error('Error formatting chart data:', error);
      return [];
    }
  }, [safeData, xAxisKey]);
  
  // 获取所有系列的名称
  const seriesNames = useMemo(() => {
    if (safeData.length === 0) return [];
    
    if ('time' in safeData[0] || xAxisKey in safeData[0]) {
      // 扁平数据，排除时间字段
      return Object.keys(safeData[0]).filter(key => key !== xAxisKey);
    }
    
    // 多系列数据
    return safeData.map(series => series.name || '未命名系列');
  }, [safeData, xAxisKey]);
  
  // 如果没有数据，显示空状态
  if (chartData.length === 0 || seriesNames.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-gray-400">
        暂无数据
      </div>
    );
  }
  
  // 格式化工具提示和轴标签
  const formatValue = (value: number) => {
    if (value === 0) return `0 ${yAxisUnit}`;
    
    // 针对大数据的格式化
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(2)} G${yAxisUnit}`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)} M${yAxisUnit}`;
    if (value >= 1000) return `${(value / 1000).toFixed(2)} K${yAxisUnit}`;
    
    return `${value.toFixed(2)} ${yAxisUnit}`;
  };
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        layout={layout}
        margin={{ top: 10, right: 30, left: 20, bottom: 40 }}
      >
        {showGrid && (
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'} 
            vertical={false}
          />
        )}
        
        {layout === 'horizontal' ? (
          <>
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
            />
          </>
        ) : (
          <>
            <XAxis 
              type="number"
              tickFormatter={formatValue}
              domain={yAxisDomain || ['auto', 'auto']}
              tick={{ fill: isDark ? '#e5e7eb' : '#4b5563' }}
              axisLine={{ stroke: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)' }}
              tickLine={{ stroke: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)' }}
            />
            <YAxis 
              dataKey={xAxisKey}
              type="category"
              tick={{ fill: isDark ? '#e5e7eb' : '#4b5563' }}
              axisLine={{ stroke: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)' }}
              tickLine={{ stroke: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)' }}
              width={120}
            />
          </>
        )}
        
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
          <Bar
            key={seriesName}
            dataKey={seriesName}
            fill={colorPalette[index % colorPalette.length]}
            fillOpacity={0.8}
            stackId={stackBars ? 'stack' : undefined}
            barSize={barSize}
            radius={[4, 4, 0, 0]}
            animationDuration={1000}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarCharts;
