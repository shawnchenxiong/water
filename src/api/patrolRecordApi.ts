import type {
  PatrolRecordQueryParams,
  PatrolRecordPageResponse,
  PatrolRecordBasicData,
  ApiResponse
} from '@/api/types/ai-patrol'
import {
  mockPatrolRecords,
  mockPatrolRecordBasicData,
  filterPatrolRecords
} from '@/api/mock/ai-patrol'

/**
 * 获取巡检记录列表
 */
export async function getPatrolRecords(
  params: PatrolRecordQueryParams
): Promise<ApiResponse<PatrolRecordPageResponse>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    return getMockPatrolRecords(params)
  }
  
  // 生产环境调用真实API
  // return request.get('/api/ai-patrol/records', { params })
  
  // 临时返回Mock数据（后端API未完成时）
  return getMockPatrolRecords(params)
}

/**
 * Mock巡检记录数据处理函数
 */
async function getMockPatrolRecords(
  params: PatrolRecordQueryParams
): Promise<ApiResponse<PatrolRecordPageResponse>> {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 600))
  
  const allData = mockPatrolRecords()
  
  // 筛选数据
  const filteredData = filterPatrolRecords(allData, {
    stationId: params.stationId,
    taskId: params.taskId,
    deviceType: params.deviceType,
    result: params.result,
    auditStatus: params.auditStatus,
    keyword: params.keyword
  })
  
  // 按时间范围过滤
  let timeFilteredData = filteredData
  if (params.inspectionTimeRange && params.inspectionTimeRange.length === 2) {
    const [startTime, endTime] = params.inspectionTimeRange
    timeFilteredData = filteredData.filter(item => {
      const inspectionTime = new Date(item.inspectionTime)
      return inspectionTime >= new Date(startTime) && inspectionTime <= new Date(endTime)
    })
  }
  
  // 分页
  const current = params.current || 1
  const pageSize = params.pageSize || 20
  const total = timeFilteredData.length
  const pages = Math.ceil(total / pageSize)
  const start = (current - 1) * pageSize
  const end = start + pageSize
  const records = timeFilteredData.slice(start, end)
  
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
 * 获取巡检记录基础数据
 */
export async function getPatrolRecordBasicData(): Promise<ApiResponse<PatrolRecordBasicData>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    return getMockPatrolRecordBasicData()
  }
  
  // 生产环境调用真实API
  // return request.get('/api/ai-patrol/records/basic-data')
  
  // 临时返回Mock数据（后端API未完成时）
  return getMockPatrolRecordBasicData()
}

/**
 * Mock巡检记录基础数据处理函数
 */
async function getMockPatrolRecordBasicData(): Promise<ApiResponse<PatrolRecordBasicData>> {
  await new Promise(resolve => setTimeout(resolve, 200))
  
  return {
    code: 200,
    message: 'success',
    data: mockPatrolRecordBasicData()
  }
}
