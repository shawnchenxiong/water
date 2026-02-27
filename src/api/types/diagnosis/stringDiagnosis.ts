/**
 * 组串诊断类型定义
 */

import type { ApiResponse } from '@/types/api'

/**
 * 组串状态枚举
 */
export type StringStatusCode = 
  | 'normal_not_connected'    // 正常未接入
  | 'branch_disconnect'       // 支路断配
  | 'not_enabled_no_data'     // 未启用支路数据未上报
  | 'pending_verification'    // 待重新核定
  | 'enabled_normal'          // 已启用正常
  | 'not_enabled'            // 未启用

/**
 * 组串状态信息
 */
export interface StringStatus {
  code: StringStatusCode
  name: string
  color: string
}

/**
 * 设备统计信息
 */
export interface DeviceStatistics {
  totalDevices: number        // 设备总数
  onlineDevices: number       // 在线设备数
  offlineDevices: number      // 离线设备数
  unavailableDevices?: number // 不可用设备数
}

/**
 * 支路统计信息
 */
export interface StringStatistics {
  normalNotConnected: number    // 正常未接入数量
  branchDisconnect: number     // 支路断配数量
  notEnabledNoData: number     // 未启用无数据数量
  pendingVerification: number  // 待重新核定数量
  totalStrings: number         // 总组串数
  enabledStrings: number       // 已启用组串数
  disabledStrings: number      // 未启用组串数
}

/**
 * 组串诊断统计数据
 */
export interface StringDiagnosisStatistics {
  stationId: string
  stationName: string
  deviceStatistics: DeviceStatistics
  stringStatistics: StringStatistics
  lastUpdateTime: string
}

/**
 * 组串诊断记录
 */
export interface StringDiagnosisRecord {
  id: string                    // 组串ID
  stationName: string          // 所属电站
  stationId: string            // 电站ID
  deviceName: string           // 设备名称
  deviceId: string             // 设备ID
  stringName: string           // 支路名称
  stringIndex: number          // 支路索引
  currentValue: number         // 核查支路电流值
  currentUnit: string          // 电流单位
  configStatus: string         // 配置启用状态
  configStatusCode: string     // 配置状态代码
  checkStatus: string          // 检查状态
  checkStatusCode: StringStatusCode // 检查状态代码
  statusColor: string          // 状态颜色
  lastCheckTime: string        // 最近检查时间
  remarks: string              // 备注
  isEnabled: boolean           // 是否启用
  canEnable: boolean           // 是否可启用
  canDisable: boolean          // 是否可禁用
  hasDataComparison: boolean   // 是否支持数据对比
  hasCapacityConfig: boolean   // 是否支持容量配置
}

/**
 * 分页信息
 */
export interface Pagination {
  current: number              // 当前页
  pageSize: number             // 每页大小
  total: number                // 总数
  totalPages: number           // 总页数
}

/**
 * 组串诊断列表查询参数
 */
export interface GetStringDiagnosisListParams {
  stationId: string                    // 电站ID (必填)
  enableStatus?: string               // 启用状态: all/enabled/disabled
  checkStatus?: string                // 检查状态
  deviceName?: string                 // 设备名称筛选
  page?: number                       // 页码
  pageSize?: number                   // 每页数量
  sortField?: string                  // 排序字段
  sortOrder?: 'desc' | 'asc'         // 排序方向
}

/**
 * 组串诊断列表响应数据
 */
export interface StringDiagnosisListData {
  list: StringDiagnosisRecord[]       // 组串列表
  statistics: StringDiagnosisStatistics // 统计信息
  pagination: Pagination              // 分页信息
}

/**
 * 组串诊断列表响应
 */
export interface GetStringDiagnosisListResponse extends ApiResponse<StringDiagnosisListData> {}

/**
 * 批量操作请求参数
 */
export interface BatchOperationRequest {
  stationId: string           // 电站ID
  stringIds: string[]         // 组串ID列表
  operation: 'enable' | 'disable' | 'diagnose' // 操作类型
  reason?: string             // 操作原因
}

/**
 * 批量操作结果
 */
export interface BatchOperationResult {
  stringId: string           // 组串ID
  success: boolean           // 是否成功
  message: string            // 结果消息
}

/**
 * 批量操作响应数据
 */
export interface BatchOperationData {
  successCount: number                    // 成功数量
  failedCount: number                     // 失败数量
  results: BatchOperationResult[]         // 详细结果
}

/**
 * 批量操作响应
 */
export interface BatchOperationResponse extends ApiResponse<BatchOperationData> {}

/**
 * 执行诊断请求参数
 */
export interface ExecuteDiagnosisRequest {
  stationId: string                      // 电站ID
  stringIds?: string[]                   // 组串ID列表，不提供则诊断全部
  diagnosisType: 'full' | 'quick' | 'custom' // 诊断类型
  forceRefresh?: boolean                 // 是否强制刷新
}

/**
 * 诊断任务信息
 */
export interface DiagnosisTaskInfo {
  taskId: string             // 任务ID
  totalCount: number         // 总数量
  estimatedTime: number      // 预计时间(秒)
}

/**
 * 执行诊断响应
 */
export interface ExecuteDiagnosisResponse extends ApiResponse<DiagnosisTaskInfo> {}

/**
 * 诊断进度信息
 */
export interface DiagnosisProgress {
  taskId: string             // 任务ID
  status: 'pending' | 'running' | 'completed' | 'failed' // 任务状态
  progress: number           // 进度百分比
  completedCount: number     // 已完成数量
  totalCount: number         // 总数量
  currentString?: string     // 当前处理的组串
  startTime: string          // 开始时间
  estimatedEndTime?: string  // 预计结束时间
}

/**
 * 诊断进度响应
 */
export interface DiagnosisProgressResponse extends ApiResponse<DiagnosisProgress> {}

/**
 * 数据对比请求参数
 */
export interface DataCompareRequest {
  stationId: string          // 电站ID
  deviceId: string           // 设备ID
  compareDate: string        // 对比日期
  selectedParams: string[]   // 选择的参数
}

/**
 * 数据对比系列数据
 */
export interface CompareSeriesData {
  name: string               // 系列名称
  data: number[]             // 数据数组
  color: string              // 颜色
  yAxisIndex: number         // Y轴索引
}

/**
 * Y轴配置
 */
export interface YAxisConfig {
  name: string               // Y轴名称
  min?: number              // 最小值
  max?: number              // 最大值
}

/**
 * 数据对比结果
 */
export interface DataCompareResult {
  date: string               // 对比日期
  timeAxis: string[]         // 时间轴
  series: CompareSeriesData[] // 数据系列
  yAxis: YAxisConfig[]       // Y轴配置
}

/**
 * 数据对比响应
 */
export interface DataCompareResponse extends ApiResponse<{ compareResult: DataCompareResult }> {}

/**
 * 参数组
 */
export interface ParamGroup {
  groupName: string          // 参数组名称
  params: ParamItem[]        // 参数列表
}

/**
 * 参数项
 */
export interface ParamItem {
  name: string               // 参数名称
  unit: string               // 单位
  checked: boolean           // 是否选中
}

/**
 * 参数列表响应
 */
export interface CompareParamsResponse extends ApiResponse<{ paramGroups: ParamGroup[] }> {}

/**
 * 容量配置项
 */
export interface CapacityConfigItem {
  stringId: string           // 组串ID
  stringName: string         // 组串名称
  enabled: boolean           // 是否启用
  realTimeCurrent: number    // 实时电流
  stringCapacity: number     // 组串容量
}

/**
 * 容量配置请求
 */
export interface CapacityConfigRequest {
  configurations: CapacityConfigItem[] // 配置列表
}

/**
 * 容量配置响应
 */
export interface CapacityConfigResponse extends ApiResponse<BatchOperationData> {}
