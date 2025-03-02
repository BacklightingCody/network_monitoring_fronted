// import React from 'react';
import { Layout } from './Layout';
import { SystemMetrics } from './metrics/SystemMetrics';
import { NetworkStats } from './network/NetworkStats';
import { ServerList } from './servers/ServerList';
import { ServiceHealthPanel } from './services/ServiceHealthPanel';
import { AlertsPanel } from './alerts/AlertsPanel';

export function Dashboard() {
  return (
    <>
      <Layout>
        <div className="p-6 space-y-6">
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
      </Layout>
    </>
  );
}