/**
 * 积尘诊断配置相关类型定义
 */

// 配置参数类型
export type ConfigValueType = 'number' | 'string' | 'boolean'

// 配置参数类别
export type ConfigCategory = '成本参数' | '诊断阈值' | '环境系数' | '计算参数'

// 诊断配置项
export interface DustDiagnosisConfig {
  id: string
  paramName: string
  paramValue: number | string
  paramUnit: string
  modifier: string | null
  modifyTime: string | null
  description: string
  category: ConfigCategory
  valueType: ConfigValueType
  minValue?: number
  maxValue?: number
  required: boolean
  editable?: boolean
}

// 获取配置参数请求响应
export interface GetConfigResponse {
  code: number
  data: {
    configs: DustDiagnosisConfig[]
  }
  message: string
}

// 更新配置参数请求
export interface UpdateConfigRequest {
  configs: Array<{
    id: string
    paramName: string
    paramValue: number | string
    modifier: string
    modifyTime: string
  }>
}

// 更新配置参数响应
export interface UpdateConfigResponse {
  code: number
  data: {
    updatedCount: number
    updateTime: string
  }
  message: string
}

// 重置配置请求
export interface ResetConfigRequest {
  configIds: string[]
  operator: string
}

// 重置配置响应
export interface ResetConfigResponse {
  code: number
  data: {
    resetCount: number
    resetTime: string
  }
  message: string
}

// 配置修改历史记录
export interface ConfigHistory {
  id: string
  configId: string
  paramName: string
  oldValue: number | string
  newValue: number | string
  modifier: string
  modifyTime: string
  remark?: string
}

// 获取配置历史请求参数
export interface GetConfigHistoryParams {
  configId?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}

// 获取配置历史响应
export interface GetConfigHistoryResponse {
  code: number
  data: {
    history: ConfigHistory[]
    pagination: {
      total: number
      page: number
      pageSize: number
      totalPages: number
    }
  }
  message: string
}

// 表格操作类型
export type TableAction = 'edit' | 'save' | 'cancel' | 'reset'

// 配置验证结果
export interface ConfigValidation {
  valid: boolean
  message?: string
}
