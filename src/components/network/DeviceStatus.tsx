// import React from 'react';
import { Activity, ArrowDown, ArrowUp } from 'lucide-react';

export function DeviceStatus() {
  // Mock status data - in real app, this would come from an API
  const stats = {
    totalDevices: 4,
    activeDevices: 2,
    bandwidth: {
      up: 256,
      down: 512
    },
    latency: 100
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Network Status</h2>
        <Activity className="h-5 w-5 text-gray-400" />
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">Active Devices</span>
            <span className="text-sm font-medium text-gray-900">
              {stats.activeDevices}/{stats.totalDevices}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${(stats.activeDevices / stats.totalDevices) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 text-green-600 mb-2">
              <ArrowUp className="h-4 w-4" />
              <span className="text-sm font-medium">Upload</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">{stats.bandwidth.up} Mbps</span>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 text-blue-600 mb-2">
              <ArrowDown className="h-4 w-4" />
              <span className="text-sm font-medium">Download</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">{stats.bandwidth.down} Mbps</span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">Network Latency</h3>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900">{stats.latency}</span>
            <span className="text-gray-500">ms</span>
          </div>
        </div>
      </div>
    </div>
  );
}