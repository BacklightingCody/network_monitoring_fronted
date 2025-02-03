// import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock } from 'lucide-react';

export function ResourceUsageHistory() {
  // Mock data - in real app, this would come from an API
  const data = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    cpu: Math.floor(Math.random() * 100),
    memory: Math.floor(Math.random() * 100),
    disk: Math.floor(Math.random() * 100),
  }));

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Resource Usage History</h2>
        </div>
        <select className="text-sm border rounded-md p-1">
          <option>Last 24 hours</option>
          <option>Last 7 days</option>
          <option>Last 30 days</option>
        </select>
      </div>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="cpu" stackId="1" stroke="#3B82F6" fill="#93C5FD" name="CPU" />
            <Area type="monotone" dataKey="memory" stackId="1" stroke="#10B981" fill="#6EE7B7" name="Memory" />
            <Area type="monotone" dataKey="disk" stackId="1" stroke="#6366F1" fill="#A5B4FC" name="Disk" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}