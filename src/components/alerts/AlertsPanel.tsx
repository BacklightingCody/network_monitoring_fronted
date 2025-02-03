// import React from 'react';
import { Bell, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AlertsPanel() {
  // Mock data - in real app, this would come from an API
  const alerts = [
    { id: '1', message: 'High CPU usage detected', severity: 'warning', time: '5m ago' },
    { id: '2', message: 'Database server not responding', severity: 'critical', time: '10m ago' },
    { id: '3', message: 'Memory usage above 80%', severity: 'warning', time: '15m ago' },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Alerts</h2>
        <Link
          to="/settings/alerts"
          className="text-sm text-indigo-600 hover:text-indigo-900"
        >
          <Settings className="h-5 w-5" />
        </Link>
      </div>
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg ${
              alert.severity === 'critical' ? 'bg-red-50' : 'bg-yellow-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Bell
                className={`h-5 w-5 ${
                  alert.severity === 'critical' ? 'text-red-400' : 'text-yellow-400'
                }`}
              />
              <div>
                <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                <p className="text-xs text-gray-500">{alert.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}