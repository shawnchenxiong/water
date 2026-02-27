/**
 * 数据质量诊断Mock数据
 */

import type {
  DataQualityStatistics,
  DataQualityListResponse,
  DeviceDataQuality,
  DeviceType,
  DeviceTrendResponse
} from '@/api/types/diagnosis/dataQuality'

/**
 * 根据stationId生成数据质量统计
 * 参考UI设计图：质量评分91.92分，48台设备，47台90-100分，1台100分
 */
export function generateMockDataQualityStatistics(stationId: string): DataQualityStatistics {
  // 固定48台设备，参考UI设计图
  const totalDevices = 48
  const range0_80 = 0
  const range80_90 = 0
  const range90_100 = 47
  const range100 = 1
  
  return {
    summary: {
      qualityScore: 91.92,
      qualityLevel: '良好',
      suggestion: '电站关键设备的通讯可靠性和数据质量较一般',
      totalDevices: 48,
      normalDevices: 47,
      abnormalDevices: 1
    },
    chartData: {
      categories: ['0分-80分', '80分-90分', '90分-100分', '100分'],
      deviceCounts: [0, 0, 47, 1],
      // 参考UI设计图折线趋势：从低到高再下降
      qualityRates: [0, 47, 97, 9]
    }
  }
}

/**
 * 根据stationId生成设备列表
 * 参考UI设计图：47台设备92分，1台设备100分
 */
export function generateMockDeviceList(stationId: string, totalDevices: number): DeviceDataQuality[] {
  // 设备命名参考UI设计图
  const deviceNames = [
    'CN-N0203', 'CN-N0501', 'CN-N0403', 'CN-N1203', 'CN-N1101', 'CN-N1302', 'CN-N0303',
    'CN-N0601', 'CN-N0701', 'CN-N0801', 'CN-N0901', 'CN-N1001', 'CN-N1401', 'CN-N1501',
    'CN-N0202', 'CN-N0402', 'CN-N0502', 'CN-N0602', 'CN-N0702', 'CN-N0802', 'CN-N0902',
    'CN-N1002', 'CN-N1102', 'CN-N1202', 'CN-N1301', 'CN-N1402', 'CN-N1502', 'CN-N0201',
    'CN-N0301', 'CN-N0401', 'CN-N0503', 'CN-N0603', 'CN-N0703', 'CN-N0803', 'CN-N0903',
    'CN-N1003', 'CN-N1103', 'CN-N1204', 'CN-N1303', 'CN-N1403', 'CN-N1503', 'CN-N0204',
    'CN-N0304', 'CN-N0404', 'CN-N0504', 'CN-N0604', 'CN-N0704', 'CN-N0804'
  ]
  
  return Array.from({ length: totalDevices }, (_, i) => {
    const deviceName = deviceNames[i] || `CN-N${String(i + 1).padStart(4, '0')}`
    const qualityIndex = i === totalDevices - 1 ? 100 : 92
    
    return {
      deviceType: '逆变器',
      deviceName,
      deviceId: `device_${stationId}_${i + 1}`,
      qualityIndex,
      qualityRate: qualityIndex,
      commInterruptTime: 0,
      dataMissingTime: 0,
      dataAbnormalTime: 0
    }
  })
}

/**
 * Mock设备类型列表
 */
export const mockDeviceTypes: DeviceType[] = [
  { code: 'inverter', name: '逆变器' },
  { code: 'combiner', name: '汇流箱' },
  { code: 'meter', name: '电表' },
  { code: 'weather', name: '气象站' }
]

/**
 * Mock设备趋势数据
 */
export function generateMockDeviceTrend(deviceId: string, startDate: string, endDate: string): DeviceTrendResponse {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  
  const dates: string[] = []
  const qualityIndex: number[] = []
  
  for (let i = 0; i < days; i++) {
    const date = new Date(start)
    date.setDate(date.getDate() + i)
    dates.push(date.toISOString().split('T')[0])
    
    // 前11天稳定92分，第12天下降到40分，后续恢复
    if (i < 11) {
      qualityIndex.push(92)
    } else if (i === 11) {
      qualityIndex.push(40)
    } else {
      qualityIndex.push(92)
    }
  }
  
  return {
    deviceName: deviceId,
    trendData: {
      dates,
      qualityIndex,
      events: [
        {
          date: dates[11],
          type: 'quality_drop',
          description: '数据质量显著下降',
          qualityIndex: 40
        }
      ]
    }
  }
}

