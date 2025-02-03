// import React from 'react';
import { Cpu, HardDrive, CircuitBoard } from 'lucide-react';
import { MetricsGauge } from './MetricsGauge';

export function MetricsPanel() {
  // Mock data - in real app, this would come from an API
  const metrics = {
    cpu: 45,
    memory: { used: 8, total: 16 },
    disk: { used: 256, total: 512 }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">System Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricsGauge
          icon={<Cpu className="h-6 w-6 text-blue-500" />}
          title="CPU Usage"
          value={metrics.cpu}
          unit="%"
        />
        <MetricsGauge
          icon={<CircuitBoard className="h-6 w-6 text-green-500" />}
          title="Memory Usage"
          value={(metrics.memory.used / metrics.memory.total) * 100}
          unit="GB"
          subtitle={`${metrics.memory.used}/${metrics.memory.total} GB`}
        />
        <MetricsGauge
          icon={<HardDrive className="h-6 w-6 text-purple-500" />}
          title="Disk Usage"
          value={(metrics.disk.used / metrics.disk.total) * 100}
          unit="GB"
          subtitle={`${metrics.disk.used}/${metrics.disk.total} GB`}
        />
      </div>
    </div>
  );
}