/**
 * 移动巡检统计管理 API 接口
 */

import type {
  InspectionStatisticsQueryParams,
  InspectionStatisticsResponse,
  StationTreeResponse,
  StatisticsBasicDataResponse,
  PersonnelDetailsQueryParams,
  PersonnelDetailsResponse,
  StationRankingDetailsQueryParams,
  StationRankingDetailsResponse,
  ExportStatisticsParams,
  ApiResponse,
  TimeDimension
} from '@/api/types/mobile-inspection-statistics'

import {
  mockStationTree,
  mockStatisticsBasicData,
  getStatisticsByStationId,
  getStatisticsByTimeDimension,
  searchStationsByKeyword,
  getPersonnelDetailsByUserId,
  getStationRankingDetailsByStationId,
  generateTimeRangeOptions
} from '@/api/mock/mobileInspectionStatisticsMock'

/**
 * 获取电站树结构
 */
export const getStationTree = async (): Promise<StationTreeResponse> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 300))
  
  return {
    code: 200,
    message: 'success',
    data: {
      stationTree: mockStationTree
    }
  }
}

/**
 * 获取巡检统计数据
 */
export const getInspectionStatistics = async (
  params: InspectionStatisticsQueryParams
): Promise<InspectionStatisticsResponse> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 800))
  
  const { stationId, timeDimension } = params
  const statisticsData = stationId 
    ? getStatisticsByStationId(stationId, timeDimension)
    : getStatisticsByTimeDimension(timeDimension)
  
  return {
    code: 200,
    message: 'success',
    data: statisticsData
  }
}

/**
 * 获取基础数据
 */
export const getStatisticsBasicData = async (): Promise<StatisticsBasicDataResponse> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 200))
  
  return {
    code: 200,
    message: 'success',
    data: mockStatisticsBasicData
  }
}

/**
 * 搜索电站
 */
export const searchStations = async (keyword: string): Promise<StationTreeResponse> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 200))
  
  const filteredStations = searchStationsByKeyword(keyword)
  
  return {
    code: 200,
    message: 'success',
    data: {
      stationTree: filteredStations
    }
  }
}

/**
 * 获取巡检人员详细记录
 */
export const getPersonnelDetails = async (
  params: PersonnelDetailsQueryParams
): Promise<PersonnelDetailsResponse> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const { userId, stationId, timeRange } = params
  const detailsData = getPersonnelDetailsByUserId(userId, stationId, timeRange)
  
  return {
    code: 200,
    message: 'success',
    data: detailsData
  }
}

/**
 * 获取电站排名详细数据
 */
export const getStationRankingDetails = async (
  params: StationRankingDetailsQueryParams
): Promise<StationRankingDetailsResponse> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const { stationId, timeRange } = params
  const rankingDetails = getStationRankingDetailsByStationId(stationId, timeRange)
  
  return {
    code: 200,
    message: 'success',
    data: rankingDetails
  }
}

/**
 * 导出统计数据
 */
export const exportStatistics = async (params: ExportStatisticsParams): Promise<Blob> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  const { stationId, timeDimension, timeRange, exportType } = params
  
  // 获取要导出的统计数据
  const statisticsData = stationId 
    ? getStatisticsByStationId(stationId, timeDimension)
    : getStatisticsByTimeDimension(timeDimension)
  
  if (exportType === 'excel') {
    // 模拟生成Excel文件
    const csvContent = [
      '时间范围,总巡检次数,正常次数,异常次数,未巡检次数',
      `${timeRange},${statisticsData.piechartData.total},${statisticsData.piechartData.normal},${statisticsData.piechartData.abnormal},${statisticsData.piechartData.notInspected}`,
      '',
      '电站排名,电站名称,评分',
      ...statisticsData.stationRanking.list.map(item => 
        `${item.rank},${item.stationName},${item.score}`
      ),
      '',
      '人员排名,人员姓名,评分',
      ...statisticsData.personnelRanking.list.map(item => 
        `${item.rank},${item.name},${item.score}`
      )
    ].join('\n')
    
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  } else {
    // 模拟生成PDF文件
    const pdfContent = `巡检统计报告\n时间范围: ${timeRange}\n总巡检次数: ${statisticsData.piechartData.total}`
    return new Blob([pdfContent], { type: 'application/pdf' })
  }
}

/**
 * 获取时间范围选项
 */
export const getTimeRangeOptions = async (
  dimension: TimeDimension
): Promise<ApiResponse<Array<{value: string, label: string}>>> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 100))
  
  const options = generateTimeRangeOptions(dimension)
  
  return {
    code: 200,
    message: 'success',
    data: options
  }
}

/**
 * 刷新统计数据
 */
export const refreshStatistics = async (
  params: InspectionStatisticsQueryParams
): Promise<InspectionStatisticsResponse> => {
  // 模拟刷新延迟
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 刷新时重新获取数据
  return getInspectionStatistics(params)
}

