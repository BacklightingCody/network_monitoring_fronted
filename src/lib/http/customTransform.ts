// customTransform.ts - 自定义转换实现
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import { AxiosTransform } from './axiosTransform'

export class CustomTransform extends AxiosTransform {
  beforeRequest(config: AxiosRequestConfig) {
    // 添加统一请求头
    config.headers = {
      ...config.headers,
      'X-Requested-With': 'XMLHttpRequest'
    }
    return config
  }

  transformResponse<T = unknown>(response: AxiosResponse<T>) {
    const data = response.data as { code?: number }
    if (data?.code === 200) {
      return response
    }
    throw new Error('Request failed')
  }
}