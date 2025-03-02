"use client"

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
  timeRange?: '1h' | '24h' | '72h'
  yAxisDomain?: [number, number]
  yAxisUnit?: string
  showLegend?: boolean
}

export default function LineCharts({ 
  data, 
  timeRange = '1h',
  yAxisDomain = [0, 100],
  yAxisUnit = '%',
  showLegend = true 
}: LineChartsProps) {
  const onTimeRangeChange = (range: '1h' | '24h' | '72h') => {
    console.log('Time range changed to:', range);
  };

  const isSeriesData = (data: DataPoint[] | Series[]): data is Series[] => {
    return Array.isArray(data) && data.length > 0 && 'name' in data[0];
  };

  return (
    <div className="w-full h-[200px]">
      <div className="flex justify-end mb-2 space-x-2">
        <button 
          className={`px-2 py-1 rounded ${timeRange === '1h' ? 'bg-primary text-white' : 'bg-gray-200'}`}
          onClick={() => onTimeRangeChange('1h')}
        >
          1小时
        </button>
        <button 
          className={`px-2 py-1 rounded ${timeRange === '24h' ? 'bg-primary text-white' : 'bg-gray-200'}`}
          onClick={() => onTimeRangeChange('24h')}
        >
          24小时
        </button>
        <button 
          className={`px-2 py-1 rounded ${timeRange === '72h' ? 'bg-primary text-white' : 'bg-gray-200'}`}
          onClick={() => onTimeRangeChange('72h')}
        >
          72小时
        </button>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={!isSeriesData(data) ? data : undefined}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="time" tick={{ fill: "#666" }} tickLine={{ stroke: "#666" }} />
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
          
          {isSeriesData(data) ? (
            // 多条线的情况
            data.map((series: Series, index) => (
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
            // 单条线的情况
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