/**
 * 获取实时统计数据（WebSocket模拟）
 */
export const subscribeRealtimeStatistics = (
  params: InspectionStatisticsQueryParams,
  callback: (data: any) => void
): () => void => {
  // 模拟WebSocket连接
  const interval = setInterval(async () => {
    try {
      const response = await getInspectionStatistics(params)
      callback(response.data)
    } catch (error) {
      console.error('实时数据获取失败:', error)
    }
  }, 5 * 60 * 1000) // 每5分钟更新一次
  
  // 返回取消订阅函数
  return () => {
    clearInterval(interval)
  }
}

/**
 * 批量获取多个电站的统计数据
 */
export const getBatchStationStatistics = async (
  stationIds: string[],
  timeDimension: TimeDimension,
  timeRange: string
): Promise<ApiResponse<Record<string, any>>> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const batchData: Record<string, any> = {}
  
  for (const stationId of stationIds) {
    batchData[stationId] = getStatisticsByStationId(stationId, timeDimension)
  }
  
  return {
    code: 200,
    message: 'success',
    data: batchData
  }
}

/**
 * 获取统计数据趋势
 */
export const getStatisticsTrend = async (
  stationId: string,
  timeDimension: TimeDimension,
  days: number = 7
): Promise<ApiResponse<{
  dates: string[]
  totalInspections: number[]
  normalInspections: number[]
  abnormalInspections: number[]
}>> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 600))
  
  // 生成趋势数据
  const dates = []
  const totalInspections = []
  const normalInspections = []
  const abnormalInspections = []
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.push(date.toISOString().split('T')[0])
    
    // 模拟数据
    const total = Math.floor(Math.random() * 30) + 10
    const abnormal = Math.floor(Math.random() * 5)
    const normal = total - abnormal
    
    totalInspections.push(total)
    normalInspections.push(normal)
    abnormalInspections.push(abnormal)
  }
  
  return {
    code: 200,
    message: 'success',
    data: {
      dates,
      totalInspections,
      normalInspections,
      abnormalInspections
    }
  }
}

/**
 * 获取巡检效率统计
 */
export const getInspectionEfficiency = async (
  stationId?: string,
  timeRange?: string
): Promise<ApiResponse<{
  averageInspectionTime: number    // 平均巡检耗时（分钟）
  inspectionFrequency: number      // 巡检频率（次/天）
  issueDiscoveryRate: number       // 问题发现率（%）
  issueResolutionRate: number      // 问题解决率（%）
  personnelEfficiency: Array<{     // 人员效率
    userId: string
    name: string
    efficiency: number
    inspectionCount: number
  }>
}>> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return {
    code: 200,
    message: 'success',
    data: {
      averageInspectionTime: 45,
      inspectionFrequency: 2.3,
      issueDiscoveryRate: 15.2,
      issueResolutionRate: 87.5,
      personnelEfficiency: [
        {
          userId: 'user001',
          name: '张三',
          efficiency: 95.6,
          inspectionCount: 45
        },
        {
          userId: 'user002',
          name: '李四',
          efficiency: 92.3,
          inspectionCount: 38
        },
        {
          userId: 'user003',
          name: '王五',
          efficiency: 89.7,
          inspectionCount: 32
        }
      ]
    }
  }
}

/**
 * 获取巡检质量分析
 */
export const getInspectionQualityAnalysis = async (
  stationId?: string,
  timeRange?: string
): Promise<ApiResponse<{
  qualityScore: number             // 整体质量评分
  completenessRate: number         // 完整性评分
  accuracyRate: number             // 准确性评分
  timelinessRate: number           // 及时性评分
  qualityTrend: Array<{            // 质量趋势
    date: string
    score: number
  }>
  issueCategories: Array<{         // 问题分类统计
    category: string
    count: number
    percentage: number
  }>
}>> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 600))
  
  return {
    code: 200,
    message: 'success',
    data: {
      qualityScore: 92.5,
      completenessRate: 95.2,
      accuracyRate: 91.8,
      timelinessRate: 90.5,
      qualityTrend: [
        { date: '2025-10-15', score: 89.2 },
        { date: '2025-10-16', score: 91.5 },
        { date: '2025-10-17', score: 93.1 },
        { date: '2025-10-18', score: 90.8 },
        { date: '2025-10-19', score: 94.2 },
        { date: '2025-10-20', score: 92.7 },
        { date: '2025-10-21', score: 92.5 }
      ],
      issueCategories: [
        { category: '设备故障', count: 12, percentage: 52.2 },
        { category: '环境问题', count: 6, percentage: 26.1 },
        { category: '安全隐患', count: 3, percentage: 13.0 },
        { category: '其他问题', count: 2, percentage: 8.7 }
      ]
    }
  }
}
