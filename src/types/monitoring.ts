export interface ServerStatus {
  id: string;
  name: string;
  status: 'online' | 'offline';
  lastChecked: Date;
}

export interface SystemMetrics {
  cpu: number;
  memory: {
    used: number;
    total: number;
  };
  disk: {
    used: number;
    total: number;
  };
}

export interface NetworkTraffic {
  timestamp: Date;
  incoming: number;
  outgoing: number;
}

export interface ServiceHealth {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  lastChecked: Date;
  responseTime: number;
}

export interface AlertConfig {
  id: string;
  metric: string;
  threshold: number;
  enabled: boolean;
}