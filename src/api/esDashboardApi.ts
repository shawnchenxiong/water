/**
 * 光伏综合信息页面 API
 */

import { request } from '@/utils/request'
import type {
  ApiResponse,
  PowerGenerationStats,
  PowerTrendDataPoint,
  FullHourData,
  MapRegionData,
  StationConstructionStats,
  PowerGenerationTop20,
  PowerCurveDataPoint,
  AlarmData,
  TimeRange,
  CityStationData,
  DistrictStationData
} from '@/api/types/es-dashboard'
import {
  mockPowerGenerationStats,
  mockPowerTrend,
  mockFullHourTop20,
  mockMapRegions,
  mockConstructionStats,
  mockGenerationTop20,
  mockPowerCurve,
  mockAlarmList,
  mockCityStationsData,
  mockDistrictStationsData
} from '@/api/mock/es-dashboard'

/**
 * 获取发电量统计数据
 */
export async function getPowerGenerationStats(): Promise<ApiResponse<PowerGenerationStats>> {
  if (import.meta.env.MOCK !== 'false') {
    await new Promise(resolve => setTimeout(resolve, 300))
    return {
      code: 200,
      message: 'success',
      data: mockPowerGenerationStats()
    }
  }
  
  return request.get('/api/pv/dashboard/power-stats')
}

/**
 * 获取发电量趋势数据
 * @param timeRange 时间范围
 */
export async function getPowerTrend(timeRange: TimeRange = 'month'): Promise<ApiResponse<PowerTrendDataPoint[]>> {
  if (import.meta.env.MOCK !== 'false') {
    await new Promise(resolve => setTimeout(resolve, 300))
    return {
      code: 200,
      message: 'success',
      data: mockPowerTrend(timeRange)
    }
  }
  
  return request.get('/api/pv/dashboard/power-trend', { params: { timeRange } })
}

/**
 * 获取满发小时TOP20数据
 * @param timeRange 时间范围
 */
export async function getFullHourTop20(timeRange: TimeRange = 'month'): Promise<ApiResponse<FullHourData[]>> {
  if (import.meta.env.MOCK !== 'false') {
    await new Promise(resolve => setTimeout(resolve, 300))
    return {
      code: 200,
      message: 'success',
      data: mockFullHourTop20(timeRange)
    }
  }
  
  return request.get('/api/pv/dashboard/full-hour-top20', { params: { timeRange } })
}

/**
 * 获取地图区域数据
 */
export async function getMapRegions(): Promise<ApiResponse<MapRegionData[]>> {
  if (import.meta.env.MOCK !== 'false') {
    await new Promise(resolve => setTimeout(resolve, 300))
    return {
      code: 200,
      message: 'success',
      data: mockMapRegions()
    }
  }
  
  return request.get('/api/pv/dashboard/map-regions')
}

/**
 * 获取电站建设统计数据
 */
export async function getConstructionStats(): Promise<ApiResponse<StationConstructionStats>> {
  if (import.meta.env.MOCK !== 'false') {
    await new Promise(resolve => setTimeout(resolve, 300))
    return {
      code: 200,
      message: 'success',
      data: mockConstructionStats()
    }
  }
  
  return request.get('/api/pv/dashboard/construction-stats')
}

/**
 * 获取发电量TOP20数据
 * @param timeRange 时间范围
 */
export async function getGenerationTop20(timeRange: TimeRange = 'month'): Promise<ApiResponse<PowerGenerationTop20[]>> {
  if (import.meta.env.MOCK !== 'false') {
    await new Promise(resolve => setTimeout(resolve, 300))
    return {
      code: 200,
      message: 'success',
      data: mockGenerationTop20(timeRange)
    }
  }
  
  return request.get('/api/pv/dashboard/generation-top20', { params: { timeRange } })
}

/**
 * 获取功率曲线数据
 * @param date 日期（YYYY-MM-DD）
 */
export async function getPowerCurve(date?: string): Promise<ApiResponse<PowerCurveDataPoint[]>> {
  if (import.meta.env.MOCK !== 'false') {
    await new Promise(resolve => setTimeout(resolve, 300))
    return {
      code: 200,
      message: 'success',
      data: mockPowerCurve(date || new Date().toISOString().split('T')[0])
    }
  }
  
  return request.get('/api/pv/dashboard/power-curve', { params: { date } })
}

/**
 * 获取告警列表数据
 */
export async function getAlarmList(): Promise<ApiResponse<AlarmData[]>> {
  if (import.meta.env.MOCK !== 'false') {
    await new Promise(resolve => setTimeout(resolve, 300))
    return {
      code: 200,
      message: 'success',
      data: mockAlarmList()
    }
  }
  
  return request.get('/api/pv/dashboard/alarms')
}

/**
 * 获取城市电站数据
 */
export async function getCityStations(): Promise<ApiResponse<CityStationData[]>> {
  if (import.meta.env.MOCK !== 'false') {
    await new Promise(resolve => setTimeout(resolve, 100))
    return {
      code: 200,
      message: 'success',
      data: mockCityStationsData()
    }
  }
  
  return request.get('/api/pv/dashboard/city-stations')
}

/**
 * 获取指定省份的城市电站数据
 * @param provinceName 省份名称
 */
export async function getProvinceCityStations(provinceName: string): Promise<ApiResponse<CityStationData[]>> {
  if (import.meta.env.MOCK !== 'false') {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200))
    
    // 从mock数据中筛选指定省份的城市
    const allCities = mockCityStationsData()
    const provinceCities = allCities.filter(city => 
      city.provinceName === provinceName || city.provinceName === provinceName.replace('省', '') + '省'
    )
    
    return {
      code: 200,
      message: 'success',
      data: provinceCities
    }
  }
  
  return request.get(`/api/pv/dashboard/province/${encodeURIComponent(provinceName)}/city-stations`)
}

/**
 * 获取所有区/县电站数据
 */
export async function getDistrictStations(): Promise<ApiResponse<DistrictStationData[]>> {
  if (import.meta.env.MOCK !== 'false') {
    await new Promise(resolve => setTimeout(resolve, 100))
    return {
      code: 200,
      message: 'success',
      data: mockDistrictStationsData()
    }
  }
  
  return request.get('/api/pv/dashboard/district-stations')
}

/**
 * 获取指定城市的区/县电站数据
 * @param cityAdcode 城市行政编码
 */
export async function getCityDistrictStations(cityAdcode: number): Promise<ApiResponse<DistrictStationData[]>> {
  if (import.meta.env.MOCK !== 'false') {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500))
    
    // 从mock数据中筛选指定城市的区
    const allDistricts = mockDistrictStationsData()
    const cityDistricts = allDistricts.filter(district => district.cityAdcode === cityAdcode)
    
    return {
      code: 200,
      message: 'success',
      data: cityDistricts
    }
  }
  
  return request.get('/api/pv/dashboard/city-districts', {
    params: { cityAdcode }
  })
}
