import { StateCreator } from 'zustand';
import { getNetworkAllMetrics } from '@/services/api/network';
import { transformMetricsData, extractMetrics } from '@/components/metrics/utils/transformMetricsData';
import { StoreState } from '../index';
import { timeRangeMs } from '@/components/metrics/constant';

export interface NetworkState {
  interface: string;
  value: number;
}

export interface NetworkTrendPoint {
  time: string;
  value: number;
}

export interface NetworkNicInfo {
  metric: {
    nic?: string;
    family?: string;
    friendly_name?: string;
    address?: string;
    [key: string]: string | undefined;
  };
  time: string | number;
  value: string | number;
}

export interface NetworkMetricsState {
  bytesReceived: NetworkState[];
  bytesSent: NetworkState[];
  bytesTotal: number;
  currentBandwidth: number;
  outputQueueLength: number;
  packetsReceived: NetworkState[];
  packetsSent: NetworkState[];
  packetsTotal: number;
  errors: {
    outbound: number;
    received: number;
    discardedOutbound: number;
    discardedReceived: number;
    unknown: number;
  };
  nicInfo: NetworkNicInfo[];
  trafficTrend: {
    bytesReceived: NetworkTrendPoint[];
    bytesSent: NetworkTrendPoint[];
    bandwidth: NetworkTrendPoint[];
  };
  packetsTrend: {
    received: NetworkTrendPoint[];
    sent: NetworkTrendPoint[];
    total: NetworkTrendPoint[];
  };
  errorsTrend: {
    outbound: NetworkTrendPoint[];
    received: NetworkTrendPoint[];
    discarded: NetworkTrendPoint[];
  };
  error: string | null;
  isLoading: boolean;
  isPolling: boolean;
}

export interface NetworkMetricsActions {
  fetchNetworkMetrics: () => Promise<void>;
  updateMetrics: (metrics: Partial<NetworkMetricsState>) => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  startPolling: () => void;
  stopPolling: () => void;
}

export type NetworkMetricsSlice = NetworkMetricsState & NetworkMetricsActions;

const initialState: NetworkMetricsState = {
  bytesReceived: [],
  bytesSent: [],
  bytesTotal: 0,
  currentBandwidth: 0,
  outputQueueLength: 0,
  packetsReceived: [],
  packetsSent: [],
  packetsTotal: 0,
  errors: {
    outbound: 0,
    received: 0,
    discardedOutbound: 0,
    discardedReceived: 0,
    unknown: 0,
  },
  nicInfo: [],
  trafficTrend: {
    bytesReceived: [],
    bytesSent: [],
    bandwidth: [],
  },
  packetsTrend: {
    received: [],
    sent: [],
    total: [],
  },
  errorsTrend: {
    outbound: [],
    received: [],
    discarded: [],
  },
  error: null,
  isLoading: false,
  isPolling: false,
};

export const createNetworkMetricsSlice: StateCreator<
  StoreState,
  [],
  [],
  NetworkMetricsSlice
