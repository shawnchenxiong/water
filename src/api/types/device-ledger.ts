/**
 * 设备台账类型定义
 */

/**
 * 设备台账记录
 */
export interface DeviceLedgerRecord {
  id: string
  stationName: string
  stationId: string
  deviceName: string
  deviceCategory: string
  deviceCategoryCode: string
  deviceSubCategory: string
  deviceNumber: string
  kksCode?: string
  deviceType: string
  manufacturer: string
  installLocation?: string
  associatedStation?: string
  connectedComponentsSerialNumbers?: string
  connectedComponentCapacity?: number
  connectedComponentManufacturer?: string
  connectedComponentModel?: string
  connectedComponentType?: string
  connectedComponentPeriod?: string
  productionDate?: string
  warrantyDate?: string
  commissioningDate?: string
  deviceStatus: string
  statusColor: string
  remarks?: string
  createTime: string
  updateTime: string
  creator?: string
  updater?: string
}

/**
 * 设备台账列表响应
 */
export interface DeviceLedgerListResponse {
  deviceLedger: DeviceLedgerRecord[]
  pagination: {
    current: number
    pageSize: number
    total: number
    totalPages: number
  }
}

/**
 * 设备台账查询参数
 */
export interface DeviceLedgerQueryParams {
  stationId?: string
  deviceCategory?: string
  manufacturer?: string
  deviceType?: string
  deviceName?: string
  deviceStatus?: string
  page?: number
  pageSize?: number
  sortField?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * 设备分类
 */
export interface DeviceCategory {
  value: string
  label: string
  icon: string
  subCategories: DeviceSubCategory[]
}

/**
 * 设备子分类
 */
export interface DeviceSubCategory {
  value: string
  label: string
}

/**
 * 生产厂商
 */
export interface Manufacturer {
  id: string
  name: string
  category: string[]
  country: string
}

/**
 * 设备状态
 */
export interface DeviceStatus {
  value: string
  label: string
  color: string
  description: string
}

/**
 * 电站树节点
 */
export interface StationTreeNode {
  id: string
  name: string
  type: 'platform' | 'province' | 'station'
  capacity?: string
  deviceCount?: number
  children?: StationTreeNode[]
}

/**
 * 基础数据响应
 */
export interface DeviceLedgerBasicData {
  deviceCategories: DeviceCategory[]
  manufacturers: Manufacturer[]
  deviceStatuses: DeviceStatus[]
  stations: StationTreeNode[]
}

/**
 * 新增/编辑设备表单数据
 */
export interface DeviceLedgerFormData {
  dataSource?: string
  stationId: string
  deviceNumber: string
  deviceCategory: string
  deviceType: string
  installLocation?: string
  connectedComponentsSerialNumbers?: string
  connectedComponentManufacturer?: string
  connectedComponentType?: string
  warrantyDate?: string
  deviceStatus: string
  deviceName: string
  kksCode?: string
  deviceSubCategory: string
  manufacturer: string
  associatedStation?: string
  connectedComponentCapacity?: number
  connectedComponentModel?: string
  connectedComponentPeriod?: string
  commissioningDate?: string
  remarks?: string
}

/**
 * 批量删除请求
 */
export interface BatchDeleteRequest {
  deviceIds: string[]
}

/**
 * 批量删除响应
 */
export interface BatchDeleteResponse {
  successCount: number
  failedCount: number
}

/**
 * 导出请求
 */
export interface ExportRequest {
  stationId?: string
  deviceCategory?: string
  exportFormat: 'excel' | 'pdf'
  exportFields: string[]
}

/**
 * 导入响应
 */
export interface ImportResponse {
  totalCount: number
  successCount: number
  failedCount: number
  errorRows: {
    row: number
    error: string
  }[]
}

/**
 * 更新设备状态请求
 */
export interface UpdateDeviceStatusRequest {
  deviceStatus: string
  statusRemark?: string
}

