/**
 * 缺陷管理类型定义
 */

/**
 * 缺陷记录
 */
export interface DefectRecord {
  id: string
  stationId: string
  stationName: string
  deviceName: string
  deviceType: string
  defectType: string
  defectLevel: string
  defectReason: string
  defectDescription: string
  handleStatus: string
  responsibleUnit: string
  submitter: string
  submitTime: string
  updateTime?: string
  statusColor?: string
}

/**
 * 缺陷查询参数
 */
export interface DefectQueryParams {
  stationId?: string
  deviceName1?: string
  deviceName2?: string
  deviceType?: string
  defectType?: string
  defectLevel?: string
  defectReason?: string
  handleStatus?: string
  submitTimeStart?: string
  submitTimeEnd?: string
  page: number
  pageSize: number
  sortField?: string
  sortOrder?: string
}

/**
 * 缺陷基础数据
 */
export interface DefectBasicData {
  deviceTypes: Array<{ label: string; value: string }>
  defectTypes: Array<{ label: string; value: string }>
  defectLevels: Array<{ label: string; value: string; color?: string }>
  defectReasons: Array<{ label: string; value: string }>
  handleStatuses: Array<{ label: string; value: string; color?: string }>
  responsibleUnits: Array<{ label: string; value: string }>
}

/**
 * 分页参数
 */
export interface PaginationParams {
  current: number
  pageSize: number
  total: number
  totalPages?: number
}

/**
 * API响应
 */
export interface DefectListResponse {
  code: number
  message: string
  data: {
    defects: DefectRecord[]
    pagination: PaginationParams
  }
}

export interface DefectBasicDataResponse {
  code: number
  message: string
  data: DefectBasicData
}

