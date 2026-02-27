/**
 * 运维计划 API
 * @description 提供运维计划管理功能的完整接口
 */

import request from '@/utils/request'
import type {
  MaintenancePlanListResponse,
  MaintenancePlanQueryParams,
  MaintenancePlanBasicDataResponse,
  CreateMaintenancePlanRequest,
  UpdateMaintenancePlanRequest,
  UpdatePlanStatusRequest,
  CreateMaintenancePlanResponse,
  MaintenancePlan,
} from '../types/maintenance-plan'
import {
  mockMaintenancePlanListData,
  mockBasicData,
  mockMaintenancePlans,
} from '../mock/maintenancePlanMock'

/**
 * 获取运维计划列表
 */
export function getMaintenancePlans(params: MaintenancePlanQueryParams): Promise<MaintenancePlanListResponse> {
  // 开发阶段使用 Mock 数据
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredData = [...mockMaintenancePlans]

      // 电站筛选
      if (params.stationId) {
        filteredData = filteredData.filter((item) => item.stationId === params.stationId)
      }

      // 计划名称筛选
      if (params.planName) {
        const keyword = params.planName.toLowerCase()
        filteredData = filteredData.filter((item) =>
          item.planName.toLowerCase().includes(keyword)
        )
      }

      // 计划状态筛选
      if (params.planStatus) {
        filteredData = filteredData.filter((item) => item.planStatus === params.planStatus)
      }

      // 工单类型筛选
      if (params.workOrderType) {
        filteredData = filteredData.filter((item) => item.workOrderType === params.workOrderType)
      }

      // 循环周期筛选
      if (params.cycleType) {
        filteredData = filteredData.filter((item) => item.cycleType === params.cycleType)
      }

      // 更新时间筛选
      if (params.updateTimeStart || params.updateTimeEnd) {
        filteredData = filteredData.filter((item) => {
          const updateTime = new Date(item.updateTime).getTime()
          const startTime = params.updateTimeStart ? new Date(params.updateTimeStart).getTime() : 0
          const endTime = params.updateTimeEnd ? new Date(params.updateTimeEnd).getTime() : Infinity
          return updateTime >= startTime && updateTime <= endTime
        })
      }

      // 结束时间筛选
      if (params.endTimeStart || params.endTimeEnd) {
        filteredData = filteredData.filter((item) => {
          if (!item.cycleEndTime) return false
          const endTime = new Date(item.cycleEndTime).getTime()
          const startTime = params.endTimeStart ? new Date(params.endTimeStart).getTime() : 0
          const endTimeLimit = params.endTimeEnd ? new Date(params.endTimeEnd).getTime() : Infinity
          return endTime >= startTime && endTime <= endTimeLimit
        })
      }

      // 排序
      const sortField = params.sortField || 'updateTime'
      const sortOrder = params.sortOrder || 'desc'
      filteredData.sort((a, b) => {
        let aValue = (a as any)[sortField]
        let bValue = (b as any)[sortField]

        if (sortField === 'updateTime' || sortField === 'createTime' || sortField.includes('Time')) {
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
        maintenancePlans: paginatedData,
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
  // return request.get<MaintenancePlanListResponse>('/api/maintenance-plans', { params })
}

/**
 * 获取基础数据
 */
export function getMaintenancePlanBasicData(): Promise<MaintenancePlanBasicDataResponse> {
  // 开发阶段使用 Mock 数据
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockBasicData)
    }, 200)
  })

  // 生产环境使用真实 API
  // return request.get<MaintenancePlanBasicDataResponse>('/api/maintenance-plans/basic-data')
}

/**
 * 新增运维计划
 */
export function createMaintenancePlan(data: CreateMaintenancePlanRequest): Promise<CreateMaintenancePlanResponse> {
  // 开发阶段模拟创建
  return new Promise((resolve) => {
    setTimeout(() => {
      const planId = `plan${Date.now()}`
      resolve({
        planId,
        message: '新增成功',
      })
    }, 500)
  })

  // 生产环境使用真实 API
  // return request.post<CreateMaintenancePlanResponse>('/api/maintenance-plans', data)
}

/**
 * 更新运维计划
 */
export function updateMaintenancePlan(data: UpdateMaintenancePlanRequest): Promise<void> {
  // 开发阶段模拟更新
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, 500)
  })

  // 生产环境使用真实 API
  // return request.put<void>(`/api/maintenance-plans/${data.id}`, data)
}

/**
 * 删除运维计划
 */
export function deleteMaintenancePlan(planId: string): Promise<void> {
  // 开发阶段模拟删除
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, 300)
  })

  // 生产环境使用真实 API
  // return request.delete<void>(`/api/maintenance-plans/${planId}`)
}

/**
 * 更新计划状态
 */
export function updatePlanStatus(planId: string, data: UpdatePlanStatusRequest): Promise<void> {
  // 开发阶段模拟状态更新
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, 300)
  })

  // 生产环境使用真实 API
  // return request.patch<void>(`/api/maintenance-plans/${planId}/status`, data)
}

/**
 * 获取运维计划详情
 */
export function getMaintenancePlanDetail(planId: string): Promise<MaintenancePlan> {
  // 开发阶段使用 Mock 数据
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const plan = mockMaintenancePlans.find((item) => item.id === planId)
      if (plan) {
        resolve(plan)
      } else {
        reject(new Error('计划不存在'))
      }
    }, 200)
  })

  // 生产环境使用真实 API
  // return request.get<MaintenancePlan>(`/api/maintenance-plans/${planId}`)
}
