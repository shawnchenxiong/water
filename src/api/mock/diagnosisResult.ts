import type { 
  DiagnosisResult, 
  DiagnosisSummary,
  GetDiagnosisResultsResponse,
  GetDeviceTrendResponse,
  DeviceTrend,
  WeatherType,
  TrendData
} from '@/api/types/diagnosis/diagnosisResult'
import dayjs from 'dayjs'

/**
 * 积尘诊断结果 Mock 数据
 */

// 设备名称前缀
const DEVICE_PREFIXES = ['CN-N', 'SH-N', 'BJ-N']

// 天气类型数组
const WEATHER_TYPES: WeatherType[] = ['sunny', 'cloudy', 'rainy', 'snowy', 'foggy']

// 生成设备名称
const generateDeviceName = (index: number): string => {
  const prefix = DEVICE_PREFIXES[Math.floor(Math.random() * DEVICE_PREFIXES.length)]
  return `${prefix}${String(index + 1).padStart(4, '0')}`
}

// 生成诊断结果Mock数据
export const generateMockDiagnosisResults = (
  stationId: string,
  date: string,
  count: number = 48
): DiagnosisResult[] => {
  return Array.from({ length: count }, (_, i) => {
    // 30%的设备没有积尘损失率数据
    const hasDustLossRate = Math.random() > 0.3
    
    const deviceName = generateDeviceName(i)
    return {
      id: `device_${stationId}_${i + 1}`,
      stationName: '芜湖城南污水厂',
      deviceId: deviceName,  // 使用设备名称作为设备ID
      deviceName: deviceName,
      dailyGeneration: parseFloat((Math.random() * 50 + 150).toFixed(1)), // 150-200 kWh
      equivalentHours: parseFloat((Math.random() * 0.5 + 1.2).toFixed(2)), // 1.2-1.7 h
      installedCapacity: parseFloat((Math.random() * 20 + 110).toFixed(2)), // 110-130 kWp
      dustLossRate: hasDustLossRate ? parseFloat((Math.random() * 5).toFixed(1)) : null, // 0-5%
      hasHistoryTrend: true
    }
  })
}

// 生成诊断摘要Mock数据
export const generateMockDiagnosisSummary = (results: DiagnosisResult[]): DiagnosisSummary => {
  const analyzedDevices = results.filter(r => r.dustLossRate !== null).length
  const totalLossRate = results
    .filter(r => r.dustLossRate !== null)
    .reduce((sum, r) => sum + (r.dustLossRate || 0), 0)
  
  return {
    totalDevices: results.length,
    analyzedDevices,
    avgDustLossRate: analyzedDevices > 0 ? parseFloat((totalLossRate / analyzedDevices).toFixed(2)) : 0
  }
}

// 生成历史趋势Mock数据
export const generateMockTrendData = (
  deviceId: string,
  startDate: string,
  endDate: string
): TrendData => {
  const start = dayjs(startDate)
  const end = dayjs(endDate)
  const days = end.diff(start, 'days') + 1
  
  const dates: string[] = []
  const dustLossRate: number[] = []
  const dustLossGeneration: number[] = []
  const weather: WeatherType[] = []
  
  for (let i = 0; i < days; i++) {
    const currentDate = start.add(i, 'days')
    dates.push(currentDate.format('YYYY-MM-DD'))
    
    // 生成积尘损失率 (1-4%)
    const baseRate = 2 + Math.sin(i * 0.2) * 0.5
    dustLossRate.push(parseFloat((baseRate + (Math.random() - 0.5) * 0.5).toFixed(2)))
    
    // 生成积尘损失电量 (10-30 kWh)
    const baseGeneration = 20 + Math.cos(i * 0.15) * 5
    dustLossGeneration.push(parseFloat((baseGeneration + (Math.random() - 0.5) * 5).toFixed(1)))
    
    // 生成天气（雨天概率较低）
    const rand = Math.random()
    if (rand < 0.4) {
      weather.push('sunny')
    } else if (rand < 0.7) {
      weather.push('cloudy')
    } else if (rand < 0.85) {
      weather.push('rainy')
    } else if (rand < 0.95) {
      weather.push('foggy')
    } else {
      weather.push('snowy')
    }
  }
  
  return {
    dates,
    dustLossRate,
    dustLossGeneration,
    weather
  }
}

// Mock API响应函数
export const getMockDiagnosisResultsResponse = (
  stationId: string,
  date: string
): GetDiagnosisResultsResponse => {
  console.log('Mock API: 获取积尘诊断结果', { stationId, date })
  
  const results = generateMockDiagnosisResults(stationId, date)
  const summary = generateMockDiagnosisSummary(results)
  
  return {
    code: 200,
    data: {
      diagnosisResults: results,
      summary
    },
    message: '诊断结果获取成功'
  }
}

export const getMockDeviceTrendResponse = (
  deviceId: string,
  startDate: string,
  endDate: string
): GetDeviceTrendResponse => {
  console.log('Mock API: 获取设备历史趋势', { deviceId, startDate, endDate })
  
  const trendData = generateMockTrendData(deviceId, startDate, endDate)
  
  return {
    code: 200,
    data: {
      deviceName: deviceId,
      trendData
    },
    message: '历史趋势获取成功'
  }
}

// 空数据Mock
export const getMockEmptyDiagnosisResultsResponse = (): GetDiagnosisResultsResponse => {
  return {
    code: 200,
    data: {
      diagnosisResults: [],
      summary: {
        totalDevices: 0,
        analyzedDevices: 0,
        avgDustLossRate: 0
      }
    },
    message: '暂无诊断结果'
  }
}
