import http from '@/lib/http';


// // 定义所有内存相关指标的接口
// interface MemoryMetrics {
//   availableMemory: MemoryMetric[]; // 可用内存
//   cacheMemory: MemoryMetric[]; // 缓存内存
//   cachePeakMemory: MemoryMetric[]; // 缓存内存峰值
//   cacheFaults: MemoryMetric[]; // 缓存缺页
//   commitLimit: MemoryMetric[]; // 提交限制
//   committedMemory: MemoryMetric[]; // 已提交内存
//   demandZeroFaults: MemoryMetric[]; // 零页缺页
//   freeZeroPageList: MemoryMetric[]; // 空闲零页列表
//   freePageTableEntries: MemoryMetric[]; // 空闲页面表条目
//   modifiedPageList: MemoryMetric[]; // 修改过的页面列表
//   pageFaults: MemoryMetric[]; // 页面缺页
//   physicalFreeMemory: MemoryMetric[]; // 物理空闲内存
//   physicalTotalMemory: MemoryMetric[]; // 物理总内存
//   poolNonpagedMemory: MemoryMetric[]; // 非分页池内存
//   poolPagedMemory: MemoryMetric[]; // 分页池内存
//   swapPageOperations: MemoryMetric[]; // 交换页面操作
//   swapPageReads: MemoryMetric[]; // 交换页面读取
//   swapPageWrites: MemoryMetric[]; // 交换页面写入
//   systemCacheResidentMemory: MemoryMetric[]; // 系统缓存驻留内存
//   systemDriverResidentMemory: MemoryMetric[]; // 系统驱动驻留内存
// }

// 获取可用内存 (Available Memory)
// 返回当前可用的内存量，适用于展示当前系统剩余可用内存。
export async function getAvailableMemory() {
  return await getMemoryUsage('/metrics/memory/available-bytes');
}

// 获取缓存内存 (Cache Memory)
// 返回当前系统缓存内存的大小，适用于展示缓存内存的使用情况。
export async function getCacheMemory() {
  return await getMemoryUsage('/metrics/memory/cache-bytes');
}

// 获取缓存峰值内存 (Cache Peak Memory)
// 返回缓存内存的历史峰值数据，适用于展示缓存内存的最高使用值。
export async function getCachePeakMemory() {
  return await getMemoryUsage('/metrics/memory/cache-peak-bytes');
}

// 获取缓存缺页次数 (Cache Faults)
// 返回缓存缺页的总次数，适用于展示系统缓存访问失败的次数。
export async function getCacheFaults() {
  return await getMemoryUsage('/metrics/memory/cache-faults-total');
}

// 获取提交限制内存 (Commit Limit)
// 返回当前系统的提交限制内存，适用于展示系统内存分配的最大限制。
export async function getCommitLimit() {
  return await getMemoryUsage('/metrics/memory/commit-limit');
}

// 获取已提交内存 (Committed Memory)
// 返回当前已提交的内存量，适用于展示系统已提交使用的内存。
export async function getCommittedMemory() {
  return await getMemoryUsage('/metrics/memory/committed-bytes');
}

// 获取零需求缺页次数 (Demand Zero Faults)
// 返回零需求缺页的总次数，适用于展示由于内存需求为零而发生的缺页。
export async function getDemandZeroFaults() {
  return await getMemoryUsage('/metrics/memory/demand-zero-faults-total');
}

// 获取空闲内存和零页列表内存 (Free and Zero Page List)
// 返回系统空闲内存和零页列表内存的总量，适用于展示未使用的内存区域。
export async function getFreeZeroPageList() {
  return await getMemoryUsage('/metrics/memory/free-zero-page-list-bytes');
}

// 获取空闲系统页表项 (Free System Page Table Entries)
// 返回当前系统中空闲的页表项数量，适用于展示系统页表的利用率。
export async function getFreePageTableEntries() {
  return await getMemoryUsage('/metrics/memory/free-system-page-table-entries');
}

// 获取修改页列表内存 (Modified Page List)
// 返回系统中修改过的页面列表所占内存量，适用于展示内存中被修改过的页面。
export async function getModifiedPageList() {
  return await getMemoryUsage('/metrics/memory/modified-page-list-bytes');
}

// 获取页面缺页次数 (Page Faults)
// 返回系统的页面缺页总次数，适用于展示内存页缺失的次数。
export async function getPageFaults() {
  return await getMemoryUsage('/metrics/memory/page-faults-total');
}

// 获取物理空闲内存 (Physical Free Memory)
// 返回当前系统中的物理内存空闲量，适用于展示物理内存中未被使用的部分。
export async function getPhysicalFreeMemory() {
  return await getMemoryUsage('/metrics/memory/physical-free-bytes');
}

// 获取物理总内存 (Physical Total Memory)
// 返回系统的物理内存总量，适用于展示系统的总内存容量。
export async function getPhysicalTotalMemory() {
  return await getMemoryUsage('/metrics/memory/physical-total-bytes');
}

// 获取池非分页内存 (Pool Nonpaged Memory)
// 返回系统中非分页池使用的内存量，适用于展示物理内存池的使用情况。
export async function getPoolNonpagedMemory() {
  return await getMemoryUsage('/metrics/memory/pool-nonpaged-bytes');
}

// 获取池分页内存 (Pool Paged Memory)
// 返回系统中分页池使用的内存量，适用于展示分页内存池的使用情况。
export async function getPoolPagedMemory() {
  return await getMemoryUsage('/metrics/memory/pool-paged-bytes');
}

// 获取交换页面操作总次数 (Swap Page Operations)
// 返回系统的交换页面操作总次数，适用于展示系统的内存交换情况。
export async function getSwapPageOperations() {
  return await getMemoryUsage('/metrics/memory/swap-page-operations-total');
}

// 获取交换页面读取总次数 (Swap Page Reads)
// 返回系统进行的交换页面读取操作的总次数，适用于展示系统从交换区读取内存的情况。
export async function getSwapPageReads() {
  return await getMemoryUsage('/metrics/memory/swap-page-reads-total');
}

// 获取交换页面写入总次数 (Swap Page Writes)
// 返回系统进行的交换页面写入操作的总次数，适用于展示系统向交换区写入内存的情况。
export async function getSwapPageWrites() {
  return await getMemoryUsage('/metrics/memory/swap-page-writes-total');
}

// 获取系统缓存驻留内存 (System Cache Resident Memory)
// 返回系统缓存驻留内存的大小，适用于展示系统内存中用于缓存的数据大小。
export async function getSystemCacheResidentMemory() {
  return await getMemoryUsage('/metrics/memory/system-cache-resident-bytes');
}

// 获取系统驱动驻留内存 (System Driver Resident Memory)
// 返回系统驱动驻留内存的大小，适用于展示驱动程序所占用的内存大小。
export async function getSystemDriverResidentMemory() {
  return await getMemoryUsage('/metrics/memory/system-driver-resident-bytes');
}


// 获取所有磁盘指标
export async function getMemoryAllMetrics() {
  try {
    const response = await http.get('/metrics/memory/all');
    return response;
  } catch (error) {
    console.error('Failed to fetch all disk metrics:', error);
    throw error;
  }
}

// 通用的内存使用数据请求方法
async function getMemoryUsage(endpoint: string) {
  try {
    const response = await http.get(endpoint);
    return response;
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    throw error;
  }
}

