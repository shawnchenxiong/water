/**
 * 统计报表Mock数据
 */

import type {
  ReportQueryParams,
  PowerStationRow,
  InverterRow,
  EmissionRow,
  ReportResponse
} from '@/api/types/analysis/statistics'

/**
 * 电站名称配置
 */
export const mockStationNames = ['东方光伏电站', '西区新能源电站', '南山风光互补电站', '北部综合能源站']

/**
 * 逆变器厂商配置
 */
export const mockInverterManufacturers = ['华为', '阳光电源', '古瑞瓦特', 'SMA', 'ABB']

/**
 * 天气配置
 */
export const mockWeatherTypes = ['晴', '多云', '阴']

/**
 * 生成随机数据
 */
export function generateRandomData(min: number, max: number, fixed: number = 2): string {
  const value = Math.random() * (max - min) + min
  return value.toFixed(fixed)
}

/**
 * 生成电站运行报表Mock数据
 */
export function generateMockPowerStationData(params: ReportQueryParams): PowerStationRow[] {
  const data: PowerStationRow[] = []
  const stationName = mockStationNames.find((_, idx) => params.regionId === `100${idx + 1}`) || mockStationNames[0]
  
  const count = Math.min(params.pageSize, 15)
  
  for (let i = 0; i < count; i++) {
    const date = new Date(params.dateTime)
    date.setDate(date.getDate() - i)
    
    data.push({
      statsDate: date.toISOString().split('T')[0],
      regionName: stationName,
      regionId: params.regionId,
      capacity: generateRandomData(50, 100, 2),
      generation: generateRandomData(50000, 100000, 0),
      equivalence: generateRandomData(4, 8, 2),
      powerInverter: generateRandomData(8000, 15000, 0),
      powerBind: generateRandomData(8000, 15000, 0),
      powerOnline: generateRandomData(8000, 15000, 0),
      powerUse: generateRandomData(8000, 15000, 0),
      powerOffline: '0',
      irradiation: generateRandomData(15, 25, 2),
      connectTime: '06:00:00',
      offTime: '18:30:00',
      onlineTime: generateRandomData(10, 13, 2),
      maxPower: generateRandomData(8000, 15000, 0),
      maxPowerTime: '12:30:00',
      avgPower: generateRandomData(5000, 8000, 0),
      dayPR: generateRandomData(85, 98, 2),
      textDay: mockWeatherTypes[Math.floor(Math.random() * 3)],
      maxTemp: generateRandomData(25, 40, 1),
      minTemp: generateRandomData(-5, 15, 1),
      avgTemp: generateRandomData(10, 25, 1),
      avgWindSpeed: generateRandomData(0.5, 5.0, 1),
      countDay: i + 1
    })
  }
  
  return data
}

/**
 * 生成逆变器运行报表Mock数据
 */
export function generateMockInverterData(params: ReportQueryParams): InverterRow[] {
  const data: InverterRow[] = []
  const stationName = mockStationNames.find((_, idx) => params.regionId === `100${idx + 1}`) || mockStationNames[0]
  
  const count = Math.min(params.pageSize, 12)
  
  for (let i = 0; i < count; i++) {
    data.push({
      deviceId: `INV-${params.regionId}-${String(i + 1).padStart(3, '0')}`,
      deviceName: `逆变器#${i + 1}`,
      nodeName: stationName,
      capacity: parseFloat(generateRandomData(1, 3, 2)),
      generation: generateRandomData(1000, 5000, 0),
      equivalence: parseFloat(generateRandomData(4, 8, 2)),
      connection: '06:00:00-18:30:00',
      maxPower: generateRandomData(800, 2000, 0),
      maxPowerTime: '12:30:00'
    })
  }
  
  return data
}

/**
 * 生成减排统计报表Mock数据
 */
export function generateMockEmissionData(params: ReportQueryParams): EmissionRow[] {
  const data: EmissionRow[] = []
  const stationName = mockStationNames.find((_, idx) => params.regionId === `100${idx + 1}`) || mockStationNames[0]
  
  const count = Math.min(params.pageSize, 15)
  
  for (let i = 0; i < count; i++) {
    const date = new Date(params.dateTime)
    date.setDate(date.getDate() - i)
    
    const generation = parseFloat(generateRandomData(50000, 100000, 0))
    const coalReduction = (generation * 0.000404).toFixed(3) // 标准煤系数
    const co2Reduction = (generation * 0.001083).toFixed(3) // CO2减排系数
    const so2Reduction = (generation * 0.000003).toFixed(3) // SO2减排系数
    const noxReduction = (generation * 0.0000015).toFixed(3) // NOx减排系数
    
    data.push({
      statsDate: date.toISOString().split('T')[0],
      regionName: stationName,
      regionId: params.regionId,
      location: stationName,
      capacity: generateRandomData(50, 100, 2),
      generation: generation.toString(),
      carbonDioxideReduction: co2Reduction,
      saveStandardCoal: coalReduction,
      equivalentTreePlant: Math.floor(generation * 0.00005).toString(),
      sulfurDioxide: so2Reduction,
      tonerDust: (generation * 0.000001).toFixed(3),
      nitrogenOxides: noxReduction
    })
  }
  
  return data
}

/**
 * 获取Mock统计报表响应
 */
export function getMockReportResponse<T>(
  data: T[],
  params: ReportQueryParams
): ReportResponse<T> {
  return {
    code: 200,
    message: '操作成功',
    data: {
      list: data,
      total: data.length,
      pageSize: params.pageSize,
      pageNum: params.pageNum
    }
  }
}
