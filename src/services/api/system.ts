import http from '@/lib/http';

// Define the expected Prometheus metric structure
interface PrometheusMetric {
  metric: { [key: string]: string }; // e.g., { __name__: "windows_os_hostname", instance: "localhost:9182" }
  value: [number, string]; // [timestamp, value]
}

// Generic response type (array of Prometheus metrics)
type SystemMetricResponse = PrometheusMetric[];

// API client functions
export async function getHostname(): Promise<SystemMetricResponse> {
  return await fetchSystemMetric('/metrics/system/hostname');
}

export async function getSystemInfo(): Promise<SystemMetricResponse> {
  return await fetchSystemMetric('/metrics/system/info');
}

export async function getProcesses(): Promise<SystemMetricResponse> {
  return await fetchSystemMetric('/metrics/system/processes');
}

export async function getProcessesLimit(): Promise<SystemMetricResponse> {
  return await fetchSystemMetric('/metrics/system/processes-limit');
}

export async function getMemoryFree(): Promise<SystemMetricResponse> {
  return await fetchSystemMetric('/metrics/system/memory-free');
}

export async function getMemoryLimit(): Promise<SystemMetricResponse> {
  return await fetchSystemMetric('/metrics/system/memory-limit');
}

export async function getSystemTime(): Promise<SystemMetricResponse> {
  return await fetchSystemMetric('/metrics/system/time');
}

export async function getTimezone(): Promise<SystemMetricResponse> {
  return await fetchSystemMetric('/metrics/system/timezone');
}

export async function getUsers(): Promise<SystemMetricResponse> {
  return await fetchSystemMetric('/metrics/system/users');
}

export async function getBootTime(): Promise<SystemMetricResponse> {
  return await fetchSystemMetric('/metrics/system/boot-time');
}

export async function getCpuQueueLength(): Promise<SystemMetricResponse> {
  return await fetchSystemMetric('/metrics/system/cpu-queue-length');
}

export async function getContextSwitches(): Promise<SystemMetricResponse> {
  return await fetchSystemMetric('/metrics/system/context-switches');
}

export async function getExceptionDispatches(): Promise<SystemMetricResponse> {
  return await fetchSystemMetric('/metrics/system/exception-dispatches');
}

export async function getSystemCalls(): Promise<SystemMetricResponse> {
  return await fetchSystemMetric('/metrics/system/system-calls');
}

export async function getThreads(): Promise<SystemMetricResponse> {
  return await fetchSystemMetric('/metrics/system/threads');
}

export async function getLogicalProcessors(): Promise<SystemMetricResponse> {
  return await fetchSystemMetric('/metrics/system/logical-processors');
}

export async function getPhysicalMemory(): Promise<SystemMetricResponse> {
  return await fetchSystemMetric('/metrics/system/physical-memory');
}

export async function getDiskIO(): Promise<SystemMetricResponse> {
  return await fetchSystemMetric('/metrics/system/disk-io');
}

export async function getServices(): Promise<SystemMetricResponse> {
  return await fetchSystemMetric('/metrics/system/services');
}

export async function getServiceState(): Promise<SystemMetricResponse> {
  return await fetchSystemMetric('/metrics/system/service-state');
}

export async function getCollectorDuration(): Promise<SystemMetricResponse> {
  return await fetchSystemMetric('/metrics/system/collector-duration');
}

// Interface for the aggregated "all" endpoint response
export interface SystemAllMetrics {
  hostname: SystemMetricResponse;
  systemInfo: SystemMetricResponse;
  processes: SystemMetricResponse;
  processesLimit: SystemMetricResponse;
  memoryFree: SystemMetricResponse;
  memoryLimit: SystemMetricResponse;
  systemTime: SystemMetricResponse;
  timezone: SystemMetricResponse;
  users: SystemMetricResponse;
  bootTime: SystemMetricResponse;
  cpuQueueLength: SystemMetricResponse;
  contextSwitches: SystemMetricResponse;
  exceptionDispatches: SystemMetricResponse;
  systemCalls: SystemMetricResponse;
  threads: SystemMetricResponse;
  logicalProcessors: SystemMetricResponse;
  physicalMemory: SystemMetricResponse;
  diskIO: SystemMetricResponse;
  services: SystemMetricResponse;
  serviceState: SystemMetricResponse;
  collectorDuration: SystemMetricResponse;
}

export async function getAllSystemMetrics(): Promise<SystemAllMetrics> {
  return await fetchSystemMetric('/metrics/system/all');
}

// Generic fetch function for system metrics
async function fetchSystemMetric(endpoint: string): Promise<any> {
  try {
    const response = await http.get(endpoint);
    return response; // Assumes http.get returns the data directly (e.g., result array or object)
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    throw error;
  }
}