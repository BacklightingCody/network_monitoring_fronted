import React, { useMemo, useState } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Sector, Tooltip } from 'recharts';
import { useTheme } from 'next-themes';

export interface PieChartData {
  name: string;
  value: number;
}

interface PieChartsProps {
  data: PieChartData[];
  showLegend?: boolean;
  valueUnit?: string;
  innerRadius?: number;
  outerRadius?: number;
  customColors?: string[];
  donut?: boolean;
  activeIndex?: number;
  paddingAngle?: number;
  labelVisible?: boolean;
  title?: string;
  cx?: string;
  cy?: string;
  labelLine?: boolean;
  activeShape?: (props: any) => JSX.Element;
  onSliceHover?: (index: number) => void;
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

const PieCharts: React.FC<PieChartsProps> = ({
  data,
  donut = false,
  innerRadius = 0,
  outerRadius = "80%",
  cx = "50%",
  cy = "50%",
  labelLine = true,
  showLegend = true,
  valueUnit = '',
  activeIndex,
  activeShape,
  paddingAngle = 0,
  customColors,
  onSliceHover,
  labelVisible = false,
  title
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  // 确保数据存在且是数组
  const safeData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }
    // 对数据进行安全处理，确保每个项目都有name和value
    return data.filter(item => item && typeof item === 'object')
      .map(item => ({
        name: item.name || 'Unknown',
        value: typeof item.value === 'number' ? item.value : 0
      }));
  }, [data]);
  
  // 跟踪活动索引
  const [activeIdx, setActiveIdx] = useState<number | undefined>(activeIndex);
  
  // 获取颜色数组
  const colorPalette = useMemo(() => {
    if (customColors && customColors.length > 0) return customColors;
    return isDark ? darkModeColors : defaultColors;
  }, [customColors, isDark]);
  
  // 如果没有数据，显示空状态
  if (safeData.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-gray-400">
        暂无数据
      </div>
    );
  }

  // 处理扇区点击
  const handleSectorClick = (index: number) => {
    if (onSliceHover) {
      onSliceHover(index);
    } else {
      setActiveIdx(index === activeIdx ? undefined : index);
    }
  };

  // 计算总值用于百分比
  const total = useMemo(() => safeData.reduce((sum, item) => sum + item.value, 0), [safeData]);
  
  // 格式化值
  const formatValue = (value: number) => {
    if (value === 0) return `0 ${valueUnit}`;
    
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(2)} G${valueUnit}`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)} M${valueUnit}`;
    if (value >= 1000) return `${(value / 1000).toFixed(2)} K${valueUnit}`;
    
    return `${value.toFixed(2)} ${valueUnit}`;
  };
  
  // 自定义活动扇区
  const renderActiveShape = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    
    const RADIAN = Math.PI / 180;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';
    
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.9}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 5}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill={isDark ? '#e5e7eb' : '#4b5563'}>
          {payload.name}
        </text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill={isDark ? '#e5e7eb' : '#4b5563'}>
          {`${formatValue(value)} (${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };
  
  // 自定义标签
  const renderLabel = (props: any) => {
    if (!labelVisible) return null;
    
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, index, name } = props;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="#fff" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  // 中间显示的标题（用于甜甜圈图）
  const centerLabel = title && donut ? (
    <text 
      x="50%" 
      y="50%" 
      textAnchor="middle" 
      dominantBaseline="middle"
      fill={isDark ? '#e5e7eb' : '#1f2937'}
      fontSize={16}
      fontWeight="bold"
    >
      {title}
    </text>
  ) : null;
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        {title && (
          <text
            x="50%"
            y="5%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-lg font-medium"
            fill={isDark ? '#e5e7eb' : '#4b5563'}
          >
            {title}
          </text>
        )}
        
        <Pie
          data={safeData}
          cx={cx}
          cy={cy}
          labelLine={labelLine}
          label={labelVisible ? renderLabel : undefined}
          outerRadius={outerRadius}
          innerRadius={donut ? innerRadius : 0}
          fill="#8884d8"
          paddingAngle={paddingAngle}
          dataKey="value"
          activeIndex={activeIdx !== undefined ? activeIdx : activeIndex}
          activeShape={activeShape ? activeShape : renderActiveShape}
          onClick={(_, index) => handleSectorClick(index)}
          onMouseEnter={(_, index) => {
            if (!activeShape) return;
            handleSectorClick(index);
          }}
        >
          {safeData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={colorPalette[index % colorPalette.length]} 
            />
          ))}
        </Pie>
        
        {centerLabel}
        
        {showLegend && (
          <Legend 
            layout="vertical" 
            align="right"
            verticalAlign="middle"
            wrapperStyle={{ 
              paddingLeft: '20px',
              color: isDark ? '#e5e7eb' : '#4b5563',
              fontSize: '14px',
            }}
            formatter={(value, entry: any, index) => {
              const percent = ((safeData[index].value / total) * 100).toFixed(1);
              return (
                <span style={{ color: isDark ? '#e5e7eb' : '#4b5563' }}>
                  {value} ({percent}%)
                </span>
              );
            }}
          />
        )}
        
        <Tooltip
          formatter={(value: number, name: string) => {
            const percent = ((value / total) * 100).toFixed(2);
            return [`${formatValue(value)} (${percent}%)`, name];
          }}
          contentStyle={{
            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            borderColor: isDark ? 'rgba(100, 116, 139, 0.5)' : 'rgba(203, 213, 225, 0.8)',
            borderRadius: '8px',
            color: isDark ? '#e5e7eb' : '#1f2937',
            padding: '10px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieCharts;
