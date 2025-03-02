import http from '@/lib/http';

// 获取 CPU 逻辑核心数
export async function getLogicalProcessorCount() {
  return await getCpuUsage('/metrics/cpu/logical-processor');
}

// 获取 CPU 时钟中断
export async function getClockInterrupts() {
  return await getCpuUsage('/metrics/cpu/clock-interrupts');
}

// 获取核心频率
export async function getCoreFrequency() {
  return await getCpuUsage('/metrics/cpu/core-frequency');
}

// 获取 CPU 空闲/等待状态（C 状态）
export async function getCpuCState() {
  return await getCpuUsage('/metrics/cpu/cstate');
}

// 获取 CPU 执行时间
export async function getCpuTime() {
  return await getCpuUsage('/metrics/cpu/cpu-time');
}

// 获取 CPU 性能
export async function getProcessorPerformance() {
  return await getCpuUsage('/metrics/cpu/processor-performance');
}

// 获取 CPU 中断和 DPC
export async function getDpcs() {
  return await getCpuUsage('/metrics/cpu/dpcs');
}

export async function getInterrupts() {
  return await getCpuUsage('/metrics/cpu/interrupts');
}

// 通用的 CPU 使用数据请求方法
async function getCpuUsage(endpoint:string) {
  try {
    const response = await http.get(endpoint);
    return response;
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    throw error;
  }
}


// getCpuUsage('/metrics/cpu/processor-utility'),
// getCpuUsage('/metrics/cpu/core-frequency'),
// getCpuUsage('/metrics/cpu/cpu-time'), // CPU在不同运行模式下消耗的总时间