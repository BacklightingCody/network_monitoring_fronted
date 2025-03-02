// utils/transformMetrics.ts
interface PrometheusMetric {
  metric: {
    __name__: string;
    [key: string]: string;
  };
  value: [number, string];
}

interface MetricDataPoint {
  time: string | number;
  value: number;
  [key: string]: any;
}

interface TransformOptions {
  // 是否需要保留metric中的标签
  keepLabels?: string[];
  // 是否格式化时间
  formatTime?: boolean;
  // 自定义值的处理函数
  valueProcessor?: (value: string) => number;
  // 是否只返回最新值
  latestOnly?: boolean;
}

// 转换单个指标数据
export function transformMetric(
  data: PrometheusMetric,
  options: TransformOptions = {}
): MetricDataPoint {
  const {
    keepLabels = [],
    formatTime = true,
    valueProcessor = (v: string) => parseFloat(v)
  } = options;

  const [timestamp, strValue] = data.value;
  const value = valueProcessor(strValue);
  
  const result: MetricDataPoint = {
    time: formatTime ? new Date(timestamp * 1000).toLocaleTimeString() : timestamp,
    value: isNaN(value) ? 0 : value
  };

  // 保留指定的标签
  if (keepLabels.length > 0) {
    keepLabels.forEach(label => {
      if (data.metric[label]) {
        result[label] = data.metric[label];
      }
    });
  }

  return result;
}

// 转换指标数据数组
export function transformMetricsData(
  rawData: PrometheusMetric[],
  options: TransformOptions = {}
): MetricDataPoint[] | number {
  if (!Array.isArray(rawData) || rawData.length === 0) {
    return options.latestOnly ? 0 : [];
  }

  // 如果只需要最新值
  if (options.latestOnly) {
    const latestMetric = rawData[rawData.length - 1];
    return parseFloat(latestMetric.value[1]) || 0;
  }

  return rawData.map(metric => transformMetric(metric, options));
}

// 转换多个指标系列的数据(用于图表)
export function transformMetricsSeries(
  rawData: PrometheusMetric[],
  options: {
    groupBy: string; // 用于分组的标签名
    keepLabels?: string[];
    formatTime?: boolean;
    valueProcessor?: (value: string) => number;
  }
): { name: string; data: MetricDataPoint[] }[] {
  const { groupBy, ...transformOptions } = options;
  
  // 按指定标签分组
  const groups = new Map<string, PrometheusMetric[]>();
  
  rawData.forEach(metric => {
    const groupValue = metric.metric[groupBy] || 'default';
    if (!groups.has(groupValue)) {
      groups.set(groupValue, []);
    }
    groups.get(groupValue)?.push(metric);
  });

  // 转换每个分组的数据
  return Array.from(groups.entries()).map(([name, metrics]) => ({
    name,
    data: transformMetricsData(metrics, transformOptions) as MetricDataPoint[]
  }));
}

export function calculateAverageCpuUsage(data: any[], index: number = 1): number {
  if (!data || data.length === 0) {
    return 0;
  }
  // 提取所有核心的CPU利用率并转换为浮点数
  const coreValues = data.map((item) => parseFloat(item.value)).filter((val) => !isNaN(val));
  if (coreValues.length === 0) {
    return 0;
  }
  // 累加所有核心利用率
  const total = coreValues.reduce((acc, curr) => acc + curr, 0);
  // 计算平均值
  const average = total;

  return parseFloat(average.toFixed(2)); // 保留两位小数
}

// 使用示例:
/*
// 获取单个最新值(用于卡片展示)
const cpuUsage = transformMetricsData(cpuMetrics, { latestOnly: true });

// 获取完整的时间序列数据(用于单线图表)
const cpuHistory = transformMetricsData(cpuMetrics, {
  formatTime: true,
  keepLabels: ['core']
});

// 获取多系列数据(用于多线图表)
const cpuStateHistory = transformMetricsSeries(cpuMetrics, {
  groupBy: 'state',
  formatTime: true,
  keepLabels: ['core']
});
*/