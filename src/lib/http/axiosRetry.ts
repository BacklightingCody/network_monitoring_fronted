// axiosRetry.ts - 请求重试模块
import type { AxiosInstance, AxiosError,InternalAxiosRequestConfig } from 'axios'

export interface RetryConfig {
  retries?: number
  retryDelay?: number
  retryCondition?: (error: AxiosError) => boolean
}

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  __retryCount?: number
}

export class AxiosRetry {
  private instance: AxiosInstance
  private config: Required<RetryConfig>

  constructor(
    instance: AxiosInstance,
    config: RetryConfig = {
      retries: 3,
      retryDelay: 1000,
      retryCondition: (error) =>
        !error.response || (error.response.status >= 500 && error.response.status < 600)
    }
  ) {
    this.instance = instance
    this.config = {
      retries: config.retries ?? 3,
      retryDelay: config.retryDelay ?? 1000,
      retryCondition: config.retryCondition ?? (() => true)
    }
  }

  async retry(error: AxiosError) {
    const config = error.config as CustomAxiosRequestConfig
    if (!config || !this.config.retries) return Promise.reject(error)

    config.__retryCount = config.__retryCount || 0

    if (config.__retryCount >= this.config.retries) {
      return Promise.reject(error)
    }

    if (!this.config.retryCondition(error)) {
      return Promise.reject(error)
    }

    config.__retryCount += 1

    await new Promise(resolve =>
      setTimeout(resolve, this.config.retryDelay)
    )

    return this.instance(config)
  }
}