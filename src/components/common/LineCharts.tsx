"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useThemeStore } from "@/stores/theme";
import { useTheme } from 'next-themes';

interface DataPoint {
  time: string;
  value: number;
  [key: string]: any;
}

interface Series {
  name: string;
  data: DataPoint[];
  color?: string;
}

interface LineChartsProps {
  data: DataPoint[] | Series[];
  timeRange: "30m" | "1h" | "24h" | "72h" | "7d";
  yAxisDomain?: [number, number];
  yAxisUnit?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  strokeWidth?: number;
  dot?: boolean;
  curveType?: string;
  customColors?: string[];
  syncId?: string;
}

const isSeriesData = (data: DataPoint[] | Series[]): data is Series[] => {
  return Array.isArray(data) && data.length > 0 && "name" in data[0];
};

// 解析时间字符串为Date对象
const parseTime = (timeStr: string): Date => {
  const today = new Date();
  const [hours, minutes, seconds] = timeStr.split(":").map(Number);
  return new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes, seconds);
};

// 格式化时间轴标签
const formatXAxis = (tickItem: string) => {
  return tickItem;
};

// 自定义时间轴刻度
const generateTimeAxisTicks = (data: DataPoint[]): string[] => {
  if (data.length <= 1) return data.length ? [data[0].time] : [];

  const interval = Math.max(1, Math.floor(data.length / 8)); // 控制显示大约 8 个刻度
  const ticks: string[] = [];

  for (let i = 0; i < data.length; i += interval) {
    ticks.push(data[i].time);
  }

  // 确保最后一个点被包含
  if (ticks[ticks.length - 1] !== data[data.length - 1].time) {
    ticks.push(data[data.length - 1].time);
  }

  return ticks;
};

// 默认颜色数组
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

// 深色模式颜色数组
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

const LineCharts: React.FC<LineChartsProps> = ({
  data,
  timeRange = '1h',
  yAxisUnit = '',
  showLegend = true,
  showGrid = true,
  strokeWidth = 2,
  dot = false,
  curveType = 'linear',
  yAxisDomain,
  customColors,
  syncId,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [selectedRange, setSelectedRange] = useState(timeRange);
  const theme = useThemeStore((state) => state.theme);

  // 定义主题相关的颜色
  const chartColors = {
    grid: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    text: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
    tooltip: {
      bg: theme === 'dark' ? 'hsl(var(--card))' : 'hsl(var(--card))',
      border: theme === 'dark' ? 'hsl(var(--border))' : 'hsl(var(--border))',
      text: theme === 'dark' ? 'hsl(var(--card-foreground))' : 'hsl(var(--card-foreground))'
    }
  };

  // 确保数据存在且是数组
  const safeData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }
    return data;
  }, [data]);
  
  // 获取颜色数组
  const colorPalette = useMemo(() => {
    if (customColors && customColors.length > 0) return customColors;
    return isDark ? darkModeColors : defaultColors;
  }, [customColors, isDark]);
  
  // 格式化数据以适合 recharts
  const chartData = useMemo(() => {
    // 如果没有数据，返回空数组
    if (safeData.length === 0) return [];
    
    try {
      // 如果数据已经是扁平的时间序列格式，直接返回
      if ('time' in safeData[0]) {
        return safeData;
      }
      
      // 假设数据是多个序列的集合，需要转换为扁平格式
      // 确保第一个系列存在且有data数组
      if (!safeData[0].data || !Array.isArray(safeData[0].data) || safeData[0].data.length === 0) {
        return [];
      }
      
      // 使用第一个序列的时间点作为基准
      const timePoints = safeData[0].data.map(d => d.time);
      
      return timePoints.map((time, timeIdx) => {
        const point: any = { time };
        
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
  }, [safeData]);
  
  // 获取所有系列的名称
  const seriesNames = useMemo(() => {
    if (safeData.length === 0) return [];
    
    try {
      if ('time' in safeData[0]) {
        // 扁平数据，排除时间字段
        return Object.keys(safeData[0]).filter(key => key !== 'time');
      }
      
      // 多系列数据
      return safeData.map(series => series.name || '未命名系列');
    } catch (error) {
      console.error('Error getting series names:', error);
      return [];
    }
  }, [safeData]);
  
  // 如果没有数据或系列，显示空状态
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
    <div className="w-full h-[250px]">
      <div className="flex justify-end mb-2 space-x-2">
        {[ "30m","1h", "24h", "72h", "7d"].map((range) => (
          <button
            key={range}
            className={`px-2 py-1 rounded transition-colors ${selectedRange === range
                ? "bg-green-500 text-foreground"
                : "bg-blue-200 text-blue-900 hover:bg-muted/80"
              }`}
            onClick={() => setSelectedRange(range as "30m" | "1h" | "24h" | "72h" | "7d")}
          >
            {range === "1h"
              ? "1小时"
              : range === "30m"
                ? "30分钟"
                : range === "24h"
                  ? "24小时"
                  : range === "72h"
                    ? "3天"
                    : "7天"}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 20, bottom: 40 }}
          syncId={syncId}
        >
          {showGrid && (
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'} 
              vertical={false}
            />
          )}
          
          <XAxis 
            dataKey="time" 
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
            <Line
              key={seriesName}
              type={curveType as any}
              dataKey={seriesName}
              stroke={colorPalette[index % colorPalette.length]}
              strokeWidth={strokeWidth}
              dot={dot}
              activeDot={{ r: 8 }}
              isAnimationActive={true}
              animationDuration={1000}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineCharts;