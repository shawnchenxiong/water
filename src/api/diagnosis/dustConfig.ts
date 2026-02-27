import request from '@/utils/request'
import type { 
  GetConfigResponse, 
  UpdateConfigRequest,
  UpdateConfigResponse,
  ResetConfigRequest,
  ResetConfigResponse,
  GetConfigHistoryParams,
  GetConfigHistoryResponse 
} from '@/api/types/diagnosis/dustConfig'

// Mock数据导入（开发环境使用）
import {
  getMockConfigsResponse,
  updateMockConfigsResponse,
  resetMockConfigsResponse,
  getMockConfigHistoryResponse,
} from '@/api/mock/dustConfig'

/**
 * 积尘诊断配置API
 */

/**
 * 获取积尘诊断配置
 */
export const getDustDiagnosisConfigs = async (): Promise<GetConfigResponse> => {
  // 默认使用Mock数据，除非明确设置MOCK=false
  if (import.meta.env.MOCK !== 'false') {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getMockConfigsResponse())
      }, 300)
    })
  }

  // 生产环境API调用
  const response = await request.get('/api/intelligent-diagnosis/dust-diagnosis/config')
  return response.data as GetConfigResponse
}

/**
 * 更新积尘诊断配置
 */
export const updateDustDiagnosisConfigs = async (data: UpdateConfigRequest): Promise<UpdateConfigResponse> => {
  // 默认使用Mock数据，除非明确设置MOCK=false
  if (import.meta.env.MOCK !== 'false') {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(updateMockConfigsResponse(data.configs))
      }, 500)
    })
  }

  // 生产环境API调用
  const response = await request.put('/api/intelligent-diagnosis/dust-diagnosis/config', data)
  return response.data as UpdateConfigResponse
}

/**
 * 重置配置为默认值
 */
export const resetDustDiagnosisConfigs = async (data: ResetConfigRequest): Promise<ResetConfigResponse> => {
  // 默认使用Mock数据，除非明确设置MOCK=false
  if (import.meta.env.MOCK !== 'false') {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(resetMockConfigsResponse(data.configIds))
      }, 400)
    })
  }

  // 生产环境API调用
  const response = await request.post('/api/intelligent-diagnosis/dust-diagnosis/config/reset', data)
  return response.data as ResetConfigResponse
}

/**
 * 获取配置修改历史
 */
export const getDustDiagnosisConfigHistory = async (params: GetConfigHistoryParams): Promise<GetConfigHistoryResponse> => {
  // 默认使用Mock数据，除非明确设置MOCK=false
  if (import.meta.env.MOCK !== 'false') {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getMockConfigHistoryResponse(params))
      }, 300)
    })
  }

  // 生产环境API调用
  const response = await request.get('/api/intelligent-diagnosis/dust-diagnosis/config/history', { params })
  return response.data as GetConfigHistoryResponse
}

/**
 * 验证配置参数值
 */
export const validateConfigValue = (
  value: number | string, 
  valueType: 'number' | 'string' | 'boolean',
  minValue?: number, 
  maxValue?: number
): { valid: boolean; message?: string } => {
  if (valueType === 'number') {
    const numValue = Number(value)
    
    if (isNaN(numValue)) {
      return { valid: false, message: '请输入有效的数字' }
    }
    
    if (minValue !== undefined && numValue < minValue) {
      return { valid: false, message: `值不能小于 ${minValue}` }
    }
    
    if (maxValue !== undefined && numValue > maxValue) {
      return { valid: false, message: `值不能大于 ${maxValue}` }
    }
  }
  
  if (valueType === 'string' && (!value || value.toString().trim() === '')) {
    return { valid: false, message: '请输入有效的值' }
  }
  
  return { valid: true }
}
