/**
 * 故障库记录
 */
export interface FaultLibraryRecord {
  /** 故障ID */
  id: string
  /** 设备类型 */
  deviceType: string
  /** 故障表现 */
  faultDescription: string
  /** 影响范围 */
  impactScope: string
  /** 可能原因 */
  possibleCause: string
  /** 处理建议 */
  solutionSuggestion: string
  /** 关联告警数量 */
  relatedAlarmCount: number
  /** 修改人 */
  modifiedBy: string
  /** 修改时间 */
  modifiedTime: string
  /** 创建时间 */
  createTime: string
  /** 应用范围 */
  applicationScope?: 'cover' | 'keep'
}

/**
 * 故障库查询参数
 */
export interface FaultLibraryQueryParams {
  /** 设备类型 */
  deviceType?: string
  /** 故障表现关键字 */
  faultDescription?: string
  /** 当前页 */
  current?: number
  /** 每页大小 */
  pageSize?: number
}

/**
 * 故障库分页响应
 */
export interface FaultLibraryPageResponse {
  /** 记录列表 */
  records: FaultLibraryRecord[]
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
 * 故障库基础数据
 */
export interface FaultLibraryBasicData {
  /** 设备类型列表 */
  deviceTypes: Array<{ label: string; value: string }>
}

/**
 * 故障库表单数据
 */
export interface FaultLibraryFormData {
  /** 故障ID（编辑时使用） */
  id?: string
  /** 设备类型 */
  deviceType: string
  /** 故障表现 */
  faultDescription: string
  /** 影响范围 */
  impactScope: string
  /** 可能原因 */
  possibleCause: string
  /** 处理建议 */
  solutionSuggestion: string
  /** 应用范围 */
  applicationScope: 'cover' | 'keep'
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
