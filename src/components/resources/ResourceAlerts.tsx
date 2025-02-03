// import React from 'react';
import { AlertTriangle, Bell } from 'lucide-react';

export function ResourceAlerts() {
  // Mock alerts data - in real app, this would come from an API
  const alerts = [
    {
      id: 1,
      type: 'CPU',
      message: 'CPU usage exceeded 80%',
      timestamp: '10 minutes ago',
      severity: 'high'
    },
    {
      id: 2,
      type: 'Memory',
      message: 'Memory usage above threshold',
      timestamp: '15 minutes ago',
      severity: 'medium'
    },
    {
      id: 3,
      type: 'Disk',
      message: 'Low disk space warning',
      timestamp: '1 hour ago',
      severity: 'low'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Resource Alerts</h2>
        <Bell className="h-5 w-5 text-gray-400" />
      </div>
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg flex items-start space-x-3 ${
              alert.severity === 'high' 
                ? 'bg-red-50' 
                : alert.severity === 'medium'
                ? 'bg-yellow-50'
                : 'bg-blue-50'
            }`}
          >
            <AlertTriangle className={`h-5 w-5 ${
              alert.severity === 'high'
                ? 'text-red-400'
                : alert.severity === 'medium'
                ? 'text-yellow-400'
                : 'text-blue-400'
            }`} />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">{alert.type}</span>
                <span className="text-sm text-gray-500">{alert.timestamp}</span>
              </div>
              <p className="text-sm text-gray-600">{alert.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}