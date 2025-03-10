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

  // 确定X轴的刻度间隔
  const getXAxisInterval = () => {
    const dataLength = isSeriesData(displayData) 
      ? displayData[0]?.data.length || 0 
      : displayData.length;
    
    if (dataLength <= 10) return 0;
    return Math.max(1, Math.floor(dataLength / 10));
  };

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
            interval={getXAxisInterval()}
            angle={-45}
            textAnchor="end"
            height={60}
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