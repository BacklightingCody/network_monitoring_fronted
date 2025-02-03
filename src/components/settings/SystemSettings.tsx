// import React from 'react';
import { Settings } from 'lucide-react';

export function SystemSettings() {
  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="h-5 w-5 text-indigo-600" />
        <h2 className="text-lg font-medium text-gray-900">系统设置</h2>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              数据刷新间隔 (秒)
            </label>
            <input
              type="number"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              defaultValue={30}
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              数据保留时间 (天)
            </label>
            <input
              type="number"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              defaultValue={30}
            />
          </div>
        </div>
      </div>
    </div>
  );
}