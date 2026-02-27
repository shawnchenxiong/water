/**
 * 移动巡检问题管理类型定义
 */

// 巡检问题基础信息
export interface InspectionIssue {
  id: string                    // 问题ID
  inspectionLevel: string       // 巡检级别（高/中/低）
  levelColor: string           // 级别颜色
  inspectionType: string       // 巡检类型
  stationName: string          // 电站名称
  stationId: string            // 电站ID
  confirmStatus: string        // 确认状态（已确认/待确认/已忽略）
  statusColor: string          // 状态颜色
  inspector: string            // 巡检人员姓名
  inspectorId: string          // 巡检人员ID
  updateTime: string           // 更新时间
  confirmer: string            // 确认人姓名
  confirmerId: string          // 确认人ID
  confirmTime: string          // 确认时间
  confirmDescription: string   // 确认说明
  issueDescription: string     // 问题描述
  location: string             // 问题位置
  images: string[]             // 问题图片列表
}

// 巡检问题查询参数
export interface InspectionIssueQueryParams {
  stationId: string            // 电站ID（必填）
  page?: number                // 页码，默认1
  pageSize?: number            // 每页数量，默认20
  sortField?: string           // 排序字段，默认updateTime
  sortOrder?: 'desc' | 'asc'   // 排序方向，默认desc
  confirmStatus?: string       // 确认状态过滤
  inspectionLevel?: string     // 问题等级过滤
  keyword?: string             // 搜索关键词
}

// 巡检问题列表响应
export interface InspectionIssueListResponse {
  inspectionIssues: InspectionIssue[]
  pagination: {
    current: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// 问题确认请求
export interface ConfirmIssueRequest {
  issueId: string              // 问题ID
  confirmStatus: string        // 确认状态（已确认/已忽略）
  confirmDescription: string   // 确认说明
}

// 问题确认响应
export interface ConfirmIssueResponse {
  code: number
  message: string
  data: null
}

// 问题详情响应
export interface InspectionIssueDetailResponse {
  code: number
  message: string
  data: InspectionIssue
}

// 电站树节点
export interface StationTreeNode {
  id: string                   // 节点ID
  name: string                 // 节点名称
  type: 'platform' | 'province' | 'station'  // 节点类型
  capacity?: string            // 电站容量（仅电站节点）
  status?: string              // 电站状态（仅电站节点）
  children?: StationTreeNode[] // 子节点
}

// 电站树响应
export interface StationTreeResponse {
  code: number
  message: string
  data: {
    stationTree: StationTreeNode[]
  }
}

// 电站搜索响应
export interface StationSearchResponse {
  code: number
  message: string
  data: {
    stationTree: StationTreeNode[]
  }
}

// 筛选表单数据
export interface FilterFormData {
  keyword: string              // 搜索关键词
  confirmStatus: string        // 确认状态
  inspectionLevel: string      // 问题等级
}

// 巡检问题基础数据
export interface InspectionIssueBasicData {
  confirmStatuses: Array<{     // 确认状态选项
    value: string
    label: string
    color: string
  }>
  inspectionLevels: Array<{    // 巡检级别选项
    value: string
    label: string
    color: string
  }>
  inspectionTypes: Array<{     // 巡检类型选项
    value: string
    label: string
  }>
}

// 巡检问题基础数据响应
export interface InspectionIssueBasicDataResponse {
  code: number
  message: string
  data: InspectionIssueBasicData
}

// API响应基础结构
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// 分页参数
export interface PaginationParams {
  current: number
  pageSize: number
  total: number
  totalPages: number
}

// 排序参数
export interface SortParams {
  field: string
  order: 'desc' | 'asc'
}

// 问题统计数据
export interface IssueStatistics {
  totalCount: number           // 总问题数
  pendingCount: number         // 待确认问题数
  confirmedCount: number       // 已确认问题数
  ignoredCount: number         // 已忽略问题数
  highLevelCount: number       // 高级别问题数
  mediumLevelCount: number     // 中级别问题数
  lowLevelCount: number        // 低级别问题数
}

// 问题统计响应
export interface IssueStatisticsResponse {
  code: number
  message: string
  data: IssueStatistics
}

// 批量操作请求
export interface BatchOperationRequest {
  issueIds: string[]           // 问题ID列表
  operation: 'confirm' | 'ignore' | 'delete'  // 操作类型
  confirmDescription?: string  // 确认说明（确认操作时必填）
}

// 批量操作响应
export interface BatchOperationResponse {
  code: number
  message: string
  data: {
    successCount: number       // 成功处理数量
    failedCount: number        // 失败处理数量
    failedItems: string[]      // 失败项目ID列表
  }
}

// 问题图片信息
export interface IssueImage {
  id: string                   // 图片ID
  url: string                  // 图片URL
  name: string                 // 图片名称
  size: number                 // 图片大小（字节）
  uploadTime: string           // 上传时间
}

// 问题位置信息
export interface IssueLocation {
  area: string                 // 区域
  device: string               // 设备
  coordinates?: {              // 坐标信息（可选）
    latitude: number
    longitude: number
  }
}

// 扩展的问题详情
export interface ExtendedInspectionIssue extends InspectionIssue {
  issueImages: IssueImage[]    // 详细图片信息
  locationInfo: IssueLocation  // 详细位置信息
  relatedIssues: string[]      // 相关问题ID列表
  severity: number             // 严重程度评分（1-10）
  estimatedRepairTime: number  // 预估修复时间（小时）
  repairCost: number           // 预估修复成本
  tags: string[]               // 问题标签
}

// 问题历史记录
export interface IssueHistory {
  id: string                   // 历史记录ID
  issueId: string              // 问题ID
  action: string               // 操作类型
  operator: string             // 操作人
  operatorId: string           // 操作人ID
  operationTime: string        // 操作时间
  description: string          // 操作描述
  oldValue: string             // 旧值
  newValue: string             // 新值
}

// 问题历史记录响应
export interface IssueHistoryResponse {
  code: number
  message: string
  data: IssueHistory[]
}