> = (set, get) => {
  let pollingInterval: NodeJS.Timeout | null = null;
  const updateNetwork = (newState: Partial<NetworkMetricsState>) =>
    set(state => ({ network: { ...state.network, ...newState } }));

  const processStateMetrics = (metrics: any[]): NetworkState[] =>
    metrics.map(item => ({
      interface: item.metric?.interface || '',
      value: parseFloat(item.value[1] as string) || 0,
    }));

  return {
    ...initialState,

    fetchNetworkMetrics: async () => {
      const networkState = get().network;
      if (networkState.isLoading) return;

      try {
        updateNetwork({ isLoading: true, error: null });

        const allMetrics = await getNetworkAllMetrics();
        const currentTime = new Date().toLocaleTimeString();

        const {
          bytesReceived,
          bytesSent,
          bytesTotal,
          currentBandwidth,
          outputQueueLength,
          packetsReceived,
          packetsSent,
          packetsTotal,
          packetsOutboundErrors,
          packetsReceivedErrors,
          packetsOutboundDiscarded,
          packetsReceivedDiscarded,
          packetsReceivedUnknown,
          nicAddressInfo,
        } = allMetrics;

        // Process state data
        const bytesReceivedMetrics = processStateMetrics(bytesReceived);
        const bytesSentMetrics = processStateMetrics(bytesSent);
        const packetsReceivedMetrics = processStateMetrics(packetsReceived);
        const packetsSentMetrics = processStateMetrics(packetsSent);

        updateNetwork({
          bytesReceived: bytesReceivedMetrics,
          bytesSent: bytesSentMetrics,
          bytesTotal: processStateMetrics(bytesTotal).reduce((sum, m) => sum + m.value, 0),
          currentBandwidth: processStateMetrics(currentBandwidth).reduce((sum, m) => sum + m.value, 0),
          outputQueueLength: processStateMetrics(outputQueueLength).reduce((sum, m) => sum + m.value, 0),
          packetsReceived: packetsReceivedMetrics,
          packetsSent: packetsSentMetrics,
          packetsTotal: processStateMetrics(packetsTotal).reduce((sum, m) => sum + m.value, 0),
          errors: {
            outbound: processStateMetrics(packetsOutboundErrors).reduce((sum, m) => sum + m.value, 0),
            received: processStateMetrics(packetsReceivedErrors).reduce((sum, m) => sum + m.value, 0),
            discardedOutbound: processStateMetrics(packetsOutboundDiscarded).reduce((sum, m) => sum + m.value, 0),
            discardedReceived: processStateMetrics(packetsReceivedDiscarded).reduce((sum, m) => sum + m.value, 0),
            unknown: processStateMetrics(packetsReceivedUnknown).reduce((sum, m) => sum + m.value, 0),
          },
          nicInfo: extractMetrics(nicAddressInfo, ['nic', 'friendly_name', 'family', 'address']),
          trafficTrend: {
            bytesReceived: [
              ...networkState.trafficTrend.bytesReceived,
              { time: currentTime, value: bytesReceivedMetrics.reduce((sum, m) => sum + m.value, 0) },
            ].slice(-timeRangeMs['7d']),
            bytesSent: [
              ...networkState.trafficTrend.bytesSent,
              { time: currentTime, value: bytesSentMetrics.reduce((sum, m) => sum + m.value, 0) },
            ].slice(-timeRangeMs['7d']),
            bandwidth: [
              ...networkState.trafficTrend.bandwidth,
              {
                time: currentTime,
                value: processStateMetrics(currentBandwidth).reduce((sum, m) => sum + m.value, 0),
              },
            ].slice(-timeRangeMs['7d']),
          },
          packetsTrend: {
            received: [
              ...networkState.packetsTrend.received,
              { time: currentTime, value: packetsReceivedMetrics.reduce((sum, m) => sum + m.value, 0) },
            ].slice(-timeRangeMs['7d']),
            sent: [
              ...networkState.packetsTrend.sent,
              { time: currentTime, value: packetsSentMetrics.reduce((sum, m) => sum + m.value, 0) },
            ].slice(-timeRangeMs['7d']),
            total: [
              ...networkState.packetsTrend.total,
              {
                time: currentTime,
                value: processStateMetrics(packetsTotal).reduce((sum, m) => sum + m.value, 0),
              },
            ].slice(-timeRangeMs['7d']),
          },
          errorsTrend: {
            outbound: [
              ...networkState.errorsTrend.outbound,
              {
                time: currentTime,
                value: processStateMetrics(packetsOutboundErrors).reduce((sum, m) => sum + m.value, 0),
              },
            ].slice(-timeRangeMs['7d']),
            received: [
              ...networkState.errorsTrend.received,
              {
                time: currentTime,
                value: processStateMetrics(packetsReceivedErrors).reduce((sum, m) => sum + m.value, 0),
              },
            ].slice(-timeRangeMs['7d']),
            discarded: [
              ...networkState.errorsTrend.discarded,
              {
                time: currentTime,
                value:
                  processStateMetrics(packetsOutboundDiscarded).reduce((sum, m) => sum + m.value, 0) +
                  processStateMetrics(packetsReceivedDiscarded).reduce((sum, m) => sum + m.value, 0),
              },
            ].slice(-timeRangeMs['7d']),
          },
          isLoading: false,
        });
      } catch (error) {
        console.error('获取网络指标失败:', error);
        const errorMessage = error instanceof Error ? error.message : '获取数据失败，请稍后重试';
        updateNetwork({ error: errorMessage, isLoading: false });
      }
    },

    updateMetrics: (metrics) => updateNetwork(metrics),
    setError: (error) => updateNetwork({ error }),
    setLoading: (isLoading) => updateNetwork({ isLoading }),
    
    startPolling: () => {
      const currentState = get().network;
      if (currentState.isPolling || pollingInterval) return;

      updateNetwork({ isPolling: true });

      const fetchMetrics = () => {
        const state = get().network;
        if (state.isPolling) {
          state.fetchNetworkMetrics().catch(err =>
            console.error('轮询期间获取网络指标失败:', err)
          );
        }
      };

      fetchMetrics();

      pollingInterval = setInterval(fetchMetrics, 5000);
    },

    stopPolling: () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
      }

      setTimeout(() => {
        updateNetwork({ isPolling: false });
      }, 0);
    },
  };
};