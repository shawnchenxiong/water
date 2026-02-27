/**
 * 设备运行诊断Mock数据
 */

import type {
  DeviceOperationStatistics,
  DeviceOperationListResponse,
  DeviceOperationTrendResponse,
  DeviceTypeListResponse,
  DeviceOperationDetailedReport
} from '@/api/types/diagnosis/deviceOperation'

/**
 * Mock - 设备运行统计数据
 */
export const mockDeviceOperationStatistics: DeviceOperationStatistics = {
  summary: {
    operationIndex: 100,
    operationLevel: '优秀',
    suggestion: '设备运行健康状态较高',
    totalDevices: 48,
    normalDevices: 48,
    abnormalDevices: 0
  },
  chartData: {
    categories: ['0分-80分', '80分-90分', '90分-100分', '100分'],
    deviceCounts: [0, 0, 0, 48],
    operationRates: [0, 0, 0, 100]
  }
}

/**
 * Mock - 设备运行列表数据
 */
export const mockDeviceOperationList: DeviceOperationListResponse = {
  devices: Array.from({ length: 48 }, (_, i) => ({
    deviceType: '逆变器',
    deviceName: `CN-N${String(Math.floor(i / 100) + 1).padStart(2, '0')}${String((i % 100) + 1).padStart(2, '0')}`,
    deviceId: `device_${i + 1}`,
    operationIndex: 100,
    generationTime: 7,
    downTime: 0,
    interruptTime: 0
  })),
  pagination: {
    total: 48,
    page: 1,
    pageSize: 20,
    totalPages: 3
  }
}

/**
 * Mock - 设备运行趋势数据
 */
export const mockDeviceOperationTrend: DeviceOperationTrendResponse = {
  deviceName: 'CN-N0702',
  trendData: {
    dates: Array.from({ length: 31 }, (_, i) => `2025-10-${String(i + 1).padStart(2, '0')}`),
    operationIndex: [
      ...Array(19).fill(100), // 前19天正常100分
      0, // 第20天异常0分
      ...Array(11).fill(100) // 后续恢复100分
    ],
    events: [
      {
        date: '2025-10-20',
        type: 'operation_abnormal',
        description: '设备运行异常',
        operationIndex: 0
      }
    ]
  }
}

/**
 * Mock - 设备类型列表
 */
export const mockDeviceTypeList: DeviceTypeListResponse = {
  deviceTypes: [
    { code: 'inverter', name: '逆变器' },
    { code: 'combiner', name: '汇流箱' },
    { code: 'transformer', name: '变压器' },
    { code: 'meter', name: '电表' }
  ]
}

/**
 * Mock - 设备运行详细报告
 */
export const mockDeviceOperationReport: DeviceOperationDetailedReport = {
  reportSummary: {
    totalOperationTime: 168,
    normalOperationTime: 161,
    downTime: 0,
    interruptTime: 7,
    overallOperationRate: 95.8
  },
  operationDetails: Array.from({ length: 31 }, (_, i) => ({
    date: `2025-10-${String(i + 1).padStart(2, '0')}`,
    operationIndex: i === 19 ? 0 : 100,
    generationTime: i === 19 ? 0 : 7,
    downTime: 0,
    interruptTime: i === 19 ? 7 : 0,
    events: i === 19 ? [{
      date: `2025-10-${String(i + 1).padStart(2, '0')}`,
      type: 'operation_abnormal',
      description: '设备运行异常',
      operationIndex: 0
    }] : []
  }))
}

