/**
 * 发电趋势分析 - API接口
 * 基于真实API: http://znvne.com/gw/auxsysCensus/powerTrend/selectPowerTrend
 */

import request from '@/utils/request'
import type {
  TreeNode,
  GetTrendDataParams,
  GetTrendDataResponse
} from '@/api/types/analysis/powerTrend'
import { mockTreeData, getMockTrendData } from '@/api/mock/powerTrend'


/**
 * 获取电站树
 */
export async function getStationTree(): Promise<TreeNode[]> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return Promise.resolve(mockTreeData)
  }

  const response = await request.get('/auxsysAlarm/alarm/getRegionDevice', {
    params: {
      deviceType: '',
      filterModelId: 103
    }
  })
  return response.data
}

/**
 * 获取发电趋势数据
 * 真实API地址: /auxsysCensus/powerTrend/selectPowerTrend
 */
export async function getTrendData(
  params: GetTrendDataParams
): Promise<GetTrendDataResponse> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return Promise.resolve(
      getMockTrendData({
        timeType: params.timeType,
        chartType: params.chartType
      })
    )
  }

  // 时间类型映射
  const dateTypeMap: Record<string, number> = {
    day: 0,
    month: 1,
    year: 2,
    total: 3
  }

  // 图表类型映射
  const typeMap: Record<string, number> = {
    curve: 1,
    power: 2
  }

  const response = await request.get('/auxsysCensus/powerTrend/selectPowerTrend', {
    params: {
      regionId: params.stationIds[0], // 真实API只支持单个电站
      dateType: dateTypeMap[params.timeType],
      dateTime: params.date,
      type: typeMap[params.chartType]
    }
  })

  return response.data
}

/**
 * 导出发电趋势数据
 */
export async function exportTrendData(
  params: GetTrendDataParams
): Promise<Blob> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    // 生成模拟Excel数据
    const csvContent = `电站名称,日期,发电量(kWh),功率(kW)\n示例电站,${params.date},1234.56,789.12`
    const BOM = '\uFEFF'
    return new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' })
  }

  const dateTypeMap: Record<string, number> = {
    day: 0,
    month: 1,
    year: 2,
    total: 3
  }

  const typeMap: Record<string, number> = {
    curve: 1,
    power: 2
  }

  const response = await request.get(
    '/auxsysCensus/powerTrend/exportTrendData',
    {
      params: {
        regionId: params.stationIds[0],
        dateType: dateTypeMap[params.timeType],
        dateTime: params.date,
        type: typeMap[params.chartType]
      },
      responseType: 'blob'
    }
  )

  return response.data
}

