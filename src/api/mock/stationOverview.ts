/**
 * 电站概览Mock数据
 */

import type { StationData, StationStats } from '@/types/station'

/**
 * 电站名称配置
 */
export const mockStationNames = ['城南污水厂', '城北污水厂', '经开区污水厂', '高新区污水厂', '工业园区污水厂', '开发区污水厂']

/**
 * 连接状态配置
 */
export const mockConnectStatuses = ['通讯正常', '部分离线', '全部离线', '接入中']

/**
 * 位置配置
 */
export const mockLocations = ['安徽省芜湖市', '安徽省合肥市', '江苏省南京市', '浙江省杭州市']

/**
 * 引用 mockData.ts 中的原始数据生成逻辑
 * 确保数据一致性（5分钟间隔数据）
 */
import { generateStationData, generateStationList } from '@/utils/mockData'

export function generateMockStationList(count: number): StationData[] {
  // 使用 mockData.ts 中的原始函数
  const stations = generateStationList(count)
  
  // 确保每个电站数据包含 StationCard 需要的所有字段
  return stations.map((station, index) => {
    // 如果原始数据缺少某些字段，添加它们
    const enhanced = {
      ...station,
      // 确保必需字段存在
      regionId: station.id || `station_${index}`,
      regionName: station.name || `电站${index + 1}`,
      regionCode: `ST${String(index + 1).padStart(3, '0')}`,
      connectStatus: station.commStatus === 'normal' ? '通讯正常' :
                    station.commStatus === 'all_offline' ? '全部离线' :
                    station.commStatus === 'partial_offline' ? '部分离线' : '接入中',
      powerSource: station.powerSource || '逆变器',
      // 确保 powerTrend 格式正确，包含两条线的数据
      powerTrend: {
        time: station.powerTrend?.time || Array.from({ length: 24 }, (_, h) => `${h}:00`),
        power: station.powerTrend?.power || Array.from({ length: 24 }, () => Math.random() * 100),
        radiation: station.powerTrend?.radiation || Array.from({ length: 24 }, () => Math.random() * 300)
      }
    } as StationData
    
    return enhanced
  })
}

/**
 * 计算电站统计数据
 */
export function calculateMockStationStats(stations: StationData[]): StationStats {
  const stats = {
    total: stations.length,
    commNormal: 0,
    allOffline: 0,
    partialOffline: 0,
    connecting: 0,
    noAlarm: 0,
    hasAlarm: 0,
    commonlyAlarm: 0, // 普通告警
    seriousAlarm: 0,  // 重要告警
    emergentAlarm: 0  // 紧急告警
  }
  
  stations.forEach(station => {
    // 通讯状态统计
    switch (station.commStatus) {
      case 'normal':
        stats.commNormal++
        break
      case 'all_offline':
        stats.allOffline++
        break
      case 'partial_offline':
        stats.partialOffline++
        break
      case 'connecting':
        stats.connecting++
        break
    }
    
    // 告警状态统计
    if (station.alarmStatus === 'none') {
      stats.noAlarm++
    } else {
      stats.hasAlarm++
    }
  })
  
  return stats
}

/**
 * 获取Mock电站列表响应
 */
export async function getMockStationList(params: {
  page: number
  pageSize: number
  keyword?: string
  filter?: string
}): Promise<{
  code: number
  message: string
  data: {
    list: StationData[]
    total: number
    stats: StationStats
  }
}> {
  await new Promise(resolve => setTimeout(resolve, 300))
  
  // 生成更多数据用于分页
  const allStations = generateMockStationList(24)
  
  // 关键词过滤
  let filteredStations = allStations
  if (params.keyword) {
    filteredStations = allStations.filter(station => 
      station.regionName.includes(params.keyword!) || 
      station.id?.includes(params.keyword!)
    )
  }
  
  // 状态过滤
  if (params.filter && params.filter !== 'total') {
    filteredStations = filteredStations.filter(station => {
      switch (params.filter) {
        case 'commNormal':
          return station.commStatus === 'normal'
        case 'allOffline':
          return station.commStatus === 'all_offline'
        case 'partialOffline':
          return station.commStatus === 'partial_offline'
        case 'connecting':
          return station.commStatus === 'connecting'
        case 'noAlarm':
          return station.alarmStatus === 'none'
        case 'hasAlarm':
          return station.alarmStatus === 'has_alarm'
        default:
          return true
      }
    })
  }
  
  // 分页
  const startIndex = (params.page - 1) * params.pageSize
  const endIndex = startIndex + params.pageSize
  const paginatedStations = filteredStations.slice(startIndex, endIndex)
  
  // 统计数据
  const stats = calculateMockStationStats(allStations)
  
  return {
    code: 200,
    message: 'success',
    data: {
      list: paginatedStations,
      total: filteredStations.length,
      stats
    }
  }
}

/**
 * 获取Mock导出数据
 */
export async function getMockExportData(params: {
  keyword?: string
  filter?: string
}): Promise<{
  code: number
  message: string
  data: {
    filename: string
    data: any[]
  }
}> {
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const allStations = generateMockStationList(24)
  
  // 应用过滤条件
  let filteredStations = allStations
  if (params.keyword) {
    filteredStations = allStations.filter(station => 
      station.regionName.includes(params.keyword!) || 
      station.id?.includes(params.keyword!)
    )
  }
  
  if (params.filter && params.filter !== 'total') {
    filteredStations = filteredStations.filter(station => {
      switch (params.filter) {
        case 'commNormal':
          return station.commStatus === 'normal'
        case 'allOffline':
          return station.commStatus === 'all_offline'
        case 'partialOffline':
          return station.commStatus === 'partial_offline'
        case 'connecting':
          return station.commStatus === 'connecting'
        case 'noAlarm':
          return station.alarmStatus === 'none'
        case 'hasAlarm':
          return station.alarmStatus === 'has_alarm'
        default:
          return true
      }
    })
  }
  
  // 转换为导出格式
  const exportData = filteredStations.map(station => ({
    '电站名称': station.regionName,
    '电站编码': station.id || '',
    '连接状态': station.commStatus || '',
    '告警状态': station.alarmStatus === 'none' ? '无告警' : '有告警',
    '日发电量(kWh)': station.dailyEnergy,
    '日等效时(h)': station.dailyHours?.toFixed(2),
    '实时功率(kW)': station.realPower?.toFixed(2),
    '创建时间': station.createdate
  }))
  
  const filename = `电站数据_${new Date().toISOString().slice(0, 10)}.xlsx`
  
  return {
    code: 200,
    message: 'success',
    data: {
      filename,
      data: exportData
    }
  }
}