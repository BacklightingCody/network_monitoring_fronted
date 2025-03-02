export const exponentialBackoff = (retryCount: number) => {
  const baseDelay = 1000 // 基础延迟1秒
  const maxDelay = 5000 // 最大延迟5秒
  const jitter = Math.random() * 100 // 随机抖动,避免多个请求同时重试
  
  // 使用指数退避算法计算延迟时间
  const delay = Math.min(
    baseDelay * Math.pow(2, retryCount - 1) + jitter,
    maxDelay
  )
  
  return delay
}