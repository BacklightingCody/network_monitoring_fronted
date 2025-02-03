// import React from 'react';
import { SystemMetrics } from '../components/metrics/SystemMetrics';
import { MonitoringMetrics } from '../components/metrics/MonitoringMetrics';
import { NetworkStats } from '../components/network/NetworkStats';
import { ServerList } from '../components/servers/ServerList';
import { ServiceHealthPanel } from '../components/services/ServiceHealthPanel';
import { AlertsPanel } from '../components/alerts/AlertsPanel';

export function Overview() {
  return (
    <div className="space-y-6">
      <MonitoringMetrics />
      <SystemMetrics />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <NetworkStats />
        </div>
        <div>
          <ServerList />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ServiceHealthPanel />
        </div>
        <div>
          <AlertsPanel />
        </div>
      </div>
    </div>
  );
}