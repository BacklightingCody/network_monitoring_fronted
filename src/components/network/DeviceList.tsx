// import React from 'react';
import { Router, Wifi, Server, AlertCircle } from 'lucide-react';

export function DeviceList() {
  // Mock devices data - in real app, this would come from an API
  const devices = [
    {
      id: 1,
      name: 'Core Router',
      type: 'router',
      ip: '192.168.168.1',
      status: 'online',
      lastSeen: 'Just now'
    },
    {
      id: 2,
      name: 'Main Switch',
      type: 'switch',
      ip: '192.168.157.1',
      status: 'online',
      lastSeen: '2 minutes ago'
    },
    {
      id: 3,
      name: 'Wireless AP',
      type: 'ap',
      ip: '10.138.197.182',
      status: 'warning',
      lastSeen: '5 minutes ago'
    },
    {
      id: 4,
      name: 'Backup Server',
      type: 'server',
      ip: '192.168.1.4',
      status: 'offline',
      lastSeen: '15 minutes ago'
    }
  ];

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'router':
        return <Router className="h-5 w-5" />;
      case 'ap':
        return <Wifi className="h-5 w-5" />;
      case 'server':
        return <Server className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Network Devices</h2>
      <div className="space-y-4">
        {devices.map((device) => (
          <div
            key={device.id}
            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`${device.status === 'online'
                    ? 'text-green-500'
                    : device.status === 'warning'
                      ? 'text-yellow-500'
                      : 'text-gray-400'
                  }`}>
                  {getDeviceIcon(device.type)}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{device.name}</h3>
                  <p className="text-sm text-gray-500">{device.ip}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${device.status === 'online'
                    ? 'bg-green-100 text-green-800'
                    : device.status === 'warning'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                  {device.status}
                </span>
                <p className="text-xs text-gray-500 mt-1">{device.lastSeen}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}