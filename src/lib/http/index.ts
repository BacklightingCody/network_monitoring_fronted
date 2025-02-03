import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  AxiosHeaders,
  InternalAxiosRequestConfig,
} from 'axios';

// 定义响应数据格式
interface ResponseData<T = unknown> {
  code: number;
  data: T;
  message: string;
}

// 扩展 Axios 请求配置类型
interface CustomRequestConfig extends AxiosRequestConfig {
  /** 是否显示 loading (需自行实现) */
  showLoading?: boolean;
  /** 是否重试 */
  retry?: boolean;
  /** 重试次数 */
  retryCount?: number;
  /** 重试间隔(ms) */
  retryDelay?: number;
  /** 重试计数 */
  __retryCount?: number; // 增加这个属性
}

// 定义业务错误类型
export class BusinessError extends Error {
  code: number;
  data?: unknown; // 使用 unknown 替代 any

  constructor(code: number, message: string, data?: unknown) {
    super(message);
    this.code = code;
    this.data = data;
  }
}

export default class Http {
  private instance: AxiosInstance;
  private retryCount: number; // 默认重试次数
  private retryDelay: number; // 默认重试间隔

  constructor(config?: CustomRequestConfig) {
    this.retryCount = config?.retryCount || 0; // 默认值 3
    this.retryDelay = config?.retryDelay || 1000; // 默认值 1000ms

    this.instance = axios.create({
      timeout: 10000,
      baseURL: import.meta.env.VITE_API_BASE_URL,
      ...config,
    });

    this.initInterceptors();
  }

  // 初始化拦截器
  private initInterceptors() {
    // 请求拦截
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => this.handleRequest(config),
      (error: AxiosError) => Promise.reject(error)
    );

    // 响应拦截
    this.instance.interceptors.response.use(
      <T>(response: AxiosResponse<ResponseData<T>>) => this.handleResponse(response) as AxiosResponse<T>,
      (error: AxiosError) => this.handleError(error)
    );
  }

  // 请求处理
  private handleRequest(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    const token = localStorage.getItem('access_token');
    if (token) {
      // 确保 headers 不为 undefined
      if (!config.headers) {
        config.headers = new AxiosHeaders();
      }
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    // 处理特殊 Content-Type
    if (config.data instanceof FormData) {
      config.headers.set('Content-Type', 'multipart/form-data');
    }

    return config;
  }

  // 响应处理
  private handleResponse(response: AxiosResponse<ResponseData>) {
    const res = response.data;

    // 根据业务状态码处理
    if (res.code !== 200) {
      return Promise.reject(new BusinessError(res.code, res.message, res.data));
    }

    return res.data;
  }

  // 错误处理
  private async handleError(error: AxiosError): Promise<never> {
    const config = error.config as CustomRequestConfig;

    // 请求取消的情况
    if (axios.isCancel(error)) {
      throw error; // 显式抛出错误
    }

    // HTTP 状态码处理
    if (error.response) {
      const response = error.response as AxiosResponse;
      switch (response.status) {
        case 401:
          await this.handleUnauthorized();
          break;
        case 403:
          console.error('Forbidden:', response.data);
          break;
        case 500:
          console.error('Server Error:', response.data);
          break;
        default:
          console.error(`Unexpected status code: ${response.status}`, response.data);
      }
    }

    // 重试逻辑
    if (config?.retry && (config.retryCount || this.retryCount)) {
      const retryCount = config.retryCount ?? this.retryCount;
      const retryDelay = config.retryDelay ?? this.retryDelay;

      // 重试计数
      if ((config.__retryCount ?? 0) < retryCount) {
        config.__retryCount = (config.__retryCount || 0) + 1;

        await new Promise<void>((resolve) => {
          setTimeout(resolve, retryDelay);
        });

        return this.instance.request(config); // 直接返回重试请求的结果
      }
    }

    // 如果没有重试或重试次数用尽，则抛出错误
    throw error;
  }

  // 401 处理
  private async handleUnauthorized() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        const { data } = await axios.post<{ access_token: string }>('/auth/refresh', { refreshToken });
        localStorage.setItem('access_token', data.access_token);
        return;
      } catch (e) {
        console.error('Refresh token failed:', e);
      }
    }

    // 跳转登录
    window.location.href = '/login';
  }

  // 通用请求方法
  public request<T = unknown>(config: CustomRequestConfig): Promise<T> {
    return this.instance.request(config);
  }

  public get<T = unknown>(
    url: string,
    params?: Record<string, unknown>,
    config?: CustomRequestConfig
  ): Promise<T> {
    return this.instance.get(url, { ...config, params });
  }

  public post<T = unknown>(
    url: string,
    data?: Record<string, unknown>,
    config?: CustomRequestConfig
  ): Promise<T> {
    return this.instance.post(url, data, config);
  }

  public put<T = unknown>(
    url: string,
    data?: Record<string, unknown>,
    config?: CustomRequestConfig
  ): Promise<T> {
    return this.instance.put(url, data, config);
  }

  public delete<T = unknown>(
    url: string,
    params?: Record<string, unknown>,
    config?: CustomRequestConfig
  ): Promise<T> {
    return this.instance.delete(url, { ...config, params });
  }

  // 文件上传
  public upload<T = unknown>(
    url: string,
    file: File,
    fieldName = 'file'
  ): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);

    return this.instance.post<T>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(response => response.data);
  }
}

// 导出默认实例
export const http = new Http();

// 按需创建新实例
export const createHttp = (config?: CustomRequestConfig) => new Http(config);