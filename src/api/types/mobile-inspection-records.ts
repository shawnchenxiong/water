/**
 * 移动巡检记录管理类型定义
 */

// 巡检记录基础信息
export interface InspectionRecord {
  id: string                    // 记录ID
  inspectionType: string        // 巡检类型
  stationName: string          // 电站名称
  stationId: string            // 电站ID
  inspectionStatus: string     // 巡检状态
  inspectionNotes: string      // 巡检耗注（备注）
  inspector: string            // 巡检人员姓名
  inspectorId: string          // 巡检人员ID
  updateTime: string           // 更新时间
  createTime: string           // 创建时间
  duration: string             // 巡检耗时
}

// 巡检记录查询参数
export interface InspectionRecordQueryParams {
  stationId: string            // 电站ID（必填）
  page?: number                // 页码，默认1
  pageSize?: number            // 每页数量，默认20
  sortField?: string           // 排序字段，默认updateTime
  sortOrder?: 'desc' | 'asc'   // 排序方向，默认desc
  keyword?: string             // 搜索关键词
}

// 巡检记录列表响应
export interface InspectionRecordListResponse {
  inspectionRecords: InspectionRecord[]
  pagination: {
    current: number
    pageSize: number
    total: number
    totalPages: number
  }
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
}

// 巡检记录基础数据
export interface InspectionRecordBasicData {
  inspectionTypes: Array<{     // 巡检类型选项
    value: string
    label: string
  }>
  inspectionStatuses: Array<{  // 巡检状态选项
    value: string
    label: string
    color: string
  }>
}

// 巡检记录基础数据响应
export interface InspectionRecordBasicDataResponse {
  code: number
  message: string
  data: InspectionRecordBasicData
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

// 巡检记录统计数据
export interface RecordStatistics {
  totalCount: number           // 总记录数
  completedCount: number       // 已完成记录数
  inProgressCount: number      // 进行中记录数
  pendingCount: number         // 待开始记录数
  deviceInspectionCount: number // 设备巡检数
  safetyInspectionCount: number // 安全巡检数
  environmentInspectionCount: number // 环境巡检数
}

// 巡检记录统计响应
export interface RecordStatisticsResponse {
  code: number
  message: string
  data: RecordStatistics
}

// 巡检记录详情
export interface InspectionRecordDetail extends InspectionRecord {
  inspectionItems: InspectionItem[]  // 巡检项目列表
  attachments: string[]              // 附件列表
  location: string                   // 巡检位置
  weather: string                    // 天气情况
  temperature: string                // 温度
  remarks: string                    // 备注
}

// 巡检项目
export interface InspectionItem {
  id: string                   // 项目ID
  itemName: string             // 项目名称
  itemType: string             // 项目类型
  checkResult: string          // 检查结果
  isNormal: boolean            // 是否正常
  description: string          // 描述
  images: string[]             // 相关图片
}

// 巡检记录详情响应
export interface InspectionRecordDetailResponse {
  code: number
  message: string
  data: InspectionRecordDetail
}

// 导出参数
export interface ExportParams {
  stationId: string            // 电站ID（必填）
  startTime?: string           // 开始时间
  endTime?: string             // 结束时间
  inspectionType?: string      // 巡检类型
  inspectionStatus?: string    // 巡检状态
}

// 巡检记录创建请求
export interface CreateInspectionRecordRequest {
  stationId: string            // 电站ID
  inspectionType: string       // 巡检类型
  inspectorId: string          // 巡检人员ID
  inspectionItems: Omit<InspectionItem, 'id'>[]  // 巡检项目
  location?: string            // 巡检位置
  weather?: string             // 天气情况
  temperature?: string         // 温度
  remarks?: string             // 备注
}

// 巡检记录更新请求
export interface UpdateInspectionRecordRequest {
  id: string                   // 记录ID
  inspectionStatus: string     // 巡检状态
  inspectionNotes: string      // 巡检备注
  inspectionItems?: InspectionItem[]  // 巡检项目
  attachments?: string[]       // 附件列表
  remarks?: string             // 备注
}

// 巡检记录创建响应
export interface CreateInspectionRecordResponse {
  code: number
  message: string
  data: {
    id: string
  }
}

// 巡检记录更新响应
export interface UpdateInspectionRecordResponse {
  code: number
  message: string
  data: null
}

// 文件上传响应
export interface FileUploadResponse {
  code: number
  message: string
  data: {
    fileUrl: string
    fileName: string
    fileSize: number
  }
}

// 巡检记录历史
export interface RecordHistory {
  id: string                   // 历史记录ID
  recordId: string             // 巡检记录ID
  action: string               // 操作类型
  operator: string             // 操作人
  operatorId: string           // 操作人ID
  operationTime: string        // 操作时间
  description: string          // 操作描述
  oldValue: string             // 旧值
  newValue: string             // 新值
}

// 巡检记录历史响应
export interface RecordHistoryResponse {
  code: number
  message: string
  data: RecordHistory[]
}
