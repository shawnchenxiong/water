import request from '@/utils/request'
import type {
  GetStringDiagnosisListParams,
  GetStringDiagnosisListResponse,
  BatchOperationRequest,
  BatchOperationResponse,
  ExecuteDiagnosisRequest,
  ExecuteDiagnosisResponse,
  DiagnosisProgressResponse,
  DataCompareRequest,
  DataCompareResponse,
  CompareParamsResponse,
  CapacityConfigRequest,
  CapacityConfigResponse
} from '@/api/types/diagnosis/stringDiagnosis'

// Mock数据导入（开发环境使用）
import {
  getMockStringDiagnosisListResponse,
  getMockBatchOperationResponse,
  getMockExecuteDiagnosisResponse,
  getMockDiagnosisProgressResponse,
  getMockDataCompareResponse,
  getMockCompareParamsResponse,
  getMockCapacityConfigResponse
} from '@/api/mock/stringDiagnosis'

/**
 * 组串诊断API
 */

/**
 * 获取组串诊断列表
 */
export const getStringDiagnosisList = async (params: GetStringDiagnosisListParams): Promise<GetStringDiagnosisListResponse> => {
  // 默认使用Mock数据，除非明确设置MOCK=false
  if (import.meta.env.MOCK !== 'false') {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getMockStringDiagnosisListResponse(params))
      }, 800) // 模拟网络延迟
    })
  }

  // 生产环境API调用
  const response = await request.get('/api/intelligent-diagnosis/string-diagnosis', { params })
  return response.data as GetStringDiagnosisListResponse
}

/**
 * 执行组串诊断
 */
export const executeStringDiagnosis = async (data: ExecuteDiagnosisRequest): Promise<ExecuteDiagnosisResponse> => {
  // 默认使用Mock数据，除非明确设置MOCK=false
  if (import.meta.env.MOCK !== 'false') {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getMockExecuteDiagnosisResponse(data))
      }, 500) // 模拟网络延迟
    })
  }

  // 生产环境API调用
  const response = await request.post('/api/intelligent-diagnosis/string-diagnosis/execute', data)
  return response.data as ExecuteDiagnosisResponse
}

/**
 * 获取诊断进度
 */
export const getDiagnosisProgress = async (taskId: string): Promise<DiagnosisProgressResponse> => {
  // 默认使用Mock数据，除非明确设置MOCK=false
  if (import.meta.env.MOCK !== 'false') {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getMockDiagnosisProgressResponse(taskId))
      }, 300) // 模拟网络延迟
    })
  }

  // 生产环境API调用
  const response = await request.get('/api/intelligent-diagnosis/string-diagnosis/progress', {
    params: { taskId }
  })
  return response.data as DiagnosisProgressResponse
}

/**
 * 批量启用/禁用组串
 */
export const batchOperateStrings = async (data: BatchOperationRequest): Promise<BatchOperationResponse> => {
  // 默认使用Mock数据，除非明确设置MOCK=false
  if (import.meta.env.MOCK !== 'false') {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getMockBatchOperationResponse(data))
      }, 1000) // 模拟网络延迟
    })
  }

  // 生产环境API调用
  const response = await request.post('/api/intelligent-diagnosis/string-diagnosis/batch-enable', data)
  return response.data as BatchOperationResponse
}

/**
 * 组串数据对比
 */
export const compareStringData = async (data: DataCompareRequest): Promise<DataCompareResponse> => {
  // 默认使用Mock数据，除非明确设置MOCK=false
  if (import.meta.env.MOCK !== 'false') {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getMockDataCompareResponse(data))
      }, 1200) // 模拟网络延迟
    })
  }

  // 生产环境API调用
  const response = await request.post('/api/intelligent-diagnosis/string-diagnosis/data-compare', data)
  return response.data as DataCompareResponse
}

/**
 * 获取数据对比参数列表
 */
export const getCompareParams = async (deviceId: string): Promise<CompareParamsResponse> => {
  // 默认使用Mock数据，除非明确设置MOCK=false
  if (import.meta.env.MOCK !== 'false') {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getMockCompareParamsResponse(deviceId))
      }, 400) // 模拟网络延迟
    })
  }

  // 生产环境API调用
  const response = await request.get('/api/intelligent-diagnosis/string-diagnosis/compare-params', {
    params: { deviceId }
  })
  return response.data as CompareParamsResponse
}

/**
 * 容量配置管理
 */
export const updateCapacityConfig = async (deviceId: string, data: CapacityConfigRequest): Promise<CapacityConfigResponse> => {
  // 默认使用Mock数据，除非明确设置MOCK=false
  if (import.meta.env.MOCK !== 'false') {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getMockCapacityConfigResponse(deviceId, data))
      }, 800) // 模拟网络延迟
    })
  }

  // 生产环境API调用
  const response = await request.post(`/api/intelligent-diagnosis/string-diagnosis/device/${deviceId}/capacity-config`, data)
  return response.data as CapacityConfigResponse
}
