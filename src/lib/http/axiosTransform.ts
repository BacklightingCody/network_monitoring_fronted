// axiosTransform.ts - 数据转换基类
import type { AxiosRequestConfig, AxiosResponse } from 'axios'

export abstract class AxiosTransform {
  // 请求之前的拦截器
  beforeRequest?(config: AxiosRequestConfig): AxiosRequestConfig
  
  // 请求成功后的拦截器
  transformResponse?<T = unknown>(response: AxiosResponse<T>): AxiosResponse<T> | T
  
  // 请求失败的拦截器
  requestCatch?(error: Error): Promise<Error>
  
  // 请求完成的拦截器(无论成功失败)
  requestFinally?(): void
  
  // 请求并发控制
  setMaxConcurrent?(max: number): void
}