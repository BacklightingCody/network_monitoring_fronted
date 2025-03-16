"use client";

import { useEffect, useState, useMemo } from "react";
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

export default function LineCharts({
  data,
  timeRange = "1h",
  yAxisDomain = [0, 100],
  yAxisUnit = "%",
  showLegend = true,
}: LineChartsProps) {
  const [selectedRange, setSelectedRange] = useState(timeRange);

  // 处理数据，确保按时间排序
  const sortedData = useMemo(() => {
    if (isSeriesData(data)) {
      return data.map(series => ({
        ...series,
        data: [...series.data].sort((a, b) => parseTime(a.time).getTime() - parseTime(b.time).getTime())
      }));
    }
    return [...data].sort((a, b) => parseTime(a.time).getTime() - parseTime(b.time).getTime());
  }, [data]);

  // 计算时间范围
  const timeRangeMs = {
    "30m": 30 * 60 * 1000,
    "1h": 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
    "72h": 72 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
  };

  // 过滤并映射数据
  const displayData = useMemo(() => {
    if (!sortedData.length) return [];

    const now = new Date();
    const rangeMs = timeRangeMs[selectedRange];
    const cutoffTime = new Date(now.getTime() - rangeMs);

    if (isSeriesData(sortedData)) {
      return sortedData.map(series => ({
        ...series,
        data: series.data.filter(point => parseTime(point.time) > cutoffTime)
      }));
    }

    return sortedData.filter(point => parseTime(point.time) > cutoffTime);
  }, [sortedData, selectedRange]);

  // 计算时间轴刻度
  const xAxisTicks = useMemo(() => {
    const dataPoints = isSeriesData(displayData) ? displayData[0]?.data : displayData;
    return generateTimeAxisTicks(dataPoints || []);
  }, [displayData]);

  return (
    <div className="w-full">
      <div className="flex justify-end mb-2 space-x-2">
        {["30m", "1h", "24h", "72h", "7d"].map((range) => (
          <button
            key={range}
            className={`px-2 py-1 rounded ${
              selectedRange === range ? "bg-green-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setSelectedRange(range as any)}
          >
            {range === "30m"
              ? "30分钟"
              : range === "1h"
              ? "1小时"
              : range === "24h"
              ? "24小时"
              : range === "72h"
              ? "3天"
              : "7天"}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart 
          data={isSeriesData(displayData) ? displayData[0].data : displayData}
          margin={{ top: 5, right: 10, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis
            dataKey="time"
            tick={{ fill: "#000" }}
            tickLine={{ stroke: "#000" }}
            ticks={xAxisTicks}
            angle={-45}
            textAnchor="end"
            height={60}
            tickFormatter={formatXAxis}
            minTickGap={30}
          />
          <YAxis
            domain={yAxisDomain}
            tick={{ fill: "#000" }}
            tickLine={{ stroke: "#000" }}
            tickFormatter={(value) => `${value}${yAxisUnit}`}
            width={100}
          />
          <Tooltip
            formatter={(value: number) => [`${value}${yAxisUnit}`, "值"]}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
            }}
          />
          {showLegend && <Legend />}
          {isSeriesData(displayData) ? (
            displayData.map((series, index) => (
              <Line
                key={series.name}
                type="monotone"
                name={series.name}
                dataKey="value"
                data={series.data}
                stroke={series.color || `hsl(${index * 60}, 70%, 50%)`}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
                connectNulls={true}
              />
            ))
          ) : (
            <Line
              type="monotone"
              dataKey="value"
              stroke="green"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
              connectNulls={true}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}