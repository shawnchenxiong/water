import request from '@/utils/request'
import type { 
  GetCleaningAdviceParams,
  GetCleaningAdviceResponse,
  GetWeatherForecastParams,
  GetWeatherForecastResponse,
  GetDeviceHistoryTrendParams,
  GetDeviceHistoryTrendResponse
} from '@/api/types/diagnosis/cleaningAdvice'

// Mock数据导入（开发环境使用）
import {
  getMockCleaningAdviceResponse,
  getMockWeatherForecastResponse,
  getMockDeviceHistoryTrendResponse
} from '@/api/mock/cleaningAdvice'

/**
 * 积尘清洗建议API
 */

/**
 * 获取清洗建议
 */
export const getCleaningAdvice = async (params: GetCleaningAdviceParams): Promise<GetCleaningAdviceResponse> => {
  // 默认使用Mock数据，除非明确设置MOCK=false
  if (import.meta.env.MOCK !== 'false') {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getMockCleaningAdviceResponse(params.stationId, params.date))
      }, 800) // 模拟网络延迟
    })
  }

  // 生产环境API调用
  const response = await request.get('/api/intelligent-diagnosis/dust-diagnosis/cleaning-advice', { params })
  return response.data as GetCleaningAdviceResponse
}

/**
 * 获取天气预报
 */
export const getWeatherForecast = async (params: GetWeatherForecastParams): Promise<GetWeatherForecastResponse> => {
  // 默认使用Mock数据，除非明确设置MOCK=false
  if (import.meta.env.MOCK !== 'false') {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getMockWeatherForecastResponse(params.stationId, params.days))
      }, 300) // 模拟网络延迟
    })
  }

  // 生产环境API调用
  const response = await request.get('/api/intelligent-diagnosis/dust-diagnosis/weather-forecast', { params })
  return response.data as GetWeatherForecastResponse
}

/**
 * 获取设备历史趋势
 */
export const getDeviceHistoryTrend = async (params: GetDeviceHistoryTrendParams): Promise<GetDeviceHistoryTrendResponse> => {
  // 默认使用Mock数据，除非明确设置MOCK=false
  if (import.meta.env.MOCK !== 'false') {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getMockDeviceHistoryTrendResponse(params))
      }, 600) // 模拟网络延迟
    })
  }

  // 生产环境API调用
  const response = await request.get('/api/intelligent-diagnosis/dust-diagnosis/device-trend', { params })
  return response.data as GetDeviceHistoryTrendResponse
}
