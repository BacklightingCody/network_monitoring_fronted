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
  console.log(coreValues,'kxc')
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

/*
options:{
  formatTime: true,
  average: true,
  valueProcessor: (v: string) => parseFloat(v)
  }
*/


export function aggregateMetricsData(
  rawData: PrometheusMetric[],
  options: {
    formatTime?: boolean; // 是否格式化时间
    average?: boolean; // 是否计算平均值
    valueProcessor?: (value: string) => number; // 自定义数值处理
  } = {}
): MetricDataPoint | null {
  if (!Array.isArray(rawData) || rawData.length === 0) {
    return null;
  }

  const { formatTime = true, average = false, valueProcessor = (v: string) => parseFloat(v) } = options;

  // 计算时间戳范围（取最后一个时间戳）
  const lastTimestamp = rawData[rawData.length - 1].value[0];

  // 提取所有的数值
  const values = rawData.map(metric => valueProcessor(metric.value[1])).filter(v => !isNaN(v));

  if (values.length === 0) {
    return null;
  }

  // 计算总和或平均值
  const total = values.reduce((acc, curr) => acc + curr, 0);
  const resultValue = average ? total / values.length : total;

  return {
    time: formatTime ? new Date(lastTimestamp * 1000).toLocaleTimeString() : lastTimestamp,
    value: parseFloat(resultValue.toFixed(2)) // 保留两位小数
  };
}

// utils/transformCpuCStateData.ts

interface CpuCStateData {
  metric: {
    core: string;
    state: string;
    instance: string;
    job: string;
    [key: string]: any;
  };
  value: [number, string];  // [timestamp, time in state (seconds)]
}

interface CStateResult {
  c1: { name: string; value: number; data: any[] };
  c2: { name: string; value: number; data: any[] };
  c3: { name: string; value: number; data: any[] };
}

export const processCpuCStateData = (data: CpuCStateData[]): CStateResult => {
  const result: CStateResult = {
    c1: { name: 'c1', value: 0, data: [] },
    c2: { name: 'c2', value: 0, data: [] },
    c3: { name: 'c3', value: 0, data: [] }
  };

  data.forEach(item => {
    const { state } = item.metric;  // C 状态（c1, c2, c3）
    const timeSpentInState = parseFloat(item.value[1]);  // CPU 在该状态下消耗的时间（秒）
    const time = new Date(item.value[0] * 1000).toISOString();  // 时间戳格式化为 ISO 字符串

    // 累加每个状态的时间，并保存对应的时间数据
    if (state === 'c1') {
      result.c1.value += timeSpentInState;
      result.c1.data.push({ time, value: timeSpentInState });
    } else if (state === 'c2') {
      result.c2.value += timeSpentInState;
      result.c2.data.push({ time, value: timeSpentInState });
    } else if (state === 'c3') {
      result.c3.value += timeSpentInState;
      result.c3.data.push({ time, value: timeSpentInState });
    }
  });

  return result;
};


export const getCurrentCpuState = (cStateData: CStateResult): string => {
  // 比较各个状态的 value，获取最大值
  const maxStateValue = Math.max(cStateData.c1.value, cStateData.c2.value, cStateData.c3.value);

  // 返回最大值对应的状态名称
  if (maxStateValue === cStateData.c1.value) {
    return 'c1';
  } else if (maxStateValue === cStateData.c2.value) {
    return 'c2';
  } else {
    return 'c3';
  }
};