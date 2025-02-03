import React from 'react';
import { Network } from 'lucide-react';

export function NetworkTopology() {
  return (
    <div className="min-h-[600px] flex items-center justify-center">
      <div className="text-center text-gray-500">
        <Network className="h-16 w-16 mx-auto mb-4" />
        <p>Network topology visualization will be implemented here</p>
      </div>
    </div>
  );
}