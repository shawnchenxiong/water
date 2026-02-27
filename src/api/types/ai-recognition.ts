/**
 * AI识别结果相关类型定义
 */

/**
 * 识别结果类型
 */
export type RecognitionResult = 'normal' | 'abnormal' | 'alarm'

/**
 * 算法类型
 */
export type AlgorithmType = 'personnel_intrusion' | 'fire_smoke' | 'device_abnormal' | 'liquid_level'

/**
 * 审核状态
 */
export type AuditStatus = 'pending' | 'audited' | 'rejected'

/**
 * AI识别历史记录
 */
export interface AIRecognitionHistoryRecord {
  /** 记录ID */
  id: string
  /** 巡检时间 */
  inspectionTime: string
  /** 设备名称 */
  deviceName: string
  /** 算法类型 */
  algorithmType: AlgorithmType
  /** 识别结果 */
  recognitionResult: RecognitionResult
  /** 置信度 */
  confidence: string
  /** 描述 */
  description: string
  /** 图片URL列表 */
  imageUrls: string[]
  /** 创建时间 */
  createTime: string
}

/**
 * AI识别审核记录
 */
export interface AIRecognitionAuditRecord extends AIRecognitionHistoryRecord {
  /** 审核状态 */
  auditStatus: AuditStatus
  /** 告警误报 */
  alarmMisreport: 'yes' | 'no' | ''
  /** 审核人 */
  auditor?: string
  /** 审核时间 */
  auditTime?: string
  /** 审核备注 */
  auditRemark?: string
}

/**
 * 历史数据查询参数
 */
export interface AIRecognitionHistoryQueryParams {
  /** 电站ID */
  stationId?: string
  /** 时间范围 */
  timeRange?: string[]
  /** 识别结果 */
  recognitionResult?: RecognitionResult | ''
  /** 算法类型 */
  algorithmType?: AlgorithmType | ''
  /** 当前页 */
  current?: number
  /** 每页条数 */
  pageSize?: number
}

/**
 * 审核数据查询参数
 */
export interface AIRecognitionAuditQueryParams {
  /** 电站ID */
  stationId?: string
  /** 时间范围 */
  timeRange?: string[]
  /** 识别结果 */
  recognitionResult?: RecognitionResult | ''
  /** 审核状态 */
  auditStatus?: AuditStatus | ''
  /** 告警误报 */
  alarmMisreport?: 'yes' | 'no' | ''
  /** 算法类型 */
  algorithmType?: AlgorithmType | ''
  /** 当前页 */
  current?: number
  /** 每页条数 */
  pageSize?: number
}

/**
 * 历史数据分页响应
 */
export interface AIRecognitionHistoryPageResponse {
  /** 记录列表 */
  records: AIRecognitionHistoryRecord[]
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
 * 审核数据分页响应
 */
export interface AIRecognitionAuditPageResponse {
  /** 记录列表 */
  records: AIRecognitionAuditRecord[]
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
 * 算法审核请求参数
 */
export interface AlgorithmAuditParams {
  /** 记录ID列表 */
  recordIds: string[]
  /** 审核结果 */
  auditResult: 'pass' | 'reject'
  /** 审核备注 */
  remark?: string
}

/**
 * 识别结果详情
 */
export interface AIRecognitionDetail {
  /** 基础信息 */
  record: AIRecognitionHistoryRecord
  /** 原始图片URL */
  originalImageUrl: string
  /** 标注图片URL */
  annotatedImageUrl: string
  /** 识别区域坐标 */
  detectionRegions: Array<{
    x: number
    y: number
    width: number
    height: number
    label: string
    confidence: number
  }>
  /** 算法参数 */
  algorithmParams: Record<string, any>
}

/**
 * 基础选项数据
 */
export interface AIRecognitionBasicData {
  /** 识别结果选项 */
  recognitionResults: Array<{ label: string; value: RecognitionResult | '' }>
  /** 算法类型选项 */
  algorithmTypes: Array<{ label: string; value: AlgorithmType | '' }>
  /** 审核状态选项 */
  auditStatuses: Array<{ label: string; value: AuditStatus | '' }>
  /** 告警误报选项 */
  alarmMisreports: Array<{ label: string; value: 'yes' | 'no' | '' }>
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
