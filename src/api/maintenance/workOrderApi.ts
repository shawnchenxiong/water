/**
 * 工单管理 API
 * @description 提供工单管理功能的完整接口
 */

import request from '@/utils/request'
import type {
  WorkOrderListResponse,
  WorkOrderQueryParams,
  WorkOrderBasicDataResponse,
  CreateWorkOrderFormData,
  UpdateWorkOrderFormData,
  WorkOrderFlowRequest,
  WorkflowConfigResponse,
  UpdateNodeConfigRequest,
} from '../types/work-order'
import {
  mockWorkOrderListData,
  mockBasicData,
  mockWorkflowConfig,
  mockWorkOrders,
} from '../mock/workOrderMock'

/**
 * 获取工单列表
 */
export function getWorkOrders(params: WorkOrderQueryParams): Promise<WorkOrderListResponse> {
  // 开发阶段使用 Mock 数据
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredData = [...mockWorkOrders]

      // Tab筛选
      if (params.tab) {
        const currentUserId = 'user001' // 模拟当前用户
        switch (params.tab) {
          case 'my-todo':
            filteredData = filteredData.filter(
              (item) => item.currentProcessorId === currentUserId && 
              ['待分派', '处理中'].includes(item.flowStatus)
            )
            break
          case 'my-done':
            filteredData = filteredData.filter(
              (item) => item.currentProcessorId === currentUserId && 
              ['已完成', '已关闭'].includes(item.flowStatus)
            )
            break
          case 'all':
          default:
            // 显示所有工单
            break
        }
      }

      // 电站筛选
      if (params.stationId) {
        filteredData = filteredData.filter((item) => item.stationId === params.stationId)
      }

      // 工单类型筛选
      if (params.workOrderType) {
        filteredData = filteredData.filter((item) => item.workOrderType === params.workOrderType)
      }

      // 工单来源筛选
      if (params.workOrderSource) {
        filteredData = filteredData.filter((item) => item.workOrderSource === params.workOrderSource)
      }

      // 流转状态筛选
      if (params.flowStatus) {
        filteredData = filteredData.filter((item) => item.flowStatus === params.flowStatus)
      }

      // 是否合并筛选
      if (params.isMerged !== undefined) {
        filteredData = filteredData.filter((item) => item.isMerged === params.isMerged)
      }

      // 工单编号筛选
      if (params.workOrderNumber) {
        const keyword = params.workOrderNumber.toLowerCase()
        filteredData = filteredData.filter((item) =>
          item.workOrderNumber.toLowerCase().includes(keyword)
        )
      }

      // 当前处理人筛选
      if (params.currentProcessor) {
        const keyword = params.currentProcessor.toLowerCase()
        filteredData = filteredData.filter((item) =>
          item.currentProcessor.toLowerCase().includes(keyword)
        )
      }

      // 开始时间筛选
      if (params.startTimeBegin || params.startTimeEnd) {
        filteredData = filteredData.filter((item) => {
          const startTime = new Date(item.startTime).getTime()
          const beginTime = params.startTimeBegin ? new Date(params.startTimeBegin).getTime() : 0
          const endTime = params.startTimeEnd ? new Date(params.startTimeEnd).getTime() : Infinity
          return startTime >= beginTime && startTime <= endTime
        })
      }

      // 结束时间筛选
      if (params.endTimeBegin || params.endTimeEnd) {
        filteredData = filteredData.filter((item) => {
          const endTime = new Date(item.endTime).getTime()
          const beginTime = params.endTimeBegin ? new Date(params.endTimeBegin).getTime() : 0
          const endTimeLimit = params.endTimeEnd ? new Date(params.endTimeEnd).getTime() : Infinity
          return endTime >= beginTime && endTime <= endTimeLimit
        })
      }

      // 排序
      const sortField = params.sortField || 'startTime'
      const sortOrder = params.sortOrder || 'desc'
      filteredData.sort((a, b) => {
        let aValue = (a as any)[sortField]
        let bValue = (b as any)[sortField]

        if (sortField === 'startTime' || sortField === 'endTime' || sortField === 'createTime') {
          aValue = new Date(aValue).getTime()
          bValue = new Date(bValue).getTime()
        }

        if (sortOrder === 'desc') {
          return bValue - aValue
        } else {
          return aValue - bValue
        }
      })

      // 分页
      const page = params.page || 1
      const pageSize = params.pageSize || 20
      const total = filteredData.length
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const paginatedData = filteredData.slice(start, end)

      resolve({
        workOrders: paginatedData,
        pagination: {
          current: page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      })
    }, 300)
  })

  // 生产环境使用真实 API
  // return request.get<WorkOrderListResponse>('/api/work-orders', { params })
}

