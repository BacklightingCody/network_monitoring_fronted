import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export function TopologyControls() {
  return (
    <div className="flex gap-2 mb-4">
      <button className="p-2 rounded hover:bg-gray-100">
        <ZoomIn className="h-5 w-5" />
      </button>
      <button className="p-2 rounded hover:bg-gray-100">
        <ZoomOut className="h-5 w-5" />
      </button>
      <button className="p-2 rounded hover:bg-gray-100">
        <RotateCcw className="h-5 w-5" />
      </button>
    </div>
  );
}