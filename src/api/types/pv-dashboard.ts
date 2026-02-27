/**
 * 光伏综合信息页面API类型定义
 */

/**
 * 发电量统计数据
 */
export interface PowerGenerationStats {
  /** 实时功率(MW) */
  realtimePower: number
  /** 今日发电量(kWh) */
  todayGeneration: number
  /** 当月发电量(kWh) */
  monthlyGeneration: number
  /** 年累计发电量(kWh) */
  yearlyGeneration: number
  /** 总累计发电量(kWh) */
  totalGeneration: number
}

/**
 * 发电量趋势数据点
 */
export interface PowerTrendDataPoint {
  /** 日期 */
  date: string
  /** 发电量(kWh) */
  generation: number
}

/**
 * 满发小时数据
 */
export interface FullHourData {
  /** 电站名称 */
  stationName: string
  /** 满发小时数 */
  fullHours: number
  /** 单位 */
  unit: string
}

/**
 * 地图区域数据
 */
export interface MapRegionData {
  /** 区域ID */
  regionId: string
  /** 区域名称 */
  regionName: string
  /** 电站数量 */
  stationCount: number
  /** 告警数量 */
  alarmCount: number
  /** 坐标位置 */
  position: {
    lat: number
    lng: number
  }
}

/**
 * 电站建设状态
 */
export type StationStatus = 'grid_connected' | 'under_construction' | 'planned'

/**
 * 电站建设统计
 */
export interface StationConstructionStats {
  /** 并网电站 */
  gridConnected: {
    count: number
    capacity: number // MW
  }
  /** 在建电站 */
  underConstruction: {
    count: number
    capacity: number // MW
  }
  /** 拟建电站 */
  planned: {
    count: number
    capacity: number // MW
  }
}

/**
 * 发电量TOP20数据
 */
export interface PowerGenerationTop20 {
  /** 电站名称 */
  stationName: string
  /** 发电量(kWh) */
  generation: number
  /** 单位 */
  unit: string
}

/**
 * 功率曲线数据点
 */
export interface PowerCurveDataPoint {
  /** 时间 */
  time: string
  /** 功率(MW) */
  power: number
}

/**
 * 告警等级
 */
export type AlarmLevel = 'info' | 'warning' | 'error'

/**
 * 告警状态
 */
export type AlarmStatus = 'pending' | 'confirmed' | 'resolved'

/**
 * 告警数据
 */
export interface AlarmData {
  /** 告警ID */
  id: string
  /** 告警级别 */
  level: AlarmLevel
  /** 告警名称 */
  alarmName: string
  /** 告警位置 */
  location: string
  /** 告警时间 */
  alarmTime: string
  /** 告警级别文本 */
  levelText: string
  /** 确认状态 */
  status: AlarmStatus
  /** 确认状态文本 */
  statusText: string
}

/**
 * 时间范围类型
 */
export type TimeRange = 'day' | 'month' | 'year'

/**
 * 综合信息页面数据
 */
export interface PVDashboardData {
  /** 发电量统计 */
  powerStats: PowerGenerationStats
  /** 发电量趋势 */
  powerTrend: PowerTrendDataPoint[]
  /** 满发小时TOP20 */
  fullHourTop20: FullHourData[]
  /** 地图区域数据 */
  mapRegions: MapRegionData[]
  /** 电站建设统计 */
  constructionStats: StationConstructionStats
  /** 发电量TOP20 */
  generationTop20: PowerGenerationTop20[]
  /** 功率曲线 */
  powerCurve: PowerCurveDataPoint[]
  /** 告警列表 */
  alarms: AlarmData[]
}

/**
 * 综合信息页面查询参数
 */
export interface PVDashboardParams {
  /** 时间范围 */
  timeRange?: TimeRange
  /** 开始日期 */
  startDate?: string
  /** 结束日期 */
  endDate?: string
}

/**
 * API响应类型
 */
export interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
  timestamp?: string
}

/**
 * 城市电站数据
 */
export interface CityStationData {
  /** 城市行政编码 */
  cityAdcode: number
  /** 城市名称 */
  cityName: string
  /** 省份行政编码 */
  provinceAdcode: number
  /** 省份名称 */
  provinceName: string
  /** 电站数量 */
  stationCount: number
  /** 告警数量 */
  alarmCount: number
}

/**
 * 区/县电站数据
 */
export interface DistrictStationData {
  /** 区行政编码 */
  districtAdcode: number
  /** 区名称 */
  districtName: string
  /** 城市行政编码 */
  cityAdcode: number
  /** 城市名称 */
  cityName: string
  /** 电站数量 */
  stationCount: number
  /** 告警数量 */
  alarmCount: number
}

// 类型别名，保持向后兼容
export type PowerStats = PowerGenerationStats
export type PowerTrendItem = PowerTrendDataPoint
export type FullHourTop20Item = FullHourData
export type MapRegion = MapRegionData
export type GenerationTop20Item = PowerGenerationTop20
export type PowerCurveItem = PowerCurveDataPoint
export type AlarmItem = AlarmData