/**
 * 获取基础数据
 */
export function getWorkOrderBasicData(): Promise<WorkOrderBasicDataResponse> {
  // 开发阶段使用 Mock 数据
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockBasicData)
    }, 200)
  })

  // 生产环境使用真实 API
  // return request.get<WorkOrderBasicDataResponse>('/api/work-orders/basic-data')
}

/**
 * 新增工单
 */
export function createWorkOrder(data: CreateWorkOrderFormData): Promise<{ workOrderId: string; workOrderNumber: string }> {
  // 开发阶段模拟创建
  return new Promise((resolve) => {
    setTimeout(() => {
      const workOrderId = `wo${Date.now()}`
      const workOrderNumber = `WO${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(mockWorkOrders.length + 1).padStart(4, '0')}`
      resolve({
        workOrderId,
        workOrderNumber,
      })
    }, 500)
  })

  // 生产环境使用真实 API
  // return request.post<{ workOrderId: string; workOrderNumber: string }>('/api/work-orders', data)
}

/**
 * 更新工单
 */
export function updateWorkOrder(data: UpdateWorkOrderFormData): Promise<void> {
  // 开发阶段模拟更新
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, 500)
  })

  // 生产环境使用真实 API
  // return request.put<void>(`/api/work-orders/${data.id}`, data)
}

/**
 * 删除工单
 */
export function deleteWorkOrder(workOrderId: string): Promise<void> {
  // 开发阶段模拟删除
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, 300)
  })

  // 生产环境使用真实 API
  // return request.delete<void>(`/api/work-orders/${workOrderId}`)
}

/**
 * 工单流转
 */
export function flowWorkOrder(workOrderId: string, data: WorkOrderFlowRequest): Promise<void> {
  // 开发阶段模拟流转
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, 500)
  })

  // 生产环境使用真实 API
  // return request.post<void>(`/api/work-orders/${workOrderId}/flow`, data)
}

/**
 * 获取流程配置
 */
export function getWorkflowConfig(workOrderTypeId?: string) {
  // 开发阶段使用 Mock 数据
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockWorkflowConfig)
    }, 200)
  })

  // 生产环境使用真实 API
  // return request.get(`/api/work-orders/workflow/${workOrderTypeId}`)
}

/**
 * 更新工作流配置
 */
export function updateWorkflowConfig(workOrderTypeId: string, config: any): Promise<void> {
  // 开发阶段模拟更新
  return new Promise((resolve) => {
    setTimeout(() => {
      // 更新 Mock 数据中的工作流配置
      Object.assign(mockWorkflowConfig, config)
      resolve()
    }, 500)
  })

  // 生产环境使用真实 API
  // return request.put(`/api/work-orders/workflow/${workOrderTypeId}`, config)
}

/**
 * 更新节点配置
 */
export function updateNodeConfig(data: UpdateNodeConfigRequest): Promise<void> {
  // 开发阶段模拟更新
  return new Promise((resolve) => {
    setTimeout(() => {
      // 更新Mock数据中的节点配置
      const node = mockWorkflowConfig.nodes.find(n => n.id === data.nodeId)
      if (node) {
        node.assignedUsers = [...data.assignedUsers]
      }
      resolve()
    }, 300)
  })

  // 生产环境使用真实 API
  // return request.put<void>('/api/work-orders/workflow-config', data)
}

/**
 * 获取工单详情
 */
export function getWorkOrderDetail(workOrderId: string) {
  // 开发阶段使用 Mock 数据
  return new Promise((resolve) => {
    setTimeout(() => {
      const workOrder = mockWorkOrders.find((item) => item.id === workOrderId)
      resolve(workOrder || null)
    }, 200)
  })

  // 生产环境使用真实 API
  // return request.get(`/api/work-orders/${workOrderId}`)
}
