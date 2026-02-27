import type {
  FaultLibraryQueryParams,
  FaultLibraryPageResponse,
  FaultLibraryBasicData,
  FaultLibraryFormData,
  ApiResponse
} from '@/api/types/fault-library'
import {
  mockFaultLibraryRecords,
  mockFaultLibraryBasicData,
  filterFaultLibraryRecords
} from '@/api/mock/fault-library'

/**
 * 获取故障库列表
 */
export async function getFaultLibraryRecords(
  params: FaultLibraryQueryParams
): Promise<ApiResponse<FaultLibraryPageResponse>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    return getMockFaultLibraryRecords(params)
  }
  
  // 生产环境调用真实API
  // return request.get('/api/fault-library/records', { params })
  
  // 临时返回Mock数据（后端API未完成时）
  return getMockFaultLibraryRecords(params)
}

/**
 * Mock故障库数据处理函数
 */
async function getMockFaultLibraryRecords(
  params: FaultLibraryQueryParams
): Promise<ApiResponse<FaultLibraryPageResponse>> {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const allData = mockFaultLibraryRecords()
  
  // 筛选数据
  const filteredData = filterFaultLibraryRecords(allData, {
    deviceType: params.deviceType,
    faultDescription: params.faultDescription
  })
  
  // 分页
  const current = params.current || 1
  const pageSize = params.pageSize || 20
  const total = filteredData.length
  const pages = Math.ceil(total / pageSize)
  const start = (current - 1) * pageSize
  const end = start + pageSize
  const records = filteredData.slice(start, end)
  
  return {
    code: 200,
    message: 'success',
    data: {
      records,
      total,
      current,
      pageSize,
      pages
    }
  }
}

/**
 * 获取故障库基础数据
 */
export async function getFaultLibraryBasicData(): Promise<ApiResponse<FaultLibraryBasicData>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    return getMockFaultLibraryBasicData()
  }
  
  // 生产环境调用真实API
  // return request.get('/api/fault-library/basic-data')
  
  // 临时返回Mock数据（后端API未完成时）
  return getMockFaultLibraryBasicData()
}

/**
 * Mock故障库基础数据处理函数
 */
async function getMockFaultLibraryBasicData(): Promise<ApiResponse<FaultLibraryBasicData>> {
  await new Promise(resolve => setTimeout(resolve, 200))
  
  return {
    code: 200,
    message: 'success',
    data: mockFaultLibraryBasicData()
  }
}

/**
 * 创建故障库记录
 */
export async function createFaultLibraryRecord(
  data: FaultLibraryFormData
): Promise<ApiResponse<null>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    await new Promise(resolve => setTimeout(resolve, 800))
    return {
      code: 200,
      message: 'Create successfully',
      data: null
    }
  }
  
  // 生产环境调用真实API
  // return request.post('/api/fault-library/records', data)
  
  // 临时返回Mock响应
  await new Promise(resolve => setTimeout(resolve, 800))
  return {
    code: 200,
    message: 'Create successfully',
    data: null
  }
}

/**
 * 更新故障库记录
 */
export async function updateFaultLibraryRecord(
  id: string,
  data: FaultLibraryFormData
): Promise<ApiResponse<null>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    await new Promise(resolve => setTimeout(resolve, 600))
    return {
      code: 200,
      message: 'Update successfully',
      data: null
    }
  }
  
  // 生产环境调用真实API
  // return request.put(`/api/fault-library/records/${id}`, data)
  
  // 临时返回Mock响应
  await new Promise(resolve => setTimeout(resolve, 600))
  return {
    code: 200,
    message: 'Update successfully',
    data: null
  }
}

/**
 * 删除故障库记录
 */
export async function deleteFaultLibraryRecord(id: string): Promise<ApiResponse<null>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    await new Promise(resolve => setTimeout(resolve, 400))
    return {
      code: 200,
      message: 'Delete successfully',
      data: null
    }
  }
  
  // 生产环境调用真实API
  // return request.delete(`/api/fault-library/records/${id}`)
  
  // 临时返回Mock响应
  await new Promise(resolve => setTimeout(resolve, 400))
  return {
    code: 200,
    message: 'Delete successfully',
    data: null
  }
}

/**
 * 批量删除故障库记录
 */
export async function batchDeleteFaultLibraryRecords(ids: string[]): Promise<ApiResponse<null>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    await new Promise(resolve => setTimeout(resolve, 600))
    return {
      code: 200,
      message: 'Batch delete successfully',
      data: null
    }
  }
  
  // 生产环境调用真实API
  // return request.post('/api/fault-library/records/batch-delete', { ids })
  
  // 临时返回Mock响应
  await new Promise(resolve => setTimeout(resolve, 600))
  return {
    code: 200,
    message: 'Batch delete successfully',
    data: null
  }
}
