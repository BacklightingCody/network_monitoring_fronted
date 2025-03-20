// import React from 'react';
import { ServerStatus } from '../../utils/types/monitoring';
import { Server, CheckCircle, XCircle } from 'lucide-react';

export function ServerList() {
  // Mock data - in real app, this would come from an API
  const servers: ServerStatus[] = [
    { id: '1', name: 'Production Server', status: 'online', lastChecked: new Date() },
    { id: '2', name: 'Backup Server', status: 'online', lastChecked: new Date() },
    { id: '3', name: 'Development Server', status: 'offline', lastChecked: new Date() },
  ];

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Servers</h2>
        <div className="space-y-4">
          {servers.map((server) => (
            <div
              key={server.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <Server className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{server.name}</p>
                  <p className="text-sm text-gray-500">
                    Last checked: {server.lastChecked.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              {server.status === 'online' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}