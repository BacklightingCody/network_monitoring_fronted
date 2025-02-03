// import React from 'react';
import { AlertSettings } from '../components/settings/AlertSettings';
import { SystemSettings } from '../components/settings/SystemSettings';
import { NetworkSettings } from '../components/settings/NetworkSettings';

export function Settings() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">系统设置</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <AlertSettings />
        <SystemSettings />
        <NetworkSettings />
      </div>
    </div>
  );
}