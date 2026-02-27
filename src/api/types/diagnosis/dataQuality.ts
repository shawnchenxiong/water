/**
 * 数据质量诊断类型定义
 */

/**
 * 数据质量统计摘要
 */
export interface DataQualitySummary {
  /** 数据质量评分 */
  qualityScore: number
  /** 质量等级 */
  qualityLevel: string
  /** 建议 */
  suggestion: string
  /** 设备总数 */
  totalDevices: number
  /** 正常设备数 */
  normalDevices: number
  /** 异常设备数 */
  abnormalDevices: number
}

/**
 * 数据质量图表数据
 */
export interface DataQualityChartData {
  /** 类别（评分区间） */
  categories: string[]
  /** 设备数量 */
  deviceCounts: number[]
  /** 质量百分比 */
  qualityRates: number[]
}

/**
 * 数据质量统计数据
 */
export interface DataQualityStatistics {
  /** 统计摘要 */
  summary: DataQualitySummary
  /** 图表数据 */
  chartData: DataQualityChartData
}

/**
 * 设备数据质量信息
 */
export interface DeviceDataQuality {
  /** 设备类型 */
  deviceType: string
  /** 设备名称 */
  deviceName: string
  /** 设备ID */
  deviceId: string
  /** 数据质量指数 (0-100) */
  qualityIndex: number
  /** 数据质量率 (%) */
  qualityRate: number
  /** 通讯中断时长 (小时) */
  commInterruptTime: number
  /** 数据缺失时长 (小时) */
  dataMissingTime: number
  /** 数据异常时长 (小时) */
  dataAbnormalTime: number
}

/**
 * 设备数据质量列表响应
 */
export interface DataQualityListResponse {
  /** 设备列表 */
  devices: DeviceDataQuality[]
  /** 分页信息 */
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

/**
 * 设备类型
 */
export interface DeviceType {
  /** 类型代码 */
  code: string
  /** 类型名称 */
  name: string
}

/**
 * 设备质量趋势数据
 */
export interface DeviceTrendData {
  /** 日期数组 */
  dates: string[]
  /** 质量指数数组 */
  qualityIndex: number[]
  /** 事件列表 */
  events: {
    date: string
    type: string
    description: string
    qualityIndex: number
  }[]
}

/**
 * 设备质量趋势响应
 */
export interface DeviceTrendResponse {
  /** 设备名称 */
  deviceName: string
  /** 趋势数据 */
  trendData: DeviceTrendData
}

/**
 * 数据质量查询参数
 */
export interface DataQualityQueryParams {
  /** 电站ID */
  stationId: string
  /** 设备类型（可选） */
  deviceType?: string
  /** 查询日期 */
  date: string
  /** 页码 */
  page?: number
  /** 每页大小 */
  pageSize?: number
}

/**
 * 设备趋势查询参数
 */
export interface DeviceTrendQueryParams {
  /** 设备ID */
  deviceId: string
  /** 开始日期 */
  startDate: string
  /** 结束日期 */
  endDate: string
}

