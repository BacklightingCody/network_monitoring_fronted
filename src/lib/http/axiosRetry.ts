// axiosRetry.ts - 请求重试模块
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { exponentialBackoff } from './exponentialBackoff'

export interface RetryConfig {
  retries?: number // 最大重试次数
  retryDelay?: number // 重试延迟时间(ms)
  retryCondition?: (error: AxiosError) => boolean // 重试条件
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
    
    // 如果没有配置或已达到最大重试次数,直接返回错误
    if (!config || !this.config.retries) {
      return Promise.reject(error)
    }

    config.__retryCount = config.__retryCount || 0

    // 如果已经重试3次了,就不再重试
    if (config.__retryCount >= this.config.retries) {
      return Promise.reject(new Error(`请求失败,已重试${this.config.retries}次`))
    }

    // 检查是否满足重试条件
    if (!this.config.retryCondition(error)) {
      return Promise.reject(error)
    }

    config.__retryCount += 1

    // 使用指数退避算法计算延迟时间
    const delay = exponentialBackoff(config.__retryCount)
    
    console.log(`请求失败,第${config.__retryCount}次重试,延迟${delay}ms`)
    
    await new Promise(resolve => setTimeout(resolve, delay))

    return this.instance(config)
  }
}