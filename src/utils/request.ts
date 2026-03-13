/**
 * Axios 请求封装
 */
import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
  },
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 添加 Token（优先从 localStorage 获取）
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
      // jeecg-boot 可能还需要 X-Access-Token
      config.headers['X-Access-Token'] = token
    }

    // 添加租户ID（多租户支持）
    const tenantId = localStorage.getItem('tenant_id')
    if (tenantId && config.headers) {
      config.headers['tenant-id'] = tenantId
    }

    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response
    // 如果返回 code 为 200, 0 或者 success 为 true 视为成功
    if (data && (data.code === 200 || data.code === 0 || data.code === '200' || data.success)) {
      return data
    }
    // 拦截特定后端错误并抛出
    return Promise.reject(new Error(data.message || 'Error'))
  },
  (error) => {
    console.error('Response error:', error)
    return Promise.reject(error)
  }
)

// 导出请求方法
export const request = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return service.get(url, config)
  },

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.post(url, data, config)
  },

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.put(url, data, config)
  },

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return service.delete(url, config)
  },

  upload<T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    return service.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    })
  },
}

export default service

