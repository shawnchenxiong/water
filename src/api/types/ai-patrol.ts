/**
 * AI巡检任务记录
 */
export interface PatrolTaskRecord {
  /** 任务ID */
  id: string
  /** 任务名称 */
  taskName: string
  /** 任务类型 */
  taskType: string
  /** 执行模式 */
  executeMode: string
  /** 执行时间段 */
  executeTimeRange: string
  /** 执行时间/执行间隔 */
  executeInterval: string
  /** 任务状态 */
  taskStatus: string
  /** 最后执行时间 */
  lastExecuteTime: string
}

/**
 * 巡检任务查询参数
 */
export interface PatrolTaskQueryParams {
  /** 电站ID */
  stationId?: string
  /** 任务类型 */
  taskType?: string
  /** 执行模式 */
  executeMode?: string
  /** 任务状态 */
  taskStatus?: string
  /** 执行时间范围 */
  executeTimeRange?: string[]
  /** 关键字 */
  keyword?: string
  /** 当前页 */
  current?: number
  /** 每页大小 */
  pageSize?: number
}

/**
 * 巡检任务分页响应
 */
export interface PatrolTaskPageResponse {
  /** 任务列表 */
  records: PatrolTaskRecord[]
  /** 总数 */
  total: number
  /** 当前页 */
  current: number
  /** 每页大小 */
  pageSize: number
  /** 总页数 */
  pages: number
}

/**
 * 巡检任务基础数据
 */
export interface PatrolTaskBasicData {
  /** 任务类型列表 */
  taskTypes: Array<{ label: string; value: string }>
  /** 执行模式列表 */
  executeModes: Array<{ label: string; value: string }>
  /** 任务状态列表 */
  taskStatuses: Array<{ label: string; value: string }>
}

/**
 * 巡检监控表格记录
 */
export interface PatrolMonitorTableRecord {
  /** 巡检时间 */
  time: string
  /** 设备位置 */
  location: string
  /** 设备名称 */
  deviceName: string
  /** 点位名称 */
  pointName: string
  /** 巡检结果 */
  result: string
  /** 审核状态 */
  auditStatus: string
}

/**
 * 巡检监控表格查询参数
 */
export interface PatrolMonitorTableParams {
  /** 任务ID */
  taskId: string
  /** 数据类型: realtime-实时信息, alarm-告警信息 */
  dataType: 'realtime' | 'alarm'
  /** 当前页 */
  current?: number
  /** 每页大小 */
  pageSize?: number
}

/**
 * 巡检监控表格响应
 */
export interface PatrolMonitorTableResponse {
  /** 表格数据列表 */
  records: PatrolMonitorTableRecord[]
  /** 总数 */
  total: number
  /** 当前页 */
  current: number
  /** 每页大小 */
  pageSize: number
  /** 总页数 */
  pages: number
}

/**
 * 巡检记录
 */
export interface PatrolRecord {
  /** 记录ID */
  id: string
  /** 电站名称 */
  stationName: string
  /** 巡检任务ID */
  taskId: string
  /** 巡检任务名称 */
  taskName: string
  /** 设备位置 */
  location: string
  /** 设备名称 */
  deviceName: string
  /** 设备类型 */
  deviceType: string
  /** 巡检点位 */
  pointName: string
  /** 巡检时间 */
  inspectionTime: string
  /** 巡检结果 */
  result: '正常' | '异常' | '警告'
  /** 异常描述 */
  abnormalDesc?: string
  /** 巡检图片 */
  images?: string[]
  /** 审核状态 */
  auditStatus: '待审核' | '已审核' | '已驳回'
  /** 审核人 */
  auditor?: string
  /** 审核时间 */
  auditTime?: string
  /** 审核备注 */
  auditRemark?: string
  /** 创建时间 */
  createTime: string
}

/**
 * 巡检记录查询参数
 */
export interface PatrolRecordQueryParams {
  /** 电站ID */
  stationId?: string
  /** 任务ID */
  taskId?: string
  /** 设备类型 */
  deviceType?: string
  /** 巡检结果 */
  result?: string
  /** 审核状态 */
  auditStatus?: string
  /** 巡检时间范围 */
  inspectionTimeRange?: string[]
  /** 关键字搜索 */
  keyword?: string
  /** 当前页 */
  current?: number
  /** 每页大小 */
  pageSize?: number
}

/**
 * 巡检记录分页响应
 */
export interface PatrolRecordPageResponse {
  /** 记录列表 */
  records: PatrolRecord[]
  /** 总数 */
  total: number
  /** 当前页 */
  current: number
  /** 每页大小 */
  pageSize: number
  /** 总页数 */
  pages: number
}

/**
 * 巡检记录基础数据
 */
export interface PatrolRecordBasicData {
  /** 设备类型列表 */
  deviceTypes: Array<{ label: string; value: string }>
  /** 巡检结果列表 */
  results: Array<{ label: string; value: string }>
  /** 审核状态列表 */
  auditStatuses: Array<{ label: string; value: string }>
}

/**
 * API响应格式
 */
export interface ApiResponse<T = any> {
  /** 响应码 */
  code: number
  /** 响应数据 */
  data: T
  /** 响应消息 */
  message: string
  /** 时间戳 */
  timestamp?: string
}

