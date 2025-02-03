export const exponentialBackoff = (retryCount: number) => {
  const baseDelay = 1000; // 初始延迟1秒
  const jitter = Math.random() * 500; // 随机抖动
  
  return new Promise(resolve => 
    setTimeout(resolve, baseDelay * 2 ** retryCount + jitter)
  );
};