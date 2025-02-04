// axiosCancel.ts - 重复请求取消模块
import type { AxiosRequestConfig } from 'axios'

export class AxiosCanceler {
  private pendingMap = new Map<string, AbortController>()
  
  generateKey(config: AxiosRequestConfig): string {
    return [
      config.method,
      config.url,
      JSON.stringify(config.params),
      JSON.stringify(config.data)
    ].join('&')
  }

  addPending(config: AxiosRequestConfig) {
    this.removePending(config)
    const key = this.generateKey(config)
    const controller = new AbortController()
    config.signal = controller.signal
    this.pendingMap.set(key, controller)
  }

  removePending(config: AxiosRequestConfig) {
    const key = this.generateKey(config)
    if (this.pendingMap.has(key)) {
      this.pendingMap.get(key)?.abort()
      this.pendingMap.delete(key)
    }
  }

  clearPending() {
    this.pendingMap.forEach(controller => controller.abort())
    this.pendingMap.clear()
  }
}