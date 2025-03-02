import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, CircuitBoard, Network } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  total?: number;
  unit: string;
  icon: React.ReactNode;
  color: string;
}

function MetricCard({ title, value, total, unit, icon, color }: MetricCardProps) {
  const percentage = total ? (value / total) * 100 : value;

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
        <span className="text-xs font-medium text-gray-500">{title}</span>
      </div>
      <div className="mt-3">
        <div className="flex items-end">
          <h4 className="text-2xl font-semibold">{value}</h4>
          <span className="text-sm text-gray-500 ml-1">{unit}</span>
        </div>
        {total && (
          <div className="mt-2">
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${percentage > 80 ? 'bg-red-500' :
                    percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 mt-1">
              {value} / {total} {unit}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function SystemMetrics() {
  const initialMetrics = {
    cpu: { used: 22, total: 100 },
    memory: { used: 9.62, total: 16 },
    disk: { used: 459.5, total: 512 },
    network: { bandwidth: 610.89 }
  };

  const [metrics, setMetrics] = useState(initialMetrics);

  // Function to generate random fluctuation around the initial value
  const getFluctuatedValue = (initialValue: number, range: number) => {
    const fluctuation = (Math.random() * range - range / 2); // Random value within +/- range
    const newValue = initialValue + fluctuation;
    return parseFloat(newValue.toFixed(3)); // Ensure value is limited to 3 decimal places
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMetrics(prevMetrics => ({
        cpu: {
          used: getFluctuatedValue(prevMetrics.cpu.used, 5), // CPU fluctuates by +/- 5
          total: 100,
        },
        memory: {
          used: getFluctuatedValue(prevMetrics.memory.used, 1), // Memory fluctuates by +/- 1 GB
          total: prevMetrics.memory.total
        },
        disk: {
          used: getFluctuatedValue(prevMetrics.disk.used, 0), // Disk fluctuates by +/- 20 GB
          total: prevMetrics.disk.total
        },
        network: {
          bandwidth: getFluctuatedValue(prevMetrics.network.bandwidth, 50) // Bandwidth fluctuates by +/- 50 KB/s
        }
      }));
    }, 3000); // Update every 3 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="CPU Usage"
        value={metrics.cpu.used}
        total={metrics.cpu.total}
        unit="%"
        icon={<Cpu className="h-5 w-5 text-blue-600" />}
        color="bg-blue-50"
      />
      <MetricCard
        title="Memory Usage"
        value={metrics.memory.used}
        total={metrics.memory.total}
        unit="GB"
        icon={<CircuitBoard className="h-5 w-5 text-green-600" />}
        color="bg-green-50"
      />
      <MetricCard
        title="Disk Usage"
        value={metrics.disk.used}
        total={metrics.disk.total}
        unit="GB"
        icon={<HardDrive className="h-5 w-5 text-purple-600" />}
        color="bg-purple-50"
      />
      <MetricCard
        title="Network Bandwidth"
        value={metrics.network.bandwidth}
        unit="KB/s"
        icon={<Network className="h-5 w-5 text-cyan-600" />}
        color="bg-cyan-50"
      />
    </div>
  );
}
