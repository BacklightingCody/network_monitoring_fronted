// import React from 'react';
import { SystemMetrics } from '../components/metrics/SystemMetrics';
import { ResourceUsageHistory } from '../components/resources/ResourceUsageHistory';
import { ResourceAlerts } from '../components/resources/ResourceAlerts';
import { CpuMetrics } from '@/components/metrics/cpu/MetricsCpu';
import { DiskMetrics } from '@/components/metrics/disk/MetricsDisk';
import { NetworkMetrics } from '@/components/metrics/network/MetricsNet';
import { MemoryMetrics } from '@/components/metrics/memory/MetricsMemory';
import {MetricsSystem} from '@/components/metrics/system/MetricsSystem';
export function Resources() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">资源管理</h1>
      {/* <CpuMetrics />
      <DiskMetrics />
      <NetworkMetrics />
      <MemoryMetrics /> */}
      <MetricsSystem />
      <ResourceUsageHistory />
      <ResourceAlerts />
    </div>
  );
}