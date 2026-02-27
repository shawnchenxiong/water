/**
 * 积尘诊断结果相关类型定义
 */

// 诊断结果项
export interface DiagnosisResult {
  id: string
  stationName: string
  deviceId: string               // 设备ID
  deviceName: string
  dailyGeneration: number        // 当日发电量 (kWh)
  equivalentHours: number        // 等价发电量 (h)
  installedCapacity: number      // 装机容量 (kWp)
  dustLossRate: number | null    // 设备积尘损失率 (%)
  hasHistoryTrend: boolean       // 是否有历史趋势数据
}

// 诊断摘要统计
export interface DiagnosisSummary {
  totalDevices: number           // 总设备数
  analyzedDevices: number        // 已分析设备数
  avgDustLossRate: number        // 平均积尘损失率
}

// 获取诊断结果请求参数
export interface GetDiagnosisResultsParams {
  stationId: string
  date: string                   // 格式：YYYY-MM-DD
}

// 获取诊断结果响应
export interface GetDiagnosisResultsResponse {
  code: number
  data: {
    diagnosisResults: DiagnosisResult[]
    summary: DiagnosisSummary
  }
  message: string
}

// 天气类型
export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'foggy'

// 历史趋势数据
export interface TrendData {
  dates: string[]                // 日期数组
  dustLossRate: number[]         // 积尘损失率数组
  dustLossGeneration: number[]   // 积尘损失电量数组
  weather: WeatherType[]         // 天气数组
}

// 设备历史趋势
export interface DeviceTrend {
  deviceName: string
  trendData: TrendData
}

// 获取设备历史趋势请求参数
export interface GetDeviceTrendParams {
  deviceId: string
  startDate: string             // 格式：YYYY-MM-DD
  endDate: string               // 格式：YYYY-MM-DD
  params?: string[]             // 参数类型数组
}

// 获取设备历史趋势响应
export interface GetDeviceTrendResponse {
  code: number
  data: DeviceTrend
  message: string
}

// 趋势参数类型
export interface TrendParam {
  value: string
  label: string
  color: string
  unit: string
}

// 趋势参数选项
export const TREND_PARAMS: TrendParam[] = [
  {
    value: 'dustLossRate',
    label: '电站积尘损失率',
    color: '#ff8c00',
    unit: '%'
  },
  {
    value: 'dustLossGeneration', 
    label: '电站积尘损失电量',
    color: '#1890ff',
    unit: 'kWh'
  }
]

// 天气图标映射
export const WEATHER_ICONS: Record<WeatherType, string> = {
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '🌧️',
  snowy: '❄️',
  foggy: '🌫️'
}

// 分页信息
export interface Pagination {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 表格排序信息
export interface SortInfo {
  prop: string
  order: 'ascending' | 'descending' | null
}
