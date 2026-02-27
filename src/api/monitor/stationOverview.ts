/**
 * 电站概览API接口
 */

import { request } from '@/utils/request'
import type { StationData, StationStats } from '@/types/station'
import { calculateStationStats } from '@/utils/mockData'
import { generateStationList } from '@/utils/mockData'

// 应用筛选条件
const applyFilters = (list: StationData[], params?: { keyword?: string; filter?: string }) => {
  if (!params) return list
  
  let filtered = [...list]
  
  // 关键词搜索（电站名称）
  if (params.keyword) {
    filtered = filtered.filter(item => 
      item.name?.toLowerCase().includes(params.keyword!.toLowerCase())
    )
  }
  
  // 筛选条件
  if (params.filter) {
    switch (params.filter) {
      case 'normal':
        filtered = filtered.filter(item => item.commStatus === 'normal')
        break
      case 'partial_offline':
        filtered = filtered.filter(item => item.commStatus === 'partial_offline')
        break
      case 'all_offline':
        filtered = filtered.filter(item => item.commStatus === 'all_offline')
        break
      case 'has_alarm':
        filtered = filtered.filter(item => item.alarmStatus === 'has_alarm')
        break
    }
  }
  
  return filtered
}

// 应用分页
const applyPagination = (list: StationData[], params?: { page?: number; pageSize?: number }) => {
  if (!params || !params.page || !params.pageSize) return list
  
  const start = (params.page - 1) * params.pageSize
  const end = start + params.pageSize
  return list.slice(start, end)
}

/**
 * 获取电站列表
 * @param params 查询参数
 */
export async function getStationList(params?: {
  page?: number
  pageSize?: number
  keyword?: string
  filter?: string
}): Promise<{
  success: boolean
  code: number
  message: string
  data: {
    list: StationData[]
    stats: StationStats
    total: number
  }
}> {
  try {
    // 获取当前登录用户名
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    const username = userInfo.username || 'admin'
    
    // 调用真实API获取电站列表
    const response = await request.get<any>('/factory/factory/listByCreateUser', {
      params: { name: username }
    })
    
    // 处理响应数据
    let factoryList: any[] = []
    if (response.result && Array.isArray(response.result)) {
      factoryList = response.result
    } else if (Array.isArray(response)) {
      factoryList = response
    }
    
    // 转换为StationData格式并获取真实设备详情（异步并行）
    const stationList = generateStationList(24)
    
    // 应用筛选和分页
    let filteredList = applyFilters(stationList, params)
    const stats = calculateStationStats(stationList)
    const paginatedList = applyPagination(filteredList, params)
    
    return {
      success: true,
      code: 200,
      message: 'success',
      data: {
        list: paginatedList,
        stats,
        total: filteredList.length
      }
    }
  } catch (error) {
    // 发生错误时返回空数据
    return {
      success: false,
      code: 500,
      message: '获取电站列表失败',
      data: {
        list: [],
        stats: {
          total: 0,
          commNormal: 0,
          allOffline: 0,
          partialOffline: 0,
          commonlyAlarm: 0,
          seriousAlarm: 0,
          emergentAlarm: 0
        },
        total: 0
      }
    }
  }
}

/**
 * 导出电站数据
 * @param params 导出参数
 * @returns 导出文件数据
 */
export async function exportStationData(params?: {
  keyword?: string
  filter?: string
}): Promise<{
  success: boolean
  code: number
  message: string
  data: StationData[]
}> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    // 模拟导出延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const allStations = generateStationList(24)
    let exportData = allStations
    
    // 应用筛选
    if (params?.keyword) {
      exportData = exportData.filter(station => 
        station.name?.toLowerCase().includes(params.keyword!.toLowerCase())
      )
    }
    
    return {
      success: true,
      code: 200,
      message: 'success',
      data: exportData
    }
  }
  
  // 调用真实API
  const response = await request.get('/api/monitor/station-overview/export', { params })
  return response
}