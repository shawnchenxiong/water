import request from '@/utils/request'
import type { 
  CleaningQueryParams,
  GetCleaningRecordsResponse,
  CreateCleaningRecordRequest,
  CreateCleaningRecordResponse,
  UpdateCleaningRecordRequest,
  UpdateCleaningRecordResponse,
  DeleteCleaningRecordResponse,
  GetStationsResponse
} from '@/api/types/diagnosis/cleaningQuery'

// Mock数据导入（开发环境使用）
import {
  getMockCleaningRecordsResponse,
  getMockStationsResponse,
  createMockCleaningRecordResponse,
  updateMockCleaningRecordResponse,
  deleteMockCleaningRecordResponse,
  getMockEmptyRecordsResponse
} from '@/api/mock/cleaningQuery'

/**
 * 积尘清洗查询API
 */

/**
 * 查询清洗记录
 */
export const getCleaningRecords = async (params: CleaningQueryParams): Promise<GetCleaningRecordsResponse> => {
  // 默认使用Mock数据，除非明确设置MOCK=false
  if (import.meta.env.MOCK !== 'false') {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟无数据情况（10%概率）
        if (Math.random() < 0.1) {
          resolve(getMockEmptyRecordsResponse())
        } else {
          resolve(getMockCleaningRecordsResponse(
            params.stationId,
            params.startTime,
            params.endTime,
            params.page,
            params.pageSize
          ))
        }
      }, 500) // 模拟网络延迟
    })
  }

  // 生产环境API调用
  const response = await request.get('/api/intelligent-diagnosis/dust-diagnosis/cleaning-records', { params })
  return response.data as GetCleaningRecordsResponse
}

/**
 * 获取电站列表
 */
export const getStations = async (): Promise<GetStationsResponse> => {
  // 默认使用Mock数据，除非明确设置MOCK=false
  if (import.meta.env.MOCK !== 'false') {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getMockStationsResponse())
      }, 200)
    })
  }

  // 生产环境API调用
  const response = await request.get('/api/intelligent-diagnosis/dust-diagnosis/stations')
  return response.data as GetStationsResponse
}

/**
 * 新增清洗记录
 */
export const createCleaningRecord = async (data: CreateCleaningRecordRequest): Promise<CreateCleaningRecordResponse> => {
  // 默认使用Mock数据，除非明确设置MOCK=false
  if (import.meta.env.MOCK !== 'false') {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(createMockCleaningRecordResponse(data))
      }, 800) // 模拟保存时间
    })
  }

  // 生产环境API调用
  const response = await request.post('/api/intelligent-diagnosis/dust-diagnosis/cleaning-records', data)
  return response.data as CreateCleaningRecordResponse
}

/**
 * 编辑清洗记录
 */
export const updateCleaningRecord = async (
  recordId: string, 
  data: UpdateCleaningRecordRequest
): Promise<UpdateCleaningRecordResponse> => {
  // 默认使用Mock数据，除非明确设置MOCK=false
  if (import.meta.env.MOCK !== 'false') {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(updateMockCleaningRecordResponse(recordId, data))
      }, 600)
    })
  }

  // 生产环境API调用
  const response = await request.put(`/api/intelligent-diagnosis/dust-diagnosis/cleaning-records/${recordId}`, data)
  return response.data as UpdateCleaningRecordResponse
}

/**
 * 删除清洗记录
 */
export const deleteCleaningRecord = async (recordId: string): Promise<DeleteCleaningRecordResponse> => {
  // 默认使用Mock数据，除非明确设置MOCK=false
  if (import.meta.env.MOCK !== 'false') {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(deleteMockCleaningRecordResponse(recordId))
      }, 400)
    })
  }

  // 生产环境API调用
  const response = await request.delete(`/api/intelligent-diagnosis/dust-diagnosis/cleaning-records/${recordId}`)
  return response.data as DeleteCleaningRecordResponse
}

/**
 * 验证查询参数
 */
export const validateQueryParams = (params: CleaningQueryParams): { valid: boolean; message?: string } => {
  if (!params.stationId) {
    return { valid: false, message: '请选择电站' }
  }
  
  if (!params.startTime) {
    return { valid: false, message: '请选择开始时间' }
  }
  
  if (!params.endTime) {
    return { valid: false, message: '请选择结束时间' }
  }
  
  const startTime = new Date(params.startTime)
  const endTime = new Date(params.endTime)
  
  if (startTime >= endTime) {
    return { valid: false, message: '结束时间必须大于开始时间' }
  }
  
  // 限制查询时间跨度为1年
  const maxDays = 365
  const daysDiff = Math.ceil((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysDiff > maxDays) {
    return { valid: false, message: `查询时间跨度不能超过${maxDays}天` }
  }
  
  return { valid: true }
}

/**
 * 验证清洗记录表单
 */
export const validateCleaningRecordForm = (formData: any): { valid: boolean; message?: string } => {
  if (!formData.stationId) {
    return { valid: false, message: '请选择所属电站' }
  }
  
  if (!formData.cleaningTime) {
    return { valid: false, message: '请选择清洗时间' }
  }
  
  if (!formData.cleaningMethod) {
    return { valid: false, message: '请选择清洗方式' }
  }
  
  if (!formData.cleaningArea || formData.cleaningArea <= 0) {
    return { valid: false, message: '请输入有效的清洗面积' }
  }
  
  if (!formData.cleaningPersonnel || formData.cleaningPersonnel.trim() === '') {
    return { valid: false, message: '请输入清洗人员' }
  }
  
  // 验证清洗时间不能晚于当前时间
  const cleaningTime = new Date(formData.cleaningTime)
  const now = new Date()
  
  if (cleaningTime > now) {
    return { valid: false, message: '清洗时间不能晚于当前时间' }
  }
  
  // 验证清洗成本（如果填写）
  if (formData.cleaningCost !== undefined && formData.cleaningCost !== null && formData.cleaningCost < 0) {
    return { valid: false, message: '清洗成本不能为负数' }
  }
  
  return { valid: true }
}
