import type {
  GetCleaningAdviceResponse,
  GetWeatherForecastResponse,
  GetDeviceHistoryTrendResponse,
  GetDeviceHistoryTrendParams,
  WeatherForecast,
  DeviceDetail,
  TrendData
} from '@/api/types/diagnosis/cleaningAdvice'
import { generateDateRange } from '@/utils/mockData'

/**
 * 积尘清洗建议Mock数据
 */

/**
 * 生成天气预报Mock数据
 */
const generateMockWeatherForecast = (days: number = 15): WeatherForecast[] => {
  const weatherTypes = [
    { weather: '小雨', icon: 'rainy' },
    { weather: '多云', icon: 'cloudy' },
    { weather: '晴', icon: 'sunny' },
    { weather: '阴', icon: 'overcast' },
    { weather: '雷阵雨', icon: 'thunderstorm' }
  ]

  const temperatures = [
    '9°C - 13°C',
    '11°C - 17°C',
    '8°C - 15°C',
    '12°C - 18°C',
    '10°C - 16°C'
  ]

  return Array.from({ length: days }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    const weatherType = weatherTypes[i % weatherTypes.length]
    
    return {
      date: `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
      weather: weatherType.weather,
      icon: weatherType.icon,
      temperature: temperatures[i % temperatures.length],
      humidity: 60 + Math.floor(Math.random() * 30),
      windSpeed: `${2 + Math.floor(Math.random() * 5)}m/s`
    }
  })
}

/**
 * 生成设备明细Mock数据
 */
const generateMockDeviceDetails = (stationName: string): DeviceDetail[] => {
  const deviceNames = ['CN-N0702', 'CN-N0801', 'CN-N0802', 'CN-N0101', 'CN-N0203', 'CN-N0303']
  
  return deviceNames.map((deviceName) => ({
    stationName,
    deviceName,
    installedCapacity: Number((115 + Math.random() * 15).toFixed(2)),
    dailyGeneration: Number((150 + Math.random() * 30).toFixed(2)),
    equivalentHours: Number((1.3 + Math.random() * 0.3).toFixed(2)),
    dustLossGeneration: null, // 根据SPEC，暂无数据时显示null
    dustLossRate: null,
    cleaningAdvice: null
  }))
}

/**
 * 生成趋势数据Mock
 */
const generateMockTrendData = (): TrendData => {
  const dates = generateDateRange(30) // 30天数据
  const weatherIcons = ['cloudy', 'sunny', 'cloudy', 'rainy', 'cloudy', 'sunny', 'sunny']
  
  return {
    dates,
    dustLossRate: dates.map(() => Number((1 + Math.random() * 4).toFixed(1))), // 1-5%
    dustLossGeneration: dates.map(() => Number((100 + Math.random() * 100).toFixed(0))), // 100-200kWh
    weather: dates.map((_, i) => weatherIcons[i % weatherIcons.length])
  }
}

/**
 * 获取清洗建议Mock响应
 */
export const getMockCleaningAdviceResponse = (stationId: string, date: string): GetCleaningAdviceResponse => {
  // 模拟根据电站ID生成不同数据
  const stationName = stationId.includes('wuhu') ? '芜湖城南污水厂' : '测试电站'
  
  return {
    success: true,
    code: 200,
    message: '清洗建议获取成功',
    data: {
      stationAdvice: {
        dustLossRate: Number((4 + Math.random() * 2).toFixed(1)), // 4-6%
        predictedLossRevenue: Number((20000 + Math.random() * 10000).toFixed(2)), // 20000-30000元
        cleaningCost: 15000.00,
        recommendedDate: '2025-10-25'
      },
      dustStatistics: {
        level1: { count: 48, percentage: 100 },
        level2: { count: 0, percentage: 0 },
        level3: { count: 0, percentage: 0 }
      },
      trendData: generateMockTrendData(),
      deviceDetails: generateMockDeviceDetails(stationName)
    }
  }
}

/**
 * 获取天气预报Mock响应
 */
export const getMockWeatherForecastResponse = (stationId: string, days: number = 15): GetWeatherForecastResponse => {
  return {
    success: true,
    code: 200,
    message: '天气预报获取成功',
    data: {
      forecast: generateMockWeatherForecast(days)
    }
  }
}

/**
 * 获取设备历史趋势Mock响应
 */
export const getMockDeviceHistoryTrendResponse = (params: GetDeviceHistoryTrendParams): GetDeviceHistoryTrendResponse => {
  const startDate = new Date(params.startDate)
  const endDate = new Date(params.endDate)
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  
  const dates = Array.from({ length: daysDiff + 1 }, (_, i) => {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    return date.toISOString().split('T')[0]
  })
  
  return {
    success: true,
    code: 200,
    message: '设备历史趋势获取成功',
    data: {
      dates,
      dustLossRate: dates.map(() => Number((1 + Math.random() * 4).toFixed(1))),
      dustLossGeneration: dates.map(() => Number((50 + Math.random() * 100).toFixed(1))),
      dailyGeneration: dates.map(() => Number((150 + Math.random() * 50).toFixed(1)))
    }
  }
}
