/**
 * 工单管理相关类型定义
 * @description 定义工单管理功能的所有数据结构和接口类型
 */

// ==================== 基础类型 ====================

/**
 * 工单记录
 */
export interface WorkOrder {
  id: string                    // 工单ID
  serialNumber: number          // 序号
  stationName: string          // 电站名称
  stationId: string            // 电站ID
  workOrderType: string        // 工单类型
  workOrderSource: string      // 工单来源
  workOrderNumber: string      // 工单编号
  workOrderDescription: string // 工单描述
  flowStatus: string           // 流转状态
  statusColor: string          // 状态颜色
  currentProcessor: string     // 当前处理人
  currentProcessorId: string   // 当前处理人ID
  startTime: string           // 工单开始时间
  endTime: string             // 工单完成时间
  actualStartTime?: string    // 实际开始时间
  actualEndTime?: string      // 实际完成时间
  createTime: string          // 创建时间
  creator: string             // 创建人
  creatorId: string           // 创建人ID
  workOrderLevel?: string     // 工单级别
  enableAlert?: boolean       // 是否开启预警
  processingAdvice?: string   // 处理建议
  attachments?: string[]      // 附件列表
  isMerged?: boolean         // 是否合并
  plannedCompletionTime: string // 计划完成时间
  actualCompletionTime?: string // 实际完成时间
  priority: string            // 优先级
  workOrderObjects?: WorkOrderObject[] // 工单对象
  flowRecords?: FlowRecord[]  // 流转记录
}

/**
 * 工单类型选项
 */
export interface WorkOrderType {
  value: string    // 类型值
  label: string    // 显示标签
  icon: string     // 图标
  color: string    // 颜色
}

/**
 * 工单对象
 */
export interface WorkOrderObject {
  serialNumber: number     // 序号
  stationId: string       // 电站ID
  stationName: string     // 电站名称
  objectDescription: string // 对象描述
}

/**
 * 用户信息
 */
export interface WorkOrderUser {
  id: string        // 用户ID
  name: string      // 用户名称
  role: string      // 角色
  department: string // 部门
}

// ==================== 查询参数 ====================

/**
 * 工单查询参数
 */
export interface WorkOrderQueryParams {
  tab?: 'my-todo' | 'my-done' | 'all'  // Tab类型
  stationId?: string                    // 电站ID
  workOrderType?: string               // 工单类型
  workOrderSource?: string             // 工单来源
  flowStatus?: string                  // 流转状态
  isMerged?: boolean                   // 是否合并
  workOrderNumber?: string             // 工单编号
  currentProcessor?: string            // 当前处理人
  startTimeBegin?: string             // 开始时间开始
  startTimeEnd?: string               // 开始时间结束
  endTimeBegin?: string               // 结束时间开始
  endTimeEnd?: string                 // 结束时间结束
  page?: number                       // 页码
  pageSize?: number                   // 每页数量
  sortField?: string                  // 排序字段
  sortOrder?: 'asc' | 'desc'         // 排序方向
}

// ==================== 响应数据 ====================

/**
 * 工单列表响应
 */
