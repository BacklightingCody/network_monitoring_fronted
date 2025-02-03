// import React from 'react';
import { SystemMetrics } from '../components/metrics/SystemMetrics';
import { ResourceUsageHistory } from '../components/resources/ResourceUsageHistory';
import { ResourceAlerts } from '../components/resources/ResourceAlerts';

export function Resources() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">资源管理</h1>
      <SystemMetrics />
      <ResourceUsageHistory />
      <ResourceAlerts />
    </div>
  );
}