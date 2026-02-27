/**
 * 电站概览API类型定义
 */

/**
 * 电站概览统计数据
 */
export interface StationOverviewStatistics {
  /** 总数 */
  total: number
  /** 通讯正常数量 */
  communicationNormal: number
  /** 全部设备离线数量 */
  allDeviceOffline: number
  /** 部分设备离线数量 */
  partialDeviceOffline: number
  /** 接入中数量 */
  connecting: number
  /** 无告警数量 */
  noAlarm: number
  /** 有告警数量 */
  hasAlarm: number
}

/**
 * 电站概览记录
 */
export interface StationOverviewRecord {
  /** 电站ID */
  id: string
  /** 电站名称 */
  stationName: string
  /** 通讯状态 */
  communication: 'online' | 'offline' | 'connecting'
  /** 是否有告警 */
  alarm: boolean
  /** 所在地区 */
  location: string
  /** 装机功率(MW) */
  installedPower: number
  /** 装机能量(MWh) */
  installedEnergy: number
  /** 天气 */
  weather: 'sunny' | 'cloudy' | 'rainy' | 'snowy'
  /** 实时功率(kW) */
  realtimePower: number
  /** 当日充电量(kWh) */
  dailyCharging: number
  /** 当日放电量(kWh) */
  dailyDischarging: number
  /** 当月充电量(kWh) */
  monthlyCharging?: number
  /** 当月放电量(kWh) */
  monthlyDischarging?: number
  /** 当年充电量(kWh) */
  yearlyCharging?: number
  /** 当年放电量(kWh) */
  yearlyDischarging?: number
  /** 累计充电量(kWh) */
  cumulativeCharging: number
  /** 累计放电量(kWh) */
  cumulativeDischarging: number
  /** 并网日期 */
  gridConnectionDate?: string
  /** 联系人 */
  contactPerson?: string
  /** 联系电话 */
  contactPhone?: string
  /** 更新时间 */
  updateTime: string
  /** 所在位置 */
  position?: string
  /** 建设状态 */
  constructionStatus?: 'operational' | 'construction' | 'planning'
  /** 并网时间 */
  gridConnectionTime?: string
}

/**
 * 电站概览查询参数
 */
export interface StationOverviewQueryParams {
  /** 搜索关键字 */
  keyword?: string
  /** 所在位置 */
  location?: string
  /** 所在地区 */
  region?: string
  /** 建设状态 */
  constructionStatus?: string
  /** 最小功率 */
  minPower?: number
  /** 最大功率 */
  maxPower?: number
  /** 最小能量 */
  minEnergy?: number
  /** 最大能量 */
  maxEnergy?: number
  /** 并网时间 */
  gridConnectionTime?: string
  /** 联系人 */
  contactPerson?: string
  /** 联系电话 */
  contactPhone?: string
  /** 当前页码 */
  current?: number
  /** 每页大小 */
  pageSize?: number
}

/**
 * 电站概览分页响应
 */
export interface StationOverviewPageResponse {
  /** 记录列表 */
  records: StationOverviewRecord[]
  /** 总记录数 */
  total: number
  /** 当前页码 */
  current: number
  /** 每页大小 */
  pageSize: number
  /** 总页数 */
  pages: number
}

/**
 * 电站概览基础数据
 */
export interface StationOverviewBasicData {
  /** 位置选项 */
  locationOptions: Array<{ label: string; value: string }>
  /** 地区选项 */
  regionOptions: Array<{ label: string; value: string }>
  /** 建设状态选项 */
  constructionStatusOptions: Array<{ label: string; value: string }>
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
