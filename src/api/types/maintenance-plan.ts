/**
 * 运维计划相关类型定义
 * @description 定义运维计划功能的所有数据结构和接口类型
 */

// ==================== 基础类型 ====================

/**
 * 运维计划记录
 */
export interface MaintenancePlan {
  id: string                    // 计划ID
  planName: string             // 计划名称
  planStatus: string           // 计划状态
  statusColor: string          // 状态颜色
  workOrderType: string        // 工单类型
  stationName: string          // 电站名称
  stationId: string            // 电站ID
  firstStartTime: string       // 首次工单开始时间
  nextStartTime?: string       // 下次工单开始时间
  cycleType?: string           // 循环周期
  cycleEndTime?: string        // 循环截止时间
  updater: string              // 更新人
  updaterId: string            // 更新人ID
  updateTime: string           // 更新时间
  createTime: string           // 创建时间
  
  // 详细信息字段
  workOrderLevel?: string      // 工单级别
  workOrderDescription?: string // 工单描述
  isEnabled?: boolean          // 是否启用
  approver?: string            // 审批人
  approverId?: string          // 审批人ID
  processor: string            // 处理人
  processorId: string          // 处理人ID
  otherProcessors?: string[]   // 其他处理人
  otherProcessorIds?: string[] // 其他处理人ID
  firstEndTime?: string        // 首次工单完成时间
  processingAdvice?: string    // 处理建议
  attachments?: string[]       // 附件列表
  workOrderObjects?: PlanObject[] // 工单对象
}

/**
 * 计划对象
 */
export interface PlanObject {
  id?: string                  // 对象ID
  serialNumber: number         // 序号
  stationId: string            // 电站ID
  stationName: string          // 电站名称
  objectDescription?: string   // 对象描述
}

/**
 * 工单类型选项
 */
export interface WorkOrderType {
  value: string                // 类型值
  label: string                // 显示标签
  icon: string                 // 图标
  color: string                // 颜色
}

/**
 * 用户信息
 */
export interface User {
  id: string                   // 用户ID
  name: string                 // 用户名称
  role: string                 // 用户角色
  department?: string          // 部门
}

/**
 * 电站信息
 */
export interface Station {
  id: string                   // 电站ID
  name: string                 // 电站名称
  capacity?: string            // 装机容量
  status?: string              // 运行状态
}

// ==================== 请求参数类型 ====================

/**
 * 运维计划查询参数
 */
export interface MaintenancePlanQueryParams {
  stationId?: string           // 电站ID
  planName?: string            // 计划名称（模糊搜索）
  planStatus?: string          // 计划状态
  workOrderType?: string       // 工单类型
  cycleType?: string           // 循环周期
  updateTimeStart?: string     // 更新时间开始
  updateTimeEnd?: string       // 更新时间结束
  endTimeStart?: string        // 结束时间开始
  endTimeEnd?: string          // 结束时间结束
  page?: number                // 页码
  pageSize?: number            // 每页数量
  sortField?: string           // 排序字段
  sortOrder?: 'asc' | 'desc'   // 排序方向
}

/**
 * 新增运维计划请求
 */
export interface CreateMaintenancePlanRequest {
  planName: string             // 计划名称
  workOrderType: string        // 工单类型
  workOrderObjects: PlanObject[] // 工单对象
  workOrderLevel: string       // 工单级别
  workOrderDescription?: string // 工单描述
  isEnabled: boolean           // 是否启用
  approver?: string            // 审批人
  processor: string            // 处理人
  otherProcessors?: string[]   // 其他处理人
  firstStartTime: string       // 首次工单开始时间
  firstEndTime: string         // 首次工单完成时间
  cycleType?: string           // 循环周期
  cycleEndTime?: string        // 循环截止时间
  processingAdvice?: string    // 处理建议
  attachments?: string[]       // 附件
}

/**
 * 更新运维计划请求
 */
export interface UpdateMaintenancePlanRequest extends CreateMaintenancePlanRequest {
  id: string                   // 计划ID
}

/**
 * 更新计划状态请求
 */
export interface UpdatePlanStatusRequest {
  status: string               // 状态
}

// ==================== 响应类型 ====================

/**
 * 运维计划列表响应
 */
export interface MaintenancePlanListResponse {
  maintenancePlans: MaintenancePlan[]
  pagination: {
    current: number
    pageSize: number
    total: number
    totalPages: number
  }
}

/**
 * 基础数据响应
 */
export interface MaintenancePlanBasicDataResponse {
  workOrderTypes: WorkOrderType[]
  users: User[]
  stations: Station[]
  planStatuses: { label: string; value: string; color?: string }[]
  cycleTypes: { label: string; value: string }[]
  workOrderLevels: { label: string; value: string; color?: string }[]
}

/**
 * 创建计划响应
 */
export interface CreateMaintenancePlanResponse {
  planId: string
  message: string
}

// ==================== 表单类型 ====================

/**
 * 筛选表单数据
 */
export interface FilterFormData {
  planName: string
  planStatus: string
  workOrderType: string
  cycleType: string
  updateTimeRange: string[]
  endTimeRange: string[]
}

/**
 * 计划表单数据
 */
export interface PlanFormData {
  planName: string
  workOrderType: string
  workOrderObjects: PlanObject[]
  workOrderLevel: string
  workOrderDescription: string
  isEnabled: boolean
  approver: string
  processor: string
  otherProcessors: string[]
  firstStartTime: string
  firstEndTime: string
  cycleType: string
  cycleEndTime: string
  processingAdvice: string
  attachments: string[]
}

// ==================== 常量定义 ====================

/**
 * 计划状态常量
 */
export const PLAN_STATUS = {
  ACTIVE: '进行中',
  COMPLETED: '已完成',
  PAUSED: '暂停',
  CANCELLED: '已取消',
} as const

/**
 * 循环周期常量
 */
export const CYCLE_TYPE = {
  DAILY: '日',
  WEEKLY: '周',
  MONTHLY: '月',
  QUARTERLY: '季度',
  YEARLY: '年',
} as const

/**
 * 工单级别常量
 */
export const WORK_ORDER_LEVEL = {
  ROUTINE: '常规',
  URGENT: '紧急',
  IMPORTANT: '重要',
} as const

/**
 * 工单类型常量
 */
export const WORK_ORDER_TYPE = {
  REPAIR: '检修工单',
  MAINTENANCE: '维护工单',
  INSPECTION: '巡检工单',
  CLEANING: '清洁工单',
  OTHER: '其他工单',
} as const

// ==================== 类型导出 ====================

export type PlanStatus = typeof PLAN_STATUS[keyof typeof PLAN_STATUS]
export type CycleType = typeof CYCLE_TYPE[keyof typeof CYCLE_TYPE]
export type WorkOrderLevel = typeof WORK_ORDER_LEVEL[keyof typeof WORK_ORDER_LEVEL]
export type WorkOrderTypeValue = typeof WORK_ORDER_TYPE[keyof typeof WORK_ORDER_TYPE]
