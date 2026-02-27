import type {
  StatisticsReportQueryParams,
  StatisticsReportPageResponse,
  StatisticsReportBasicData,
  ApiResponse
} from '@/api/types/statistics-report'
import {
  mockESStationReports,
  mockStatisticsReportBasicData,
  filterStatisticsReports
} from '@/api/mock/statistics-report'
import { request } from '@/utils/request'

/**
 * 获取统计报表数据
 */
export async function getStatisticsReports(
  params: StatisticsReportQueryParams
): Promise<ApiResponse<StatisticsReportPageResponse>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    return getMockStatisticsReports(params)
  }
  
  // 生产环境调用真实API
  return request.get('/api/statistics/reports', { params })
}

/**
 * 获取统计报表基础数据
 */
export async function getStatisticsReportBasicData(): Promise<ApiResponse<StatisticsReportBasicData>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    return getMockStatisticsReportBasicData()
  }
  
  // 生产环境调用真实API
  return request.get('/api/statistics/basic-data')
}

/**
 * Mock数据处理 - 统计报表数据
 */
async function getMockStatisticsReports(
  params: StatisticsReportQueryParams
): Promise<ApiResponse<StatisticsReportPageResponse>> {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // 生成模拟数据
  const allData = mockESStationReports(params.reportType)
  
  // 应用筛选条件
  const filteredData = filterStatisticsReports(allData, {
    stationId: params.stationId,
    reportTime: params.reportTime
  })
  
  // 分页处理
  const current = params.current || 1
  const pageSize = params.pageSize || 10
  const total = filteredData.length
  const startIndex = (current - 1) * pageSize
  const endIndex = startIndex + pageSize
  const records = filteredData.slice(startIndex, endIndex)
  
  return {
    code: 200,
    message: 'success',
    data: {
      records,
      total,
      current,
      pageSize,
      pages: Math.ceil(total / pageSize)
    }
  }
}

/**
 * Mock数据处理 - 基础数据
 */
async function getMockStatisticsReportBasicData(): Promise<ApiResponse<StatisticsReportBasicData>> {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 200))
  
  return {
    code: 200,
    message: 'success',
    data: mockStatisticsReportBasicData()
  }
}
