// axiosService.ts - 核心服务类
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError ,AxiosResponse} from 'axios'
import { AxiosCanceler } from './axiosCancle'
import { AxiosRetry, RetryConfig } from './axiosRetry'
import { AxiosTransform } from './axiosTransform'

export interface RequestOptions {
  retry?: RetryConfig
  transform?: AxiosTransform
  withCancel?: boolean
}

export class AxiosService {
  private instance: AxiosInstance
  private canceler: AxiosCanceler
  private retry: AxiosRetry
  private options: RequestOptions

  constructor(options: RequestOptions = {}) {
    this.instance = axios.create()
    this.options = options
    this.canceler = new AxiosCanceler()
    this.retry = new AxiosRetry(this.instance, options.retry)
    this.setupInterceptors()
  }

  private setupInterceptors() {
    // 请求拦截
    this.instance.interceptors.request.use(config => {
      this.options.transform?.beforeRequest?.(config)
      if (this.options.withCancel) {
        this.canceler.addPending(config)
      }
      return config
    })

    // 响应拦截
    this.instance.interceptors.response.use(
      response => {
        if (this.options.withCancel) {
          this.canceler.removePending(response.config)
        }
        return this.options.transform?.transformResponse
          ? this.options.transform.transformResponse(response)
          : response
      },
      error => {
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
      return Promise.reject(new Error('重复请求已取消'))
    }

    if (this.options.retry) {
      return this.retry.retry(error)
    }

    return Promise.reject(error)
  }

  public request<T = unknown>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.request<T>(config)
  }

  public cancelAll() {
    this.canceler.clearPending()
  }
}
