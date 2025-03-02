// customTransform.ts - 自定义转换实现
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import { AxiosTransform } from './axiosTransform'

export class CustomTransform extends AxiosTransform {
  private token: string = ''
  
  setToken(token: string) {
    this.token = token
  }

  beforeRequest(config: AxiosRequestConfig) {
    // 统一添加token和请求头
    config.headers = {
      ...config.headers,
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
      'Authorization': this.token ? `Bearer ${this.token}` : ''
    }
    
    // 处理GET请求缓存
    if (config.method?.toUpperCase() === 'GET') {
      config.params = {
        ...config.params,
        _t: Date.now() // 防止缓存
      }
    }
    
    return config
  }

  transformResponse<T = unknown>(response: AxiosResponse<T>) {
    const { data, status } = response
    // 这里假设后端返回格式为 { code, data, message }
    const result = data as any

    if (status === 200) {
      if (result.code === 0 || result.code === 200) {
        return result.data
      }
      throw new Error(result.message || '请求失败')
    }
    throw new Error('网络请求错误')
  }

  requestCatch(error: Error): Promise<Error> {
    // 统一错误处理
    console.error('请求发生错误:', error)
    return Promise.reject(error)
  }
}