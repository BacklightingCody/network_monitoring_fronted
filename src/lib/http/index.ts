// index.ts - 整合导出
export * from './axiosCancle'
export * from './axiosRetry'
export * from './axiosTransform'
export * from './customTransform'
export * from './axiosService'
import { CustomTransform } from './customTransform'
import { AxiosService } from './axiosService'

// 创建默认 transform 实例
const transform = new CustomTransform()

// 创建默认 http 实例
const http = new AxiosService(
  {
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json'
    }
  },
  {
    retry: {
      retries: 3,
      retryDelay: 1000,
      retryCondition: (error) => {
        const { status } = error.response || {}
        return !status || status >= 500
      }
    },
    transform,
    withCancel: true,
    maxConcurrent: 10
  }
)

export default http
export {
  AxiosService,
  CustomTransform
}
