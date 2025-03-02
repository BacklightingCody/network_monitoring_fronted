// import React from 'react';
import { ServiceHealth } from '../../types/monitoring';
import { Activity, CheckCircle, AlertTriangle, XOctagon } from 'lucide-react';

export function ServiceHealthPanel() {
  // Mock data - in real app, this would come from an API
  const services: ServiceHealth[] = [
    { id: '1', name: 'Web Server', status: 'healthy', lastChecked: new Date(), responseTime: 120 },
    { id: '2', name: 'Database', status: 'warning', lastChecked: new Date(), responseTime: 450 },
    { id: '3', name: 'Cache Server', status: 'healthy', lastChecked: new Date(), responseTime: 80 },
    { id: '4', name: 'Message Queue', status: 'critical', lastChecked: new Date(), responseTime: 2000 },
  ];

  const getStatusIcon = (status: ServiceHealth['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XOctagon className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <>
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Health</h2>
      <div className="space-y-4">
        {services.map((service) => (
          <div
            key={service.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <Activity className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">{service.name}</p>
                <p className="text-sm text-gray-500">
                  Response time: {service.responseTime}ms
                </p>
              </div>
            </div>
            {getStatusIcon(service.status)}
          </div>
        ))}
      </div>
    </div>
    </>
  );
}