export interface WorkOrderListResponse {
  workOrders: WorkOrder[]
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
export interface WorkOrderBasicDataResponse {
  workOrderTypes: WorkOrderType[]
  workOrderSources: Array<{ value: string; label: string }>
  flowStatuses: Array<{ value: string; label: string; color: string }>
  workOrderLevels: Array<{ value: string; label: string }>
  users: WorkOrderUser[]
  stations: Array<{ id: string; name: string }>
}

// ==================== 表单数据 ====================

/**
 * 新增工单表单数据
 */
export interface CreateWorkOrderFormData {
  workOrderType: string              // 工单类型
  workOrderObjects: WorkOrderObject[] // 工单对象列表
  workOrderLevel: string             // 工单级别
  workOrderDescription: string       // 工单描述
  enableAlert: boolean              // 是否开启预警
  processor: string                 // 处理人
  otherProcessors: string[]         // 其他处理人
  startTime: string                 // 开始时间
  endTime: string                   // 结束时间
  processingAdvice?: string         // 处理建议
  attachments?: string[]            // 附件
}

/**
 * 更新工单表单数据
 */
export interface UpdateWorkOrderFormData extends CreateWorkOrderFormData {
  id: string // 工单ID
}

// ==================== 流程配置 ====================

/**
 * 流程节点
 */
export interface WorkflowNode {
  id: string           // 节点ID
  name: string         // 节点名称
  type: 'start' | 'task' | 'approve' | 'countersign' | 'end' // 节点类型
  nodeCount?: number   // 节点数量
  assignedUsers?: string[] // 分配的用户
  x: number           // X坐标
  y: number           // Y坐标
}

/**
 * 流程连线
 */
export interface WorkflowEdge {
  id: string     // 连线ID
  source: string // 源节点ID
  target: string // 目标节点ID
}

/**
 * 工作流配置
 */
export interface WorkflowConfig {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}

/**
 * 流程配置响应
 */
export interface WorkflowConfigResponse {
  workflowConfig: WorkflowConfig
}

/**
 * 更新节点配置请求
 */
export interface UpdateNodeConfigRequest {
  nodeId: string         // 节点ID
  assignedUsers: string[] // 分配的用户
}

// ==================== 工单流转 ====================

/**
 * 工单流转请求
 */
export interface WorkOrderFlowRequest {
  action: 'approve' | 'reject' | 'complete' | 'assign' // 流转动作
  nextProcessor?: string   // 下一处理人
  processingComment: string // 处理意见
  attachments?: string[]   // 附件
}

/**
 * 工单流转记录
 */
export interface WorkOrderFlowRecord {
  id: string           // 记录ID
  workOrderId: string  // 工单ID
  nodeId: string       // 节点ID
  nodeName: string     // 节点名称
  processor: string    // 处理人
  processorId: string  // 处理人ID
  action: string       // 处理动作
  processingComment: string // 处理意见
  processTime: string  // 处理时间
  attachments?: string[] // 附件
}

// 流转记录类型别名
export type FlowRecord = WorkOrderFlowRecord

// ==================== 常量定义 ====================

/**
 * 工单类型常量
 */
export const WORK_ORDER_TYPES = {
  REPAIR: '检修工单',
  MAINTENANCE: '维护工单',
  INSPECTION: '巡检工单',
  CLEANING: '清洁工单',
  OPERATION: '运检工单',
  OTHER: '其他工单',
} as const

/**
 * 工单来源常量
 */
export const WORK_ORDER_SOURCES = {
  PLAN: '运维计划',
  INSPECTION: '巡检发现',
  ALARM: '故障报警',
  MANUAL: '手动创建',
} as const

/**
 * 流转状态常量
 */
export const FLOW_STATUSES = {
  PENDING_ASSIGN: '待分派',
  PROCESSING: '处理中',
  PENDING_REVIEW: '待审核',
  COMPLETED: '已完成',
  CLOSED: '已关闭',
} as const

/**
 * 工单级别常量
 */
export const WORK_ORDER_LEVELS = {
  NORMAL: '常规',
  URGENT: '紧急',
  IMPORTANT: '重要',
} as const

/**
 * Tab类型常量
 */
export const TAB_TYPES = {
  MY_TODO: 'my-todo',
  MY_DONE: 'my-done',
  ALL: 'all',
} as const

/**
 * 流转动作常量
 */
export const FLOW_ACTIONS = {
  APPROVE: 'approve',
  REJECT: 'reject',
  COMPLETE: 'complete',
  ASSIGN: 'assign',
} as const

// ==================== 类型导出 ====================

export type WorkOrderTypeValue = typeof WORK_ORDER_TYPES[keyof typeof WORK_ORDER_TYPES]
export type WorkOrderSourceValue = typeof WORK_ORDER_SOURCES[keyof typeof WORK_ORDER_SOURCES]
export type FlowStatusValue = typeof FLOW_STATUSES[keyof typeof FLOW_STATUSES]
export type WorkOrderLevelValue = typeof WORK_ORDER_LEVELS[keyof typeof WORK_ORDER_LEVELS]
export type TabTypeValue = typeof TAB_TYPES[keyof typeof TAB_TYPES]
export type FlowActionValue = typeof FLOW_ACTIONS[keyof typeof FLOW_ACTIONS]
