// axiosService.ts - 核心服务类
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios'
import { AxiosCanceler } from './axiosCancle'
import { AxiosRetry, RetryConfig } from './axiosRetry'
import { AxiosTransform } from './axiosTransform'

export interface RequestOptions {
  retry?: RetryConfig
  transform?: AxiosTransform
  withCancel?: boolean
  maxConcurrent?: number // 最大并发数
}

export class AxiosService {
  private instance: AxiosInstance
  private canceler: AxiosCanceler
  private retry: AxiosRetry
  private options: RequestOptions
  private queue: Set<string> = new Set() // 请求队列
  private maxConcurrent: number // 最大并发数

  constructor(axiosConfig: AxiosRequestConfig, options: RequestOptions = {}) {
    this.instance = axios.create(axiosConfig) // 使用传入的 axios 配置
    this.options = options
    this.canceler = new AxiosCanceler()
    this.retry = new AxiosRetry(this.instance, options.retry)
    this.maxConcurrent = options.maxConcurrent || 10
    this.setupInterceptors()
  }

  private setupInterceptors() {
    // 请求拦截
    this.instance.interceptors.request.use(
      async config => {
        // 并发控制
        while (this.queue.size >= this.maxConcurrent) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        
        const requestId = this.canceler.generateKey(config)
        this.queue.add(requestId)

        // 处理重复请求
        if (this.options.withCancel) {
          this.canceler.addPending(config)
        }
        
        return this.options.transform?.beforeRequest?.(config) || config
      },
      error => {
        return Promise.reject(error)
      }
    )

    // 响应拦截
    this.instance.interceptors.response.use(
      response => {
        // console.log('response', response)
        const requestId = this.canceler.generateKey(response.config)
        this.queue.delete(requestId)
        
        if (this.options.withCancel) {
          this.canceler.removePending(response.config)
        }
        
        return this.options.transform?.transformResponse
          ? this.options.transform.transformResponse(response)
          : response
      },
      error => {
        const requestId = this.canceler.generateKey(error.config)
        this.queue.delete(requestId)
        
        if (this.options.withCancel) {
          this.canceler.removePending(error.config)
        }
        return this.handleError(error)
      }
    )
  }

  private async handleError(error: AxiosError) {
    if (this.options.transform?.requestCatch) {
      return this.options.transform.requestCatch(error)
    }

    if (axios.isCancel(error)) {
      return Promise.reject(new Error('请求已取消'))
    }

    // 处理网络错误
    if (!error.response) {
      return Promise.reject(new Error('网络连接失败'))
    }

    // 处理重试
    if (this.options.retry) {
      return this.retry.retry(error)
    }

    return Promise.reject(error)
  }

  public setMaxConcurrent(max: number) {
    this.maxConcurrent = max
  }

  public request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
    return this.instance.request<T>(config)
  }

  public get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'GET', url })
  }

  public post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'POST', url, data })
  }

  public put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'PUT', url, data })
  }

  public delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'DELETE', url })
  }

  public cancelAll() {
    this.canceler.clearPending()
  }
}
