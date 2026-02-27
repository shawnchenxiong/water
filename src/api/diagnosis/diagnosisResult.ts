import request from '@/utils/request'
import type { 
  GetDiagnosisResultsParams,
  GetDiagnosisResultsResponse,
  GetDeviceTrendParams,
  GetDeviceTrendResponse
} from '@/api/types/diagnosis/diagnosisResult'

// Mock数据导入（开发环境使用）
import {
  getMockDiagnosisResultsResponse,
  getMockDeviceTrendResponse,
  getMockEmptyDiagnosisResultsResponse
} from '@/api/mock/diagnosisResult'

/**
 * 积尘诊断结果API
 */

/**
 * 获取积尘诊断结果
 */
export const getDiagnosisResults = async (params: GetDiagnosisResultsParams): Promise<GetDiagnosisResultsResponse> => {
  // 默认使用Mock数据，除非明确设置MOCK=false
  if (import.meta.env.MOCK !== 'false') {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟无数据情况（5%概率）
        if (Math.random() < 0.05) {
          resolve(getMockEmptyDiagnosisResultsResponse())
        } else {
          resolve(getMockDiagnosisResultsResponse(params.stationId, params.date))
        }
      }, 600) // 模拟网络延迟
    })
  }

  // 生产环境API调用
  const response = await request.get('/api/intelligent-diagnosis/dust-diagnosis/results', { params })
  return response.data as GetDiagnosisResultsResponse
}

/**
 * 获取设备历史趋势
 */
export const getDeviceTrend = async (params: GetDeviceTrendParams): Promise<GetDeviceTrendResponse> => {
  // 默认使用Mock数据，除非明确设置MOCK=false
  if (import.meta.env.MOCK !== 'false') {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getMockDeviceTrendResponse(params.deviceId, params.startDate, params.endDate))
      }, 800) // 模拟网络延迟
    })
  }

  // 生产环境API调用
  const response = await request.get('/api/intelligent-diagnosis/dust-diagnosis/device-trend', { params })
  return response.data as GetDeviceTrendResponse
}

/**
 * 验证诊断结果查询参数
 */
export const validateDiagnosisParams = (params: GetDiagnosisResultsParams): { valid: boolean; message?: string } => {
  if (!params.stationId) {
    return { valid: false, message: '请选择电站' }
  }
  
  if (!params.date) {
    return { valid: false, message: '请选择诊断日期' }
  }
  
  // 验证日期格式
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(params.date)) {
    return { valid: false, message: '日期格式不正确' }
  }
  
  // 验证日期不能晚于当前日期
  const selectedDate = new Date(params.date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (selectedDate > today) {
    return { valid: false, message: '诊断日期不能晚于今天' }
  }
  
  return { valid: true }
}

/**
 * 验证历史趋势查询参数
 */
export const validateTrendParams = (params: GetDeviceTrendParams): { valid: boolean; message?: string } => {
  if (!params.deviceId) {
    return { valid: false, message: '设备ID不能为空' }
  }
  
  if (!params.startDate || !params.endDate) {
    return { valid: false, message: '请选择时间范围' }
  }
  
  // 验证日期格式
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(params.startDate) || !dateRegex.test(params.endDate)) {
    return { valid: false, message: '日期格式不正确' }
  }
  
  const startDate = new Date(params.startDate)
  const endDate = new Date(params.endDate)
  
  if (startDate >= endDate) {
    return { valid: false, message: '结束日期必须晚于开始日期' }
  }
  
  // 限制查询时间跨度为90天
  const maxDays = 90
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysDiff > maxDays) {
    return { valid: false, message: `查询时间跨度不能超过${maxDays}天` }
  }
  
  return { valid: true }
}

/**
 * 格式化积尘损失率显示
 */
export const formatDustLossRate = (rate: number | null): string => {
  if (rate === null) {
    return '-'
  }
  return `${rate}%`
}

/**
 * 格式化发电量显示
 */
export const formatGeneration = (value: number, unit: string = 'kWh'): string => {
  return `${value.toFixed(1)} ${unit}`
}

/**
 * 格式化等价小时数显示
 */
export const formatEquivalentHours = (value: number): string => {
  return `${value.toFixed(2)} h`
}

/**
 * 格式化装机容量显示
 */
export const formatCapacity = (value: number): string => {
  return `${value.toFixed(2)} kWp`
}
