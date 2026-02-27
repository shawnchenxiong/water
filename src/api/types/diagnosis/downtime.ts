/**
 * 停机诊断类型定义
 */

/**
 * 停机统计摘要
 */
export interface DowntimeSummary {
  /** 停机损失电量 (kWh) */
  lossEnergy: number
  /** 停机损失收益 (元) */
  lossRevenue: number
  /** 运行可利用率 (%) */
  availabilityRate: number
}

/**
 * 时间分析图表数据
 */
export interface TimeAnalysisChartData {
  /** 时长区间 */
  categories: string[]
  /** 损失电量 */
  lossEnergy: number[]
}

/**
 * 原因分析图表数据
 */
export interface ReasonAnalysisChartData {
  /** 原因类别 */
  categories: string[]
  /** 损失电量 */
  lossEnergy: number[]
}

/**
 * 停机诊断统计数据
 */
export interface DowntimeStatistics {
  /** 统计摘要 */
  summary: DowntimeSummary
  /** 时间分析数据 */
  timeAnalysis: TimeAnalysisChartData
  /** 原因分析数据 */
  reasonAnalysis: ReasonAnalysisChartData
}

/**
 * 停机事件
 */
export interface DowntimeEvent {
  /** 事件ID */
  id: string
  /** 电站名称 */
  stationName: string
  /** 停运设备 */
  deviceName: string
  /** 开始时间 */
  startTime: string
  /** 结束时间 */
  endTime: string
  /** 考核停运时长 */
  duration: string
  /** 损失电量 (kWh) */
  lossEnergy: number
  /** 损失收益 (元) */
  lossRevenue: number
  /** 停运原因 */
  reason: string
}

/**
 * 停机事件列表响应
 */
export interface DowntimeEventListResponse {
  /** 事件列表 */
  events: DowntimeEvent[]
  /** 分页信息 */
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

/**
 * 停机诊断查询参数
 */
export interface DowntimeQueryParams {
  /** 电站ID */
  stationId: string
  /** 时间维度 (month/year/custom) */
  timeDimension: string
  /** 查询月份 */
  month: string
  /** 页码 */
  page?: number
  /** 每页大小 */
  pageSize?: number
}

