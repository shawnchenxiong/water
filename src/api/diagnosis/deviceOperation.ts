/**
 * 设备运行诊断API接口
 */

import request from '@/utils/request'
import type {
  DeviceOperationStatistics,
  DeviceOperationListResponse,
  DeviceOperationTrendResponse,
  DeviceTypeListResponse,
  DeviceOperationDetailedReport,
  DeviceOperationExportRequest,
  DeviceOperationExportResponse,
  DeviceOperationQueryParams,
  DeviceTrendQueryParams
} from '@/api/types/diagnosis/deviceOperation'

import {
  mockDeviceOperationStatistics,
  mockDeviceOperationList,
  mockDeviceOperationTrend,
  mockDeviceTypeList,
  mockDeviceOperationReport
} from '@/api/mock/deviceOperation'

const useMock = import.meta.env.MOCK !== 'false'

/**
 * 根据stationId生成不同的随机mock数据
 */
function generateMockStatistics(stationId: string): DeviceOperationStatistics {
  // 使用stationId生成一个简单的种子值
  const seed = stationId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  
  // 生成70-100之间的运行指数
  const operationIndex = 70 + (seed % 31)
  
  // 生成30-60之间的设备总数
  const totalDevices = 30 + (seed % 31)
  
  // 根据运行指数计算正常和异常设备数
  const abnormalDevices = Math.floor(totalDevices * (100 - operationIndex) / 100)
  const normalDevices = totalDevices - abnormalDevices
  
  // 生成运行等级和建议
  let operationLevel = '良好'
  let suggestion = '设备运行健康状态良好'
  if (operationIndex >= 95) {
    operationLevel = '优秀'
    suggestion = '设备运行健康状态较高'
  } else if (operationIndex >= 85) {
    operationLevel = '良好'
    suggestion = '设备运行健康状态良好'
  } else if (operationIndex >= 75) {
    operationLevel = '一般'
    suggestion = '部分设备运行状态需关注'
  } else {
    operationLevel = '较差'
    suggestion = '存在多个设备运行异常，建议尽快处理'
  }
  
  // 生成图表数据
  const range0_80 = Math.floor(totalDevices * 0.1 * (100 - operationIndex) / 100)
  const range80_90 = Math.floor(totalDevices * 0.2 * (100 - operationIndex) / 100)
  const range90_100 = Math.floor(totalDevices * 0.3)
  const range100 = totalDevices - range0_80 - range80_90 - range90_100
  
  return {
    summary: {
      operationIndex,
      operationLevel,
      suggestion,
      totalDevices,
      normalDevices,
      abnormalDevices
    },
    chartData: {
      categories: ['0分-80分', '80分-90分', '90分-100分', '100分'],
      deviceCounts: [range0_80, range80_90, range90_100, range100],
      operationRates: [
        range0_80 > 0 ? Math.round((range0_80 / totalDevices) * 100) : 0,
        range80_90 > 0 ? Math.round((range80_90 / totalDevices) * 100) : 0,
        range90_100 > 0 ? Math.round((range90_100 / totalDevices) * 100) : 0,
        range100 > 0 ? Math.round((range100 / totalDevices) * 100) : 0
      ]
    }
  }
}

/**
 * 根据stationId生成不同的设备列表
 */
function generateMockDeviceList(stationId: string, totalDevices: number) {
  const seed = stationId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  
  return Array.from({ length: totalDevices }, (_, i) => {
    const indexSeed = seed + i
    const operationIndex = 70 + (indexSeed % 31)
    const generationTime = Math.floor(5 + (indexSeed % 4))
    const downTime = operationIndex < 90 ? Math.floor(indexSeed % 3) : 0
    const interruptTime = operationIndex < 85 ? Math.floor(indexSeed % 2) : 0
    
    return {
      deviceType: '逆变器',
      deviceName: `CN-N${String(Math.floor(i / 100) + 1).padStart(2, '0')}${String((i % 100) + 1).padStart(2, '0')}`,
      deviceId: `device_${stationId}_${i + 1}`,
      operationIndex,
      generationTime,
      downTime,
      interruptTime
    }
  })
}

/**
 * 获取设备运行统计数据
 */
export async function getDeviceOperationStatistics(
  params: DeviceOperationQueryParams
): Promise<DeviceOperationStatistics> {
  if (useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateMockStatistics(params.stationId))
      }, 500)
    })
  }

  const response = await request.get('/api/intelligent-diagnosis/device-operation/statistics', {
    params
  })
  return response.data
}

/**
 * 获取设备运行列表
 */
export async function getDeviceOperationList(
  params: DeviceOperationQueryParams
): Promise<DeviceOperationListResponse> {
  if (useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { page = 1, pageSize = 20, stationId } = params
        
        // 根据stationId生成设备数据
        const statistics = generateMockStatistics(stationId)
        const allDevices = generateMockDeviceList(stationId, statistics.summary.totalDevices)
        
        const start = (page - 1) * pageSize
        const end = start + pageSize
        
        resolve({
          devices: allDevices.slice(start, end),
          pagination: {
            total: allDevices.length,
            page,
            pageSize,
            totalPages: Math.ceil(allDevices.length / pageSize)
          }
        })
      }, 500)
    })
  }

  const response = await request.get('/api/intelligent-diagnosis/device-operation/devices', {
    params
  })
  return response.data
}

/**
 * 获取设备运行趋势
 */
export async function getDeviceOperationTrend(
  params: DeviceTrendQueryParams
): Promise<DeviceOperationTrendResponse> {
  if (useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockDeviceOperationTrend)
      }, 500)
    })
  }

  const response = await request.get('/api/intelligent-diagnosis/device-operation/device-trend', {
    params
  })
  return response.data
}

/**
 * 获取设备类型列表
 */
export async function getDeviceTypeList(stationId: string): Promise<DeviceTypeListResponse> {
  if (useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockDeviceTypeList)
      }, 300)
    })
  }

  const response = await request.get('/api/intelligent-diagnosis/device-operation/device-types', {
    params: { stationId }
  })
  return response.data
}

/**
 * 获取设备运行详细报告
 */
export async function getDeviceOperationDetailedReport(
  params: {
    stationId: string
    deviceId?: string
    startDate: string
    endDate: string
  }
): Promise<DeviceOperationDetailedReport> {
  if (useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockDeviceOperationReport)
      }, 500)
    })
  }

  const response = await request.get(
    '/api/intelligent-diagnosis/device-operation/detailed-report',
    {
      params
    }
  )
  return response.data
}

/**
 * 导出设备运行报告
 */
export async function exportDeviceOperationReport(
  data: DeviceOperationExportRequest
): Promise<DeviceOperationExportResponse> {
  if (useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          downloadUrl: 'https://example.com/reports/device-operation-202510.xlsx',
          fileName: '设备运行诊断报告-202510.xlsx'
        })
      }, 1000)
    })
  }

  const response = await request.post('/api/intelligent-diagnosis/device-operation/export', data)
  return response.data
}

