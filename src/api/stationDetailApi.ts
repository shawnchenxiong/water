/**
 * 电站详情API
 */
import { request } from '@/utils/request'
import type { StationDetail, WeatherInfo, StationFullInfo } from './types/station-detail'

/**
 * API响应格式
 */
interface ApiResponse<T = any> {
  code: number
  message: string
  data?: T
  timestamp?: string
}

/**
 * Mock数据 - 电站详情
 */
const mockStationDetail = (stationId: string): StationDetail => {
  return {
    id: stationId,
    name: '临湘污水处理厂',
    location: '湖南省岳阳市临湘市...',
    status: '并网',
    capacity: 1.41,
    irradiance: 0,
    dailyIrradiance: 0,
    realPower: 34.9,
    dailyPower: 2587.8,
    monthlyPower: 8467.8,
    yearlyPower: 99.41,
    totalPower: 110.25,
    consumption: 0,
    grid: 0,
    pvPower: 49.29,
    image: '/images/morendianzhan.png',
    description: '暂无描述'
  }
}

/**
 * Mock数据 - 天气信息
 */
const mockWeatherInfo = (): WeatherInfo => {
  const now = new Date()
  const formatDate = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${month}-${day}`
  }

  return {
    current: {
      temperature: 20,
      wind: '南风',
      windSpeed: '10km/h',
      sunTime: '06:41 - 17:40',
      date: formatDate(now),
      type: 'cloudy',
      desc: '阴',
      tempRange: '15°C - 19°C'
    },
    forecast: [
      { date: formatDate(new Date(now.getTime() + 86400000)), type: 'sunny', desc: '晴', tempRange: '12°C - 21°C' },
      { date: formatDate(new Date(now.getTime() + 172800000)), type: 'sunny', desc: '晴', tempRange: '15°C - 23°C' },
      { date: formatDate(new Date(now.getTime() + 259200000)), type: 'cloudy', desc: '阴', tempRange: '17°C - 23°C' },
      { date: formatDate(new Date(now.getTime() + 345600000)), type: 'sunny', desc: '晴', tempRange: '14°C - 23°C' }
    ],
    updateTime: new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\//g, '-')
  }
}

/**
 * 获取电站详情
 * @param stationId 电站ID
 * @returns 电站详情
 */
export async function getStationDetail(stationId: string): Promise<ApiResponse<StationDetail>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 300))

    return {
      code: 200,
      message: 'success',
      data: mockStationDetail(stationId)
    }
  }

  // 真实API调用
  return request.get(`/api/station/${stationId}/detail`)
}

/**
 * 获取电站天气信息
 * @param stationId 电站ID
 * @returns 天气信息
 */
export async function getStationWeather(stationId: string): Promise<ApiResponse<WeatherInfo>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 200))

    return {
      code: 200,
      message: 'success',
      data: mockWeatherInfo()
    }
  }

  // 真实API调用
  return request.get(`/api/station/${stationId}/weather`)
}

/**
 * 获取电站完整信息（包含天气）
 * @param stationId 电站ID
 * @returns 电站完整信息
 */
export async function getStationFullInfo(stationId: string): Promise<ApiResponse<StationFullInfo>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    // 并行请求电站详情和天气信息
    const [stationRes, weatherRes] = await Promise.all([
      getStationDetail(stationId),
      getStationWeather(stationId)
    ])

    if (stationRes.code === 200 && weatherRes.code === 200) {
      return {
        code: 200,
        message: 'success',
        data: {
          station: stationRes.data!,
          weather: weatherRes.data!
        }
      }
    }

    throw new Error('获取电站信息失败')
  }

  // 真实API调用
  return request.get(`/api/station/${stationId}/full-info`)
}

