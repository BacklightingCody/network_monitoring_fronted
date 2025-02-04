// axiosTransform.ts - 数据转换基类
import type { AxiosRequestConfig, AxiosResponse } from 'axios'

export abstract class AxiosTransform {
  beforeRequest?(config: AxiosRequestConfig): AxiosRequestConfig

  transformResponse?<T = unknown>(response: AxiosResponse<T>): AxiosResponse<T>

  requestCatch?(error: Error): Promise<Error>
}