// index.ts - 整合导出
export * from './axiosCancle'
export * from './axiosRetry'
export * from './axiosTransform'
export * from './customTransform'
export * from './axiosService'
import { CustomTransform } from './customTransform'
import { AxiosService } from './axiosService'
// 默认实例
const transform = new CustomTransform()
const service = new AxiosService({
  retry: { retries: 3 },
  transform,
  withCancel: true
})

export default service