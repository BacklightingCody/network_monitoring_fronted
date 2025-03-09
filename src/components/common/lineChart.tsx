"use client"

import { useEffect, useState, useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface DataPoint {
  time: string
  value: number
  [key: string]: any
}

interface Series {
  name: string
  data: DataPoint[]
  color?: string
}

interface LineChartsProps {
  data: DataPoint[] | Series[]
  timeRange: '1h' | '24h' | '72h'
  yAxisDomain?: [number, number]
  yAxisUnit?: string
  showLegend?: boolean
}
// 判断数据是否为多个数据类型
// [{ time: "2025-03-09T12:00:00Z", value: 45 },]   单条数据
//[{ name: "CPU", data: [{ time: "2025-03-09T12:00:00Z", value: 45 }] },]  多条数据 
const isSeriesData = (data: DataPoint[] | Series[]): data is Series[] => {
  return Array.isArray(data) && data.length > 0 && 'name' in data[0];
};

export default function LineCharts({ 
  data, 
  timeRange = '1h',
  yAxisDomain = [0, 100],
  yAxisUnit = '%',
  showLegend = true 
}: LineChartsProps) {
  const [selectedRange, setSelectedRange] = useState(timeRange);
  
  // 根据时间范围过滤数据
  const filteredData = useMemo(() => {
    const now = Date.now();
    const ranges = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '72h': 72 * 60 * 60 * 1000
    };
    const timeLimit = now - ranges[selectedRange];

    if (isSeriesData(data)) {
      return data.map(series => ({
        ...series,
        data: series.data.filter(point => new Date(point.time).getTime() > timeLimit)
      }));
    } else {
      return data.filter(point => new Date(point.time).getTime() > timeLimit);
    }
  }, [data, selectedRange]);

 

  return (
    <div className="w-full h-[250px]">
      <div className="flex justify-end mb-2 space-x-2">
        <button 
          className={`px-2 py-1 rounded ${selectedRange === '1h' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setSelectedRange('1h')}
        >
          1小时
        </button>
        <button 
          className={`px-2 py-1 rounded ${selectedRange === '24h' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setSelectedRange('24h')}
        >
          24小时
        </button>
        <button 
          className={`px-2 py-1 rounded ${selectedRange === '72h' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setSelectedRange('72h')}
        >
          72小时
        </button>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={!isSeriesData(filteredData) ? filteredData : undefined}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis 
            dataKey="time" 
            tick={{ fill: "#666" }} 
            tickLine={{ stroke: "#666" }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={yAxisDomain}
            tick={{ fill: "#666" }}
            tickLine={{ stroke: "#666" }}
            tickFormatter={(value) => `${value}${yAxisUnit}`}
          />
          <Tooltip
            formatter={(value: number) => [`${value}${yAxisUnit}`, "值"]}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
            }}
          />
          {showLegend && <Legend />}
          
          {isSeriesData(filteredData) ? (
            filteredData.map((series: Series, index) => (
              <Line
                key={series.name}
                type="monotone"
                data={series.data}
                name={series.name}
                dataKey="value"
                stroke={series.color || `hsl(${index * 60}, 70%, 50%)`}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            ))
          ) : (
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

