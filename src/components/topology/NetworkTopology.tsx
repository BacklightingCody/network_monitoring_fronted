import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TopologyControls } from './TopologyControls';
import { TopologyChart } from './TopologyChart';
import { NodeDetailsPanel } from './NodeDetailsPanel';
import { getNetworkTopology, getNodeDetails } from '@/services/api/topology';
import * as echarts from 'echarts';
import { useThemeStore } from '@/stores/theme';

// 类型导入
import type { TopologyData, NodeDetails } from '@/services/api/topology';

// API响应类型定义
interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

// 常量定义
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 重试延迟时间（毫秒）
const DEFAULT_TIME_RANGE_DAYS = 7; // 默认时间范围（天）

/**
 * 网络拓扑组件
 * 展示网络拓扑图及相关控制和节点详情
 */
export function NetworkTopology() {
  // 主题
  const theme = useThemeStore(state => state.theme);
  
  // 状态管理
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [topologyData, setTopologyData] = useState<TopologyData | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodeDetails, setNodeDetails] = useState<NodeDetails | null>(null);
  const [isLoadingTopology, setIsLoadingTopology] = useState(false);
  const [isLoadingNodeDetails, setIsLoadingNodeDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [echartsLoaded, setEchartsLoaded] = useState(true); // 默认为true，避免不必要的检查延迟
  
  // Refs
  const isRequestInProgress = useRef(false);
  const lastRequestParams = useRef({ startTime: '', endTime: '' });
  const abortControllerRef = useRef<AbortController | null>(null);
  // 重试计数器
  const retryCount = useRef(0);

  // 设置默认时间范围 - 只在组件首次加载时执行一次
  useEffect(() => {
    // 初始化默认时间范围
    const now = new Date();
    const pastDate = new Date();
    pastDate.setDate(now.getDate() - DEFAULT_TIME_RANGE_DAYS);
      
    const isoNow = now.toISOString();
    const isoPastDate = pastDate.toISOString();
      
    setStartTime(isoPastDate);
    setEndTime(isoNow);
    
    // 初始加载检查
    try {
      // 检查 echarts 是否已加载
      if (typeof echarts !== 'undefined') {
        setEchartsLoaded(true);
      } else {
        throw new Error('ECharts library not found');
      }
    } catch (error) {
      console.error('echarts 加载失败:', error);
      setEchartsLoaded(false);
      setError('图表库加载失败，请确保已安装 echarts 依赖');
    }
    
    // 组件卸载时取消所有正在进行的请求
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * 格式化日期输入为API请求格式
   */
  const formatDateForRequest = useCallback((dateString: string): string => {
    if (!dateString) return '';
    
    try {
      // 如果是ISO格式，直接返回
      if (dateString.includes('T') && dateString.includes('Z')) {
        return dateString;
      }
      
      // 如果是日期时间选择器格式（YYYY-MM-DDTHH:MM），添加秒和毫秒
      if (dateString.includes('T')) {
        return new Date(dateString + ':00.000Z').toISOString();
      }
      
      // 其他情况，尝试解析为日期对象
      return new Date(dateString).toISOString();
    } catch (e) {
      console.error('日期格式化错误:', e);
      return dateString;
    }
  }, []);

  /**
   * 获取拓扑数据的函数
   */
  const fetchTopologyData = useCallback(async (retry = false, force = false) => {
    // 检查前置条件
    if (!echartsLoaded) {
      setError('图表库未加载，请确保已安装 echarts 依赖');
      return;
    }

    // 正在进行中的请求检查
    if (isRequestInProgress.current && !force) {
      return;
    }

    // 重试次数限制检查
    if (retry && retryCount.current >= MAX_RETRIES) {
      setError(`请求拓扑数据失败，已尝试 ${MAX_RETRIES} 次。请检查网络连接或API服务是否可用。`);
      return;
    }
    
    if (retry) {
      retryCount.current += 1;
    } else {
      retryCount.current = 0;
    }

    // 格式化时间参数
    const formattedStartTime = formatDateForRequest(startTime);
    const formattedEndTime = formatDateForRequest(endTime);
    
    // 检查是否与上次请求参数相同
    if (!force && 
        formattedStartTime === lastRequestParams.current.startTime && 
        formattedEndTime === lastRequestParams.current.endTime) {
      return;
    }

    // 更新最近的请求参数
    lastRequestParams.current = {
      startTime: formattedStartTime,
      endTime: formattedEndTime
    };

    // 取消之前的请求（如果有）
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // 创建新的 AbortController
    abortControllerRef.current = new AbortController();

    try {
      // 标记请求开始
      isRequestInProgress.current = true;
      setIsLoadingTopology(true);
      setError(null);
    
      const response = await getNetworkTopology(
        formattedStartTime, 
        formattedEndTime,
        { 
          signal: abortControllerRef.current.signal,
          timeout: 30000 // 30秒超时
        }
      );
      
      // 如果请求被取消，直接返回
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      
      // 处理响应数据，兼容标准格式和直接返回格式
      let actualData: TopologyData | null = null;
      
      if (response && typeof response === 'object') {
        // 情况1: 标准API响应 { code: 0, data: {...}, message: "success" }
        if ('code' in response && response.code === 0 && 'data' in response) {
          actualData = response.data as TopologyData;
        }
        // 情况2: 直接返回数据 { nodes: [...], links: [...], summary: {...} }
        else if ('nodes' in response && 'links' in response && Array.isArray(response.nodes)) {
          actualData = response as TopologyData;
        }
        // 其他情况: 未知格式
        else {
          console.warn('API返回了未知格式的数据');
        }
      }
      
      if (actualData && actualData.nodes && actualData.links) {
        setTopologyData(actualData);
      } else {
        console.warn('API返回了无效数据');
        setError('API返回了无效数据，请检查网络连接或联系管理员');
        
        // 自动重试
        if (!retry) {
          setTimeout(() => fetchTopologyData(true), RETRY_DELAY);
        }
      }
    } catch (error) {
      // 检查是否是请求取消导致的错误
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
      
      console.error('获取拓扑数据异常:', error);
      setError(`获取拓扑数据异常: ${error instanceof Error ? error.message : String(error)}`);
      
      // 自动重试
      if (!retry) {
        setTimeout(() => fetchTopologyData(true), RETRY_DELAY);
      }
    } finally {
      // 标记请求结束
      isRequestInProgress.current = false;
      setIsLoadingTopology(false);
    }
  }, [startTime, endTime, echartsLoaded, formatDateForRequest]);

  /**
   * 获取节点详情
   */
  const fetchNodeDetails = useCallback(async (nodeId: string) => {
    if (!nodeId) return;
    
    // 创建新的 AbortController 用于节点详情请求
    const nodeDetailAbortController = new AbortController();
    
    try {
      setIsLoadingNodeDetails(true);
      
      const formattedStartTime = formatDateForRequest(startTime);
      const formattedEndTime = formatDateForRequest(endTime);
      
      const response = await getNodeDetails(
        nodeId, 
        formattedStartTime, 
        formattedEndTime,
        { 
          signal: nodeDetailAbortController.signal,
          timeout: 20000 // 20秒超时
        }
      );
      
      
      // 处理响应数据，兼容标准格式和直接返回格式
      let actualDetails: NodeDetails | null = null;
      
      if (response && typeof response === 'object') {
        // 情况1: 标准API响应 { code: 0, data: {...}, message: "success" }
        if ('code' in response && response.code === 0 && 'data' in response) {
          actualDetails = response.data as NodeDetails;
        }
        // 情况2: 直接返回数据 { nodeId: "...", ... }
        else if ('nodeId' in response) {
          actualDetails = response as NodeDetails;
        }
        // 其他情况: 未知格式
        else {
          console.warn('API返回了未知格式的节点数据');
        }
      }
      
      if (actualDetails && actualDetails.nodeId) {
        setNodeDetails(actualDetails);
      } else {
        console.warn('API返回了无效的节点详情数据');
        setError(`未能获取到节点 ${nodeId} 的有效详情数据`);
      }
    } catch (error) {
      // 检查是否是请求取消导致的错误
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
      
      console.error('获取节点详情异常:', error);
      setError(`获取节点 ${nodeId} 详情异常: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoadingNodeDetails(false);
    }
  }, [startTime, endTime, formatDateForRequest]);

  /**
   * 处理时间范围变化
   */
  const handleTimeRangeChange = useCallback((newStartTime: string, newEndTime: string) => {
    setStartTime(newStartTime);
    setEndTime(newEndTime);
  }, []);

  /**
   * 处理节点点击
   */
  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    fetchNodeDetails(nodeId);
  }, [fetchNodeDetails]);

  /**
   * 处理关闭节点详情面板
   */
  const handleCloseNodeDetails = useCallback(() => {
    setSelectedNodeId(null);
    setNodeDetails(null);
  }, []);

  /**
   * 手动刷新数据
   */
  const handleRefresh = useCallback(() => {
    fetchTopologyData(false, true); // 强制刷新，忽略缓存检查
  }, [fetchTopologyData]);

  /**
   * 清除错误消息
   */
  const handleClearError = useCallback(() => {
    setError(null);
  }, []);

  // 时间范围变化时加载数据
  useEffect(() => {
    // 确保时间参数已准备好
    if (startTime && endTime) {
      fetchTopologyData();
    }
  }, [startTime, endTime, fetchTopologyData]);

  return (
    <div className="space-y-4">
      <TopologyControls
        startTime={startTime}
        endTime={endTime}
        onTimeRangeChange={handleTimeRangeChange}
        onRefresh={handleRefresh}
        isLoading={isLoadingTopology}
      />
      
      {error && (
        <div className="bg-red-50 border border-border text-red-700 dark:bg-red-950/30 dark:text-red-400 px-4 py-3 rounded-md relative">
          <span className="block sm:inline">{error}</span>
          {retryCount.current > 0 && retryCount.current < MAX_RETRIES && (
            <span className="block sm:inline ml-2">
              自动重试中 ({retryCount.current}/{MAX_RETRIES})...
            </span>
          )}
          <button 
            className="absolute top-0 right-0 mt-3 mr-4 text-red-700 dark:text-red-400"
            onClick={handleClearError}
            aria-label="关闭错误提示"
          >
            ×
          </button>
        </div>
      )}

      {!echartsLoaded ? (
        <div className="min-h-[600px] flex items-center justify-center bg-card border border-border rounded-md">
          <div className="text-center text-red-500">
            <p>图表库加载失败，请确保已安装 echarts 依赖</p>
            <p className="mt-2 text-sm text-muted-foreground">运行 npm install echarts --save 安装</p>
          </div>
        </div>
      ) : (
        <TopologyChart
          data={topologyData}
          loading={isLoadingTopology}
          onNodeClick={handleNodeClick}
        />
      )}
      
      <NodeDetailsPanel
        nodeDetails={nodeDetails}
        loading={isLoadingNodeDetails}
        onClose={handleCloseNodeDetails}
      />

      {topologyData && (
        <div className="bg-card border border-border rounded-md p-4 text-sm">
          <h3 className="font-medium mb-2 text-foreground">拓扑统计信息</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md">
              <div className="text-sm text-muted-foreground">节点总数</div>
              <div className="text-xl font-medium text-foreground">{topologyData.summary.nodeCount}</div>
            </div>
            <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-md">
              <div className="text-sm text-muted-foreground">内部节点</div>
              <div className="text-xl font-medium text-foreground">{topologyData.summary.internalNodes}</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-950/30 p-3 rounded-md">
              <div className="text-sm text-muted-foreground">外部节点</div>
              <div className="text-xl font-medium text-foreground">{topologyData.summary.externalNodes}</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/30 p-3 rounded-md">
              <div className="text-sm text-muted-foreground">连接总数</div>
              <div className="text-xl font-medium text-foreground">{topologyData.summary.linkCount}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}