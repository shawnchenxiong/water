/**
 * 设备运行诊断相关类型定义
 */

/**
 * 设备运行统计摘要
 */
export interface DeviceOperationSummary {
  operationIndex: number // 运行指数 (0-100)
  operationLevel: string // 运行等级 (优秀/良好/一般/较差/很差)
  suggestion: string // 建议说明
  totalDevices: number // 总设备数
  normalDevices: number // 正常设备数
  abnormalDevices: number // 异常设备数
}

/**
 * 设备运行图表数据
 */
export interface DeviceOperationChartData {
  categories: string[] // 运行状态区间 (0分-80分, 80分-90分, 90分-100分, 100分)
  deviceCounts: number[] // 设备数量
  operationRates: number[] // 运行指数百分比
}

/**
 * 设备运行统计响应
 */
export interface DeviceOperationStatistics {
  summary: DeviceOperationSummary
  chartData: DeviceOperationChartData
}

/**
 * 设备运行数据
 */
export interface DeviceOperationData {
  deviceType: string // 设备类型
  deviceName: string // 设备名称
  deviceId?: string // 设备ID
  operationIndex: number // 发电运行指数
  generationTime: number // 发电时长(小时)
  downTime: number // 停机时长(小时)
  interruptTime: number // 中断时长(小时)
}

/**
 * 设备列表分页信息
 */
export interface DeviceOperationPagination {
  total: number // 总记录数
  page: number // 当前页码
  pageSize: number // 每页大小
  totalPages: number // 总页数
}

/**
 * 设备列表响应
 */
export interface DeviceOperationListResponse {
  devices: DeviceOperationData[]
  pagination: DeviceOperationPagination
}

/**
 * 设备运行事件
 */
export interface DeviceOperationEvent {
  date: string // 日期
  type: string // 事件类型 (operation_abnormal)
  description: string // 事件描述
  operationIndex: number // 运行指数
}

/**
 * 设备运行趋势数据
 */
export interface DeviceOperationTrendData {
  dates: string[] // 日期数组
  operationIndex: number[] // 运行指数数组
  events: DeviceOperationEvent[] // 事件数组
}

/**
 * 设备运行趋势响应
 */
export interface DeviceOperationTrendResponse {
  deviceName: string // 设备名称
  trendData: DeviceOperationTrendData
}

/**
 * 设备类型
 */
export interface DeviceType {
  code: string // 设备类型代码
  name: string // 设备类型名称
}

/**
 * 设备类型列表响应
 */
export interface DeviceTypeListResponse {
  deviceTypes: DeviceType[]
}

/**
 * 设备运行详细报告摘要
 */
export interface DeviceOperationReportSummary {
  totalOperationTime: number // 总运行时长(小时)
  normalOperationTime: number // 正常运行时长(小时)
  downTime: number // 停机时长(小时)
  interruptTime: number // 中断时长(小时)
  overallOperationRate: number // 总体运行率(百分比)
}

/**
 * 运行详情数据
 */
export interface OperationDetail {
  date: string // 日期
  operationIndex: number // 运行指数
  generationTime: number // 发电时长
  downTime: number // 停机时长
  interruptTime: number // 中断时长
  events: DeviceOperationEvent[] // 事件
}

/**
 * 设备运行详细报告
 */
export interface DeviceOperationDetailedReport {
  reportSummary: DeviceOperationReportSummary
  operationDetails: OperationDetail[]
}

/**
 * 导出请求参数
 */
export interface DeviceOperationExportRequest {
  stationId: string
  deviceType?: string
  startDate: string
  endDate: string
  exportType: 'excel' | 'pdf'
}

/**
 * 导出响应
 */
export interface DeviceOperationExportResponse {
  downloadUrl: string
  fileName: string
}

/**
 * 查询参数
 */
export interface DeviceOperationQueryParams {
  stationId: string
  deviceType?: string
  date: string
  page?: number
  pageSize?: number
}

/**
 * 设备趋势查询参数
 */
export interface DeviceTrendQueryParams {
  deviceId: string
  startDate: string
  endDate: string
}

