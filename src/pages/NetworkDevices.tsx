// import React from 'react';
import { DeviceList } from '../components/network/DeviceList';
import { DeviceStatus } from '../components/network/DeviceStatus';
import { NetworkStats } from '../components/network/NetworkStats';

export function NetworkDevices() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">网络设备</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DeviceList />
        </div>
        <div>
          <DeviceStatus />
        </div>
      </div>
      <NetworkStats />
    </div>
  );
}