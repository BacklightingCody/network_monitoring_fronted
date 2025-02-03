import React from 'react';

interface MetricsGaugeProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  unit: string;
  subtitle?: string;
}

export function MetricsGauge({ icon, title, value, unit, subtitle }: MetricsGaugeProps) {
  const percentage = Math.min(100, Math.max(0, value));
  const strokeDasharray = `${percentage} ${100 - percentage}`;
  const color = percentage > 80 ? 'stroke-red-500' : percentage > 60 ? 'stroke-yellow-500' : 'stroke-green-500';

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {icon}
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            className="stroke-gray-200"
            strokeWidth="2"
          />
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            className={color}
            strokeWidth="2"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-semibold">{Math.round(value)}%</span>
        </div>
      </div>
      <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
}