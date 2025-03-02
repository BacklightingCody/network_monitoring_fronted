// import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function NetworkTrafficChart() {
  // Mock data - in real app, this would come from an API
  const data = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    incoming: Math.random() * 100,
    outgoing: Math.random() * 80,
  }));

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Network Traffic</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="incoming" stroke="#3B82F6" name="Incoming Traffic" />
              <Line type="monotone" dataKey="outgoing" stroke="#10B981" name="Outgoing Traffic" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}