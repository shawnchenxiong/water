/**
 * 数据质量诊断API接口
 */

import request from '@/utils/request'
import type {
  DataQualityStatistics,
  DataQualityListResponse,
  DataQualityQueryParams,
  DeviceTrendQueryParams,
  DeviceTrendResponse
} from '@/api/types/diagnosis/dataQuality'

import {
  generateMockDataQualityStatistics,
  generateMockDeviceList,
  mockDeviceTypes,
  generateMockDeviceTrend
} from '@/api/mock/dataQuality'

const useMock = import.meta.env.MOCK !== 'false'

/**
 * 获取数据质量统计
 */
export async function getDataQualityStatistics(
  params: DataQualityQueryParams
): Promise<DataQualityStatistics> {
  if (useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateMockDataQualityStatistics(params.stationId))
      }, 500)
    })
  }

  const response = await request.get('/api/intelligent-diagnosis/data-quality/statistics', {
    params
  })
  return response.data
}

/**
 * 获取设备数据质量列表
 */
export async function getDeviceDataQualityList(
  params: DataQualityQueryParams
): Promise<DataQualityListResponse> {
  if (useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { page = 1, pageSize = 20, stationId } = params
        const statistics = generateMockDataQualityStatistics(stationId)
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

  const response = await request.get('/api/intelligent-diagnosis/data-quality/devices', {
    params
  })
  return response.data
}

/**
 * 获取设备类型列表
 */
export async function getDeviceTypeList(stationId: string) {
  if (useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ deviceTypes: mockDeviceTypes })
      }, 300)
    })
  }

  const response = await request.get('/api/intelligent-diagnosis/data-quality/device-types', {
    params: { stationId }
  })
  return response.data
}

/**
 * 获取设备质量趋势
 */
export async function getDeviceTrend(
  params: DeviceTrendQueryParams
): Promise<DeviceTrendResponse> {
  if (useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateMockDeviceTrend(params.deviceId, params.startDate, params.endDate))
      }, 500)
    })
  }

  const response = await request.get('/api/intelligent-diagnosis/data-quality/device-trend', {
    params
  })
  return response.data
}

