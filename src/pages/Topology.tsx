// import React from 'react';
import { NetworkTopology } from '../components/topology/NetworkTopology';
import { TopologyControls } from '../components/topology/TopologyControls';

export function Topology() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">网络拓扑图</h1>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <NetworkTopology />
      </div>
    </div>
  );
}