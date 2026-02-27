/**
 * 积尘清洗查询相关类型定义
 */

// 清洗方式枚举
export type CleaningMethod = '人工清洗' | '机器人清洗' | '高压水枪' | '干式清洗' | '化学清洗'

// 清洗记录
export interface CleaningRecord {
  id: string
  stationId: string
  stationName: string
  cleaningTime: string
  cleaningMethod: CleaningMethod
  cleaningArea: number
  cleaningPersonnel: string
  cleaningCost?: number
  submitter: string
  submitTime: string
  remark?: string
}

// 清洗记录查询参数
export interface CleaningQueryParams {
  stationId: string
  startTime: string
  endTime: string
  page?: number
  pageSize?: number
}

// 分页信息
export interface Pagination {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 查询清洗记录响应
export interface GetCleaningRecordsResponse {
  code: number
  data: {
    records: CleaningRecord[]
    pagination: Pagination
  }
  message: string
}

// 新增清洗记录请求
export interface CreateCleaningRecordRequest {
  stationId: string
  cleaningTime: string
  cleaningMethod: CleaningMethod
  cleaningArea: number
  cleaningPersonnel: string
  cleaningCost?: number
  submitter: string
  remark?: string
}

// 新增清洗记录响应
export interface CreateCleaningRecordResponse {
  code: number
  data: {
    recordId: string
  }
  message: string
}

// 编辑清洗记录请求
export interface UpdateCleaningRecordRequest {
  cleaningTime?: string
  cleaningMethod?: CleaningMethod
  cleaningArea?: number
  cleaningPersonnel?: string
  cleaningCost?: number
  remark?: string
}

// 编辑清洗记录响应
export interface UpdateCleaningRecordResponse {
  code: number
  data: {
    recordId: string
    updateTime: string
  }
  message: string
}

// 删除清洗记录响应
export interface DeleteCleaningRecordResponse {
  code: number
  data: {
    recordId: string
  }
  message: string
}

// 电站信息
export interface Station {
  stationId: string
  stationName: string
  location: string
  capacity: number
}

// 获取电站列表响应
export interface GetStationsResponse {
  code: number
  data: {
    stations: Station[]
  }
  message: string
}

// 新增清洗记录表单数据
export interface CleaningRecordForm {
  stationId: string
  cleaningTime: string
  cleaningMethod: CleaningMethod
  cleaningArea: number | null
  cleaningPersonnel: string
  cleaningCost: number | null
  remark: string
}

// 表单验证规则
export interface FormValidation {
  valid: boolean
  message?: string
}

// 表格操作类型
export type TableAction = 'edit' | 'delete' | 'view'
