/**
 * 统计报表相关类型定义
 */

/**
 * 报表类型
 */
export type ReportType = 'daily' | 'weekly' | 'monthly' | 'yearly'

/**
 * 储能电站报表记录
 */
export interface ESStationReportRecord {
  /** 统计日期 */
  reportDate: string
  /** 电站名称 */
  stationName: string
  /** 所在地区 */
  location: string
  /** 装机功率(kW) */
  installedPower: string
  /** 装机能量(kWh) */
  installedEnergy: string
  /** 电站SOH */
  stationSOH: string
  /** 当日充电量(kWh) */
  dailyCharge: string
  /** 当日放电量(kWh) */
  dailyDischarge: string
}

/**
 * 统计报表查询参数
 */
export interface StatisticsReportQueryParams {
  /** 报表类型 */
  reportType: ReportType
  /** 电站ID */
  stationId: string
  /** 报表时间 */
  reportTime: string
  /** 当前页 */
  current?: number
  /** 每页条数 */
  pageSize?: number
}

/**
 * 统计报表分页响应
 */
export interface StatisticsReportPageResponse {
  /** 记录列表 */
  records: ESStationReportRecord[]
  /** 总条数 */
  total: number
  /** 当前页 */
  current: number
  /** 每页条数 */
  pageSize: number
  /** 总页数 */
  pages: number
}

/**
 * 电站选项
 */
export interface StationOption {
  /** 显示标签 */
  label: string
  /** 值 */
  value: string
}

/**
 * 统计报表基础数据
 */
export interface StatisticsReportBasicData {
  /** 电站列表 */
  stations: StationOption[]
}

/**
 * API 响应类型
 */
export interface ApiResponse<T> {
  code: number
  data: T
  message: string
  timestamp?: string
}
