import { request } from '@/utils/request'
import type {
  StationOverviewStatistics,
  StationOverviewQueryParams,
  StationOverviewPageResponse,
  StationOverviewBasicData,
  ApiResponse
} from '@/api/types/station-overview'
import {
  mockStationOverviewStatistics,
  mockStationOverviewRecords,
  mockStationOverviewBasicData,
  filterStationOverviewRecords
} from '@/api/mock/station-overview'

/**
 * 获取电站概览统计数据
 * @returns 统计数据
 */
export async function getStationOverviewStatistics(): Promise<ApiResponse<StationOverviewStatistics>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    return getMockStatistics()
  }
  
  return request.get<ApiResponse<StationOverviewStatistics>>('/api/station/overview/statistics')
}

/**
 * 获取电站概览列表数据
 * @param params 查询参数
 * @returns 分页数据
 */
export async function getStationOverviewList(
  params: StationOverviewQueryParams
): Promise<ApiResponse<StationOverviewPageResponse>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    return getMockStationOverviewList(params)
  }
  
  return request.get<ApiResponse<StationOverviewPageResponse>>('/api/station/overview/list', { params })
}

/**
 * 获取电站概览基础数据（筛选选项）
 * @returns 基础数据
 */
export async function getStationOverviewBasicData(): Promise<ApiResponse<StationOverviewBasicData>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    return getMockBasicData()
  }
  
  return request.get<ApiResponse<StationOverviewBasicData>>('/api/station/overview/basic-data')
}

/**
 * Mock: 获取统计数据
 */
async function getMockStatistics(): Promise<ApiResponse<StationOverviewStatistics>> {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const statistics = mockStationOverviewStatistics()
  
  return {
    code: 200,
    message: 'success',
    data: statistics,
    timestamp: new Date().toISOString()
  }
}

/**
 * Mock: 获取电站概览列表数据
 */
async function getMockStationOverviewList(
  params: StationOverviewQueryParams
): Promise<ApiResponse<StationOverviewPageResponse>> {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const allRecords = mockStationOverviewRecords()
  
  // 应用筛选条件
  const filteredRecords = filterStationOverviewRecords(allRecords, params)
  
  // 分页处理
  const current = params.current || 1
  const pageSize = params.pageSize || 20
  const start = (current - 1) * pageSize
  const end = start + pageSize
  const records = filteredRecords.slice(start, end)
  
  // 计算统计数据（基于过滤后的数据）
  const total = filteredRecords.length
  const pages = Math.ceil(total / pageSize)
  
  return {
    code: 200,
    message: 'success',
    data: {
      records,
      total,
      current,
      pageSize,
      pages
    },
    timestamp: new Date().toISOString()
  }
}

/**
 * Mock: 获取基础数据
 */
async function getMockBasicData(): Promise<ApiResponse<StationOverviewBasicData>> {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 200))
  
  const basicData = mockStationOverviewBasicData()
  
  return {
    code: 200,
    message: 'success',
    data: basicData,
    timestamp: new Date().toISOString()
  }
}
