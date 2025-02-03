// import React from 'react';
import { Bell } from 'lucide-react';

export function AlertSettings() {
  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="h-5 w-5 text-indigo-600" />
        <h2 className="text-lg font-medium text-gray-900">告警设置</h2>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              CPU 使用率告警阈值 (%)
            </label>
            <input
              type="number"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              defaultValue={40}
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              内存使用率告警阈值 (%)
            </label>
            <input
              type="number"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              defaultValue={85}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            告警通知方式
          </label>
          <div className="space-y-2">
            <label className="inline-flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" defaultChecked />
              <span className="ml-2 text-sm text-gray-600">浏览器通知</span>
            </label>
            <label className="inline-flex items-center ml-6">
              <input type="checkbox" className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" defaultChecked />
              <span className="ml-2 text-sm text-gray-600">邮件通知</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}