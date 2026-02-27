/**
 * 一键诊断相关类型定义
 */

/** 诊断状态枚举 */
export type DiagnosisStatus = 'normal' | 'warning' | 'error' | 'unknown'

/** 任务状态枚举 */  
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed'

/** 诊断项目接口 */
export interface DiagnosisItem {
  /** 项目ID */
  itemId: string
  /** 项目名称 */
  itemName: string
  /** 诊断状态 */
  status: DiagnosisStatus
  /** 状态文字 */
  statusText: string
  /** 最后检查时间 */
  lastCheckTime: string
  /** 描述信息 */
  description: string
  /** 异常数量（状态为异常时） */
  abnormalCount?: number
  /** 详情页面地址 */
  detailUrl?: string
}

/** 诊断分类接口 */
export interface DiagnosisCategory {
  /** 分类ID */
  categoryId: string
  /** 分类名称 */
  categoryName: string
  /** 分类图标 */
  categoryIcon: string
  /** 诊断项目列表 */
  items: DiagnosisItem[]
}

/** 异常对象接口 */
export interface AbnormalObject {
  /** 对象ID */
  objectId: string
  /** 对象名称 */
  objectName: string
  /** 对象类型 */
  objectType: string
  /** 异常类型 */
  abnormalType: string
  /** 异常描述 */
  abnormalDescription: string
  /** 诊断项目ID */
  diagnosisItemId: string
}

/** 一键诊断结果接口 */
export interface OneClickDiagnosisResult {
  /** 电站ID */
  stationId: string
  /** 电站名称 */
  stationName: string
  /** 综合评分 (0-100) */
  overallScore: number
  /** 诊断时间 */
  diagnosisTime: string
  /** 异常项目数量 */
  abnormalCount: number
  /** 诊断状态 */
  diagnosisStatus: string
  /** 诊断分类列表 */
  categories: DiagnosisCategory[]
  /** 异常对象列表 */
  abnormalObjects?: AbnormalObject[]
}

/** 执行诊断请求参数 */
export interface ExecuteDiagnosisRequest {
  /** 电站ID */
  stationId: string
  /** 诊断类型（可选，默认全部） */
  diagnosisTypes?: string[]
  /** 是否强制刷新（忽略缓存） */
  forceRefresh?: boolean
}

/** 执行诊断响应 */
export interface ExecuteDiagnosisResponse {
  /** 任务ID */
  taskId: string
  /** 预估完成时间(秒) */
  estimatedTime: number
}

/** 诊断进度接口 */
export interface DiagnosisProgress {
  /** 任务ID */
  taskId: string
  /** 任务状态 */
  status: TaskStatus
  /** 进度百分比 (0-100) */
  progress: number
  /** 当前进行的项目 */
  currentItem: string
  /** 已完成项目数 */
  completedItems: number
  /** 总项目数 */
  totalItems: number
  /** 开始时间 */
  startTime: string
  /** 预计结束时间 */
  estimatedEndTime: string
}

/** 诊断历史记录项 */
export interface DiagnosisHistoryItem {
  /** 诊断ID */
  diagnosisId: string
  /** 诊断时间 */
  diagnosisTime: string
  /** 综合评分 */
  overallScore: number
  /** 异常项目数 */
  abnormalCount: number
  /** 诊断状态 */
  status: string
  /** 诊断耗时(秒) */
  duration: number
}

/** 诊断历史记录响应 */
export interface DiagnosisHistoryResponse {
  /** 历史记录列表 */
  records: DiagnosisHistoryItem[]
  /** 分页信息 */
  pagination: {
    current: number
    pageSize: number
    total: number
    totalPages: number
  }
}

/** 诊断历史记录查询参数 */
export interface DiagnosisHistoryQuery {
  /** 电站ID */
  stationId: string
  /** 开始时间 */
  startTime?: string
  /** 结束时间 */
  endTime?: string
  /** 页码 */
  page?: number
  /** 每页数量 */
  pageSize?: number
}

/** 诊断配置项阈值 */
export interface DiagnosisThresholds {
  /** 超时阈值(秒) */
  timeout: number
  /** 警告阈值 */
  warningLevel: number
  /** 异常阈值 */
  errorLevel: number
}

/** 诊断配置项 */
export interface DiagnosisConfigItem {
  /** 项目ID */
  itemId: string
  /** 项目名称 */
  itemName: string
  /** 所属分类 */
  category: string
  /** 是否启用 */
  enabled: boolean
  /** 分值权重 */
  weight: number
  /** 阈值设置 */
  thresholds: DiagnosisThresholds
}

/** 诊断配置响应 */
export interface DiagnosisConfigResponse {
  /** 诊断项目配置列表 */
  diagnosisItems: DiagnosisConfigItem[]
}

/** 更新诊断配置请求 */
export interface UpdateDiagnosisConfigRequest {
  /** 电站ID */
  stationId: string
  /** 诊断项目配置列表 */
  diagnosisItems: DiagnosisConfigItem[]
}

