export interface ServerStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'warning';
  lastChecked: Date;
  ipAddress?: string;
  cpu?: number;
  memory?: number;
  disk?: number;
}

export interface ServiceHealth {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  lastChecked: Date;
  responseTime: number;
  endpoint?: string;
  description?: string;
}

export interface Alert {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  time: string;
  source?: string;
  details?: string;
  isRead?: boolean;
}

export interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
}

export interface NetworkTraffic {
  inbound: number;
  outbound: number;
  total: number;
  timestamp: Date;
}

export interface ProcessInfo {
  id: string;
  name: string;
  cpu: number;
  memory: number;
  uptime: number;
  status: 'running' | 'stopped' | 'crashed';
}

export interface MonitoringMetric {
  title: string;
  subtitle: string;
  total: number;
  current: number;
  percentage: number;
  icon?: React.ReactNode;
  color: string;
} 