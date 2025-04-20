// import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/common/Card';
import { Activity } from 'lucide-react';

export function NetworkTrafficChart() {
  // Mock data - in real app, this would come from an API
  const data = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    incoming: Math.random() * 100,
    outgoing: Math.random() * 80,
  }));

  return (
    <Card className="p-6 shadow-lg border border-gray-100 dark:border-gray-800">
      <div className="flex items-center mb-6">
        <Activity className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">网络流量</h2>
      </div>
      
      <div className="h-80 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <defs>
              <linearGradient id="colorIncoming" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorOutgoing" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.2)" />
            <XAxis 
              dataKey="time" 
              stroke="#9CA3AF" 
              fontSize={12} 
              tickLine={false}
              axisLine={{ stroke: 'rgba(156, 163, 175, 0.2)' }}
              tick={{ fill: '#6B7280' }} 
            />
            <YAxis 
              stroke="#9CA3AF" 
              fontSize={12} 
              tickLine={false}
              axisLine={{ stroke: 'rgba(156, 163, 175, 0.2)' }}
              tick={{ fill: '#6B7280' }}
              tickFormatter={(value) => `${value} KB`} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number) => [`${value.toFixed(2)} KB/s`, '']}
              labelFormatter={(label) => `时间: ${label}`}
            />
            <Legend 
              iconType="circle" 
              wrapperStyle={{ paddingTop: 15 }}
              formatter={(value) => <span className="text-sm text-gray-600 dark:text-gray-300">{value === 'incoming' ? '入站流量' : '出站流量'}</span>}
            />
            <Line 
              type="monotone" 
              dataKey="incoming" 
              name="入站流量" 
              stroke="#3B82F6" 
              strokeWidth={2}
              activeDot={{ r: 6, fill: '#3B82F6', stroke: '#3B82F6', strokeWidth: 2 }}
              dot={false}
              fill="url(#colorIncoming)"
            />
            <Line 
              type="monotone" 
              dataKey="outgoing" 
              name="出站流量" 
              stroke="#10B981" 
              strokeWidth={2}
              activeDot={{ r: 6, fill: '#10B981', stroke: '#10B981', strokeWidth: 2 }}
              dot={false}
              fill="url(#colorOutgoing)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex justify-between items-center">
          <div>
            <p className="text-sm text-blue-700 dark:text-blue-300">平均入站流量</p>
            <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
              {(data.reduce((sum, item) => sum + item.incoming, 0) / data.length).toFixed(2)} KB/s
            </p>
          </div>
          <div className="w-3 h-12 bg-blue-500 rounded-full"></div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg flex justify-between items-center">
          <div>
            <p className="text-sm text-green-700 dark:text-green-300">平均出站流量</p>
            <p className="text-lg font-bold text-green-900 dark:text-green-100">
              {(data.reduce((sum, item) => sum + item.outgoing, 0) / data.length).toFixed(2)} KB/s
            </p>
          </div>
          <div className="w-3 h-12 bg-green-500 rounded-full"></div>
        </div>
      </div>
    </Card>
  );
}