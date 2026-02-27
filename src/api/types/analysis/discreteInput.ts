/**
 * 逆变器输入离散率分析 - 类型定义
 */

// 离散率状态
export type DispersionStatus = 'excellent' | 'good' | 'normal' | 'poor' | 'offline'

// 统计汇总数据
export interface DispersionSummary {
  totalCount: number
  excellentCount: number
  goodCount: number
  normalCount: number
  poorCount: number
  offlineCount: number
  excellentPercent: number
  goodPercent: number
  normalPercent: number
  poorPercent: number
  offlinePercent: number
}

// 组串数据
export interface StringData {
  name: string
  value: number
}

// 设备详情
export interface DeviceDetail {
  deviceId: string
  deviceName: string
  installedCapacity: number
  dispersionRate: number
  strings: StringData[]
  status: DispersionStatus
}

// API请求参数
export interface GetDispersionParams {
  regionId: string
  deviceType: string // '0915' 输入, '0916' 输出
  dateType: number // 1=小时
  queryTime: string // YYYY-MM-DD HH:mm:ss
}

// 分页请求参数
export interface GetDispersionPageParams extends GetDispersionParams {
  pageNum: number
  pageSize: number
  sortStr?: string
}

// 汇总API响应
export interface GetDispersionAllResponse {
  code: number
  message: string
  data: DispersionSummary
}

// 分页API响应
export interface GetDispersionPageResponse {
  code: number
  message: string
  data: {
    total: number
    pageNum: number
    pageSize: number
    pages: number
    list: DeviceDetail[]
  }
}

