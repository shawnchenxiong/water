/**
 * 设备台账 API
 * @description 提供设备台账的增删改查、导入导出等接口
 */

import request from '@/utils/request'
import type {
  DeviceLedgerListResponse,
  DeviceLedgerQueryParams,
  DeviceLedgerFormData,
  DeviceLedgerBasicData,
  BatchDeleteRequest,
  BatchDeleteResponse,
  ExportRequest,
  ImportResponse,
  UpdateDeviceStatusRequest,
} from '../types/device-ledger'
import {
  mockDeviceLedgerList,
  mockBasicData,
  mockStationTree,
} from '../mock/deviceLedgerMock'

/**
 * 获取设备台账列表
 */
export function getDeviceLedgerList(
  params: DeviceLedgerQueryParams
): Promise<DeviceLedgerListResponse> {
  // 开发阶段使用 Mock 数据
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredData = [...mockDeviceLedgerList.deviceLedger]

      // 电站筛选
      if (params.stationId) {
        filteredData = filteredData.filter((item) => item.stationId === params.stationId)
      }

      // 设备分类筛选
      if (params.deviceCategory && params.deviceCategory !== 'all') {
        filteredData = filteredData.filter(
          (item) => item.deviceCategoryCode === params.deviceCategory
        )
      }

      // 生产厂家模糊搜索
      if (params.manufacturer) {
        filteredData = filteredData.filter((item) =>
          item.manufacturer.toLowerCase().includes(params.manufacturer!.toLowerCase())
        )
      }

      // 设备类型模糊搜索
      if (params.deviceType) {
        filteredData = filteredData.filter((item) =>
          item.deviceType.toLowerCase().includes(params.deviceType!.toLowerCase())
        )
      }

      // 设备名称模糊搜索
      if (params.deviceName) {
        filteredData = filteredData.filter((item) =>
          item.deviceName.toLowerCase().includes(params.deviceName!.toLowerCase())
        )
      }

      // 设备状态筛选
      if (params.deviceStatus) {
        filteredData = filteredData.filter((item) => item.deviceStatus === params.deviceStatus)
      }

      // 分页
      const page = params.page || 1
      const pageSize = params.pageSize || 20
      const total = filteredData.length
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const paginatedData = filteredData.slice(start, end)

      resolve({
        deviceLedger: paginatedData,
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
  // return request.get<DeviceLedgerListResponse>('/api/device-ledger', { params })
}

/**
 * 获取基础数据（设备分类、厂商、状态等）
 */
export function getDeviceLedgerBasicData(): Promise<DeviceLedgerBasicData> {
  // 开发阶段使用 Mock 数据
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockBasicData)
    }, 200)
  })

  // 生产环境使用真实 API
  // return request.get<DeviceLedgerBasicData>('/api/device-ledger/basic-data')
}

/**
 * 获取电站树结构
 */
export function getStationTree() {
  // 开发阶段使用 Mock 数据
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockStationTree)
    }, 200)
  })

  // 生产环境使用真实 API
  // return request.get('/api/stations/tree')
}

/**
 * 新增设备记录
 */
export function createDeviceLedger(data: DeviceLedgerFormData): Promise<{ deviceId: string }> {
  // 开发阶段模拟创建
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        deviceId: `device${Date.now()}`,
      })
    }, 500)
  })

  // 生产环境使用真实 API
  // return request.post<{ deviceId: string }>('/api/device-ledger', data)
}

/**
 * 更新设备记录
 */
export function updateDeviceLedger(deviceId: string, data: DeviceLedgerFormData): Promise<void> {
  // 开发阶段模拟更新
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, 500)
  })

  // 生产环境使用真实 API
  // return request.put<void>(`/api/device-ledger/${deviceId}`, data)
}

/**
 * 删除设备记录
 */
export function deleteDeviceLedger(deviceId: string): Promise<void> {
  // 开发阶段模拟删除
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, 300)
  })

  // 生产环境使用真实 API
  // return request.delete<void>(`/api/device-ledger/${deviceId}`)
}

/**
 * 批量删除设备
 */
export function batchDeleteDevices(data: BatchDeleteRequest): Promise<BatchDeleteResponse> {
  // 开发阶段模拟批量删除
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        successCount: data.deviceIds.length,
        failedCount: 0,
      })
    }, 500)
  })

  // 生产环境使用真实 API
  // return request.delete<BatchDeleteResponse>('/api/device-ledger/batch', { data })
}

/**
 * 导出设备台账
 */
export function exportDeviceLedger(data: ExportRequest): Promise<Blob> {
  // 开发阶段模拟导出
  return new Promise((resolve) => {
    setTimeout(() => {
      // 创建一个简单的文本文件作为示例
      const blob = new Blob(['设备台账导出数据'], { type: 'application/vnd.ms-excel' })
      resolve(blob)
    }, 1000)
  })

  // 生产环境使用真实 API
  // return request.post<Blob>('/api/device-ledger/export', data, {
  //   responseType: 'blob',
  // })
}

/**
 * 导入设备数据
 */
export function importDeviceLedger(file: File, stationId: string): Promise<ImportResponse> {
  // 开发阶段模拟导入
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        totalCount: 100,
        successCount: 95,
        failedCount: 5,
        errorRows: [
          { row: 10, error: '设备编号重复' },
          { row: 25, error: '电站ID不存在' },
          { row: 48, error: '设备类型不合法' },
          { row: 67, error: '生产厂家为空' },
          { row: 89, error: '设备编号格式错误' },
        ],
      })
    }, 2000)
  })

  // 生产环境使用真实 API
  // const formData = new FormData()
  // formData.append('file', file)
  // formData.append('stationId', stationId)
  // return request.post<ImportResponse>('/api/device-ledger/import', formData, {
  //   headers: {
  //     'Content-Type': 'multipart/form-data',
  //   },
  // })
}

/**
 * 下载导入模板
 */
export function downloadImportTemplate(): Promise<Blob> {
  // 开发阶段模拟下载模板
  return new Promise((resolve) => {
    setTimeout(() => {
      const blob = new Blob(['设备台账导入模板'], { type: 'application/vnd.ms-excel' })
      resolve(blob)
    }, 500)
  })

  // 生产环境使用真实 API
  // return request.get<Blob>('/api/device-ledger/import-template', {
  //   responseType: 'blob',
  // })
}

/**
 * 更新设备状态
 */
export function updateDeviceStatus(
  deviceId: string,
  data: UpdateDeviceStatusRequest
): Promise<void> {
  // 开发阶段模拟更新状态
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, 300)
  })

  // 生产环境使用真实 API
  // return request.patch<void>(`/api/device-ledger/${deviceId}/status`, data)
}

/**
 * 获取设备详情
 */
export function getDeviceLedgerDetail(deviceId: string) {
  // 开发阶段使用 Mock 数据
  return new Promise((resolve) => {
    setTimeout(() => {
      const device = mockDeviceLedgerList.deviceLedger.find((item) => item.id === deviceId)
      resolve(device || null)
    }, 200)
  })

  // 生产环境使用真实 API
  // return request.get(`/api/device-ledger/${deviceId}`)
}

